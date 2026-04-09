from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from websocket_manager import ws_manager

router = APIRouter(prefix="/ws", tags=["WebSocket"])

@router.websocket("/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await ws_manager.connect(websocket, user_id)
    try:
        while True:
            # We don't intend to receive anything from the client right now,
            # but we wait on receive_text() to process client disconnection events natively
            _ = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(user_id)
