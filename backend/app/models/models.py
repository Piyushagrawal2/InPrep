import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Integer, Float, JSON, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class DifficultyLevel(str, enum.Enum):
    EASY = "easy"
    INTERMEDIATE = "intermediate"
    HARD = "hard"


class InterviewStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    interviews = relationship("Interview", back_populates="user", cascade="all, delete-orphan")


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    job_title = Column(String, nullable=False)
    job_description = Column(Text, nullable=True)
    self_introduction = Column(Text, nullable=True)
    resume_path = Column(String, nullable=True)
    resume_data = Column(JSON, nullable=True)  # Parsed resume JSON
    difficulty = Column(SQLEnum(DifficultyLevel), default=DifficultyLevel.EASY)
    duration_minutes = Column(Integer, default=30)
    status = Column(SQLEnum(InterviewStatus), default=InterviewStatus.SCHEDULED)
    scheduled_at = Column(DateTime, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    overall_score = Column(Float, nullable=True)
    feedback_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="interviews")
    messages = relationship("InterviewMessage", back_populates="interview", cascade="all, delete-orphan")


class InterviewMessage(Base):
    __tablename__ = "interview_messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    interview_id = Column(String, ForeignKey("interviews.id"), nullable=False)
    role = Column(String, nullable=False)  # "interviewer" or "candidate"
    content = Column(Text, nullable=False)
    question_type = Column(String, nullable=True)  # "behavioral", "technical", "coding", etc.
    score = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    interview = relationship("Interview", back_populates="messages")
