from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# --- Auth Schemas ---
class UserCreate(BaseModel):
    email: str
    name: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# --- Interview Schemas ---
class DifficultyLevel(str, Enum):
    EASY = "easy"
    INTERMEDIATE = "intermediate"
    HARD = "hard"


class InterviewCreate(BaseModel):
    job_title: str
    job_description: Optional[str] = None
    self_introduction: Optional[str] = None
    difficulty: DifficultyLevel = DifficultyLevel.EASY
    duration_minutes: int = Field(default=30, ge=15, le=90)
    scheduled_at: Optional[datetime] = None


class InterviewResponse(BaseModel):
    id: str
    job_title: str
    job_description: Optional[str]
    self_introduction: Optional[str]
    difficulty: str
    duration_minutes: int
    status: str
    overall_score: Optional[float]
    feedback_summary: Optional[str]
    scheduled_at: Optional[datetime]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class InterviewListResponse(BaseModel):
    interviews: List[InterviewResponse]
    total: int


# --- Message Schemas ---
class MessageCreate(BaseModel):
    content: str


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    question_type: Optional[str]
    score: Optional[float]
    feedback: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True


class InterviewConversation(BaseModel):
    interview: InterviewResponse
    messages: List[MessageResponse]


# --- Resume Schemas ---
class ResumeData(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: List[str] = []
    experience: List[dict] = []
    education: List[dict] = []
    projects: List[dict] = []
    summary: Optional[str] = None
    raw_text: str = ""
