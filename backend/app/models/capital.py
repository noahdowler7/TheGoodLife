from sqlalchemy import Column, String, SmallInteger, ForeignKey
from app.database import Base

class Capital(Base):
    __tablename__ = "capitals"

    id = Column(String(20), primary_key=True)
    label = Column(String(50), nullable=False)
    priority = Column(SmallInteger, nullable=False, unique=True)
    color = Column(String(7), nullable=False)
    icon = Column(String(50))

class DefaultDiscipline(Base):
    __tablename__ = "default_disciplines"

    id = Column(String(50), primary_key=True)
    capital_id = Column(String(20), ForeignKey("capitals.id"), nullable=False)
    label = Column(String(100), nullable=False)
    sort_order = Column(SmallInteger, nullable=False)
