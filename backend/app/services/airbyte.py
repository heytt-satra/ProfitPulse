from typing import Any, Dict, Optional

import httpx

from app.core.config import settings


class AirbyteService:
    def __init__(self) -> None:
        self.base_url = settings.AIRBYTE_URL.rstrip("/")
        self.auth = (settings.AIRBYTE_USERNAME, settings.AIRBYTE_PASSWORD)

    async def _post(self, path: str, payload: dict[str, Any]) -> Optional[dict[str, Any]]:
        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.post(
                    f"{self.base_url}{path}",
                    json=payload,
                    auth=self.auth,
                )
        except httpx.HTTPError:
            return None

        if response.status_code >= 300:
            return None
        return response.json()

    async def check_health(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/health")
        except httpx.HTTPError:
            return False
        return response.status_code == 200

    async def create_source(
        self,
        name: str,
        source_definition_id: str,
        connection_configuration: Dict[str, Any],
        workspace_id: Optional[str] = None,
    ) -> Optional[str]:
        payload = {
            "name": name,
            "sourceDefinitionId": source_definition_id,
            "connectionConfiguration": connection_configuration,
            "workspaceId": workspace_id or settings.AIRBYTE_WORKSPACE_ID,
        }
        result = await self._post("/sources/create", payload)
        if not result:
            return None
        return result.get("sourceId")

    async def create_connection(
        self,
        source_id: str,
        destination_id: Optional[str] = None,
        namespace_definition: str = "destination",
        namespace_format: str = "${SOURCE_NAMESPACE}",
    ) -> Optional[str]:
        payload = {
            "sourceId": source_id,
            "destinationId": destination_id or settings.AIRBYTE_DESTINATION_ID,
            "namespaceDefinition": namespace_definition,
            "namespaceFormat": namespace_format,
            "scheduleType": "manual",
        }
        result = await self._post("/connections/create", payload)
        if not result:
            return None
        return result.get("connectionId")

    async def trigger_sync(self, connection_id: str) -> bool:
        payload = {"connectionId": connection_id}
        result = await self._post("/connections/sync", payload)
        return bool(result)


airbyte_service = AirbyteService()
