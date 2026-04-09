from typing import Dict
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Explicit mapping: user_id -> distinct WebSocket connection
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: int):
        websocket = self.active_connections.get(user_id)
        if websocket:
            try:
                await websocket.send_json(message)
            except Exception:
                self.disconnect(user_id)

    async def broadcast(self, message: dict):
        for uid, conn in list(self.active_connections.items()):
            try:
                await conn.send_json(message)
            except Exception:
                self.disconnect(uid)

ws_manager = ConnectionManager()
