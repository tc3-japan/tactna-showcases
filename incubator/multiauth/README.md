### Outline

某案件にて、須藤さんから依頼があった多段認証のAuth0動作を確認するためのサンプルアプリです
https://tc3jp.slack.com/archives/C079XC52MGC/p1720578055293279

This is the sample apps, in order to check how external idp works with Auth0.

### Description
Please refer docs here
https://docs.google.com/document/d/1nIVQeZNb9d_IkoX7LMxZgKoTyD0gojB1CAbpShVo4Wk/edit

### Tech Stack

- app-oidc
  - React+react-auth0
  - using template from auth0
    - https://auth0.com/docs/quickstart/spa/react/01-login

- app-saml
  - node.js+saml-passport
  - using template from auth0
    - https://github.com/auth0-samples/auth0-regular-webapp-saml-idp-client
  - NOTE: I couldn't find SAML auth0 official template other than this(nodejs).

### Local Setup
- app-oidc
```sh
cd app-oidc
npm install
npm run start
```

- app-saml
```sh
cd app-saml
npm install
npm run start
```

### Deployment
Hosting on Heroku