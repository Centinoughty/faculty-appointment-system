from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.models import Notification, User
from security.oauth2 import get_current_user
from typing import List
from pydantic import BaseModel

class NotificationResponse(BaseModel):
    id: int
    type: str
    title: str
    message: str
    time: str
    read: bool
    actionUrl: str | None

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

def send_mock_email(to_email: str, subject: str, body: str):
    print("="*50)
    print(f"📧 MOCK EMAIL DISPATCHED to {to_email}")
    print(f"Subject: {subject}")
    print(f"Body: {body}")
    print("="*50)

def create_notification(db: Session, user_id: int, type: str, title: str, message: str, email: str = None):
    new_notif = Notification(
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        action_url="/"
    )
    db.add(new_notif)
    db.commit()
    
    if email:
        send_mock_email(email, title, message)

@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notifs = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).all()
    
    return [
        NotificationResponse(
            id=n.id,
            type=n.type,
            title=n.title,
            message=n.message,
            time=n.created_at.isoformat(),
            read=n.read,
            actionUrl=n.action_url
        ) for n in notifs
    ]

@router.put("/{notif_id}/read")
def mark_read(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notif = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notif.read = True
    db.commit()
    return {"message": "Notification marked as read"}
