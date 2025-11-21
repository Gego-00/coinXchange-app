const axios = require('axios');

const API_URL = 'https://v6.exchangerate-api.com/v6';
const API_KEY = process.env.EXCHANGE_RATE_API_KEY;

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
].filter(Boolean);

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  
  if (ALLOWED_ORIGINS.includes(origin) || origin?.includes('vercel.app')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      message: 'Method not allowed',
      allowedMethods: ['POST']
    });
  }

  try {
    if (!API_KEY) {
      return res.status(500).json({
        message: 'Server configuration error',
        details: 'API key not configured'
      });
    }

    const { from, to, amount } = req.body;
    
    console.log('Conversion request:', { from, to, amount });

    if (!from || !to || !amount) {
      return res.status(400).json({
        message: 'Missing required parameters',
        required: ['from', 'to', 'amount']
      });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        message: 'Invalid amount',
        details: 'Amount must be a positive number'
      });
    }

    const url = `${API_URL}/${API_KEY}/pair/${from}/${to}/${numAmount}`;
    console.log('API URL:', url);

    const response = await axios.get(url);

    if (response.data && response.data.result === 'success') {
      return res.status(200).json({
        base: from,
        target: to,
        conversionRate: response.data.conversion_rate,
        convertedAmount: response.data.conversion_result,
        amount: numAmount
      });
    } else {
      return res.status(400).json({
        message: 'Error converting currency',
        details: response.data
      });
    }

  } catch (error) {
    console.error('Conversion error:', error);

    if (error.response) {
      return res.status(error.response.status || 500).json({
        message: 'External API error',
        details: error.response.data || error.message
      });
    } else if (error.request) {
      return res.status(503).json({
        message: 'Service unavailable',
        details: 'Could not reach currency conversion service'
      });
    } else {
      return res.status(500).json({
        message: 'Error converting currency',
        details: error.message
      });
    }
  }
}