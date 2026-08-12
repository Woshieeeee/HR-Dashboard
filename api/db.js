// ================================================================
//  BEAN'S HRIS — Vercel Serverless API for JSONBin
//  Uses Master Key for full access (replace with a scoped Access Key if possible)
// ================================================================

const BIN_ID = '6a7bdb34da38895dfed88f47';
const ACCESS_KEY = '$2a$10$3TlwFttBFpegTK.k6TnP5uGlWVKLNZ7EwFn2GAhdLugBPQ0jDh9Ti'; // Master Key

const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const response = await fetch(`${JSONBIN_URL}/latest`, {
        method: 'GET',
        headers: { 'X-Access-Key': ACCESS_KEY, 'Content-Type': 'application/json' },
        cache: 'no-store'
      });
      const text = await response.text();
      let result;
      try { result = JSON.parse(text); } catch { result = { message: text }; }
      if (!response.ok) {
        console.error('JSONBin GET error:', response.status, result);
        return res.status(response.status).json({ success: false, error: result?.message || 'Failed to load database.' });
      }
      return res.status(200).json({ success: true, data: result.record || {} });
    }

    if (req.method === 'PUT') {
      if (!req.body) {
        return res.status(400).json({ success: false, error: 'No database data supplied.' });
      }
      const response = await fetch(JSONBIN_URL, {
        method: 'PUT',
        headers: { 'X-Access-Key': ACCESS_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      const text = await response.text();
      let result;
      try { result = JSON.parse(text); } catch { result = { message: text }; }
      if (!response.ok) {
        console.error('JSONBin PUT error:', response.status, result);
        return res.status(response.status).json({ success: false, error: result?.message || 'Failed to save database.' });
      }
      return res.status(200).json({ success: true, data: result.record || {} });
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  } catch (error) {
    console.error('Vercel JSONBin API error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Unexpected server error.' });
  }
}
