// api/db.js
exports.handler = async function(event, context) {
  const BIN_ID = process.env.JSONBIN_BIN_ID;
  const ACCESS_KEY = process.env.JSONBIN_ACCESS_KEY;
  const url = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (!BIN_ID || !ACCESS_KEY) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Missing JSONBin environment variables' }),
    };
  }

  try {
    if (event.httpMethod === 'GET') {
      const response = await fetch(url, {
        headers: { 'X-Access-Key': ACCESS_KEY, 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ data: data.record || {} }),
      };
    }

    if (event.httpMethod === 'PUT') {
      const body = JSON.parse(event.body);
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'X-Access-Key': ACCESS_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ data: data.record || {} }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('Netlify function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};