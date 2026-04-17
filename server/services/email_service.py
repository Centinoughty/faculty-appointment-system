import os
import base64
from datetime import datetime, timedelta
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileName, FileType, Disposition
from ics import Calendar, Event
from config import settings

def create_ics(event_title: str, description: str, start_dt: datetime, end_dt: datetime, attendees: list = None) -> bytes:
    """
    Creates an iCalendar (.ics) file mapping an appointment.
    """
    c = Calendar()
    e = Event()
    e.name = event_title
    e.begin = start_dt
    e.end = end_dt
    e.description = description
    c.events.add(e)
    return str(c).encode('utf-8')

def send_appointment_email(to_email: str, subject: str, html_content: str, appointment_details: dict = None):
    """
    Sends an email using SendGrid, with an optional ICS attachment.
    """
    if not settings.sendgrid_api_key:
        print(f"MOCK EMAIL (SendGrid key missing) -> To: {to_email}, Subject: {subject}")
        return False

    message = Mail(
        from_email=settings.sendgrid_from_email,
        to_emails=to_email,
        subject=subject,
        html_content=html_content
    )

    # Attach ICS if details are provided
    if appointment_details:
        start_time = appointment_details.get("start_time") # Must be a datetime object
        end_time = appointment_details.get("end_time") # Must be a datetime object
        title = appointment_details.get("title", subject)
        description = appointment_details.get("description", html_content)
        
        if start_time and end_time:
            ics_bytes = create_ics(title, description, start_time, end_time)
            encoded_ics = base64.b64encode(ics_bytes).decode()
            
            attachment = Attachment(
                FileContent(encoded_ics),
                FileName('appointment.ics'),
                FileType('text/calendar'),
                Disposition('attachment')
            )
            message.attachment = attachment

    try:
        sg = SendGridAPIClient(settings.sendgrid_api_key)
        response = sg.send(message)
        print(f"Email sent successfully. Status Code: {response.status_code}")
        return True
    except Exception as e:
        print(f"Error sending email via SendGrid: {e}")
        return False
