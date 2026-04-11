import os
import firebase_admin
from firebase_admin import credentials, messaging

# Initialize Firebase Admin SDK
cred_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "fams-8c5c9-firebase-adminsdk-fbsvc-0cf1ae8d8a.json")
if os.path.exists(cred_path):
    cred = credentials.Certificate(cred_path)
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
else:
    print(f"Warning: Firebase credentials not found at {cred_path}")

def send_push_notification(tokens: list[str], title: str, body: str, data: dict = None):
    """
    Sends a push notification to specific FCM tokens.
    """
    if not tokens:
        return
    
    if not data:
        data = {}

    # Ensure all data values are strings
    data = {str(k): str(v) for k, v in data.items()}

    message = messaging.MulticastMessage(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        data=data,
        tokens=tokens,
    )

    try:
        response = messaging.send_each_for_multicast(message)
        print(f"Successfully sent {response.success_count} messages")
        if response.failure_count > 0:
            for idx, resp in enumerate(response.responses):
                if not resp.success:
                    print(f"Failed to send to {tokens[idx]}: {resp.exception}")
    except Exception as e:
        print(f"Error sending push notification: {e}")
