import os
import json
from authlib.integrations.requests_client import OAuth2Session
from authlib.integrations.base_client.errors import OAuthError

def lambda_handler(event, context):
    # Get environment variables
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
        # Token request
        client = OAuth2Session(client_id, client_secret, token_endpoint_auth_method='client_secret_post')
        token = client.fetch_token(url=token_url, grant_type='client_credentials', **additional_data)
        print(f"Token: {token}")

        # Resource request
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
    except OAuthError as oauth_error:
        import traceback
        error_message = f"OAuthError occurred: {str(oauth_error)}\n{traceback.format_exc()}"
        error_obj = repr(oauth_error)  # Display the entire OAuthError object as a string
        print(error_message)
        print(f"OAuthError object: {error_obj}")
        print(f"OAuthError attributes: {oauth_error.__dict__}")  # Display all attributes of OAuthError

        status_code = 500 if oauth_error.error == 'server_error' else 400
        error_detail = {
            'error': oauth_error.error,      # Extract the error attribute
            'error_description': oauth_error.description  # Extract the error description attribute
        }

        return {
            'statusCode': status_code,
            'body': json.dumps(error_detail)
        }
    except Exception as e:
        import traceback
        error_message = f"General Error occurred: {str(e)}\n{traceback.format_exc()}"
        error_obj = repr(e)  # Display the entire error object as a string
        print(error_message)
        print(f"Exception object: {error_obj}")

        error_detail = {
            'error_message': error_message,
            'exception_object': error_obj  # Include the error object as a string
        }

        return {
            'statusCode': 500,
            'body': json.dumps(error_detail)
        }