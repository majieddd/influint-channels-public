#!/usr/bin/env node
/**
 * Influint channel intelligence, as an MCP server.
 *
 * Download this one file, set two environment variables, point any MCP client
 * at it. It proxies to the read-only HTTP API, so what it can do is exactly
 * what a key is allowed to read: look at the evidence base and one channel's
 * prioritised actions. It cannot start an analysis, publish anything, or move
 * a claim's standing.
 *
 * ZERO DEPENDENCIES, and that is the whole point. The MCP stdio transport is
 * newline-delimited JSON-RPC 2.0, which is about a hundred lines to speak
 * directly. Depending on the SDK would mean an npm install, a version to pin
 * and a lockfile to go wrong on someone else's machine, in exchange for
 * nothing this file needs. Node 18 or newer is the only requirement (it uses
 * the built-in fetch).
 *
 *   YT_INTELLIGENCE_URL=https://<host>/api/intelligence \
 *   YT_INTELLIGENCE_KEY=<key> \
 *   node yt-intelligence-mcp.mjs
 *
 * Claude Desktop / Claude Code config:
 *
 *   {
 *     "mcpServers": {
 *       "yt-intelligence": {
 *         "command": "node",
 *         "args": ["/absolute/path/to/yt-intelligence-mcp.mjs"],
 *         "env": {
 *           "YT_INTELLIGENCE_URL": "https://<host>/api/intelligence",
 *           "YT_INTELLIGENCE_KEY": "<key>"
 *         }
 *       }
 *     }
 *   }
 */

const BASE = (process.env.YT_INTELLIGENCE_URL || "").replace(/\/+$/, "");
const KEY = process.env.YT_INTELLIGENCE_KEY || "";
const NAME = "yt-intelligence";
const VERSION = "1.0.0";
const DEFAULT_PROTOCOL = "2024-11-05";

/**
 * Every tool description says what the answer RESTS ON, not just what it
 * returns. A model that is told "the claims for this niche" will state them as
 * fact; one told "most of these have never been measured, and each carries how
 * well it has held up" will pass that on. The whole system is built to avoid
 * handing over a number without its basis, and this is the last place it can
 * be dropped.
 */
const TOOLS = [
  {
    name: "intelligence_state",
    description:
      "How much of the YouTube knowledge base is actually measured, how many claims share a single test, and what is waiting on a human decision. Call this first: it is the cheapest way to know what the rest of the answers are worth.",
    path: "state",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "intelligence_claims",
    description:
      "What we believe about YouTube performance, routed to a channel's niche, together with the PROHIBITIONS — things our own data refuted and nobody should assert. Each claim carries its standing (theory / candidate-law / law / warning) and, when it has been measured, how consistently it held and across how many channels. Claims scoped to a different niche are excluded; if no niche is given the answer says so.",
    path: "claims",
    inputSchema: {
      type: "object",
      properties: {
        niche: { type: "string", description: "The channel's niche, e.g. maker-build, vlog-lifestyle, true-crime." },
        category: { type: "string", description: "retention, packaging, ideation, production, and so on." },
        standing: { type: "string", enum: ["law", "candidate-law", "warning", "theory"] },
        measuredOnly: { type: "boolean", description: "Only claims with evidence behind them." },
        limit: { type: "number" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "intelligence_claim_evidence",
    description:
      "Everything measured about ONE claim: the probe that tested it, every per-channel reading, the breakdown by niche, and an explicit list of what the evidence does NOT establish. Use this before repeating a claim as fact.",
    path: "claim",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string", description: "The claim id." } },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "channel_action_list",
    description:
      "The prioritised moves for one channel, ordered by how many viewers each could recover, with the confidence behind each one and what would make it wrong. Derived from that channel's own retention curves, not from generic advice.",
    path: "actions",
    inputSchema: {
      type: "object",
      properties: { channelId: { type: "string", description: "A YouTube channel id (UC...)." } },
      required: ["channelId"],
      additionalProperties: false,
    },
  },
  {
    name: "list_channels",
    description: "Every channel in the knowledge base, with its niche, scale band and how deeply it has been analysed.",
    path: "channels",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
];

const byName = new Map(TOOLS.map((t) => [t.name, t]));

async function callTool(name, args) {
  const tool = byName.get(name);
  if (!tool) throw new Error(`no such tool: ${name}`);
  if (!BASE || !KEY) {
    throw new Error(
      "YT_INTELLIGENCE_URL and YT_INTELLIGENCE_KEY must both be set. Ask whoever gave you this file for a key; it is read-only.",
    );
  }
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(args || {})) {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  }
  const url = `${BASE}/${tool.path}${q.toString() ? `?${q}` : ""}`;
  const res = await fetch(url, { headers: { authorization: `Bearer ${KEY}` } });
  const body = await res.text();
  if (!res.ok) {
    // The API's own error text explains the fix (a missing key, a 503 because
    // the deployment has the API switched off). Passing it through beats
    // replacing it with a status code.
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 600)}`);
  }
  return body;
}

// ── JSON-RPC over newline-delimited stdio ──────────────────────────────────

const send = (msg) => process.stdout.write(`${JSON.stringify(msg)}\n`);
const reply = (id, result) => send({ jsonrpc: "2.0", id, result });
const fail = (id, code, message) => send({ jsonrpc: "2.0", id, error: { code, message } });

async function handle(msg) {
  const { id, method, params } = msg;
  // A notification has no id and must never be answered.
  const isRequest = id !== undefined && id !== null;

  switch (method) {
    case "initialize":
      return reply(id, {
        protocolVersion: params?.protocolVersion || DEFAULT_PROTOCOL,
        capabilities: { tools: {} },
        serverInfo: { name: NAME, version: VERSION },
      });
    case "notifications/initialized":
    case "initialized":
      return;
    case "ping":
      return isRequest && reply(id, {});
    case "tools/list":
      return reply(id, { tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })) });
    case "tools/call":
      try {
        const out = await callTool(params?.name, params?.arguments);
        return reply(id, { content: [{ type: "text", text: out }] });
      } catch (err) {
        // An MCP tool error is reported INSIDE the result with isError, not as
        // a JSON-RPC error: the model should see what went wrong and adapt,
        // rather than the client treating it as a broken server.
        return reply(id, { content: [{ type: "text", text: String(err?.message || err) }], isError: true });
      }
    default:
      if (isRequest) fail(id, -32601, `method not found: ${method}`);
  }
}

let buf = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  buf += chunk;
  let nl;
  while ((nl = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, nl).trim();
    buf = buf.slice(nl + 1);
    if (!line) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      continue; // A malformed line is not worth killing the session over.
    }
    Promise.resolve(handle(msg)).catch((err) => {
      if (msg?.id !== undefined && msg?.id !== null) fail(msg.id, -32603, String(err?.message || err));
    });
  }
});
process.stdin.on("end", () => process.exit(0));
