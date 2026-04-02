import uuid
from sqlalchemy import Column, String, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base

class AccountabilityPartner(Base):
    __tablename__ = "accountability_partners"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)  # accountable person
    partner_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)  # partner (viewer)
    requester_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)  # who initiated
    name = Column(String(100), nullable=False)  # display name cache
    status = Column(String(20), nullable=False, server_default='pending')  # pending | accepted | declined
    message = Column(Text, nullable=True)  # optional request message
    color = Column(String(7))
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    responded_at = Column(TIMESTAMP(timezone=True), nullable=True)  # when accepted/declined
