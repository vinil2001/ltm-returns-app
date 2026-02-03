# LTM Returns App

Shopify Custom App for handling returns form submissions for London Transport Museum.

## Current Status

**Test deployment:** https://ltm-returns-app.onrender.com

> ⚠️ **Note:** Current Render.com deployment is temporary for testing purposes. After approval, this should be migrated to corporate infrastructure.

## Architecture

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────┐
│  Shopify Theme      │     │  LTM Returns App    │     │  Email (SMTP)   │
│  (Liquid Form)      │────▶│  (Node.js/Express)  │────▶│  shopping@...   │
└─────────────────────┘     └─────────────────────┘     └─────────────────┘
```

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **File uploads:** Multer
- **Email:** Nodemailer (requires configuration)
- **CORS:** Configured for Shopify domains

## Project Structure

```
ltm-returns-app/
├── server.js           # Main Express server
├── routes/
│   └── returns.js      # Returns form handler
├── package.json
├── .env.example        # Environment variables example
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/apps/returns/submit` | Accept returns form (multipart/form-data) |

## Local Development

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start server
npm start
```

Server will start on `http://localhost:3000`

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `SMTP_HOST` | SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username | `user@example.com` |
| `SMTP_PASS` | SMTP password | `password` |
| `RECIPIENT_EMAIL` | Email to receive returns | `shopping@ltmuseum.co.uk` |

---

# Migration Guide: Moving to Corporate Server

## Step 1: Clone the Repository

```bash
git clone https://github.com/vinil2001/ltm-returns-app.git
cd ltm-returns-app
```

## Step 2: Deploy to Your Server

### Option A: Render.com (Corporate Account)

1. Create account on [render.com](https://render.com) with corporate email
2. Create New → Web Service
3. Connect to GitHub repository
4. Configure:
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variable:** `PORT=10000`
5. Deploy

### Option B: Azure App Service

1. Create Web App in Azure Portal
2. Configure deployment from GitHub
3. Set environment variables in Configuration
4. Deploy

### Option C: AWS (Elastic Beanstalk or ECS)

1. Create Elastic Beanstalk application
2. Upload source code or connect to GitHub
3. Configure environment variables
4. Deploy

### Option D: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Step 3: Update Shopify Theme

After deploying to new server, update the form URL in `sections/main-page.liquid`:

```javascript
// Find this line (around line 317):
const response = await fetch('https://ltm-returns-app.onrender.com/apps/returns/submit', {

// Change to your new server URL:
const response = await fetch('https://YOUR-NEW-SERVER.com/apps/returns/submit', {
```

Then push the theme:
```bash
shopify theme push --theme <THEME_ID>
```

## Step 4: Configure Email (Optional)

To enable email notifications, add SMTP environment variables to your server and uncomment the nodemailer code in `routes/returns.js`.

## Step 5: Verify

1. Open the returns page on Shopify store
2. Fill out the form with test data
3. Submit and verify success message
4. Check server logs for received data

---

## CORS Configuration

The app is configured to accept requests from:
- `https://ns3wcr-it.myshopify.com`
- `https://ltmuseum.co.uk`
- `https://www.ltmuseum.co.uk`

To add more domains, edit `server.js`:

```javascript
app.use(cors({
  origin: [
    'https://ns3wcr-it.myshopify.com',
    'https://ltmuseum.co.uk',
    'https://www.ltmuseum.co.uk',
    'https://your-new-domain.com'  // Add here
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));
```

## Support

For questions or issues, contact the development team.
