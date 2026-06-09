# Blogger

A simple, real blogging web application powered by Node.js, Express, and EJS.

## Install

1. Open a terminal in `/home/rolex/Desktop/blogger`
2. Run:

```bash
corepack npm install
```

## Start the app

```bash
corepack npm start
```

Then open `http://localhost:3000` in your browser.

## Live updates

Open `http://localhost:3000/admin` to publish a new post live. The post will be saved to `data/posts.json` and immediately visible on the homepage.

## Admin authentication

The admin area is protected by a simple password form. Set `ADMIN_PASSWORD` in your environment to override the default password.

```bash
export ADMIN_PASSWORD="your-secret-password"
```

If you do not set `ADMIN_PASSWORD`, the default is `change-me`.

## Permanent deployment

This project is ready for permanent hosting.

### Deploy to Render

1. Create a Git repository:
   ```bash
git init
git add .
git commit -m "Prepare blog for deployment"
```
2. Push the repository to GitHub.
3. Create a new Web Service on Render.
4. Connect your GitHub repository.
5. Set the Start Command to:
   ```bash
node server.js
```
6. Set the Environment Variable:
   - `PORT` = `3000`
   - `ADMIN_PASSWORD` = your secret password

### Deploy to Railway

1. Push the project to GitHub.
2. Create a new project on Railway from GitHub.
3. Configure the service to run `npm start`.
4. Add environment variable `ADMIN_PASSWORD`.

### Deploy with Docker

You can also deploy this app with the included `Dockerfile`.

## Development

Run with automatic restart during editing:

```bash
corepack npm run dev
```

## Editing posts manually

Posts are stored in `data/posts.json`. Each entry has:

- `id` — URL slug
- `title`
- `publishDate`
- `excerpt`
- `content`
- `readingTime`

## Files

- `server.js` — Express server, admin route, and persistence
- `views/` — EJS templates
- `public/styles.css` — app styling
- `data/posts.json` — sample and live blog posts
