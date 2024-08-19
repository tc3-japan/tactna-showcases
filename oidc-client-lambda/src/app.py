import os
from authlib.integrations.requests_client import OAuth2Session
import json

def lambda_handler(event, context):
    # environment variables
    client_id = os.getenv('CLIENT_ID')
    client_secret = os.getenv('CLIENT_SECRET')
    token_url = os.getenv('TOKEN_URL')
    resource_url = os.getenv('RESOURCE_URL')
    audience = os.getenv('AUDIENCE')
    if not all([client_id, client_secret, token_url, resource_url]):
        return {
            'statusCode': 500,
            'body': json.dumps('Missing required environment variables')
        }

    additional_data = {
        'audience': audience
    }

    try:
        # token request
        client = OAuth2Session(client_id, client_secret, token_endpoint_auth_method='client_secret_post')
        token = client.fetch_token(url=token_url, grant_type='client_credentials', **additional_data)
        print(f"Token: {token}")

        # resource request
        response = client.get(resource_url)
        if response.status_code == 200:
            return {
                'statusCode': 200,
                'body': json.dumps(response.json())
            }
        else:
            return {
                'statusCode': response.status_code,
                'body': json.dumps(response.text)
            }
    except Exception as e:
        import traceback
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error on resource request: {str(e)}\n{traceback.format_exc()}")
        }
