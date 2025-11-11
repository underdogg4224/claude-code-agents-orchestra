# Driver OS v2 - AI Quick Wins Assessment Tool

A Next.js 14 application for construction companies to identify operational quick wins using AI-powered assessments.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v3
- **Package Manager**: npm

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

Build for production:

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## Project Structure

```
driver-os-app/
├── src/
│   ├── app/              # Next.js 14 App Router pages
│   │   ├── layout.tsx    # Root layout with metadata
│   │   ├── page.tsx      # Home page
│   │   └── globals.css   # Global styles with Tailwind
│   ├── components/       # React components
│   │   └── ui/          # UI components (shadcn/ui ready)
│   ├── lib/             # Utility functions
│   │   └── utils.ts     # Class name merger for Tailwind
│   └── types/           # TypeScript type definitions
│       └── index.ts     # Shared types
├── public/              # Static assets
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.ts   # Tailwind CSS configuration
├── next.config.js       # Next.js configuration
└── .env.example         # Environment variables template
```

## Features

- Next.js 14 App Router
- TypeScript with strict mode
- Tailwind CSS with dark mode support
- Path aliases (@/ for src/)
- ESLint configuration
- Ready for shadcn/ui component integration

## Environment Variables

See `.env.example` for required environment variables:

- `DATABASE_URL` - PostgreSQL database connection
- `STRIPE_SECRET_KEY` - Stripe payment integration
- `CAL_COM_API_KEY` - Cal.com scheduling integration
- `RESEND_API_KEY` - Resend email service
- `NEXT_PUBLIC_APP_URL` - Application URL

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

ISC
