# BusineX AI

BusineX AI is a founder operating workspace for early-stage and growing companies. It combines structured business setup, AI-assisted strategy generation, execution tracking, CRM visibility, financial discipline, and review workflows in one Vite + React application.

## What The Product Covers

The platform helps a team:
- capture business context
- generate a stage-aware operating strategy
- manage execution tasks
- track leads and pipeline value
- monitor burn and runway
- diagnose business bottlenecks with an AI review workflow

## Application Routes

- `/` for the product landing page
- `/setup` for founder and company onboarding
- `/workspace` for strategy, execution, CRM, and finance operations
- `/review` for the business review workflow

## Core Product Flow

1. Create a founder workspace with company details, stage, goals, and finances.
2. Generate an AI operating plan tailored to the business.
3. Work from the dashboard across Overview, Execution, CRM, and Finance.
4. Use the Business Review flow to diagnose growth or operational problems.

## Project Structure

- `src/components/` contains layout and shared UI primitives
- `src/context/` contains workspace state and business actions
- `src/pages/` contains route-level screens
- `src/router/` contains the client-side router
- `src/services/` contains AI integration logic

## Run Locally

Prerequisites:
- Node.js

Setup:
1. Install dependencies with `npm install`
2. Copy `.env.example` to `.env.local`
3. Set `VITE_GEMINI_API_KEY` in `.env.local` if you want live Gemini responses
4. Start the app with `npm run dev`

## Notes

- The app includes fallback strategy and review responses when no Gemini API key is configured.
- Workspace state is stored in browser localStorage to preserve the generated workspace between reloads.
- Routing is handled client-side so each major workflow has a stable path.
- The current implementation remains local-first and does not yet include a backend persistence or authentication layer.
