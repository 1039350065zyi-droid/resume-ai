# ResumeAI Deployment Checklist

## Railway environment variables

Required:

- `MIMO_API_KEY`: AI provider API key used only on the server.
- `MIMO_API_URL`: OpenAI-compatible chat completion endpoint.
- `MIMO_MODEL`: default model name, for example `qwen-plus` or a tested mimo model.
- `AI_TIMEOUT_MS`: optional AI request timeout. Keep it between `10000` and `240000`.
- `ADMIN_PASSWORD`: admin login password.
- `ADMIN_SESSION_SECRET`: long random secret for signing admin cookies.
- `ADMIN_LOGIN_PATH`: hidden admin login path, for example `/owner-random-string/login`.
- `NODE_ENV`: set to `production`.

Optional:

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_VERSION`

## Sensitive files

- `.env*` is ignored.
- `data/models.json` is ignored because it can contain provider API keys.
- `node_modules`, `.next`, `.vercel`, and build outputs are ignored.
- `.railway`, `test-output`, and temporary PDF/PNG files are ignored.
- Do not commit real API keys into Git history or remote URLs.
- Do not keep GitHub tokens in `git remote -v`; use a plain HTTPS remote or GitHub CLI/credential manager.

## Railway compatibility

- On Railway/Render-style deployments, `data/models.json` should not be treated as production configuration. Use environment variables for model settings.
- Admin model and skill management routes are protected by signed HttpOnly cookies.
- In production, direct `/admin/login` access is hidden. Use `ADMIN_LOGIN_PATH` to reach the login page.
- Saved model API keys are not returned to the browser. The admin UI only receives `hasApiKey` and an empty `apiKey` field.
- The server PDF download route uses the bundled open-source Chinese font in `public/fonts/WenQuanYiMicroHei.ttf`.

## Railway service settings

- Build command: `npm run build`
- Start command: `npm run start`
- Healthcheck path: `/`
- Config-as-code file: `railway.json`

## Verification commands

Run these before deployment:

```bash
npm install
npm run lint
npm run build
```

Current note: `npm audit --audit-level=moderate` reports a moderate PostCSS advisory through `next@16.2.9`. Do not run `npm audit fix --force` because npm suggests a breaking downgrade path. Track the next safe Next.js patch release instead.
