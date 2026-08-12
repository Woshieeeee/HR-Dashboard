// ================================================================
//  BEAN'S HRIS — Vercel Serverless API for JSONBin
//  NEW BIN ID: 6a7bec52f5f4af5e290a3eff
//  Access Key: $2a$10$vw84HGuILykLqqhaqnzIbe0iYaSolyxJ520iq4s5f96cvnbkWA2S
// ================================================================

const BIN_ID = '6a7bec52f5f4af5e290a3eff';
const ACCESS_KEY = '$2a$10$vw84HGuILykLqqhaqnzIbe0iYaSolyxJ520iq4s5f96cvnbkWA2S';

const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  console.log(`🔑 Using key: ${ACCESS_KEY.slice(0, 10)}... (length: ${ACCESS_KEY.length})`);

  try {
    if (req.method === 'GET') {
      const response = await fetch(`${JSONBIN_URL}/latest`, {
        headers: { 'X-Access-Key': ACCESS_KEY }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Load failed');
      return res.status(200).json({ success: true, data: data.record || {} });
    }

    if (req.method === 'PUT') {
      const response = await fetch(JSONBIN_URL, {
        method: 'PUT',
        headers: {
          'X-Access-Key': ACCESS_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Save failed');
      return res.status(200).json({ success: true, data: data.record });
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
