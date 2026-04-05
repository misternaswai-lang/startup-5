import { createHmac } from "node:crypto";
import { env } from "./env";

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64UrlDecode(value) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);

  return Buffer.from(`${normalized}${padding}`, "base64").toString("utf8");
}

function sign(payload, secret, expiresInSeconds) {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(body));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", secret).update(data).digest("base64url");

  return `${data}.${signature}`;
}

function verify(token, secret) {
  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new Error("Invalid token format");
  }

  const [encodedHeader, encodedPayload, receivedSignature] = parts;
  const data = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = createHmac("sha256", secret)
    .update(data)
    .digest("base64url");

  if (receivedSignature !== expectedSignature) {
    throw new Error("Invalid token signature");
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload));
  const now = Math.floor(Date.now() / 1000);

  if (typeof payload.exp !== "number" || payload.exp <= now) {
    throw new Error("Token expired");
  }

  return payload;
}

export function createAccessToken(userId) {
  return sign({ sub: userId, type: "access" }, env.jwtAccessSecret, 60 * 15);
}

export function createRefreshToken(userId) {
  return sign({ sub: userId, type: "refresh" }, env.jwtRefreshSecret, 60 * 60 * 24 * 7);
}

export function verifyAccessToken(token) {
  const payload = verify(token, env.jwtAccessSecret);

  if (payload.type !== "access") {
    throw new Error("Invalid token type");
  }

  return payload;
}
