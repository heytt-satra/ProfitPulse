"""GA multi-tenant foundation and schema reconciliation.

Revision ID: 7f8e9a1b2c3d
Revises: 34b9d3c6a45f
Create Date: 2026-02-20 22:10:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "7f8e9a1b2c3d"
down_revision: Union[str, None] = "34b9d3c6a45f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _table_exists(inspector: sa.Inspector, table_name: str) -> bool:
    return table_name in inspector.get_table_names()


def _column_exists(inspector: sa.Inspector, table_name: str, column_name: str) -> bool:
    if not _table_exists(inspector, table_name):
        return False
    return column_name in {col["name"] for col in inspector.get_columns(table_name)}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not _table_exists(inspector, "organizations"):
        op.create_table(
            "organizations",
            sa.Column("id", sa.UUID(), nullable=False),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("owner_user_id", sa.UUID(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
            sa.ForeignKeyConstraint(["owner_user_id"], ["users.id"], ondelete="SET NULL"),
            sa.PrimaryKeyConstraint("id"),
        )

    if not _table_exists(inspector, "workspaces"):
        op.create_table(
            "workspaces",
            sa.Column("id", sa.UUID(), nullable=False),
            sa.Column("organization_id", sa.UUID(), nullable=False),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("slug", sa.String(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
            sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("organization_id", "slug", name="uq_workspace_org_slug"),
        )

    if not _table_exists(inspector, "workspace_memberships"):
        op.create_table(
            "workspace_memberships",
            sa.Column("id", sa.UUID(), nullable=False),
            sa.Column("workspace_id", sa.UUID(), nullable=False),
            sa.Column("user_id", sa.UUID(), nullable=False),
            sa.Column("role", sa.String(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
            sa.ForeignKeyConstraint(["workspace_id"], ["workspaces.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("workspace_id", "user_id", name="uq_workspace_membership_user"),
        )

    if not _table_exists(inspector, "chat_history"):
        op.create_table(
            "chat_history",
            sa.Column("id", sa.UUID(), nullable=False),
            sa.Column("workspace_id", sa.UUID(), nullable=True),
            sa.Column("user_id", sa.UUID(), nullable=False),
            sa.Column("query", sa.Text(), nullable=False),
            sa.Column("generated_sql", sa.Text(), nullable=True),
            sa.Column("sql_results", sa.JSON(), nullable=True),
            sa.Column("ai_response", sa.Text(), nullable=True),
            sa.Column("execution_time_ms", sa.Integer(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
            sa.ForeignKeyConstraint(["workspace_id"], ["workspaces.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )

    if not _table_exists(inspector, "notification_preferences"):
        op.create_table(
            "notification_preferences",
            sa.Column("id", sa.UUID(), nullable=False),
            sa.Column("workspace_id", sa.UUID(), nullable=True),
            sa.Column("user_id", sa.UUID(), nullable=False),
            sa.Column("email_enabled", sa.Boolean(), nullable=True),
            sa.Column("slack_enabled", sa.Boolean(), nullable=True),
            sa.Column("slack_webhook_url", sa.String(), nullable=True),
            sa.Column("delivery_time", sa.Time(), nullable=True),
            sa.Column("timezone", sa.String(), nullable=True),
            sa.Column("include_insights", sa.Boolean(), nullable=True),
            sa.ForeignKeyConstraint(["workspace_id"], ["workspaces.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )

    if not _table_exists(inspector, "saved_queries"):
        op.create_table(
            "saved_queries",
            sa.Column("id", sa.UUID(), nullable=False),
            sa.Column("workspace_id", sa.UUID(), nullable=False),
            sa.Column("user_id", sa.UUID(), nullable=True),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("question", sa.Text(), nullable=False),
            sa.Column("generated_sql", sa.Text(), nullable=False),
            sa.Column("chart_spec", sa.JSON(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
            sa.ForeignKeyConstraint(["workspace_id"], ["workspaces.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
            sa.PrimaryKeyConstraint("id"),
        )

    if not _table_exists(inspector, "dashboards"):
        op.create_table(
            "dashboards",
            sa.Column("id", sa.UUID(), nullable=False),
            sa.Column("workspace_id", sa.UUID(), nullable=False),
            sa.Column("created_by_user_id", sa.UUID(), nullable=True),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
            sa.ForeignKeyConstraint(["workspace_id"], ["workspaces.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["created_by_user_id"], ["users.id"], ondelete="SET NULL"),
            sa.PrimaryKeyConstraint("id"),
        )

    if not _table_exists(inspector, "dashboard_widgets"):
        op.create_table(
            "dashboard_widgets",
            sa.Column("id", sa.UUID(), nullable=False),
            sa.Column("dashboard_id", sa.UUID(), nullable=False),
            sa.Column("saved_query_id", sa.UUID(), nullable=True),
            sa.Column("title", sa.String(), nullable=False),
            sa.Column("widget_type", sa.String(), nullable=False),
            sa.Column("position_x", sa.Integer(), nullable=False),
            sa.Column("position_y", sa.Integer(), nullable=False),
            sa.Column("width", sa.Integer(), nullable=False),
            sa.Column("height", sa.Integer(), nullable=False),
            sa.Column("config", sa.JSON(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
            sa.ForeignKeyConstraint(["dashboard_id"], ["dashboards.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["saved_query_id"], ["saved_queries.id"], ondelete="SET NULL"),
            sa.PrimaryKeyConstraint("id"),
        )

    inspector = sa.inspect(bind)

    if _column_exists(inspector, "users", "hashed_password"):
        op.alter_column("users", "hashed_password", existing_type=sa.String(), nullable=True)

    if _table_exists(inspector, "fact_daily_financials") and not _column_exists(inspector, "fact_daily_financials", "workspace_id"):
        op.add_column("fact_daily_financials", sa.Column("workspace_id", sa.UUID(), nullable=True))
        op.create_foreign_key(
            "fk_financials_workspace",
            "fact_daily_financials",
            "workspaces",
            ["workspace_id"],
            ["id"],
            ondelete="CASCADE",
        )

    if _table_exists(inspector, "integrations") and not _column_exists(inspector, "integrations", "workspace_id"):
        op.add_column("integrations", sa.Column("workspace_id", sa.UUID(), nullable=True))
        op.create_foreign_key(
            "fk_integrations_workspace",
            "integrations",
            "workspaces",
            ["workspace_id"],
            ["id"],
            ondelete="CASCADE",
        )

    if _table_exists(inspector, "chat_history") and not _column_exists(inspector, "chat_history", "workspace_id"):
        op.add_column("chat_history", sa.Column("workspace_id", sa.UUID(), nullable=True))
        op.create_foreign_key(
            "fk_chat_history_workspace",
            "chat_history",
            "workspaces",
            ["workspace_id"],
            ["id"],
            ondelete="CASCADE",
        )

    if _table_exists(inspector, "notification_preferences") and not _column_exists(inspector, "notification_preferences", "workspace_id"):
        op.add_column("notification_preferences", sa.Column("workspace_id", sa.UUID(), nullable=True))
        op.create_foreign_key(
            "fk_notification_preferences_workspace",
            "notification_preferences",
            "workspaces",
            ["workspace_id"],
            ["id"],
            ondelete="CASCADE",
        )


def downgrade() -> None:
    # Intentionally conservative for production safety.
    # This migration introduces tenancy and analytics artifacts that should not
    # be auto-dropped in a blind downgrade.
    raise RuntimeError("Downgrade is blocked for this irreversible GA foundation migration.")
