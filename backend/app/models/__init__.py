# Import all models so they register with Base.metadata
from app.models.user import User  # noqa: F401
from app.models.organization import Organization  # noqa: F401
from app.models.workspace import Workspace  # noqa: F401
from app.models.workspace_membership import WorkspaceMembership  # noqa: F401
from app.models.financial_data import FinancialData  # noqa: F401
from app.models.integration import Integration  # noqa: F401
from app.models.notification_preference import NotificationPreference  # noqa: F401
from app.models.chat_history import ChatHistory  # noqa: F401
from app.models.saved_query import SavedQuery  # noqa: F401
from app.models.dashboard import Dashboard  # noqa: F401
from app.models.dashboard_widget import DashboardWidget  # noqa: F401
from app.models.sync_job import SyncJob  # noqa: F401
from app.models.sync_run import SyncRun  # noqa: F401
