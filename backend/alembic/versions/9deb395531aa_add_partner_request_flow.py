"""add_partner_request_flow

Revision ID: 9deb395531aa
Revises: 342b420a91d7
Create Date: 2026-04-01 20:05:03.651168

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, TIMESTAMP


# revision identifiers, used by Alembic.
revision = '9deb395531aa'
down_revision = '342b420a91d7'
branch_labels = None
depends_on = None


def upgrade():
    # Add new columns for partner request workflow
    op.add_column('accountability_partners',
        sa.Column('status', sa.String(20), nullable=False, server_default='pending'))
    op.add_column('accountability_partners',
        sa.Column('requester_id', UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False))
    op.add_column('accountability_partners',
        sa.Column('message', sa.Text, nullable=True))
    op.add_column('accountability_partners',
        sa.Column('responded_at', TIMESTAMP(timezone=True), nullable=True))

    # Make partner_user_id NOT NULL (existing rows should already have values)
    op.alter_column('accountability_partners', 'partner_user_id',
        existing_type=UUID(as_uuid=True),
        nullable=False)


def downgrade():
    # Remove added columns
    op.drop_column('accountability_partners', 'responded_at')
    op.drop_column('accountability_partners', 'message')
    op.drop_column('accountability_partners', 'requester_id')
    op.drop_column('accountability_partners', 'status')

    # Revert partner_user_id to nullable
    op.alter_column('accountability_partners', 'partner_user_id',
        existing_type=UUID(as_uuid=True),
        nullable=True)
