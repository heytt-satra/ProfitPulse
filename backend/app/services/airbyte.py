from typing import Dict, Any, Optional
import httpx
from app.core.config import settings

class AirbyteService:
    def __init__(self, base_url: str = "http://localhost:8001/api/v1", username: str = "airbyte", password: str = "password"):
        self.base_url = base_url
        self.auth = (username, password)
        # In a real scenario, these would come from settings

    async def check_health(self) -> bool:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/health")
                return response.status_code == 200
        except Exception:
            return False

    async def create_source(self, name: str, source_definition_id: str, connection_configuration: Dict[str, Any], workspace_id: str) -> Optional[str]:
        """
        Creates a source in Airbyte. Returns the sourceId.
        """
        try:
            payload = {
                "name": name,
                "sourceDefinitionId": source_definition_id,
                "connectionConfiguration": connection_configuration,
                "workspaceId": workspace_id
            }
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/sources/create",
                    json=payload,
                    auth=self.auth
                )
                if response.status_code == 200:
                    return response.json().get("sourceId")
                return None
        except Exception as e:
            print(f"Error creating source: {e}")
            return None

    async def create_connection(self, source_id: str, destination_id: str, prefix: str = "") -> Optional[str]:
        """
        Creates a connection between source and destination.
        """
        # Implementation would call /connections/create
        # For MVP, we might just return a mock ID if Airbyte isn't running
        return "mock_connection_id_123"

    async def trigger_sync(self, connection_id: str) -> bool:
        """
        Triggers a manual sync for a connection.
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/connections/sync",
                    json={"connectionId": connection_id},
                    auth=self.auth
                )
                return response.status_code == 200
        except Exception:
            return False

airbyte_service = AirbyteService()
