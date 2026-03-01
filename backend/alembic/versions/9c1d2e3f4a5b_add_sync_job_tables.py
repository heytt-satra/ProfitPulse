"""Add sync job/run tables for ingestion orchestration.

Revision ID: 9c1d2e3f4a5b
Revises: 7f8e9a1b2c3d
Create Date: 2026-02-20 23:25:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9c1d2e3f4a5b"
down_revision: Union[str, None] = "7f8e9a1b2c3d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _table_exists(inspector: sa.Inspector, table_name: str) -> bool:
    return table_name in inspector.get_table_names()


def _index_exists(inspector: sa.Inspector, table_name: str, index_name: str) -> bool:
    if not _table_exists(inspector, table_name):
        return False
    return index_name in {idx["name"] for idx in inspector.get_indexes(table_name)}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not _table_exists(inspector, "sync_jobs"):
        op.create_table(
            "sync_jobs",
            sa.Column("id", sa.UUID(), nullable=False),
            sa.Column("workspace_id", sa.UUID(), nullable=False),
            sa.Column("integration_id", sa.UUID(), nullable=False),
            sa.Column("provider", sa.String(), nullable=False),
            sa.Column("status", sa.String(), nullable=False, server_default="pending"),
            sa.Column("trigger_type", sa.String(), nullable=False, server_default="manual"),
            sa.Column("requested_by_user_id", sa.UUID(), nullable=True),
            sa.Column("celery_task_id", sa.String(), nullable=True),
            sa.Column("attempt_count", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("latest_error", sa.Text(), nullable=True),
            sa.Column("requested_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
            sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(["workspace_id"], ["workspaces.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["integration_id"], ["integrations.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["requested_by_user_id"], ["users.id"], ondelete="SET NULL"),
            sa.PrimaryKeyConstraint("id"),
        )

    inspector = sa.inspect(bind)
    if not _index_exists(inspector, "sync_jobs", "ix_sync_jobs_workspace_requested_at"):
        op.create_index(
            "ix_sync_jobs_workspace_requested_at",
            "sync_jobs",
            ["workspace_id", "requested_at"],
            unique=False,
        )
    if not _index_exists(inspector, "sync_jobs", "ix_sync_jobs_integration_requested_at"):
        op.create_index(
            "ix_sync_jobs_integration_requested_at",
            "sync_jobs",
            ["integration_id", "requested_at"],
            unique=False,
        )

    inspector = sa.inspect(bind)
    if not _table_exists(inspector, "sync_runs"):
        op.create_table(
            "sync_runs",
            sa.Column("id", sa.UUID(), nullable=False),
            sa.Column("sync_job_id", sa.UUID(), nullable=False),
            sa.Column("status", sa.String(), nullable=False, server_default="running"),
            sa.Column("attempt_number", sa.Integer(), nullable=False, server_default="1"),
            sa.Column("external_job_id", sa.String(), nullable=True),
            sa.Column("result_payload", sa.JSON(), nullable=True),
            sa.Column("error_message", sa.Text(), nullable=True),
            sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
            sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(["sync_job_id"], ["sync_jobs.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )

    inspector = sa.inspect(bind)
    if not _index_exists(inspector, "sync_runs", "ix_sync_runs_sync_job_started_at"):
        op.create_index(
            "ix_sync_runs_sync_job_started_at",
            "sync_runs",
            ["sync_job_id", "started_at"],
            unique=False,
        )


def downgrade() -> None:
    raise RuntimeError("Downgrade is blocked for this ingestion orchestration migration.")
