import os
import secrets
from dotenv import load_dotenv
from passlib.context import CryptContext
import sendgrid
from sendgrid.helpers.mail import *

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def generate_token() -> str:
    return secrets.token_urlsafe(32)

async def send_email(email: str, token: str):
    sg = sendgrid.SendGridAPIClient(api_key=os.environ['EMAIL_API_KEY'])
    
    link = f"http://localhost:3000/reset_password?token={token}"
    subject = 'Password Reset Request'
    message = (f'Hello,\n\nTo reset your password, please go to this link: {link}\n\nNote: link will expire in 10 '
               f'minutes\n\nRegards,\nYour App Team')

    email_message = Mail(
        from_email='bytecon0@gmail.com',
        to_emails=email,
        subject=subject,
        plain_text_content=message
    )

    try:
        response = sg.send(email_message)
        print(f"Reset email sent to {email} with token {token}")
        print(f"SendGrid response status: {response.status_code}")
    except Exception as e:
        print(f"Error sending email with exception: {e}")
