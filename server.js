require('dotenv').config();
const express = require('express');
const shopify = require('@shopify/shopify-api');
const returnsRouter = require('./routes/returns');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Shopify initialization
shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SHOPIFY_SCOPES.split(','),
  HOST_NAME: process.env.HOST_NAME.replace(/https:\/\//, ''),
  API_VERSION: shopify.Context.LATEST_SUPPORTED_API_VERSION,
  IS_EMBEDDED_APP: true,
  SESSION_STORAGE: new shopify.Session.MemorySessionStorage(),
});

// Routes
app.use('/apps/returns', returnsRouter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`LTM Returns App running on port ${PORT}`);
});
