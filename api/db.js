// api/hris.js (or wherever your handler lives)
import { MongoClient } from 'mongodb';

// Environment variables (set in Vercel dashboard)
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'hris_db';
const COLLECTION_NAME = process.env.COLLECTION_NAME || 'data';
const DOCUMENT_ID = 'main'; // fixed ID for the single document

let client;
let clientPromise;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in environment variables');
}

// Global cached connection for serverless (important!)
if (!global._mongoClientPromise) {
  client = new MongoClient(MONGODB_URI);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    if (req.method === 'GET') {
      // Find the document with fixed ID, return empty object if not found
      const doc = await collection.findOne({ _id: DOCUMENT_ID });
      return res.status(200).json({ success: true, data: doc?.data || {} });
    }

    if (req.method === 'PUT') {
      // Upsert: replace the entire document’s data field
      const result = await collection.updateOne(
        { _id: DOCUMENT_ID },
        { $set: { data: req.body } },
        { upsert: true }
      );
      // Fetch the updated document
      const updated = await collection.findOne({ _id: DOCUMENT_ID });
      return res.status(200).json({ success: true, data: updated?.data || {} });
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {// api/db.js
export default async function handler(req, res) {
  const BIN_ID = process.env.JSONBIN_BIN_ID;
  const ACCESS_KEY = process.env.JSONBIN_ACCESS_KEY;
  const url = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

  if (!BIN_ID || !ACCESS_KEY) {
    return res.status(500).json({ error: 'Missing JSONBin environment variables' });
  }

  try {
    if (req.method === 'GET') {
      const response = await fetch(url, {
        headers: { 'X-Access-Key': ACCESS_KEY, 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      return res.status(200).json({ data: data.record || {} });
    }

    if (req.method === 'PUT') {
      const body = req.body;
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'X-Access-Key': ACCESS_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      return res.status(200).json({ data: data.record || {} });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
    console.error('❌ DB error:', error);
    return res.status(500).json({ error: error.message });
  }
}