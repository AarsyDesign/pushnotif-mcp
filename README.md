# 🔔 PushNotif MCP Server (`pushnotif-mcp-server`)

[![Listed on AllMCPs](https://allmcps.com/api/badge/pushnotif-official-mcp-server?style=shield)](https://allmcps.com/mcp/pushnotif-official-mcp-server)

[![MCP Protocol](https://img.shields.io/badge/MCP-2024--11--05-2563eb?style=flat-square)](https://modelcontextprotocol.io)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-10b981?style=flat-square)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-f59e0b?style=flat-square)](LICENSE)

Official open-source **Model Context Protocol (MCP) Server** implementation for **[PushNotif.biz.id](https://pushnotif.biz.id)** — allowing AI coding assistants (**Claude Desktop, Claude Code, Cursor, Windsurf, Cline, and Glama**) to register accounts, generate SDK snippets, broadcast Web Push (VAPID) & Mobile Push (Android FCM / iOS APNs), configure In-App Popup Banners, and manage QRIS credits.

---

## 📦 Repository Architecture (Open-Source MCP Server Implementation)

This repository contains the complete, runnable MCP Server implementation built on `@modelcontextprotocol/sdk`:

- **`src/index.js`** — Full Stdio MCP Server implementation (`@modelcontextprotocol/sdk`) exposing all **17 PushNotif tools** (`ListToolsRequestSchema` & `CallToolRequestSchema`).
- **`Dockerfile`** — Containerized build for Glama.ai automated inspection and local Docker execution.
- **`package.json`** — Node.js ES Module package (`bin: pushnotif-mcp`).
- **`glama.json` & `smithery.yaml`** — Registry metadata manifests.

---

## 🚀 Quick Start (Local Stdio MCP Server)

### Option 1: Run via Node.js / `npx` (Stdio)

Clone and install dependencies:
```bash
git clone https://github.com/AarsyDesign/pushnotif-mcp.git
cd pushnotif-mcp
npm install
```

Add to your `claude_desktop_config.json` or `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "pushnotif": {
      "command": "node",
      "args": ["/absolute/path/to/pushnotif-mcp/src/index.js"],
      "env": {
        "PUSHNOTIF_API_KEY": "pn_live_YOUR_API_KEY_HERE"
      }
    }
  }
}
```

### Option 2: Run via Docker (Stdio)

```bash
docker build -t pushnotif-mcp .
docker run -i --rm -e PUSHNOTIF_API_KEY=pn_live_YOUR_API_KEY_HERE pushnotif-mcp
```

### Option 3: Direct Streamable HTTP Endpoint

You can also connect directly via Streamable HTTP at `https://pushnotif.biz.id/mcp` with `Authorization: Bearer pn_live_YOUR_API_KEY_HERE`.

---

## 🛠️ Available Tools (15 Full-Lifecycle Tools)

### Account Onboarding (No API Key Required)
1. **`request_registration_otp`** — Send 6-digit verification OTP to user email (includes automatic duplicate email check).
2. **`register_new_account`** — Verify OTP, create a new PushNotif account (+1,000 Free Quota Credits forever), register first website, and return `api_key` (`pn_live_...`).
3. **`login_existing_account`** — Authenticate an existing account with email & password to retrieve its `api_key`.

### Workspace, Web Push, Mobile Push & In-App Automation
4. **`list_apps`** — List all registered websites/apps, active subscriber counts, and credit balance.
5. **`create_app`** — Register a new website or mobile app and generate VAPID keys.
6. **`get_integration_guide`** — Generate copy-paste SDK snippets for HTML/JS, Laravel, Next.js/React, WordPress, Android (Kotlin), and iOS (Swift).
7. **`send_push_notification`** — Broadcast instant Web Push (VAPID), Android (FCM), and iOS (APNs) notifications.
8. **`schedule_push_notification`** — Schedule one-time or recurring (`daily` / `weekly`) push campaigns.
9. **`configure_inapp_banner`** — Configure In-App Popup Modals, Top Sticky Bars, Bottom Slide Cards, or Live Activity Toasts.
10. **`configure_rss_autopush`, `configure_payment_webhook` (Midtrans, Xendit, Mayar, WooCommerce & GitHub)** — Configure automated RSS / Sitemap / Atom feed monitoring.
11. **`configure_mobile_credentials`** — Upload Firebase FCM Service Account JSON or Apple APNs `.p8` credentials.
12. **`list_subscribers`** — View active subscriber device distribution and segments.
13. **`get_campaign_analytics`** — Inspect campaign delivery, click-through rate (CTR), and conversion metrics.
14. **`create_qris_invoice`** — Generate a live QRIS payment invoice (starting from Rp 1,000 / 5,000 Credits).
15. **`check_billing_and_qris_status`** — Check real-time QRIS payment status (`PENDING` / `PAID`) and credit balance.
16. **`update_app_branding`** — Update notification icon URL and automatic Welcome Push message.
17. **`update_profile`** — Update workspace display name or account password.

---

## 📄 License

MIT License — Copyright (c) 2026 PushNotif.biz.id (`AarsyDesign`)
