// ---------------------------------------------------------------------------
// SwiftRemit dev mock API.
//
// Serves a lightweight, in-memory `/api/v1` surface during `vite dev` so the
// web client runs standalone, without the backend repository running. Shapes
// follow the client DTOs in `src/lib/api/types.ts` and the bootstrap schema
// in `src/features/identity/bootstrap.ts`.
//
// When VITE_API_BASE_URL is set (env or .env.development.local), requests are
// proxied to that origin instead of being mocked, so the same dev server can
// be pointed at a real swiftremit-backend instance.
// ---------------------------------------------------------------------------

const DEMO_ADDRESS = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const DEMO_USER = {
  userId: DEMO_ADDRESS,
  address: DEMO_ADDRESS,
  email: "demo@betasmail.com",
  username: "demo_user",
  status: "active",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const DEMO_PROFILE = {
  userId: DEMO_ADDRESS,
  username: "demo_user",
  displayName: "Demo User",
  bio: "SwiftRemit dev-mode demo account.",
  locale: "en",
  timezone: "UTC",
  addressDisplay: "full",
  notifications: { email: true, desktop: false, sound: true },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const DEMO_ACCOUNT = {
  userId: DEMO_ADDRESS,
  username: "demo_user",
  address: DEMO_ADDRESS,
  email: "demo@betasmail.com",
  status: "active",
  createdAt: "2026-01-01T00:00:00.000Z",
  network: "testnet",
  policyVersion: 1,
  betaLimitations: [],
};

const EMPTY_COUNTS = {
  inbox: 0,
  requests: 0,
  sent: 0,
  drafts: 0,
  outbox: 0,
  archive: 0,
  spam: 0,
  trash: 0,
  unread: 0,
  starred: 0,
};

function envelope(data) {
  return {
    data,
    meta: {
      requestId: `mock_${Math.random().toString(36).slice(2, 12)}`,
      timestamp: new Date().toISOString(),
    },
  };
}

function errorEnvelope(code, message, status) {
  return {
    error: { code, message, status },
    meta: {
      requestId: `mock_${Math.random().toString(36).slice(2, 12)}`,
      timestamp: new Date().toISOString(),
    },
  };
}

function bootstrapPayload() {
  const now = new Date().toISOString();
  return {
    user: DEMO_USER,
    session: {
      sessionId: "sess_dev_mock",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    address: DEMO_ADDRESS,
    provisioning: null,
    onboarding: {
      status: "completed",
      step: null,
      displayName: "Demo User",
      recoveryAcknowledged: true,
      unknownSenderRule: "allow",
      minimumPostage: "0",
      receiptOnDelivery: false,
      updatedAt: now,
      completedAt: now,
    },
    policy: {
      allowUnknown: true,
      requireVerified: false,
      requireReceipt: false,
      minimumPostage: "0",
    },
    wallet: {
      connected: true,
      address: DEMO_ADDRESS,
      signerType: "managed",
      capabilities: ["sign", "send", "read"],
      network: "testnet",
      balanceXlm: "100.0000000",
    },
    health: {
      ready: true,
      status: "ok",
      dependencies: { api: "mock", storage: "mock" },
    },
    syncCursor: "mock_cursor",
    featureFlags: {},
    branch: "active",
  };
}

function sessionBundle() {
  const now = Date.now();
  return {
    user: DEMO_USER,
    session: {
      sessionId: "sess_dev_mock",
      userId: DEMO_ADDRESS,
      createdAt: new Date(now - 60_000).toISOString(),
      expiresAt: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
      lastActiveAt: new Date(now).toISOString(),
    },
  };
}

/**
 * Route table. Each entry returns the `data` payload for the envelope.
 * Paths may contain `:param` segments matched positionally.
 */
const routes = [
  ["GET", "/api/v1/bootstrap", () => bootstrapPayload()],
  ["GET", "/api/v1/health", () => ({ status: "ok", service: "swiftremit-dev-mock" })],
  ["GET", "/api/v1/version", () => ({ version: "0.0.0-dev", mode: "mock" })],

  ["GET", "/api/v1/auth/session", () => sessionBundle()],
  ["POST", "/api/v1/auth/session", () => sessionBundle()],
  ["POST", "/api/v1/auth/login", () => sessionBundle()],
  [
    "POST",
    "/api/v1/auth/register",
    (ctx) => ({
      accountStatus: "pending_verification",
      email: ctx.body?.email ?? "demo@betasmail.com",
      maskedEmail: "d***@betasmail.com",
      username: ctx.body?.username ?? "demo_user",
    }),
  ],
  ["POST", "/api/v1/auth/logout", () => ({ success: true })],
  ["POST", "/api/v1/auth/logout-all", () => ({ success: true })],
  [
    "GET",
    "/api/v1/auth/sessions",
    () => [
      {
        id: "sess_dev_mock",
        device: "Dev Browser",
        region: "local",
        created: new Date(Date.now() - 60_000).toISOString(),
        lastUsed: new Date().toISOString(),
        isCurrent: true,
      },
    ],
  ],
  ["POST", "/api/v1/auth/sessions/revoke", () => ({ success: true })],
  ["POST", "/api/v1/auth/sessions/revoke-others", () => ({ success: true })],

  [
    "GET",
    "/api/v1/accounts/profile",
    () => ({
      user: DEMO_USER,
      profile: DEMO_PROFILE,
      account: DEMO_ACCOUNT,
    }),
  ],
  ["PATCH", "/api/v1/accounts/profile", () => ({ profile: DEMO_PROFILE })],
  ["GET", "/api/v1/accounts/account-info", () => ({ account: DEMO_ACCOUNT })],

  [
    "GET",
    "/api/v1/mailbox/sync",
    () => ({
      items: [],
      deletedIds: [],
      nextCursor: null,
      hasMore: false,
      syncCursor: "mock_cursor",
      counts: EMPTY_COUNTS,
    }),
  ],
  ["GET", "/api/v1/mailbox/queue", () => ({ items: [], nextCursor: null, hasMore: false })],
  ["GET", "/api/v1/mailbox/counts", () => ({ counts: EMPTY_COUNTS })],

  ["GET", "/api/v1/requests", () => ({ items: [], nextCursor: null, hasMore: false })],

  ["GET", "/api/v1/contacts", () => ({ items: [], nextCursor: null, hasMore: false })],
  [
    "POST",
    "/api/v1/contacts",
    (ctx) => ({
      contactId: `contact_${Math.random().toString(36).slice(2, 10)}`,
      owner: DEMO_ADDRESS,
      name: ctx.body?.name ?? "New Contact",
      address: ctx.body?.address ?? DEMO_ADDRESS,
      canonicalAddress: null,
      trust: "standard",
      source: "manual",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    }),
  ],

  [
    "GET",
    "/api/v1/policies/:owner",
    () => ({ allowUnknown: true, minimumPostage: "0", requireVerified: false }),
  ],
  [
    "PUT",
    "/api/v1/policies/:owner",
    (ctx) => ({
      allowUnknown: ctx.body?.allowUnknown ?? true,
      minimumPostage: ctx.body?.minimumPostage ?? "0",
      requireVerified: ctx.body?.requireVerified ?? false,
    }),
  ],
  [
    "GET",
    "/api/v1/policies/:owner/senders/:sender",
    (ctx) => ({
      owner: ctx.params.owner,
      rule: { type: "allow", updatedAt: new Date().toISOString() },
    }),
  ],
  [
    "PUT",
    "/api/v1/policies/:owner/senders/:sender",
    (ctx) => ({
      owner: ctx.params.owner,
      rule: ctx.body?.rule ?? { type: "allow", updatedAt: new Date().toISOString() },
    }),
  ],

  ["GET", "/api/v1/identity/profile/:owner", () => DEMO_PROFILE],
  [
    "GET",
    "/api/v1/identity/keys/:owner",
    (ctx) => ({
      owner: ctx.params.owner,
      currentEncryptionKeyId: null,
      currentSigningKeyId: null,
      keys: [],
      updatedAt: new Date().toISOString(),
      version: 0,
    }),
  ],
  [
    "POST",
    "/api/v1/identity/resolve",
    (ctx) => ({
      identifier: ctx.body?.identifier ?? "demo",
      owner: DEMO_ADDRESS,
      address: `${ctx.body?.identifier ?? "demo"}*betasmail.com`,
      keys: null,
      freshness: {
        resolvedAt: new Date().toISOString(),
        cached: false,
        ttlMs: 60_000,
        source: "stealth_local",
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
      },
    }),
  ],

  [
    "GET",
    "/api/v1/wallet/status",
    () => ({
      address: DEMO_ADDRESS,
      network: "testnet",
      networkPassphrase: "Test SDF Network ; September 2015",
      balanceXlm: "100.0000000",
      activation: "active",
      lastSyncedAt: new Date().toISOString(),
      stale: false,
      freshness: "fresh",
    }),
  ],

  [
    "GET",
    "/api/v1/search",
    (ctx) => ({
      items: [],
      nextCursor: null,
      hasMore: false,
      totalMatches: 0,
      query: ctx.query?.q ?? "",
      parsedFilters: {},
      indexLimitations: {
        serverIndexLimited: true,
        encryptedBodyIndexed: false,
        safeMetadataFields: ["subject", "sender", "createdAt"],
        notice: "Dev mock index — no messages are stored.",
      },
    }),
  ],

  ["GET", "/api/v1/onboarding/draft", () => null],
  ["PUT", "/api/v1/onboarding/draft", (ctx) => ctx.body ?? {}],
  ["POST", "/api/v1/onboarding/complete", () => bootstrapPayload()],

  ["GET", "/api/v1/drafts", () => ({ items: [], nextCursor: null, hasMore: false })],
  [
    "POST",
    "/api/v1/drafts",
    (ctx) => ({
      draftId: `draft_${Math.random().toString(36).slice(2, 10)}`,
      version: 1,
      updatedAt: new Date().toISOString(),
      ...(ctx.body ?? {}),
    }),
  ],
  [
    "GET",
    "/api/v1/drafts/:id",
    () => errorEnvelope("not_found", "No draft exists for this id in dev mock mode.", 404),
    true,
  ],

  [
    "POST",
    "/api/v1/postage/quote",
    () => ({
      messageId: null,
      amount: "0",
      asset: "XLM",
      expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
    }),
  ],

  [
    "GET",
    "/relays/default/diagnostics",
    () => ({
      relayId: "default",
      queueDepth: 0,
      retryCount: 0,
      lastSuccessAt: new Date().toISOString(),
      lastFailureAt: null,
      deadLetterCount: 0,
      status: "healthy",
      signals: { isDelayed: false, isRetryStorm: false, isDegraded: false },
    }),
  ],

  // Catch-all for un-modelled GET endpoints: an empty list envelope keeps
  // list-driven UI in a valid empty state instead of an error state.
  ["GET", "/api/v1/*", () => []],
  ["POST", "/api/v1/*", (ctx) => ctx.body ?? {}],
  ["PUT", "/api/v1/*", (ctx) => ctx.body ?? {}],
  ["PATCH", "/api/v1/*", (ctx) => ctx.body ?? {}],
  ["DELETE", "/api/v1/*", () => ({ success: true })],
];

function matchRoute(method, pathname) {
  for (const [routeMethod, pattern, handler, raw] of routes) {
    if (routeMethod !== method) continue;
    const patternParts = pattern.split("/");
    const pathParts = pathname.split("/");
    if (patternParts.length !== pathParts.length) continue;
    const params = {};
    let ok = true;
    for (let i = 0; i < patternParts.length; i += 1) {
      const p = patternParts[i];
      const v = pathParts[i];
      if (p === v) continue;
      if (p.startsWith(":")) {
        params[p.slice(1)] = decodeURIComponent(v);
        continue;
      }
      if (p === "*" && i === patternParts.length - 1) {
        params["*"] = pathParts.slice(i).join("/");
        ok = true;
        break;
      }
      ok = false;
      break;
    }
    if (ok) return { handler, params, raw };
  }
  return null;
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return undefined;
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return undefined;
  }
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

export function swiftremitMockApiPlugin() {
  return {
    name: "swiftremit-dev-mock-api",
    configureServer(server) {
      const proxyTarget = process.env.VITE_API_BASE_URL?.replace(/\/$/, "");
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url ?? "/", "http://localhost");
        const { pathname } = url;
        const isApi = pathname.startsWith("/api/") || pathname.startsWith("/relays/");
        if (!isApi) return next();

        if (proxyTarget) {
          try {
            const targetUrl = `${proxyTarget}${url.pathname}${url.search}`;
            const headers = { ...req.headers };
            delete headers.host;
            delete headers.connection;
            delete headers["content-length"];
            const body =
              req.method === "GET" || req.method === "HEAD" ? undefined : await readBody(req);
            const upstream = await fetch(targetUrl, {
              method: req.method,
              headers,
              body: body === undefined ? undefined : JSON.stringify(body),
            });
            const text = await upstream.text();
            res.statusCode = upstream.status;
            upstream.headers.forEach((value, key) => {
              if (key === "transfer-encoding" || key === "content-encoding") return;
              res.setHeader(key, value);
            });
            res.end(text);
            return;
          } catch (err) {
            sendJson(
              res,
              502,
              errorEnvelope(
                "upstream_unavailable",
                `Dev proxy could not reach ${proxyTarget}: ${err?.message ?? "unknown error"}`,
                502,
              ),
            );
            return;
          }
        }

        const match = matchRoute(req.method ?? "GET", pathname);
        if (!match) return next();
        const body = req.method === "GET" ? undefined : await readBody(req);
        const data = match.handler({ params: match.params, query: url.searchParams, body });
        if (data && typeof data === "object" && "error" in data) {
          sendJson(res, data.error.status ?? 400, data);
          return;
        }
        sendJson(res, 200, envelope(data));
      });
    },
  };
}
