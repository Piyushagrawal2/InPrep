import os
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.helpers.database import get_db
from app.helpers.config import settings
from app.models.models import User, Interview, InterviewMessage, InterviewStatus
from app.schemas.schemas import (
    InterviewCreate, InterviewResponse, InterviewListResponse,
    MessageCreate, MessageResponse, InterviewConversation, ResumeData
)
from app.services.auth_service import get_current_user
from app.services.resume_parser import ResumeParser
from app.services.interview_engine import AIInterviewEngine

router = APIRouter(prefix="/interviews", tags=["Interviews"])


@router.post("/", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
async def create_interview(
    data: InterviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    interview = Interview(
        user_id=current_user.id,
        job_title=data.job_title,
        job_description=data.job_description,
        self_introduction=data.self_introduction,
        difficulty=data.difficulty,
        duration_minutes=data.duration_minutes,
        scheduled_at=data.scheduled_at,
        status=InterviewStatus.SCHEDULED
    )
    db.add(interview)
    await db.commit()
    await db.refresh(interview)
    return InterviewResponse.model_validate(interview)


@router.post("/{interview_id}/upload-resume", response_model=InterviewResponse)
async def upload_resume(
    interview_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate file
    if file.content_type not in [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are accepted")

    # Get interview
    result = await db.execute(
        select(Interview).where(Interview.id == interview_id, Interview.user_id == current_user.id)
    )
    interview = result.scalar_one_or_none()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    # Save file
    ext = os.path.splitext(file.filename)[1]
    filename = f"{interview_id}_{uuid.uuid4().hex[:8]}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)

    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    with open(file_path, "wb") as f:
        f.write(content)

    # Parse resume
    try:
        resume_data = await ResumeParser.parse_file(file_path)
        interview.resume_path = file_path
        interview.resume_data = resume_data.model_dump()
        await db.commit()
        await db.refresh(interview)
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail=f"Failed to parse resume: {str(e)}")

    return InterviewResponse.model_validate(interview)


@router.get("/", response_model=InterviewListResponse)
async def list_interviews(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Interview)
        .where(Interview.user_id == current_user.id)
        .order_by(desc(Interview.created_at))
    )
    interviews = result.scalars().all()
    return InterviewListResponse(
        interviews=[InterviewResponse.model_validate(i) for i in interviews],
        total=len(interviews)
    )


@router.get("/{interview_id}", response_model=InterviewConversation)
async def get_interview(
    interview_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Interview).where(Interview.id == interview_id, Interview.user_id == current_user.id)
    )
    interview = result.scalar_one_or_none()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    msg_result = await db.execute(
        select(InterviewMessage)
        .where(InterviewMessage.interview_id == interview_id)
        .order_by(InterviewMessage.timestamp)
    )
    messages = msg_result.scalars().all()

    return InterviewConversation(
        interview=InterviewResponse.model_validate(interview),
        messages=[MessageResponse.model_validate(m) for m in messages]
    )


@router.post("/{interview_id}/start", response_model=MessageResponse)
async def start_interview(
    interview_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Interview).where(Interview.id == interview_id, Interview.user_id == current_user.id)
    )
    interview = result.scalar_one_or_none()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    if interview.status == InterviewStatus.IN_PROGRESS:
        raise HTTPException(status_code=400, detail="Interview already in progress")
    if interview.status == InterviewStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Interview already completed")

    # Parse resume data if available
    resume_data = ResumeData(**interview.resume_data) if interview.resume_data else None

    # Generate first message from AI interviewer
    first_message = await AIInterviewEngine.generate_first_message(
        job_title=interview.job_title,
        difficulty=interview.difficulty.value,
        resume_data=resume_data,
        self_introduction=interview.self_introduction,
        job_description=interview.job_description
    )

    # Save the interviewer's first message
    msg = InterviewMessage(
        interview_id=interview_id,
        role="interviewer",
        content=first_message
    )
    db.add(msg)

    # Update interview status
    interview.status = InterviewStatus.IN_PROGRESS
    interview.started_at = datetime.utcnow()
    await db.commit()
    await db.refresh(msg)

    return MessageResponse.model_validate(msg)


@router.post("/{interview_id}/message", response_model=MessageResponse)
async def send_message(
    interview_id: str,
    message: MessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Interview).where(Interview.id == interview_id, Interview.user_id == current_user.id)
    )
    interview = result.scalar_one_or_none()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    if interview.status != InterviewStatus.IN_PROGRESS:
        raise HTTPException(status_code=400, detail="Interview is not in progress")

    # Save candidate message
    candidate_msg = InterviewMessage(
        interview_id=interview_id,
        role="candidate",
        content=message.content
    )
    db.add(candidate_msg)
    await db.commit()

    # Get conversation history
    msg_result = await db.execute(
        select(InterviewMessage)
        .where(InterviewMessage.interview_id == interview_id)
        .order_by(InterviewMessage.timestamp)
    )
    messages = msg_result.scalars().all()
    history = [{"role": m.role, "content": m.content} for m in messages]

    # Generate AI response
    resume_data = ResumeData(**interview.resume_data) if interview.resume_data else None
    ai_response = await AIInterviewEngine.generate_response(
        job_title=interview.job_title,
        difficulty=interview.difficulty.value,
        conversation_history=history,
        resume_data=resume_data,
        self_introduction=interview.self_introduction,
        job_description=interview.job_description
    )

    # Save interviewer response
    interviewer_msg = InterviewMessage(
        interview_id=interview_id,
        role="interviewer",
        content=ai_response
    )
    db.add(interviewer_msg)
    await db.commit()
    await db.refresh(interviewer_msg)

    return MessageResponse.model_validate(interviewer_msg)


@router.post("/{interview_id}/end", response_model=InterviewResponse)
async def end_interview(
    interview_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Interview).where(Interview.id == interview_id, Interview.user_id == current_user.id)
    )
    interview = result.scalar_one_or_none()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    # Get conversation history for summary
    msg_result = await db.execute(
        select(InterviewMessage)
        .where(InterviewMessage.interview_id == interview_id)
        .order_by(InterviewMessage.timestamp)
    )
    messages = msg_result.scalars().all()
    history = [{"role": m.role, "content": m.content} for m in messages]

    if len(history) > 1:
        resume_data = ResumeData(**interview.resume_data) if interview.resume_data else None
        summary = await AIInterviewEngine.generate_interview_summary(
            job_title=interview.job_title,
            difficulty=interview.difficulty.value,
            conversation_history=history,
            resume_data=resume_data
        )
        interview.overall_score = summary.get("overall_score", 5.0)
        interview.feedback_summary = str(summary)

    interview.status = InterviewStatus.COMPLETED
    interview.completed_at = datetime.utcnow()
    await db.commit()
    await db.refresh(interview)

    return InterviewResponse.model_validate(interview)
