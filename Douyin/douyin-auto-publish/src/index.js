import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generatePublishPackage } from "./lib/generate.js";
import { publishToDouyin } from "./lib/publish.js";
import { buildAuthorizeUrl, exchangeCodeForToken, refreshToken as refreshTokenFn } from "./lib/token.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const configPath = path.join(root, "config.local.json");
const inputPath = path.join(root, "input.local.json");

function parseArgs(argv) {
  const args = {
    dryRun: argv.includes("--dry-run"),
    publish: argv.includes("--publish"),
    authUrl: argv.includes("--auth-url"),
    exchangeCode: argv.includes("--exchange-code"),
    refreshToken: argv.includes("--refresh-token"),
    code: "",
    state: ""
  };

  for (const arg of argv) {
    if (arg.startsWith("--code=")) args.code = arg.slice("--code=".length);
    if (arg.startsWith("--state=")) args.state = arg.slice("--state=".length);
  }
  return args;
}

async function readJson(p) {
  const content = await readFile(p, "utf8");
  return JSON.parse(content);
}

async function writeJson(p, obj) {
  await writeFile(p, JSON.stringify(obj, null, 2), "utf8");
}

async function ensureLogDir() {
  const logDir = path.join(root, "logs");
  await mkdir(logDir, { recursive: true });
  return logDir;
}

async function writeLog(payload) {
  const logDir = await ensureLogDir();
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const file = path.join(logDir, `${ts}.json`);
  await writeFile(file, JSON.stringify(payload, null, 2), "utf8");
  return file;
}

function mergeTokenIntoConfig(config, tokenInfo) {
  return {
    ...config,
    accessToken: tokenInfo.accessToken || config.accessToken,
    refreshToken: tokenInfo.refreshToken || config.refreshToken,
    openId: tokenInfo.openId || config.openId || "",
    accessTokenExpiresAt: tokenInfo.accessTokenExpiresAt || "",
    refreshTokenExpiresAt: tokenInfo.refreshTokenExpiresAt || ""
  };
}

async function handleTokenOps(args, config) {
  if (args.authUrl) {
    const url = buildAuthorizeUrl({
      ...config,
      state: args.state || config.state
    });
    console.log(JSON.stringify({ ok: true, action: "auth-url", url }, null, 2));
    return true;
  }

  if (args.exchangeCode) {
    const code = args.code || process.env.DOUYIN_CODE || "";
    if (!code) {
      throw new Error("缺少 code。用法: npm run token:exchange -- --code=YOUR_CODE");
    }
    const tokenInfo = await exchangeCodeForToken(config, code);
    const next = mergeTokenIntoConfig(config, tokenInfo);
    await writeJson(configPath, next);
    console.log(
      JSON.stringify(
        {
          ok: true,
          action: "exchange-code",
          saved: true,
          accessTokenExpiresAt: next.accessTokenExpiresAt,
          refreshTokenExpiresAt: next.refreshTokenExpiresAt
        },
        null,
        2
      )
    );
    return true;
  }

  if (args.refreshToken) {
    const tokenInfo = await refreshTokenFn(config);
    const next = mergeTokenIntoConfig(config, tokenInfo);
    await writeJson(configPath, next);
    console.log(
      JSON.stringify(
        {
          ok: true,
          action: "refresh-token",
          saved: true,
          accessTokenExpiresAt: next.accessTokenExpiresAt,
          refreshTokenExpiresAt: next.refreshTokenExpiresAt
        },
        null,
        2
      )
    );
    return true;
  }
  return false;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = await readJson(configPath);

  const done = await handleTokenOps(args, config);
  if (done) return;

  const input = await readJson(inputPath);
  const effectiveDryRun = args.dryRun || (!args.publish && config.dryRun !== false);

  const publishPackage = await generatePublishPackage(input, config);
  const result = await publishToDouyin({
    publishPackage,
    config,
    dryRun: effectiveDryRun
  });

  const logPath = await writeLog({
    timestamp: new Date().toISOString(),
    dryRun: effectiveDryRun,
    input,
    publishPackage,
    result
  });

  console.log(JSON.stringify({ ok: true, dryRun: effectiveDryRun, logPath, result }, null, 2));
}

main().catch(async (err) => {
  const errorPayload = {
    ok: false,
    message: err?.message || String(err),
    stack: err?.stack || null,
    timestamp: new Date().toISOString()
  };

  try {
    const logPath = await writeLog(errorPayload);
    console.error(JSON.stringify({ ...errorPayload, logPath }, null, 2));
  } catch {
    console.error(JSON.stringify(errorPayload, null, 2));
  }
  process.exit(1);
});
