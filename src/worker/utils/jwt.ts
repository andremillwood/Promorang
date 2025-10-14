export async function signJwt(payload: object, secret: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const header = { alg: "HS256", typ: "JWT" };
  const base64url = (obj: any) => btoa(JSON.stringify(obj)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const data = `${base64url(header)}.${base64url(payload)}`;
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `${data}.${signatureB64}`;
}

export async function verifyJwt(token: string, secret: string) {
  const [headerB64, payloadB64, signatureB64] = token.split(".");
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const data = `${headerB64}.${payloadB64}`;
  const signature = Uint8Array.from(atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
  const isValid = await crypto.subtle.verify("HMAC", key, signature, encoder.encode(data));
  if (!isValid) throw new Error("Invalid token");
  const payload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")));
  return payload;
}


