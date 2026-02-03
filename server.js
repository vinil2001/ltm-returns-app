require('dotenv').config();
const express = require('express');
const cors = require('cors');
const returnsRouter = require('./routes/returns');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
  origin: ['https://ns3wcr-it.myshopify.com', 'https://ltmuseum.co.uk', 'https://www.ltmuseum.co.uk'],
  methods: ['GET', 'POST'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/apps/returns', returnsRouter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`LTM Returns App running on port ${PORT}`);
});
