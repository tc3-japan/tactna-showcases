# Auth0 Regular Webapp SAML IDP Client   

This is a Node.js Express Regular Web application that uses the SAML2 protocol
to authentication against Auth0 as SAML IDP

## Setup

### Locally

Optional, dev. setup.

Add:

```
127.0.0.1  app1.com
```

to your `/etc/hosts` file.


### Dashboard

Create a regular web application Client.

Under settings ensure you have:

Client-Type: Regular Web Application 

Allowed Callback URLs:
 - http://app1.com:3000/callback

Allowed Logout URLs
 - http://app1.com:3000/logout

Under tenant settings -> advanced -> Allowed Logout URLs
 - http://app1.com:3000/logout


Under `Application -> Addons -> SAML2 Web App`

We shall be following [these Auth0 documentation instructions](https://auth0.com/docs/protocols/saml/saml-idp-generic#2-configure-auth0-as-idp)

Enable the `SAML2 Web App toggle`

Optionally, add any specific settings you like in `Settings` textarea.

For example:

```
{
  "nameIdentifierProbes": [
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
  ]
}
```


## Running the Sample

Install the dependencies.

```bash
npm install
```

Need to update `config.js`

Example populated values below:

```
  auth0Domain: process.env.AUTH0_DOMAIN || 'demonstration.auth0.com',
  path: process.env.SAML_PATH || '/callback',
  entryPoint: process.env.SAML_ENTRY_POINT || 'https://demonstration.auth0.com/samlp/EGkmJ0gloLyPgzbZc2ivqDkac8RkJfAE',
  issuer: 'urn:demonstration.auth0.com',
  cert: process.env.SAML_CERT || `-----BEGIN CERTIFICATE----- ... 
```

`auth0Domain` - the `Domain` setting under {Your Application} -> Settings 

`path` - you can leave this as `/callback` for this app. It is the callback path 

`entryPoint` - Get this value from {Your Application} -> Addons -> SAM2 Web App -> Usage (tab)  
It is the `Identity Provider Login URL` value.

`issuer` - Get this value from {Your Application} -> Addons -> SAM2 Web App -> Usage (tab)  
It is the `Issuer` value.

`cert` - Get this value from {Your Application} -> Addons -> SAM2 Web App -> Usage (tab)  
Click on `Identity Provider Certificate: download Auth0 certificate` and it is the downloaded cert contents.


## Run the Application

Run the application by executing the command below.

```bash
npm start
```

The app will be served at `http://app1.com:3000`.


## What is Auth0?

Auth0 helps you to:

* Add authentication with [multiple authentication sources](https://docs.auth0.com/identityproviders), either social like **Google, Facebook, Microsoft Account, LinkedIn, GitHub, Twitter, Box, Salesforce, amont others**, or enterprise identity systems like **Windows Azure AD, Google Apps, Active Directory, ADFS or any SAML Identity Provider**.
* Add authentication through more traditional **[username/password databases](https://docs.auth0.com/mysql-connection-tutorial)**.
* Add support for **[linking different user accounts](https://docs.auth0.com/link-accounts)** with the same user.
* Support for generating signed [Json Web Tokens](https://docs.auth0.com/jwt) to call your APIs and **flow the user identity** securely.
* Analytics of how, when and where users are logging in.
* Pull data from other sources and add it to the user profile, through [JavaScript rules](https://docs.auth0.com/rules).

## Create a free account in Auth0

1. Go to [Auth0](https://auth0.com) and click Sign Up.
2. Use Google, GitHub or Microsoft Account to login.

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
