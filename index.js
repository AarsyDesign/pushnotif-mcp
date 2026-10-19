#!/usr/bin/env node
/**
 * PushNotif.biz.id Official MCP STDIO-to-HTTP Bridge
 * Remote Streamable HTTP Endpoint: https://pushnotif.biz.id/mcp
 * Documentation: https://pushnotif.biz.id/docs
 */
const readline = require("readline");

const API_URL = process.env.PUSHNOTIF_MCP_URL || "https://pushnotif.biz.id/mcp";
const API_KEY = process.env.PUSHNOTIF_API_KEY || "";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });

rl.on("line", async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  try {
    const headers = { "Content-Type": "application/json" };
    if (API_KEY) headers["Authorization"] = `Bearer ${API_KEY}`;
    const res = await fetch(API_URL, { method: "POST", headers, body: trimmed });
    const text = await res.text();
    if (text) process.stdout.write(text.trim() + "\n");
  } catch (err) {
    process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32000, message: String(err.message || err) } }) + "\n");
  }
});
