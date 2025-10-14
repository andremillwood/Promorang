import { Context } from "hono";

// Proper JWT signing function for Cloudflare Workers using Web Crypto API
const signJwt = async (payload: any, secret: string): Promise<string> => {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + (7 * 24 * 60 * 60) // 7 days
  };

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(fullPayload));

  const data = `${encodedHeader}.${encodedPayload}`;

  // Use Web Crypto API for HMAC signing
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)));

  return `${data}.${encodedSignature}`;
};

export const googleAuthUrlHandler = (c: Context) => {
  // Try environment variable first, fallback to hardcoded value for testing
  const clientId = c.env.GOOGLE_CLIENT_ID || "732791210432-mgbf7g7r70gin2u6ccnnp4d16i76if9i.apps.googleusercontent.com";

  if (!clientId) {
    console.error("GOOGLE_CLIENT_ID not found in environment");
    return c.json({ error: "OAuth not configured" }, 500);
  }

  const redirectUri = "https://www.promorang.co/api/auth/google/callback";
  const scope = encodeURIComponent("openid email profile");
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

  console.log("Generated OAuth URL for client ID:", clientId.substring(0, 20) + "...");
  return c.json({ url: authUrl });
};

export const googleAuthCallbackHandler = async (c: Context) => {
  let code = "";
  let clientId = "";
  let redirectUri = "";

  try {
    console.log("OAuth callback handler started");
    const queryParams = c.req.query();
    code = queryParams.code || "";

    if (!code) {
      console.log("No authorization code provided");
      return c.text("No authorization code provided", 400);
    }

    // Use environment variables from wrangler.jsonc
    clientId = c.env.GOOGLE_CLIENT_ID || "";
    const clientSecret = c.env.GOOGLE_CLIENT_SECRET || "";
    const jwtSecret = c.env.JWT_SECRET || "";
    redirectUri = "https://www.promorang.co/api/auth/google/callback";

    console.log("Environment variables loaded:", {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasJwtSecret: !!jwtSecret,
      redirectUri: redirectUri
    });

    if (!clientId || !clientSecret || !jwtSecret) {
      console.error("Missing required environment variables");
      return c.text("OAuth not configured - missing environment variables", 500);
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    console.log("Token response status:", tokenResponse.status);
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("OAuth Token Exchange Failed:", {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText,
        clientId: clientId.substring(0, 20) + "...",
        redirectUri: redirectUri,
        codeLength: code.length
      });

      // Provide specific error messages for common issues
      if (errorText.includes('invalid_grant')) {
        return c.text("Authentication failed: Invalid authorization code or credentials", 400);
      } else if (errorText.includes('redirect_uri_mismatch')) {
        return c.text("Authentication failed: Redirect URI mismatch - check Google OAuth app configuration", 400);
      } else if (errorText.includes('invalid_client')) {
        return c.text("Authentication failed: Invalid client credentials - check Google OAuth app", 400);
      } else {
        return c.text(`Authentication failed: ${errorText}`, 400);
      }
    }

    const tokenData = await tokenResponse.json();
    console.log("Token data received:", Object.keys(tokenData));
    const { access_token } = tokenData;

    if (!access_token) {
      console.error("No access token in response:", tokenData);
      return c.text("No access token received", 500);
    }

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error("User info fetch failed:", {
        status: userResponse.status,
        statusText: userResponse.statusText,
        error: errorText,
        accessTokenPrefix: access_token.substring(0, 10) + "..."
      });
      return c.text("Failed to get user info from Google", 500);
    }

    const googleUser = await userResponse.json();

    // Create or update user in database
    const { DB } = c.env;
    console.log("Database connection established");

    // Check if user exists
    const existingUser = await DB.prepare(
      "SELECT id, mocha_user_id FROM users WHERE mocha_user_id = ?"
    ).bind(googleUser.id).first();

    console.log("Existing user check:", existingUser ? "found" : "not found");

    let userId;
    if (existingUser) {
      userId = existingUser.id;
      console.log("Using existing user ID:", userId);
    } else {
      // Create new user
      console.log("Creating new user for Google ID:", googleUser.id);
      const result = await DB.prepare(`
        INSERT INTO users (mocha_user_id, email, display_name, avatar_url)
        VALUES (?, ?, ?, ?)
      `).bind(
        googleUser.id,
        googleUser.email,
        googleUser.name,
        googleUser.picture
      ).run();

      userId = result.lastInsertRowid;
      console.log("Created new user with ID:", userId);
    }

    // Sign JWT token
    console.log("Signing JWT token for user:", userId);
    const token = await signJwt({
      sub: userId,
      email: googleUser.email,
      name: googleUser.name
    }, jwtSecret);
    console.log("JWT token signed successfully");

    // Redirect to main app with session cookie
    return new Response(null, {
      status: 302,
      headers: {
        "Set-Cookie": `token=${token}; Path=/; HttpOnly; Secure; SameSite=None; Domain=promorang.co; Max-Age=604800`,
        "Location": "https://www.promorang.co/home",
      },
    });

  } catch (error) {
    console.error("OAuth callback error:", {
      error: error.message,
      stack: error.stack,
      code: code ? code.substring(0, 20) + "..." : "no code",
      clientId: clientId ? clientId.substring(0, 20) + "..." : "no client_id",
      redirectUri: redirectUri
    });
    return c.text("Authentication failed: Internal server error", 500);
  }
};


