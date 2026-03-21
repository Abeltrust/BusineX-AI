# BusineX AI

BusineX AI is a business operating workspace for early-stage and growing companies.

The product helps a team:
- capture business context
- generate a stage-aware operating strategy
- manage execution tasks
- track leads and pipeline value
- monitor burn and runway
- diagnose business bottlenecks with an AI review workflow

## Core Product Flow

1. Create a founder workspace with company details, stage, goals, and finances.
2. Generate an AI operating plan tailored to the business.
3. Work from the dashboard across Overview, Execution, CRM, and Finance.
4. Use the Business Review flow to diagnose growth or operational problems.

## Run Locally

Prerequisites:
- Node.js

Setup:
1. Install dependencies with `npm install`
2. Copy `.env.example` to `.env.local`
3. Set `GEMINI_API_KEY` in `.env.local` if you want live Gemini responses
4. Start the app with `npm run dev`

## Notes

- The app includes fallback strategy and review responses when no Gemini API key is configured.
- Workspace state is stored in browser localStorage for demo continuity.
- The current implementation uses a lightweight local-first setup and is not yet backed by a production service layer.
