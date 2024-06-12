# M2M OIDC Client Lambda

This project is an exmaple of M2M OIDC client using [Authlib](https://docs.authlib.org/en/latest/)

### Prerequisite
- pip3
- python3

### Configuration
Following environment variables required:

- CLIENT_ID
- CLIENT_SECRET
- ISSUER_URL
- TOKEN_URL
- RESOURCE_URL

`template.yaml` to run locally

### Run locally
```
sam build
sam local invoke OidcClientFunction
```

### Deployment
```
cd src/
pip3 install -r requirements.txt -t package/
cp app.py package/
cd package/
zip -r ../package.zip .
```

Upload created `package.zip` to AWS Lambda
