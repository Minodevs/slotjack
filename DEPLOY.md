# Deploying SlotJack to Vercel

This guide will walk you through the process of deploying the SlotJack application to Vercel.

## Prerequisites

- A GitHub account
- A Vercel account (you can sign up with your GitHub account)
- Your SlotJack repository pushed to GitHub

## Step 1: Prepare your repository

Ensure your codebase is up to date and all changes are committed and pushed to GitHub:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push
```

## Step 2: Connect Your GitHub Repository to Vercel

1. Go to [Vercel's dashboard](https://vercel.com/dashboard)
2. Click on "Add New..." and select "Project"
3. Select your GitHub account and find the SlotJack repository
4. Click "Import"

## Step 3: Configure Project Settings

1. In the project configuration screen:
   - **Framework Preset**: Select Next.js
   - **Project Name**: Leave as default or customize
   - **Root Directory**: Leave empty (uses the root of the repo)
   - **Build and Output Settings**: Leave as default

2. Under "Environment Variables", add the following:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `NEXT_TELEMETRY_DISABLED`: 1

3. Click "Deploy"

## Step 4: Wait for Deployment

Vercel will now build and deploy your application. This process usually takes a few minutes. You can monitor the build logs to ensure everything is working correctly.

## Step 5: Test Your Deployment

Once deployed, Vercel will provide you with a URL for your application (typically in the format `https://slotjack-xxxx.vercel.app`).

1. Visit this URL to make sure your application is working correctly
2. Test the following functionality:
   - User registration and login
   - Slot machine game
   - Market functionality
   - Admin panel (if applicable)

## Step 6: Configure a Custom Domain (Optional)

If you have a custom domain:

1. Go to your project settings in Vercel
2. Navigate to the "Domains" tab
3. Click "Add" and enter your domain name
4. Follow the instructions to configure DNS records

## Troubleshooting

### Build Failures

If your build fails, check the Vercel build logs for specific errors. Common issues include:

- **Missing dependencies**: Ensure all dependencies are properly listed in package.json
- **Environment variables**: Verify that all required environment variables are set
- **Build script errors**: Fix any errors in your build scripts

### Runtime Errors

If your application builds successfully but has issues at runtime:

- Check browser console logs for JavaScript errors
- Verify that environment variables are correctly accessed
- Make sure API routes are working properly

### Supabase Connection Issues

If your application cannot connect to Supabase:

- Verify your Supabase URL and API key in environment variables
- Check Supabase dashboard to ensure your project is running
- Verify that database tables are set up correctly

## Automatic Deployments

Vercel automatically deploys new versions of your application when you push changes to your connected GitHub repository. No additional steps are required for future updates.

## Rolling Back Deployments

If you need to roll back to a previous version:

1. Go to your project in Vercel dashboard
2. Click on "Deployments"
3. Find the previous working deployment
4. Click the three dots menu and select "Promote to Production"

This will revert your production site to the selected deployment. 