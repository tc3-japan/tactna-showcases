module.exports = {
  auth0Domain: process.env.AUTH0_DOMAIN || 'multiauth-sp.jp.auth0.com',
  path: process.env.SAML_PATH || '/callback',
  entryPoint: process.env.SAML_ENTRY_POINT || 'https://multiauth-sp.jp.auth0.com/samlp/MiQBdUt1FkEgJ22NqaSA8qA52BVjGI5v',
  issuer: process.env.ISSUER || 'urn:multiauth-sp.jp.auth0.com',
  cert: process.env.SAML_CERT || `-----BEGIN CERTIFICATE-----
  MIIDDTCCAfWgAwIBAgIJIqDbgs03iDR7MA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNVBAMTGW11bHRpYXV0aC1zcC5qcC5hdXRoMC5jb20wHhcNMjQwNzA4MDYyODE5WhcNMzgwMzE3MDYyODE5WjAkMSIwIAYDVQQDExltdWx0aWF1dGgtc3AuanAuYXV0aDAuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlUZDq1uEcs7YmbpTQZfIKR6OyKfjxlvCCW49OVJYa4MBmOhSebbtqudydn8foHO55zyeE8oDVrnncTOD45ME6hKH2Uu0wuyXeMtdaIsOXZurrYnUz0RTu0Mh9EPJ53qT0+9KY62kCtWGg5ewTBG7kD2qaAY/pwGqQjH/j+3LKE6zxkLrO7FrVEgRiiy/K2K8WsHF6WwkzTyUnfa51PT0uCswdIegEU95ljmVnHeiu5OUWg0QEL/ULaLgp/zUdAvAruuWhi6uWj8Pzps4x3AJkU06I8BarlEng5PbHOanrEw05y7J4LUP2HFY0Is0TXftpiLd8Ie8iwnvcWpHotL6kwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSM7hahoICqPxcOZVgeXC9Y2dsxizAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAHFJ/7Hp1y5GDmTY+CyS7E2Us0fuh1o7G4KNe0oitufqXHGbFgizO2WFmgVuPknaCiPGbPTyIdDR79o5B/4fd7en4uxHZlKJPFfgmKP2gOvnGqzsdI4rWl5SjTu3dJ1ZSkX/biE6F48EJ3+9VhW5jo1V1id0sMeybx9XmYrqPU67rsJdiCCaC8J3suBx45xAxLl2mJp+8tQRfZeES86mwklXkN8njsVaxC4elWYsGQLKf1p0QwgqBXTm22bNsNzIx0Jyoti8TgXtIikybVGQzCExDfhcYp+vb4nBkQ5jY2F6r6Xi0cac16uDCPh1pw8AyKUGedeIlECdgOo5x4pyv4g=
-----END CERTIFICATE-----`,
  protocol: process.env.PROTOCOL || 'https://',
};
