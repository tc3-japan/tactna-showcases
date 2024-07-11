### Outline

某案件にて、須藤さんから依頼があった多段認証のAuth0動作を確認するためのサンプルアプリです
https://tc3jp.slack.com/archives/C079XC52MGC/p1720578055293279  
サンプル目的のため、環境変数は直接記載してます。

This is the sample apps, in order to check how external idp works with Auth0.  
Env Variables are written directly for the sample purpose.

### Description
Please refer docs here
https://docs.google.com/document/d/1nIVQeZNb9d_IkoX7LMxZgKoTyD0gojB1CAbpShVo4Wk/edit

### Tech Stack

- app-oidc
  - React+react-auth0
  - using template from auth0
    - https://auth0.com/docs/quickstart/spa/react/01-login

- app-saml
  - node.js+passport-saml
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
npm run start local
```

### Deployment
Hosting on Heroku
- app-saml  
https://dashboard.heroku.com/apps/multiauth-app-oidc
```sh
heroku git:remote -a multiauth-app-oidc -r multiauth-app-oidc
git subtree push --prefix incubator/multiauth/app-oidc/ multiauth-app-oidc feature/multi-auth:master
```

- app-saml  
https://dashboard.heroku.com/apps/multiauth-app-saml
```sh
heroku git:remote -a multiauth-app-saml -r multiauth-app-saml
git subtree push --prefix incubator/multiauth/app-saml/ multiauth-app-saml feature/multi-auth:master
```