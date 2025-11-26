const axios = require('axios');

const API_URL = 'https://v6.exchangerate-api.com/v6';
const API_KEY = process.env.EXCHANGE_RATE_API_KEY;

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.json({ status: 'ok', message: 'Currency API' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { from, to, amount } = req.body;

    if (!from || !to || !amount) {
      return res.status(400).json({ message: 'Missing parameters' });
    }

    const url = `${API_URL}/${API_KEY}/pair/${from}/${to}/${amount}`;
    const response = await axios.get(url);

    if (response.data?.result === 'success') {
      return res.json({
        base: from,
        target: to,
        conversionRate: response.data.conversion_rate,
        convertedAmount: response.data.conversion_result
      });
    }

    return res.status(400).json({ message: 'Conversion failed' });

  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};