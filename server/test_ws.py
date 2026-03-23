import urllib.request
try:
    req = urllib.request.Request("http://localhost:8000/api/student/faculty", method="GET")
    with urllib.request.urlopen(req) as response:
        print("HTTP Status:", response.status)
except Exception as e:
    print("HTTP Error:", e)

import asyncio
from websockets.sync.client import connect
from websockets.exceptions import InvalidStatusCode

def test_websocket():
    try:
        with connect("ws://localhost:8000/ws/1") as ws:
            print("WebSocket Connected!")
    except InvalidStatusCode as e:
        print(f"WebSocket Error: Server rejected connection with {e.status_code}")
    except Exception as e:
        print(f"WebSocket Generic Error: {e}")

test_websocket()
