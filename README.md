# SAMS Academic Complaints & AI Dispatch Portal - Frontend Web

> **Frontend Application:** `sams-complaints-system-frontend-next`  
> **Technology Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript

## Overview

Client-side portal for the **Sadat Academy for Management Sciences (SAMS)** Academic Complaints & AI Dispatch Portal. Built with strict Arabic Right-to-Left (`dir="rtl"`, `lang="ar"`) support, institutional brand design tokens, responsive public complaint submission/tracking workflows, and administrative role portals.

## Directory Layout

```
src/
├── app/                  # Next.js App Router (pages, layouts, route handlers)
│   ├── layout.tsx        # Global Arabic RTL layout with typography & metadata
│   ├── page.tsx          # Public landing page with hero banner & leadership spotlight
│   └── tickets/
│       └── track/        # Ticket tracking search & timeline status view
├── components/
│   ├── layout/           # Shared layout (Header with SAMS Crest Logo, Footer)
│   └── ui/               # Reusable UI controls (Form fields, buttons, modals)
├── features/
│   └── tickets/          # Ticket submission forms, validation schemas, and API client
public/
├── images/               # Official brand assets (Crest Logo, Campus Gate, Leadership Portrait)
└── favicon.ico           # Application favicon
```

## Brand Assets & Styling

- **Academy Crest Logo:** Located at `public/images/SAMS شعار الاكاديمية.jpeg`. Displayed in header, navigation, and administrative sidebars.
- **Academy Campus Gate:** Located at `public/images/صورة الاكاديمية SAMS.jpg`. Displayed as hero banner background with institutional gradient overlay.
- **Dean / Leadership Portrait:** Located at `public/images/العميد.jpg`. Featured in leadership spotlight and administrative executive profile.

## Environment Setup

1. Copy the sample environment file:
   ```bash
   cp .env.example .env.local
   ```
2. Configure required environment variables:
   - `NEXT_PUBLIC_API_BASE_URL`: Base URL of the backend NestJS service (e.g., `http://localhost:3000`).

## Local Development & Testing

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run TypeScript type check
npx tsc --noEmit

# Build for production
npm run build

# Start production server
npm run start
```
