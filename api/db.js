export default async function handler(req, res) {

  // Your JSONBin Bin ID
  const BIN_ID =
    process.env.JSONBIN_BIN_ID ||
    '6a7bdb34da38895dfed88f47';

  // Secret — keep this in Vercel Environment Variables
  const ACCESS_KEY =
    process.env.JSONBIN_ACCESS_KEY;

  // ------------------------------------------------------------
  // Check Access Key
  // ------------------------------------------------------------

  if (!ACCESS_KEY) {
    return res.status(500).json({
      success: false,
      error: 'JSONBIN_ACCESS_KEY is not configured in Vercel.'
    });
  }

  const JSONBIN_URL =
    `https://api.jsonbin.io/v3/b/${BIN_ID}`;

  try {

    // ==========================================================
    // GET DATABASE
    // ==========================================================

    if (req.method === 'GET') {

      const response = await fetch(JSONBIN_URL, {
        method: 'GET',

        headers: {
          'X-Access-Key': ACCESS_KEY,
          'Content-Type': 'application/json'
        },

        cache: 'no-store'
      });

      const text = await response.text();

      let result;

      try {
        result = JSON.parse(text);
      } catch {
        result = {
          message: text
        };
      }

      if (!response.ok) {

        console.error(
          'JSONBin GET error:',
          response.status,
          result
        );

        return res.status(response.status).json({
          success: false,
          error:
            result?.message ||
            result?.error ||
            'JSONBin failed to load the database.'
        });
      }

      return res.status(200).json({
        success: true,
        data: result.record
      });
    }


    // ==========================================================
    // SAVE / UPDATE DATABASE
    // ==========================================================

    if (req.method === 'PUT') {

      if (!req.body) {

        return res.status(400).json({
          success: false,
          error: 'No database data was supplied.'
        });
      }

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

      try {
        result = JSON.parse(text);
      } catch {
        result = {
          message: text
        };
      }

      if (!response.ok) {

        console.error(
          'JSONBin PUT error:',
          response.status,
          result
        );

        return res.status(response.status).json({
          success: false,
          error:
            result?.message ||
            result?.error ||
            'JSONBin failed to save the database.'
        });
      }

      return res.status(200).json({
        success: true,
        data: result.record
      });
    }


    // ==========================================================
    // INVALID METHOD
    // ==========================================================

    res.setHeader(
      'Allow',
      'GET, PUT'
    );

    return res.status(405).json({
      success: false,
      error: 'Method not allowed.'
    });

  } catch (error) {

    console.error(
      'Vercel JSONBin API error:',
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error.message ||
        'Unexpected server error.'
    });
  }
}
