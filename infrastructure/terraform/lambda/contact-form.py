import json
import os
import re

def lambda_handler(event, context):
    """
    Lambda function to handle contact form submissions.
    Sends email via SES if configured, otherwise just logs the submission.
    """

    # Parse request body
    try:
        if 'body' in event:
            body = json.loads(event['body'])
        else:
            body = event
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Invalid JSON in request body'})
        }

    # Extract fields
    name = body.get('name', '').strip()
    email = body.get('email', '').strip()
    message = body.get('message', '').strip()

    # Validate required fields
    if not name or not email or not message:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Name, email, and message are required'})
        }

    # Validate email format
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Invalid email format'})
        }

    # Get configuration from environment
    to_email = os.environ.get('TO_EMAIL', '')
    from_email = os.environ.get('FROM_EMAIL', '')

    # Log the submission
    print(f"Contact form submission from {name} <{email}>")
    print(f"Message: {message[:100]}...")

    # Send email via SES if configured
    if to_email and from_email:
        try:
            import boto3

            ses = boto3.client('ses')

            response = ses.send_email(
                Source=from_email,
                Destination={
                    'ToAddresses': [to_email]
                },
                Message={
                    'Subject': {
                        'Data': f"Contact Form Submission from {name}"
                    },
                    'Body': {
                        'Text': {
                            'Data': f"Name: {name}\nEmail: {email}\n\nMessage:\n{message}"
                        },
                        'Html': {
                            'Data': f"""
                            <h2>Contact Form Submission</h2>
                            <p><strong>Name:</strong> {name}</p>
                            <p><strong>Email:</strong> {email}</p>
                            <p><strong>Message:</strong></p>
                            <p>{message.replace(chr(10), '<br>')}</p>
                            """
                        }
                    }
                }
            )
            print(f"Email sent successfully: {response['MessageId']}")

        except Exception as e:
            print(f"Error sending email: {str(e)}")
            # Don't fail the request if email fails, just log it

    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'message': 'Thank you for your message! We will get back to you soon.'})
    }
