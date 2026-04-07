function required(value, name) {
  if (!value || String(value).startsWith("REPLACE_WITH_")) {
    throw new Error(`缺少配置: ${name}`);
  }
}

function toExpiryIso(seconds) {
  if (!seconds) return "";
  return new Date(Date.now() + Number(seconds) * 1000).toISOString();
}

function parseTokenResponse(json) {
  const data = json?.data || json || {};
  return {
    accessToken: data.access_token || "",
    refreshToken: data.refresh_token || "",
    openId: data.open_id || "",
    accessTokenExpiresAt: toExpiryIso(data.expires_in),
    refreshTokenExpiresAt: toExpiryIso(data.refresh_expires_in)
  };
}

async function requestToken(url, form) {
  const body = new URLSearchParams(form).toString();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`token接口返回非JSON: ${text}`);
  }
  if (!res.ok) {
    throw new Error(`token接口失败 http=${res.status} body=${JSON.stringify(json)}`);
  }
  return json;
}

export function buildAuthorizeUrl(config) {
  required(config.clientKey, "clientKey");
  required(config.redirectUri, "redirectUri");
  required(config.scope, "scope");

  const url = new URL(config.oauthAuthorizeUrl || "https://open.douyin.com/platform/oauth/connect/");
  url.searchParams.set("client_key", config.clientKey);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", config.scope);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("state", config.state || "douyin_auto_publish");
  return url.toString();
}

export async function exchangeCodeForToken(config, code) {
  required(config.clientKey, "clientKey");
  required(config.clientSecret, "clientSecret");
  required(code, "code");
  const json = await requestToken(
    config.oauthAccessTokenUrl || "https://open.douyin.com/oauth/access_token/",
    {
      client_key: config.clientKey,
      client_secret: config.clientSecret,
      code,
      grant_type: "authorization_code"
    }
  );
  return parseTokenResponse(json);
}

export async function refreshToken(config) {
  required(config.clientKey, "clientKey");
  required(config.clientSecret, "clientSecret");
  required(config.refreshToken, "refreshToken");
  const json = await requestToken(
    config.oauthAccessTokenUrl || "https://open.douyin.com/oauth/access_token/",
    {
      client_key: config.clientKey,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
      grant_type: "refresh_token"
    }
  );
  return parseTokenResponse(json);
}
