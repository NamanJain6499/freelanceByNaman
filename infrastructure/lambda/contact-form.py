import json
import os
import re
from datetime import datetime

# Contact form handler for API Gateway

def handler(event, context):
    """
    Contact form handler for API Gateway.
    Receives form submissions and sends email via SES or logs for retrieval.
    """

    # CORS headers
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    }

    # Handle OPTIONS request (CORS preflight)
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }

    try:
        # Parse request body
        body = event.get('body', '{}')
        if isinstance(body, str):
            body = json.loads(body)

        # Validate required fields
        name = body.get('name', '').strip()
        email = body.get('email', '').strip()
        message = body.get('message', '').strip()
        company = body.get('company', '').strip()
        service = body.get('service', '').strip()
        budget = body.get('budget', '').strip()

        if not name or not email or not message:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Name, email, and message are required'})
            }

        # Validate email format
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Invalid email format'})
            }

        # Prepare submission data
        submission = {
            'name': name,
            'email': email,
            'message': message,
            'company': company,
            'service': service,
            'budget': budget,
            'timestamp': datetime.utcnow().isoformat(),
            'source_ip': event.get('requestContext', {}).get('identity', {}).get('sourceIp', 'unknown')
        }

        # Log submission
        print(f"Contact form submission: {json.dumps(submission)}")

        # Send email via SES
        try:
            send_email_via_ses(submission)
        except Exception as e:
            print(f"Failed to send email: {str(e)}")
            # Still return success to user - we'll retry or handle via logs

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'message': 'Thank you! Your message has been received.',
                'timestamp': submission['timestamp']
            })
        }

    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Invalid JSON in request body'})
        }
    except Exception as e:
        print(f"Error processing contact form: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': 'An error occurred. Please try again later.'})
        }


def send_email_via_ses(submission):
    """
    Send email via AWS SES. Requires:
    1. SES domain or email verification
    2. Lambda IAM role with ses:SendEmail permission
    """
    import boto3

    to_email = os.environ.get('TO_EMAIL')
    from_email = os.environ.get('FROM_EMAIL')

    if not to_email or not from_email:
        print("TO_EMAIL or FROM_EMAIL not configured")
        return

    ses_client = boto3.client('ses', region_name='us-east-1')

    email_body = f"""
New Contact Form Submission

Name: {submission['name']}
Email: {submission['email']}
Company: {submission['company'] or 'Not provided'}
Service: {submission['service'] or 'Not selected'}
Budget: {submission['budget'] or 'Not specified'}

Message:
{submission['message']}

---
Submitted at: {submission['timestamp']}
IP: {submission['source_ip']}
    """

    ses_client.send_email(
        Source=from_email,
        Destination={'ToAddresses': [to_email]},
        Message={
            'Subject': {
                'Data': f"Contact Form: {submission['name']} - {submission['service'] or 'General inquiry'}"
            },
            'Body': {
                'Text': {'Data': email_body}
            }
        }
    )
