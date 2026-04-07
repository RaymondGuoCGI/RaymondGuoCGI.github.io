function buildPayload(publishPackage) {
  return {
    text: publishPackage.publishText
  };
}

export async function publishToDouyin({ publishPackage, config, dryRun }) {
  const payload = buildPayload(publishPackage);
  const endpoint = `${config.apiBaseUrl}${config.publishEndpoint}`;

  if (dryRun) {
    return {
      mode: config.mode,
      endpoint,
      payload,
      published: false,
      reason: "dry-run"
    };
  }

  if (!config.accessToken || config.accessToken.includes("REPLACE_")) {
    throw new Error("缺少有效 accessToken，请先在 config.local.json 配置。");
  }

  if (config.mode !== "openapi") {
    return {
      mode: config.mode,
      endpoint,
      payload,
      published: false,
      reason: "browser_fallback_not_implemented_yet"
    };
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.accessToken}`
    },
    body: JSON.stringify(payload)
  });

  const bodyText = await res.text();
  let body;
  try {
    body = JSON.parse(bodyText);
  } catch {
    body = { raw: bodyText };
  }

  return {
    mode: config.mode,
    endpoint,
    payload,
    httpStatus: res.status,
    response: body,
    published: res.ok
  };
}
