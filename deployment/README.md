# SlotJack Deployment Package

This package contains a standalone Next.js application ready for deployment.

## Deployment Instructions

1. Copy all contents of this folder to your server
2. Make sure Node.js 18.17.0 or later is installed
3. Run the following command to start the server:

```
node server.js
```

By default, the server will run on port 3000. You can change this by setting the PORT environment variable:

```
PORT=8080 node server.js
```

## Files and Directories

- `server.js` - The Node.js server that runs your application
- `.next/` - Contains application assets and server files
- `public/` - Contains static files like images and fonts
- `node_modules/` - Contains minimal dependencies required to run the server

## Environment Variables

If you need to set environment variables, you can create a `.env` file in the root directory or set them in your hosting environment.

## Mobile Optimizations

This build includes mobile responsive views that adapt to various screen sizes.
