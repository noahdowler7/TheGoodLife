import uuid
from sqlalchemy import Column, String, Date, SmallInteger, ForeignKey, UniqueConstraint, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base

class Rating(Base):
    __tablename__ = "ratings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    capital_id = Column(String(20), ForeignKey("capitals.id"), nullable=False)
    score = Column(SmallInteger, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    __table_args__ = (
        CheckConstraint('score >= 1 AND score <= 5', name='check_score_range'),
        UniqueConstraint('user_id', 'date', 'capital_id', name='uq_user_date_capital'),
    )
