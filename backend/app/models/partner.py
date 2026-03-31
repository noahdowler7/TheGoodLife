import uuid
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base

class AccountabilityPartner(Base):
    __tablename__ = "accountability_partners"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    partner_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    name = Column(String(100), nullable=False)
    color = Column(String(7))
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
