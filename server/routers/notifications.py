import traceback
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.models import Notification, User, FcmToken
from security.oauth2 import get_current_user
from typing import List
from pydantic import BaseModel
from services.email_service import send_appointment_email
from services.fcm_service import send_push_notification

class NotificationResponse(BaseModel):
    id: int
    type: str
    title: str
    message: str
    time: str
    read: bool
    actionUrl: str | None

class FcmTokenRequest(BaseModel):
    token: str

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

def create_notification(db: Session, user_id: int, type: str, title: str, message: str, email: str = None, appointment_details: dict = None):
    # 1. Save to DB
    new_notif = Notification(
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        action_url="/"
    )
    db.add(new_notif)
    db.commit()
    
    # 2. Send Push Notification via Firebase
    try:
        user_tokens = db.query(FcmToken).filter(FcmToken.user_id == user_id).all()
        token_list = [t.token for t in user_tokens]
        if token_list:
            send_push_notification(token_list, title, message)
    except Exception as e:
        print(f"Error triggering push notification: {e}")

    # 3. Send Email via SendGrid with optional ICS
    if email:
        email_body = message
        if appointment_details:
            # Construct a richer email body
            start_fmt = appointment_details['start_time'].strftime('%B %d, %Y at %H:%M')
            purpose = appointment_details.get('purpose', 'N/A')
            detailed_explanation = appointment_details.get('description', 'N/A')
            
            email_body = f"""
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; color: #1f2937; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h1 style="color: #2563eb; font-size: 24px; margin: 0;">Faculty Appointment System</h1>
                    </div>
                    
                    <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 16px; margin-bottom: 24px;">
                        <h2 style="color: #1e40af; font-size: 18px; margin: 0 0 8px 0;">{title}</h2>
                        <p style="margin: 0; font-size: 16px;">{message}</p>
                    </div>
                    
                    <div style="space-y: 16px;">
                        <div style="margin-bottom: 16px;">
                            <strong style="display: block; color: #4b5563; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">🕒 Time & Date</strong>
                            <p style="margin: 0; font-size: 16px; font-weight: 500;">{start_fmt}</p>
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <strong style="display: block; color: #4b5563; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">📝 Meeting Purpose</strong>
                            <p style="margin: 0; font-size: 16px; font-weight: 500;">{purpose}</p>
                        </div>
                        
                        <div style="margin-bottom: 24px;">
                            <strong style="display: block; color: #4b5563; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">📖 Detailed Explanation</strong>
                            <p style="margin: 0; font-size: 16px; padding: 12px; background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px;">
                                {detailed_explanation}
                            </p>
                        </div>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                    
                    <p style="font-size: 14px; color: #6b7280; text-align: center;">
                        A calendar event file (.ics) has been attached. Open it to sync this to your Google or Outlook calendar.
                    </p>
                </div>
            """
        
        try:
            send_appointment_email(email, title, email_body, appointment_details)
        except Exception as e:
            print(f"Error triggering email notification: {e}")

@router.post("/fcm-token")
def register_fcm_token(
    request: FcmTokenRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        existing = db.query(FcmToken).filter(
            FcmToken.token == request.token,
            FcmToken.user_id == current_user.id
        ).first()
        
        if not existing:
            new_token = FcmToken(user_id=current_user.id, token=request.token)
            db.add(new_token)
            db.commit()
            
        return {"message": "FCM Token registered successfully"}
    except Exception as e:
        db.rollback()
        print("FCM Token Registration Error:", traceback.format_exc())
        raise HTTPException(status_code=500, detail="Failed to save FCM token")

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
