const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors({ origin: '*' }));

// Health check buat Hugging Face
app.get('/', (req, res) => {
  res.send('Music Proxy is Running! Use /proxy?url=...');
});

// Proxy utama
app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('Missing ?url=');

  try {
    const response = await axios({
      method: 'get',
      url: targetUrl,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://www.google.com/'
      }
    });

    // Forward content-type biar bisa di-play
    if (response.headers['content-type']) {
      res.setHeader('Content-Type', response.headers['content-type']);
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    response.data.pipe(res);
  } catch (e) {
    console.log(e.message);
    res.status(500).send('Proxy error: ' + e.message);
  }
});

const PORT = process.env.PORT || 7860;
app.listen(PORT, '0.0.0.0', () => {
  console.log('Running on port ' + PORT);
});
