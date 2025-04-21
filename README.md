# SlotJack

A modern slot machine game and bonus platform built with Next.js.

## Features

- User authentication with localStorage and optional Supabase integration
- Slot machine game with customizable payouts and winning combinations
- User profiles with JackPoints rewards system
- Admin panel for managing users, rewards, and market items
- Responsive design for mobile and desktop
- Market system for redeeming rewards

## Technology Stack

- **Frontend**: React, Next.js 15+, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (optional)
- **Authentication**: Custom implementation with localStorage, Supabase Auth as fallback
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Minodevs/slotjack.git
   cd slotjack
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env.local` file based on `.env`
   - Update with your Supabase credentials (optional)

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Deployment

### Deploying to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set the following environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `NEXT_TELEMETRY_DISABLED`: 1

4. Deploy with the following settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: (leave default)
   - Install Command: `npm install`

### Manual Deployment

To build the project for production:

```bash
npm run build
npm start
```

## Project Structure

```
slotjack/
├── public/             # Static files
├── src/
│   ├── app/            # Next.js app directory
│   │   ├── admin/      # Admin panel pages
│   │   ├── api/        # API routes
│   │   └── utils/      # Utility functions
│   ├── components/     # React components
│   ├── contexts/       # React contexts
│   ├── lib/            # Library code and utilities
│   │   └── supabase/   # Supabase integration
│   ├── styles/         # Global styles
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── next.config.js      # Next.js configuration
└── tailwind.config.js  # Tailwind CSS configuration
```

## Troubleshooting

- **Supabase Connection Issues**: Check your environment variables and make sure Supabase is properly configured
- **Next.js Build Errors**: Clear `.next` cache with `npm run clean` and retry
- **Module Not Found Errors**: Run `npm install` to ensure all dependencies are installed

## License

This project is proprietary software. All rights reserved.

## Support

For support, please contact the development team.
