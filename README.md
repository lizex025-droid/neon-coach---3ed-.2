# ahed-prodictivty-20-62026

## AI backend proxy

The browser calls `POST /api/ai`; provider keys are read only by the server.

Create `.env.local` from `.env.example` and configure at least one provider:

```dotenv
AI_PROVIDER=auto
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

`auto` tries Gemini first, then OpenAI if Gemini is unavailable. A request can also
select `gemini` or `openai` explicitly without sending a key or model:

```http
POST /api/ai
Content-Type: application/json

{
  "provider": "auto",
  "message": "احسب احتياجي اليومي من البروتين",
  "dashboardData": {},
  "chatHistory": []
}
```

Never use `VITE_GEMINI_API_KEY` or `VITE_OPENAI_API_KEY`; variables prefixed with
`VITE_` are exposed to browser bundles. Add the same server variables to the
hosting provider before deploying.
