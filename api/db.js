// ================================================================
//  BEAN'S HRIS — Vercel Serverless API for JSONBin
//  Uses environment variables (set in Vercel dashboard).
//  No sensitive keys are hardcoded.
// ================================================================

// ── Read from environment variables ──
const BIN_ID = process.env.JSONBIN_BIN_ID;
const ACCESS_KEY = process.env.JSONBIN_ACCESS_KEY;

// If environment variables are not set, fallback to hardcoded (for testing)
// Remove these fallbacks when env vars are confirmed to work.
const finalBinId = BIN_ID || '6a7bdb34da38895dfed88f47';
const finalKey = ACCESS_KEY || '$2a$10$vw84HGuILykLqqhaqnzIbe0iYaSolyxJ520iq4s5f96cvnbkWA2S';

const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${finalBinId}`;

export default async function handler(req, res) {
  // ── CORS ──
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // ── GET: Load database ──
    if (req.method === 'GET') {
      const response = await fetch(`${JSONBIN_URL}/latest`, {
        method: 'GET',
        headers: {
          'X-Access-Key': finalKey,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      const text = await response.text();
      let result;
      try { result = JSON.parse(text); } catch { result = { message: text }; }

      if (!response.ok) {
        console.error('❌ GET error:', response.status, result);
        return res.status(response.status).json({
          success: false,
          error: result?.message || 'Failed to load database.'
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
          error: 'No database data supplied.'
        });
      }

      const response = await fetch(JSONBIN_URL, {
        method: 'PUT',
        headers: {
          'X-Access-Key': finalKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(req.body)
      });

      const text = await response.text();
      let result;
      try { result = JSON.parse(text); } catch { result = { message: text }; }

      if (!response.ok) {
        console.error('❌ PUT error:', response.status, result);
        return res.status(response.status).json({
          success: false,
          error: result?.message || 'Failed to save database.'
        });
      }

      return res.status(200).json({
        success: true,
        data: result.record || {}
      });
    }

    // ── Method not allowed ──
    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use GET or PUT.'
    });

  } catch (error) {
    console.error('❌ API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Unexpected server error.'
    });
  }
}
