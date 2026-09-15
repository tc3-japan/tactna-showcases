# Tactna OIDC client (React SPA) — reference implementation

A minimal but complete example of an application that signs users in with
Tactna, using [react-oidc-context](https://github.com/authts/react-oidc-context)
and [oidc-client-ts](https://github.com/authts/oidc-client-ts) (authorization
code flow with PKCE, public client).

Read alongside the
[Authorization Developer Guide](https://tc3-japan.github.io/prd-hammerhead/public/auth/authorization.html),
which is the specification; this app is one way to satisfy it.

## What is where

```
src/auth/        How this app talks to Tactna — settings, claims, errors, resource-server calls
src/hooks/       useRequestedTeam: honouring ?team_id=
src/views/       The screens
src/devtools/    [DEV ONLY] the configuration panel and its plumbing
```

`src/devtools/` exists so testers can point the app at another tenant or client
at runtime. **Nothing outside that folder imports it**: set `VITE_CONFIG_PANEL=false`
(or delete the folder) and the app runs the way a real integration does — a
single `<TactnaAuthProvider>` configured from `.env`, as `src/main.tsx` shows.

## Setup

Copy `.env.sample` to `.env` and fill in at least:

| Variable | Value |
|---|---|
| `VITE_OIDC_AUTHORITY` | Your tenant's Tactna issuer, e.g. `https://auth.example.tactna.net` |
| `VITE_OIDC_CLIENT_ID` | The client id Tactna issued (`<user pool id>:<client id>`) |
| `VITE_OIDC_REDIRECT_SIGN_IN` | Where Tactna returns after login |
| `VITE_OIDC_REDIRECT_SIGN_OUT` | Where Tactna returns after logout |
| `VITE_AUDIENCE` | The resource server this app's access token is for |
| `VITE_RESOURCE_SERVER_URI` | The API the Resources screen calls |
| `VITE_TACTNA_API_URI` | Tactna's app API (v1), used by the team switcher |
| `VITE_SIGNUP_ENDPOINT` | MyAccount's origin, used for the signup and MyAccount links |

Then `npm install && npm run dev`.

### Values Tactna must have registered

These are rejected unless they are registered on the client, and the failure
happens at `/oauth2/authorize` before any screen is shown:

- **`redirect_uri`** → the client's login allowed URLs
- **`post_logout_redirect_uri`** → the client's logout allowed URLs
- **`audience`** → the client's allowed audiences

A value that is not registered comes back as
`?error=invalid_request&error_description=...`. Ask your Tactna contact to
register them; see "OIDC Client Registration" in the developer guide.

## The session model

- Access and ID tokens live **about 10 minutes**.
- Tactna issues a **refresh token** with them — no `offline_access` scope is
  needed — valid for as long as the Tactna session (30 days by default).
- oidc-client-ts renews with that refresh token shortly before expiry, and
  stores tokens in **`sessionStorage`** (per tab, cleared when the tab closes).
  Use `localStorage` only if you have decided the XSS trade-off deliberately.
- **A hidden `prompt=none` iframe does not work with Tactna**: the session
  cookie is `SameSite=Strict`, so it is not sent from a third-party context.
  Renewal is refresh-token only. There is no `check_session_iframe` either.

## Which team the user logs in to

An app asks for a team by putting `team_id` on the authorization request. This
app takes it from `?team_id=` (see `src/hooks/useRequestedTeam.ts`) and, when it
differs from the team in the current token, asks Tactna once for that team —
because a signed-in browser makes no authorization request on its own, and the
team would otherwise stay whatever it was.

Two rules worth copying:

- **Link to a team explicitly** (`https://app.example.com/page?team_id=<uuid>`)
  rather than remembering "the last team" in the app. A remembered team is per
  browser, not per user, so the next person to sign in gets sent to the previous
  person's team — Tactna then refuses it, correctly, and the user is stuck.
- **The team in the token is the truth.** After login, read
  `https://tactna.net/team_id` (typed in `src/auth/claims.ts`) rather than
  assuming the request was granted: if the account cannot enter the requested
  team, Tactna lets the user pick one it can enter, and that is the team you got.

## Switching teams in the app

`GET /v1/accounts/me/teams` (26Q3) lists the teams the account can switch to —
every membership sharing its login emails in this app, not just the one the
current token is for. Each row carries the fixed `status.type` with the tenant's
`status.code`, whether the current credential can enter without signing in again
(`authed`), whether the team only accepts its own IdP (`mandatoryExternalIdp`),
and the Auth0 `connection` where the tenant is Auth0-integrated.

There is no "switch" call: **switching is a new authorization request**
(`src/auth/teams.ts`, screen in `src/views/Teams.tsx`). Send `team_id`, plus
`connection` on Auth0-integrated tenants — sending both also skips the
team-selection screen. Tactna then decides whether the current credential can be
reused or the team's IdP has to authenticate the user again, so `authed` and
`mandatoryExternalIdp` are hints for the UI, never gates in your code.

The call needs a user token whose `audience` covers the Tactna API
(`VITE_TACTNA_API_URI`) and the `o_member.get` permission; M2M tokens are
rejected. `audience` takes a comma-separated list when the app calls its own
resource server as well.

A 401 here is almost always that audience: the API verifies the token against
the audience it expects, so a token minted for another resource server is
refused however fresh it is. Compare `aud` on the Profile screen with the API
you are calling before looking anywhere else.

Note the trap this exercises: `signinRedirect(args)` **replaces** the provider's
`extraQueryParams` instead of merging, so a one-off request must rebuild them all
(`extraQueryParams()` in `src/auth/settings.ts`) or it silently drops `audience`.

## Reading the claims

`src/auth/claims.ts` types the `https://tactna.net/*` claims and is the intended
way to read them. Note that `user_id` is the **membership** of a team while
`global_sid` is the **account** across teams. Everything is a UUID; Tactna never
exposes internal ids.

`app/status` and `app/team_status` carry the **tenant-defined status code**
(`SUBSCRIBED`, `AUTHORIZED_CUSTOM`, ...), not the fixed status **type** behind it
— two tenants spell the same type differently, so these claims cannot be
pattern-matched. Where you need to branch, read the type from
`GET /v1/accounts/me/teams`, which returns both (`status.type` / `status.code`).
Neither is an access check: Tactna does not issue tokens for a membership that
may not sign in.

## Logging out — three different things

| Action | What it ends | When to use |
|---|---|---|
| **Logout** (`signoutRedirect`) | This app's tokens **and the Tactna session** | The real logout. Needs `id_token_hint` (sent automatically) and a registered `post_logout_redirect_uri`. |
| **Force Logout** (`removeUser` + `prompt=login`) | This app's tokens only; Tactna asks for a credential again | Testing another account. The refresh token stays valid until revoked. |
| **`POST /revoke_token`** | One refresh token | Invalidating a token you have handed out; see the developer guide. |

## Error handling

Two rules this app follows, both in `src/auth/errors.ts`:

1. **Branch on `error`, never on `error_description`.** The code is the stable
   contract; the description is human-readable text whose wording changes
   without notice. Display it, log it, decide nothing on it.
2. **Never start a login automatically after a failure.** Every authorization
   error survives a retry — the account, the team or the request is the problem —
   so an automatic retry is an infinite redirect loop between your app and
   Tactna. Offer a button instead.

The same applies to API calls (`src/auth/resourceServer.ts`): a 401 is renewed
**once** and retried, because a short-lived token expiring is the common case; a
second 401 means access changed and is reported, never re-authenticated. A 403
is the resource server's own answer and is never a reason to log in again.

The same trap exists around the calling component, in two places:

- renewing a token changes the `auth` object, so an effect that both fetches and
  depends on `auth` re-fetches every renewal (see the dependency list in
  `src/views/Resources.tsx`);
- **do not replace the app with a loading screen while `activeNavigator` is
  `signinSilent`.** A renewal is meant to be invisible; unmounting the tree makes
  every mount effect run again when it finishes, so a screen that loads on mount
  reloads on every renewal — and since a 401 triggers a renewal, an API that
  keeps refusing becomes an unbounded request loop (measured at ~3.6 calls per
  second). `src/views/Layout.tsx` shows the gate.

## Calling a resource server

The Resources screen sends `Authorization: Bearer <access token>`. The resource
server verifies the token itself:

- signature against `GET /.well-known/jwks.json` of your tenant's issuer
- `iss` equal to that issuer
- `aud` containing the resource server URL (the `audience` above)
- `exp` / `nbf`

See "Resource Server" in the developer guide for the full flow and an example
authorizer.
