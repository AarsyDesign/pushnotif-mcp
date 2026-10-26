# 🔔 PushNotif MCP Server (`pushnotif-mcp-server`)

[![Listed on mcpservers.org](https://mcpservers.org/badge.svg)](https://mcpservers.org/servers/aarsydesign/pushnotif-mcp)
[![Listed on AllMCPs](https://allmcps.com/api/badge/pushnotif-official-mcp-server?style=shield)](https://allmcps.com/mcp/pushnotif-official-mcp-server)
[![AgentShield Security](https://merx.help/badge/A+.svg)](https://merx.help/shield)

[![MCP Protocol](https://img.shields.io/badge/MCP-2024--11--05-2563eb?style=flat-square)](https://modelcontextprotocol.io)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-10b981?style=flat-square)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-f59e0b?style=flat-square)](LICENSE)

Official open-source **Model Context Protocol (MCP) Server** implementation for **[PushNotif.biz.id](https://pushnotif.biz.id)** — allowing AI coding assistants (**Claude Desktop, Claude Code, Cursor, Windsurf, Cline, and Glama**) to register accounts, generate SDK snippets, broadcast Web Push (VAPID) & Mobile Push (Android FCM / iOS APNs), configure In-App Popup Banners, Social Proof Toasts, Transactional Email OTP, and manage QRIS credits.

---

## 📦 Repository Architecture (Open-Source MCP Server Implementation)

This repository contains the complete, runnable MCP Server implementation built on `@modelcontextprotocol/sdk`:

- **`src/index.js`** — Full Stdio MCP Server implementation (`@modelcontextprotocol/sdk`) exposing all **19 PushNotif tools** (`ListToolsRequestSchema` & `CallToolRequestSchema`).
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

## 🛠️ Available Tools (19 Full-Lifecycle Tools)

### Account Onboarding (No API Key Required)
1. **`register_new_account`** — Two-step onboarding to request a 6-digit email OTP or verify the OTP to create a new PushNotif account (+1,000 Free Quota Credits forever), register the first website, and return `api_key` (`pn_live_...`).
2. **`login_existing_account`** — Authenticate an existing account with email & password to retrieve its `api_key` and optionally update workspace profile name or password.

### Workspace, Web Push, Mobile Push, In-App & Transactional Email Automation
3. **`list_apps`** — List all registered websites/apps, active subscriber counts, credit balance, and optional ready-to-paste SDK snippets (`html`, `nextjs`, `laravel`, `wordpress`, `flutter`).
4. **`create_app`** — Register a new website or mobile app and generate VAPID keys.
5. **`update_app_branding`** — Update notification icon URL, automatic Welcome Push message, or upload Firebase FCM Service Account JSON / Apple APNs `.p8` credentials.
6. **`delete_app`** — Permanently delete a registered application along with its subscribers, campaigns, and logs.
7. **`send_push_notification`** — Broadcast instant Web Push (VAPID), Android (FCM), and iOS (APNs) notifications.
8. **`schedule_push_notification`** — Schedule one-time or recurring (`daily` / `weekly`) push campaigns.
9. **`configure_inapp_banner`** — Configure In-App Popup Modals, Top Sticky Bars, or Bottom Slide Cards.
10. **`configure_social_toast`** — Configure standalone on-site Live Activity Social Proof Toast popups.
11. **`configure_rss_autopush`** — Configure automated 24/7 RSS / Sitemap / Atom feed monitoring and auto-push.
12. **`configure_payment_webhook`** — Generate incoming webhook URLs for Midtrans, Xendit, Mayar, Lynk.id, Duitku, Tripay, WooCommerce, and GitHub, or trigger a live test event.
13. **`configure_email_automation`** — Configure per-app switches for Automated Transactional Emails (Order Paid Receipt, Welcome Email, Broadcast Mirror) and custom Reply-To.
14. **`send_transactional_email`** — Send 1-to-1 transactional emails (`otp_code`, `payment_invoice`, `order_status`, `security_alert`) via PushNotif's anti-phishing locked templates.
15. **`list_subscribers`** — View active subscriber device distribution and segment tags.
16. **`update_subscriber_tags`** — Assign, replace, or remove audience segment tags on subscriber devices.
17. **`get_campaign_analytics`** — Inspect campaign delivery, click-through rate (CTR), and conversion metrics.
18. **`create_qris_invoice`** — Generate a live QRIS payment invoice (starting from Rp 1,000 / 5,000 Credits).
19. **`check_billing_and_qris_status`** — Check real-time QRIS payment status (`PENDING` / `PAID`), credit ledger history, and downloadable PDF invoices.

---

## 📄 License

MIT License — Copyright (c) 2026 PushNotif.biz.id (`AarsyDesign`)
