from openai import AsyncOpenAI
from typing import Optional
from app.core.config import settings
from app.schemas.schemas import ResumeData

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


INTERVIEWER_PERSONAS = {
    "easy": {
        "name": "Sarah Mitchell",
        "role": "Senior HR Partner",
        "style": """You are Sarah Mitchell, a warm and encouraging Senior HR Partner with 10 years of experience. 
You're conducting an introductory interview. Your approach:
- Start with a warm greeting and put the candidate at ease
- Ask about their background, motivations, and career goals
- Ask basic questions related to their resume and job title
- Be conversational, friendly, and supportive
- Give the candidate time to think — don't rush them
- Use natural speech patterns with occasional "Hmm, that's interesting" or "I see"
- Ask follow-up questions based on their answers
- Keep questions at an introductory level
- Show genuine curiosity about their experiences"""
    },
    "intermediate": {
        "name": "David Chen",
        "role": "Engineering Manager",
        "style": """You are David Chen, a sharp and experienced Engineering Manager at a top tech company.
You're conducting a technical/intermediate interview round. Your approach:
- Be professional but approachable
- Ask in-depth technical questions related to the candidate's skills and experience
- Probe deeper when answers are vague or shallow — "Can you elaborate on that?" 
- Ask scenario-based questions: "What would you do if..."
- Test problem-solving skills with practical examples
- Challenge assumptions — "Are you sure about that? What if..."
- Ask about architecture decisions and trade-offs from their projects
- Be fair but rigorous — you want to see depth of knowledge
- Use natural reactions like "Interesting approach" or "Let me push back on that a bit"
- Keep the pace steady but not rushed"""
    },
    "hard": {
        "name": "Victoria Okafor",
        "role": "VP of Engineering",
        "style": """You are Victoria Okafor, VP of Engineering at a FAANG company. You've been in the industry for 20 years.
You're conducting a senior-level/hard interview round. Your approach:
- Be direct and efficient — no fluff
- Ask complex system design and architecture questions
- Probe edge cases, scalability, and failure scenarios
- Ask "Why?" repeatedly to test depth of understanding
- Present hypothetical constraints and see how they adapt
- Test leadership and decision-making abilities
- Ask about trade-offs, technical debt, and production incidents
- Challenge weak answers firmly but respectfully
- Look for strategic thinking, not just technical knowledge
- Use silence effectively — let uncomfortable pauses push the candidate to think deeper
- "That's a standard answer. What would YOU do differently?"
- Expect concrete examples, not theoretical knowledge"""
    }
}


def _build_system_prompt(
    difficulty: str,
    job_title: str,
    resume_data: Optional[ResumeData],
    self_introduction: Optional[str],
    job_description: Optional[str],
    is_first_message: bool = False
) -> str:
    persona = INTERVIEWER_PERSONAS.get(difficulty, INTERVIEWER_PERSONAS["easy"])

    resume_context = ""
    if resume_data:
        resume_parts = []
        if resume_data.name:
            resume_parts.append(f"Candidate Name: {resume_data.name}")
        if resume_data.skills:
            resume_parts.append(f"Skills: {', '.join(resume_data.skills[:20])}")
        if resume_data.summary:
            resume_parts.append(f"Summary: {resume_data.summary}")
        if resume_data.experience:
            resume_parts.append(f"Experience: {str(resume_data.experience[:3])}")
        if resume_data.education:
            resume_parts.append(f"Education: {str(resume_data.education[:2])}")
        if resume_data.projects:
            resume_parts.append(f"Projects: {str(resume_data.projects[:3])}")
        resume_context = "\n".join(resume_parts)

    system_prompt = f"""
{persona['style']}

===== INTERVIEW CONTEXT =====
Your Name: {persona['name']}
Your Role: {persona['role']}
Job Title Being Interviewed For: {job_title}
Difficulty Level: {difficulty.upper()}
{f"Job Description: {job_description}" if job_description else ""}

===== CANDIDATE INFORMATION =====
{resume_context if resume_context else "No resume provided"}
{f"Candidate Self-Introduction: {self_introduction}" if self_introduction else ""}

===== CRITICAL RULES =====
1. You are conducting a LIVE interview. This is a real-time conversation, not a written test.
2. Ask ONE question at a time. Never list multiple questions.
3. LISTEN to the candidate's answer and ask follow-up questions naturally.
4. Reference specific items from the candidate's resume or introduction when relevant.
5. Keep your responses concise — this is a conversation, not a lecture.
6. NEVER break character. You ARE {persona['name']}, a real person.
7. NEVER mention that you are an AI, language model, or chatbot.
8. Use natural filler phrases: "Right, so...", "That makes sense...", "Interesting..."
9. If the candidate's answer is incomplete, probe deeper rather than moving to a new topic.
10. Manage the interview flow — if a topic is exhausted, transition smoothly to the next.
"""

    if is_first_message:
        system_prompt += f"""
===== FIRST MESSAGE =====
This is the START of the interview. Introduce yourself naturally as {persona['name']}, {persona['role']}.
Welcome the candidate, mention the role ({job_title}), and start with your first question.
Keep the opening warm but professional. Don't ask them to introduce themselves if they already provided a self-introduction — instead, reference something from it.
"""

    return system_prompt


class AIInterviewEngine:
    """Core AI interview conversation engine."""

    @staticmethod
    async def generate_first_message(
        job_title: str,
        difficulty: str,
        resume_data: Optional[ResumeData] = None,
        self_introduction: Optional[str] = None,
        job_description: Optional[str] = None
    ) -> str:
        system_prompt = _build_system_prompt(
            difficulty=difficulty,
            job_title=job_title,
            resume_data=resume_data,
            self_introduction=self_introduction,
            job_description=job_description,
            is_first_message=True
        )

        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": "[SYSTEM: The interview is starting now. Introduce yourself and begin.]"}
            ],
            temperature=0.8,
            max_tokens=300
        )
        return response.choices[0].message.content

    @staticmethod
    async def generate_response(
        job_title: str,
        difficulty: str,
        conversation_history: list[dict],
        resume_data: Optional[ResumeData] = None,
        self_introduction: Optional[str] = None,
        job_description: Optional[str] = None
    ) -> str:
        system_prompt = _build_system_prompt(
            difficulty=difficulty,
            job_title=job_title,
            resume_data=resume_data,
            self_introduction=self_introduction,
            job_description=job_description,
            is_first_message=False
        )

        messages = [{"role": "system", "content": system_prompt}]

        for msg in conversation_history:
            role = "assistant" if msg["role"] == "interviewer" else "user"
            messages.append({"role": role, "content": msg["content"]})

        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,
            temperature=0.8,
            max_tokens=400
        )
        return response.choices[0].message.content

    @staticmethod
    async def generate_interview_summary(
        job_title: str,
        difficulty: str,
        conversation_history: list[dict],
        resume_data: Optional[ResumeData] = None
    ) -> dict:
        """Generate end-of-interview summary with scores and feedback."""
        conversation_text = "\n".join([
            f"{'Interviewer' if m['role'] == 'interviewer' else 'Candidate'}: {m['content']}"
            for m in conversation_history
        ])

        prompt = f"""
You are an expert interview evaluator. Analyze this {difficulty}-level interview for the position of {job_title}.

INTERVIEW TRANSCRIPT:
{conversation_text}

Provide a JSON response (no markdown, just raw JSON) with:
{{
    "overall_score": <float 0-10>,
    "communication_score": <float 0-10>,
    "technical_score": <float 0-10>,
    "confidence_score": <float 0-10>,
    "problem_solving_score": <float 0-10>,
    "strengths": ["<strength1>", "<strength2>", "<strength3>"],
    "improvements": ["<area1>", "<area2>", "<area3>"],
    "hire_recommendation": "<strong_hire|hire|maybe|no_hire>",
    "summary": "<2-3 paragraph detailed feedback>"
}}
"""
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=800
        )

        import json
        try:
            result = json.loads(response.choices[0].message.content)
        except json.JSONDecodeError:
            result = {
                "overall_score": 5.0,
                "summary": response.choices[0].message.content,
                "hire_recommendation": "maybe"
            }
        return result
