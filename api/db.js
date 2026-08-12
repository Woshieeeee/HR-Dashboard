// ================================================================
//  BEAN'S HRIS — Vercel Serverless API for JSONBin
//  Hardcoded with the exact working key (tested in PowerShell).
//  For production, use environment variables; this is a quick fix.
// ================================================================

const BIN_ID = '6a7bdb34da38895dfed88f47';
const ACCESS_KEY = '$2a$10$vw84HGuILykLqqhaqnzIbe0iYaSolyxJ520iq4s5f96cvnbkWA2S';

const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

export default async function handler(req, res) {
  // ── CORS ──
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ── Log the key being used (first 10 chars) ──
  console.log(`🔑 Using key: ${ACCESS_KEY.slice(0, 10)}... (length: ${ACCESS_KEY.length})`);
  console.log(`📦 Bin ID: ${BIN_ID}`);

  try {
    // ── GET: Load database ──
    if (req.method === 'GET') {
      const response = await fetch(`${JSONBIN_URL}/latest`, {
        method: 'GET',
        headers: {
          'X-Access-Key': ACCESS_KEY,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      const text = await response.text();
      let result;
      try { result = JSON.parse(text); } catch { result = { message: text }; }

      console.log(`📥 GET status: ${response.status}`, result);

      if (!response.ok) {
        return res.status(response.status).json({
          success: false,
          error: result?.message || 'Failed to load.'
        });
      }

      return res.status(200).json({
        success: true,
        data: result.record || {}
      });
    }

    // ── PUT: Save database ──
    if (req.method === 'PUT') {
      if (!req.body) {
        return res.status(400).json({
          success: false,
          error: 'No data supplied.'
        });
      }

      console.log(`📤 PUT request size: ${JSON.stringify(req.body).length} bytes`);

      const response = await fetch(JSONBIN_URL, {
        method: 'PUT',
        headers: {
          'X-Access-Key': ACCESS_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(req.body)
      });

      const text = await response.text();
      let result;
      try { result = JSON.parse(text); } catch { result = { message: text }; }

      console.log(`📤 PUT status: ${response.status}`, result);

      if (!response.ok) {
        return res.status(response.status).json({
          success: false,
          error: result?.message || 'Failed to save.'
        });
      }

      return res.status(200).json({
        success: true,
        data: result.record || {}
      });
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({
      success: false,
      error: 'Method not allowed.'
    });

  } catch (error) {
    console.error('❌ API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Unexpected error.'
    });
  }
}
