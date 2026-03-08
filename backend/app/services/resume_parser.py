import os
import re
from typing import Optional
from PyPDF2 import PdfReader
from docx import Document
from app.schemas.schemas import ResumeData


class ResumeParser:
    """Parse PDF and DOCX resumes into structured data."""

    @staticmethod
    async def parse_file(file_path: str) -> ResumeData:
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf":
            text = ResumeParser._extract_pdf_text(file_path)
        elif ext in (".docx", ".doc"):
            text = ResumeParser._extract_docx_text(file_path)
        else:
            raise ValueError(f"Unsupported file format: {ext}")

        return ResumeParser._parse_text(text)

    @staticmethod
    def _extract_pdf_text(file_path: str) -> str:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text

    @staticmethod
    def _extract_docx_text(file_path: str) -> str:
        doc = Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs])

    @staticmethod
    def _parse_text(text: str) -> ResumeData:
        """Extract structured data from raw resume text."""
        data = ResumeData(raw_text=text)

        # Extract email
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        emails = re.findall(email_pattern, text)
        if emails:
            data.email = emails[0]

        # Extract phone
        phone_pattern = r'[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]{7,15}'
        phones = re.findall(phone_pattern, text)
        if phones:
            data.phone = phones[0].strip()

        # Extract skills (look for common patterns)
        skills_section = ResumeParser._extract_section(text, ["skills", "technologies", "technical skills", "tech stack"])
        if skills_section:
            # Split by common delimiters
            skills = re.split(r'[,|•·\n]', skills_section)
            data.skills = [s.strip() for s in skills if s.strip() and len(s.strip()) < 50]

        # Extract name (usually the first line)
        lines = text.strip().split('\n')
        if lines:
            first_line = lines[0].strip()
            if len(first_line) < 60 and not re.search(r'@|http|www', first_line):
                data.name = first_line

        # Extract summary
        summary = ResumeParser._extract_section(text, ["summary", "objective", "about", "profile"])
        if summary:
            data.summary = summary[:500]

        # Extract experience entries
        experience_text = ResumeParser._extract_section(text, ["experience", "work experience", "employment"])
        if experience_text:
            data.experience = [{"raw": experience_text[:1000]}]

        # Extract education entries
        education_text = ResumeParser._extract_section(text, ["education", "academic"])
        if education_text:
            data.education = [{"raw": education_text[:500]}]

        # Extract projects
        projects_text = ResumeParser._extract_section(text, ["projects", "personal projects", "key projects"])
        if projects_text:
            data.projects = [{"raw": projects_text[:1000]}]

        return data

    @staticmethod
    def _extract_section(text: str, headers: list[str]) -> Optional[str]:
        """Extract a section from text based on common section headers."""
        text_lower = text.lower()
        for header in headers:
            # Match section header patterns
            patterns = [
                rf'\n\s*{header}\s*[:]*\s*\n',
                rf'\n\s*{header.upper()}\s*[:]*\s*\n',
                rf'\n\s*{header.title()}\s*[:]*\s*\n',
            ]
            for pattern in patterns:
                match = re.search(pattern, text_lower)
                if match:
                    start = match.end()
                    # Find the next section header
                    next_section = re.search(
                        r'\n\s*(?:skills|experience|education|projects|summary|objective|certifications|awards|languages|interests|references|work|technical|employment|academic|about|profile)\s*[:]*\s*\n',
                        text_lower[start:],
                        re.IGNORECASE
                    )
                    end = start + next_section.start() if next_section else min(start + 2000, len(text))
                    return text[start:end].strip()
        return None
