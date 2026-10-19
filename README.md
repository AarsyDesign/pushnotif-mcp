# 🔔 PushNotif MCP Server (`pushnotif.biz.id`)

[![MCP Protocol](https://img.shields.io/badge/MCP-2025--03--26%20Streamable%20HTTP-0058BE?style=flat-square)](https://pushnotif.biz.id/mcp)
[![Website](https://img.shields.io/badge/Website-pushnotif.biz.id-047857?style=flat-square)](https://pushnotif.biz.id)
[![Agent Ready](https://img.shields.io/badge/AI%20Agent%20Ready-llms.txt%20%2B%20OpenAPI-0F172A?style=flat-square)](https://pushnotif.biz.id/llms.txt)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

**Official Model Context Protocol (MCP) Server for [PushNotif.biz.id](https://pushnotif.biz.id)** — Multi-Channel Notification Infrastructure (**Web Push VAPID, Android FCM, iOS APNs, In-App Popup & Live Activity Toast, Auto-Push RSS/Sitemap, and Transactional Email Relay**) with **Pay-As-You-Go QRIS** (IDR 0.20 / push, no monthly subscription, credits never expire).

> 🇮🇩 **Bahasa Indonesia:** Server MCP resmi untuk **[PushNotif.biz.id](https://pushnotif.biz.id)** — memungkinkan AI Coding Agent (**Claude Code, Cursor, Windsurf, Cline, VS Code Copilot, OpenClaw**) mendaftarkan website, mengambil kode pasang SDK 1-baris, menembakkan *broadcast* Web Push / Android / iOS, mengatur *In-App Popup*, dan mengaktifkan *Auto-Push RSS* langsung dari dalam teks editor Anda.

---

## ⚡ Quick Setup (Zero-Install Streamable HTTP)

### 1. Claude Code CLI
```bash
claude mcp add --transport http pushnotif https://pushnotif.biz.id/mcp --header "Authorization: Bearer YOUR_API_KEY"
```

### 2. Cursor / Windsurf / Cline / Claude Desktop (`mcp.json`)
```json
{
  "mcpServers": {
    "pushnotif": {
      "url": "https://pushnotif.biz.id/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_API_KEY"
      }
    }
  }
}
```

> 💡 **Where to get `YOUR_API_KEY`?**
> Sign up for free at **[https://pushnotif.biz.id](https://pushnotif.biz.id)** (includes **1,000 Free Starter Credits**, no credit card required) and copy your API Key (`pn_live_...`) from the **API, MCP & Profil Akun** tab.
> AI Agents can also self-register autonomously via OTP using the instructions in **[https://pushnotif.biz.id/llms.txt](https://pushnotif.biz.id/llms.txt)**.

---

## 🛠️ Available MCP Tools (14 Developer Tools)

| # | Tool Name | Description |
|---|---|---|
| 1 | `list_apps` | List all registered websites/apps, active subscriber counts, and remaining credit balance. |
| 2 | `create_app` | Register a new website/application and automatically generate ECDSA P-256 VAPID keys. |
| 3 | `get_integration_guide` | Generate ready-to-paste integration code (`sw.js`, 1-line Web SDK, Laravel/Next.js/WordPress snippets, and REST cURL). |
| 4 | `send_push_notification` | Broadcast real-time Web Push (VAPID), Android (FCM), and iOS (APNs) notifications to all active subscribers or targeted segments. |
| 5 | `schedule_push_notification` | Schedule a future push campaign (`scheduled_at`) or recurring daily reminder (`repeat_rule`). |
| 6 | `configure_inapp_banner` | Configure no-code In-App Popup Modals, Top Sticky Bars, Bottom Slide-in Cards, or Live Activity Toasts. |
| 7 | `configure_rss_autopush` | Enable automated background RSS / Sitemap / Atom feed monitoring to auto-broadcast new articles. |
| 8 | `list_subscribers` | Inspect active device subscriptions (`subscriptions`) and platform breakdown (Web, Android, iOS). |
| 9 | `get_campaign_analytics` | Retrieve campaign delivery logs, click-through rates (CTR), and credit usage ledger. |
| 10 | `update_app_branding` | Update application display name, icon URL, and automatic welcome push message. |
| 11 | `configure_mobile_credentials` | Save native Android Firebase (`FCM Service Account JSON`) and Apple (`APNs .p8`) credentials. |
| 12 | `create_qris_invoice` | Generate an instant QRIS payment invoice (starting from Rp 1,000) to top up quota credits. |
| 13 | `check_billing_and_qris_status` | Check real-time credit balance, active QRIS invoice payment status, and official tax/invoice links. |
| 14 | `update_profile` | Update workspace/company name and account profile settings. |

---

## 🌐 Official Links & Documentation

- **Website & Dashboard:** [https://pushnotif.biz.id](https://pushnotif.biz.id)
- **Developer Documentation:** [https://pushnotif.biz.id/docs](https://pushnotif.biz.id/docs)
- **MCP Integration Guide (ID):** [https://pushnotif.biz.id/panduan/mcp-claude-cursor-push-notification](https://pushnotif.biz.id/panduan/mcp-claude-cursor-push-notification)
- **AI Agent Discovery (`llms.txt`):** [https://pushnotif.biz.id/llms.txt](https://pushnotif.biz.id/llms.txt)
- **MCP Server Card:** [https://pushnotif.biz.id/.well-known/mcp/server-card.json](https://pushnotif.biz.id/.well-known/mcp/server-card.json)
- **OpenAPI 3.1 Specification:** [https://pushnotif.biz.id/openapi.json](https://pushnotif.biz.id/openapi.json)

## 📄 License

MIT License — Copyright (c) 2026 PushNotif.biz.id (Arsyad / AarsyDesign).
