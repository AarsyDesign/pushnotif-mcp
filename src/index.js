#!/usr/bin/env node
/**
 * PushNotif Official MCP Server (Stdio & Remote JSON-RPC Bridge)
 * Repository: https://github.com/AarsyDesign/pushnotif-mcp
 * Documentation: https://pushnotif.biz.id/docs
 * License: MIT
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const PUSHNOTIF_API_URL = process.env.PUSHNOTIF_API_URL || "https://pushnotif.biz.id/mcp";
const PUSHNOTIF_API_KEY = process.env.PUSHNOTIF_API_KEY || "";

const TOOLS = [
  {
    "name": "request_registration_otp",
    "description": "Send a 6-digit email verification OTP to start registering a new PushNotif account. Use this tool first when a user wants to create a new account from chat; do not use it for existing accounts (use login_existing_account instead). Public endpoint requiring no API key; checks for duplicate emails, rate-limited to 5 requests per 10 minutes per IP, and sends an OTP valid for 10 minutes before calling register_new_account. Returns JSON { ok, status, email, message }.",
    "annotations": {
      "title": "Request Registration OTP",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": true
    },
    "inputSchema": {
      "type": "object",
      "properties": {
        "email": {
          "type": "string",
          "description": "Valid email address to register (e.g., user@domain.com); must not already be registered"
        },
        "name": {
          "type": "string",
          "description": "Optional user or workspace display name (2 to 80 characters)"
        }
      },
      "required": [
        "email"
      ]
    }
  },
  {
    "name": "register_new_account",
    "description": "Verify a 6-digit email OTP, create a new PushNotif tenant account with 1,000 free lifetime credits, register the initial website app, and issue a live API key. Use this tool immediately after request_registration_otp once the user providesotp_code; do not use it to add extra websites to an existing account (use create_app instead). Public endpoint requiring no prior API key; irreversibly creates a tenant record and auto-generates ECDSA P-256 VAPID keys. Returns JSON { ok, tenant: { id, name, email, api_key, credits }, app: { id, site_name, site_url, vapid_public_key } }.",
    "annotations": {
      "title": "Register New Account with OTP",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    },
    "inputSchema": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": "User or company workspace name (2 to 80 characters)"
        },
        "email": {
          "type": "string",
          "description": "Email address that received the OTP from request_registration_otp"
        },
        "password": {
          "type": "string",
          "description": "Account password (minimum 6 characters)"
        },
        "otp_code": {
          "type": "string",
          "description": "Exact 6-digit numeric OTP code sent to the user's email"
        },
        "site_name": {
          "type": "string",
          "description": "Optional display name for the first website or app (defaults to workspace name)"
        },
        "site_url": {
          "type": "string",
          "description": "Optional full HTTPS origin URL of the first website (e.g., https://example.com)"
        }
      },
      "required": [
        "name",
        "email",
        "password",
        "otp_code"
      ]
    }
  },
  {
    "name": "login_existing_account",
    "description": "Authenticate an existing PushNotif account with email and password to retrieve its active API key and registered apps list. Use this tool when an existing user wants to connect their account in chat without opening the web dashboard; do not use it for new signups (use request_registration_otp and register_new_account instead). Read-only authentication check with no credit cost, rate-limited against brute-force attempts. Returns JSON { ok, tenant: { id, name, email, api_key, credits }, apps: [{ id, site_name, site_url }] }.",
    "annotations": {
      "title": "Login Existing Account",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    },
    "inputSchema": {
      "type": "object",
      "properties": {
        "email": {
          "type": "string",
          "description": "Registered PushNotif account email address"
        },
        "password": {
          "type": "string",
          "description": "Account password"
        }
      },
      "required": [
        "email",
        "password"
      ]
    }
  },
  {
    "name": "list_apps",
    "description": "List all registered websites and mobile apps in the authenticated PushNotif workspace along with active subscriber counts and current credit balance. Use this tool first as a prerequisite before calling send_push_notification, schedule_push_notification, get_integration_guide, or configure_inapp_banner to obtain a valid app_id; do not use it to inspect individual device tokens (use list_subscribers instead). Read-only operation requiring PUSHNOTIF_API_KEY with zero credit cost. Returns JSON { tenant_name, credits_balance, total_apps, apps: [{ id, site_name, site_url, active_subscribers }] }.",
    "annotations": {
      "title": "List Registered Apps & Credit Balance",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    },
    "inputSchema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "create_app",
    "description": "Register an additional website or mobile application under the authenticated PushNotif workspace and generate its unique ECDSA P-256 VAPID keypair. Use this tool when an authenticated user wants to add a new website domain or app; do not use it to modify an existing app's logo or welcome message (use update_app_branding instead) or to register a brand-new user account (use register_new_account instead). Requires PUSHNOTIF_API_KEY, costs 0 credits, and creates a persistent app record. Returns JSON { ok, app: { id, site_name, site_url, vapid_public_key, created_at }, sdk_snippet }.",
    "annotations": {
      "title": "Create New Website or Mobile App",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    },
    "inputSchema": {
      "type": "object",
      "properties": {
        "site_name": {
          "type": "string",
          "description": "Display name of the website or mobile application (2 to 80 characters)"
        },
        "site_url": {
          "type": "string",
          "description": "Canonical HTTPS URL of the website (must start with https:// or http://localhost)"
        }
      },
      "required": [
        "site_name",
        "site_url"
      ]
    }
  },
  {
    "name": "send_push_notification",
    "description": "Broadcast an immediate push notification across Web Push (VAPID), Android (FCM), and iOS (APNs) to active subscribers of a specific app_id. Use this tool for instant real-time delivery; do not use it for future or recurring broadcasts (use schedule_push_notification instead) or in-page popups (use configure_inapp_banner instead). Prerequisite: call list_apps first to obtain app_id. Requires PUSHNOTIF_API_KEY, deducts 1 credit (Rp 0.20) per successfully delivered device (0 credits charged for 404/410 dead tokens, which are auto-pruned), and is irreversible once dispatched. Set segment='all' for all active subscribers or pass a specific tag name to target a subset. Returns JSON { ok, campaign_id, total_targeted, total_delivered, total_gone_pruned, credits_deducted, credits_remaining }.",
    "annotations": {
      "title": "Send Immediate Push Notification Broadcast",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": true
    },
    "inputSchema": {
      "type": "object",
      "properties": {
        "app_id": {
          "type": "string",
          "description": "Target application ID in format app_xxxx (obtain from list_apps)"
        },
        "title": {
          "type": "string",
          "description": "Notification headline shown on lock screen (1 to 100 characters)"
        },
        "body": {
          "type": "string",
          "description": "Notification message body text (1 to 240 characters)"
        },
        "url": {
          "type": "string",
          "description": "Optional HTTPS destination URL opened when the user taps the notification (defaults to the app's site_url)"
        },
        "segment": {
          "type": "string",
          "description": "Subscriber filter: 'all' (default, sends to every active subscriber of app_id) or a specific subscriber tag string (e.g., 'vip', 'jakarta')"
        }
      },
      "required": [
        "app_id",
        "title",
        "body"
      ]
    }
  },
  {
    "name": "get_integration_guide",
    "description": "Generate copy-pasteable SDK installation code and service worker setup instructions for a specific app_id and target framework. Use this tool when a developer asks how to install PushNotif on HTML, Laravel, Next.js/React, WordPress, or Flutter/mobile; do not use it to send notifications (use send_push_notification instead). Prerequisite: call list_apps first to get app_id. Read-only operation requiring PUSHNOTIF_API_KEY with 0 credit cost. Returns JSON { app_id, site_name, framework, one_line_script, service_worker_url, code_snippet, verification_steps }.",
    "annotations": {
      "title": "Get Framework SDK Integration Guide",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    },
    "inputSchema": {
      "type": "object",
      "properties": {
        "app_id": {
          "type": "string",
          "description": "Target application ID in format app_xxxx (obtain from list_apps)"
        },
        "framework": {
          "type": "string",
          "description": "Target stack: 'html' (default 1-line script), 'nextjs', 'laravel', 'wordpress', or 'flutter'"
        }
      },
      "required": [
        "app_id"
      ]
    }
  },
  {
    "name": "update_profile",
    "description": "Update the authenticated tenant's workspace display name or account password. Use this tool only for account-level profile or password changes; do not use it to change a website's notification logo or welcome push message (use update_app_branding instead). Requires PUSHNOTIF_API_KEY, costs 0 credits, and overwrites the workspace name (and password hash if new_password is supplied). Returns JSON { ok, tenant: { id, name, email }, password_updated }.",
    "annotations": {
      "title": "Update Workspace Profile & Password",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    },
    "inputSchema": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": "New workspace or company display name (2 to 80 characters)"
        },
        "new_password": {
          "type": "string",
          "description": "Optional new account login password (minimum 6 characters; omit to keep current password unchanged)"
        }
      },
      "required": [
        "name"
      ]
    }
  },
  {
    "name": "update_app_branding",
    "description": "Configure an application's notification icon URL and automated welcome push notification sent when a visitor first subscribes. Use this tool to customize app-level branding and onboarding welcome alerts; do not use it to change account-level workspace names (use update_profile instead) or in-page popups (use configure_inapp_banner instead). Prerequisite: call list_apps first to obtain app_id. Requires PUSHNOTIF_API_KEY, idempotently updates the app record at 0 configuration cost (welcome pushes cost 1 credit per new subscriber when welcome_enabled=true). Returns JSON { ok, app_id, icon_url, welcome_enabled, welcome_title, welcome_body }.",
    "annotations": {
      "title": "Update App Icon & Welcome Notification",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    },
    "inputSchema": {
      "type": "object",
      "properties": {
        "app_id": {
          "type": "string",
          "description": "Target application ID in format app_xxxx (obtain from list_apps)"
        },
        "icon_url": {
          "type": "string",
          "description": "Optional direct HTTPS URL to a square PNG/JPG/WebP brand icon (recommended 192x192px)"
        },
        "welcome_enabled": {
          "type": "boolean",
          "description": "Set true to automatically send a welcome push notification immediately after a visitor grants permission"
        },
        "welcome_title": {
          "type": "string",
          "description": "Headline of the automated welcome push notification (max 80 characters)"
        },
        "welcome_body": {
          "type": "string",
          "description": "Body text of the automated welcome push notification (max 180 characters)"
        }
      },
      "required": [
        "app_id"
      ]
    }
  },
  {
    "name": "create_qris_invoice",
    "description": "Create a prepaid credit top-up invoice payable via Indonesian QRIS (all banks and e-wallets) at a flat rate of Rp 0.20 per credit (Rp 1,000 = 5,000 lifetime credits). Use this tool when the user wants to add credit balance; do not use it to check whether an existing invoice has been paid (use check_billing_and_qris_status instead). Requires PUSHNOTIF_API_KEY, creates a PENDING order valid for 30 minutes, and automatically adds non-expiring credits upon payment webhook confirmation. Provide either package_id ('starter'=Rp 20,000, 'growth'=Rp 50,000, 'pro'=Rp 100,000) or a custom amount_rp (>= 1000). Returns JSON { ok, order: { id, amount_rp, credits_added, status, qris_checkout_url, expires_at } }.",
    "annotations": {
      "title": "Create QRIS Credit Top-Up Invoice",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": true
    },
    "inputSchema": {
      "type": "object",
      "properties": {
        "package_id": {
          "type": "string",
          "description": "Preset package tier: 'starter' (Rp 20,000 = 100,000 credits), 'growth' (Rp 50,000 = 250,000 credits), or 'pro' (Rp 100,000 = 500,000 credits); overridden if amount_rp is explicitly provided"
        },
        "amount_rp": {
          "type": "integer",
          "description": "Custom top-up amount in Indonesian Rupiah (minimum 1000, maximum 10000000; 1 IDR = 5 credits)"
        }
      }
    }
  },
  {
    "name": "schedule_push_notification",
    "description": "Schedule a one-time or recurring push notification campaign for a future timestamp, or cancel an existing pending schedule. Use this tool for delayed or recurring broadcasts (daily, weekly, cron); do not use it for immediate sending (use send_push_notification instead). Prerequisite: call list_apps first to obtain app_id, or call get_campaign_analytics to find a cancel_campaign_id. Requires PUSHNOTIF_API_KEY; credits (1 per delivered device) are deducted only when the scheduled dispatch executes. Pass cancel_campaign_id ('cmp_sch_xxxx') to cancel a queued job, or pass app_id, title, body, and scheduled_for (ISO-8601) to create one. Returns JSON { ok, action, scheduled_campaign: { id, app_id, title, scheduled_for, recurrence_rule, status } }.",
    "annotations": {
      "title": "Schedule or Cancel Future Push Campaign",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": false,
      "openWorldHint": false
    },
    "inputSchema": {
      "type": "object",
      "properties": {
        "app_id": {
          "type": "string",
          "description": "Target application ID in format app_xxxx (required when creating a schedule)"
        },
        "title": {
          "type": "string",
          "description": "Notification headline (required when creating a schedule; 1 to 100 characters)"
        },
        "body": {
          "type": "string",
          "description": "Notification body text (required when creating a schedule; 1 to 240 characters)"
        },
        "url": {
          "type": "string",
          "description": "Optional HTTPS destination URL opened on tap"
        },
        "scheduled_for": {
          "type": "string",
          "description": "ISO-8601 execution timestamp (e.g., '2026-10-21T08:00:00+07:00')"
        },
        "recurrence_rule": {
          "type": "string",
          "description": "Recurrence pattern: 'once' (default), 'daily', 'twice_daily', 'weekly', 'monthly', 'every_30m', 'every_3h', 'every_6h', or a 5-field cron expression"
        },
        "cancel_campaign_id": {
          "type": "string",
          "description": "Optional scheduled campaign ID (format cmp_sch_xxxx from get_campaign_analytics) to cancel and delete before execution"
        }
      }
    }
  },
  {
    "name": "get_campaign_analytics",
    "description": "Retrieve historical push campaign delivery metrics (sent count, click count, CTR percentage, credits spent) and active scheduled queue items. Use this tool to audit campaign performance or find scheduled campaign IDs (cmp_sch_xxxx); do not use it to check QRIS payment invoices (use check_billing_and_qris_status instead) or raw subscriber device lists (use list_subscribers instead). Read-only operation requiring PUSHNOTIF_API_KEY with 0 credit cost. Returns JSON { summary: { total_sent, total_clicks, avg_ctr_percent }, campaigns: [{ id, app_id, title, delivered_count, click_count, ctr_percent, created_at }], scheduled_queue: [...] }.",
    "annotations": {
      "title": "Get Campaign Delivery & CTR Analytics",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    },
    "inputSchema": {
      "type": "object",
      "properties": {
        "app_id": {
          "type": "string",
          "description": "Optional application ID filter (format app_xxxx); omit to aggregate across all apps in the workspace"
        },
        "limit": {
          "type": "integer",
          "description": "Maximum number of recent campaigns to return (1 to 50, default: 10)"
        }
      }
    }
  },
  {
    "name": "list_subscribers",
    "description": "Retrieve active subscriber device records and platform breakdown counts (Web VAPID, Android FCM, iOS APNs) for the workspace or a specific app_id. Use this tool to inspect audience size, platform distribution, or subscriber tags; do not use it to view campaign click metrics (use get_campaign_analytics instead). Read-only operation requiring PUSHNOTIF_API_KEY with 0 credit cost. Returns JSON { total_active, platform_breakdown: { web, android_fcm, ios_apns }, subscribers: [{ id, app_id, platform, tags, created_at }] }.",
    "annotations": {
      "title": "List Active Subscribers & Platform Breakdown",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    },
    "inputSchema": {
      "type": "object",
      "properties": {
        "app_id": {
          "type": "string",
          "description": "Optional application ID filter (format app_xxxx); omit to list subscribers across all workspace apps"
        },
        "limit": {
          "type": "integer",
          "description": "Maximum number of recent subscriber records to return (1 to 100, default: 15)"
        }
      }
    }
  },
  {
    "name": "check_billing_and_qris_status",
    "description": "Check QRIS top-up order payment status (PENDING or PAID), current credit balance, credit ledger history, and official PDF invoice URLs. Use this tool to verify whether a QRIS invoice from create_qris_invoice has been paid or to audit credit usage; do not use it to create a new top-up invoice (use create_qris_invoice instead). Read-only operation requiring PUSHNOTIF_API_KEY with 0 credit cost. Returns JSON { credits_balance, orders: [{ id, amount_rp, credits_added, status, invoice_pdf_url, created_at }], recent_ledger: [...] }.",
    "annotations": {
      "title": "Check QRIS Payment Status & Credit Ledger",
      "readOnlyHint": true,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    },
    "inputSchema": {
      "type": "object",
      "properties": {
        "order_id": {
          "type": "string",
          "description": "Optional specific QRIS order ID (format ord_xxxx from create_qris_invoice) to inspect; omit to list recent orders"
        }
      }
    }
  },
  {
    "name": "configure_mobile_credentials",
    "description": "Store native mobile push credentials—Firebase Cloud Messaging (FCM HTTP v1 service-account.json) for Android APK and Apple Push Notification service (.p8 AuthKey, Key ID, Team ID, Bundle ID) for iOS—on a specific app_id. Use this tool when enabling native Android or iOS push delivery; do not use it for standard browser Web Push (which uses auto-generated VAPID keys from create_app). Prerequisite: call list_apps first to obtain app_id. Requires PUSHNOTIF_API_KEY, costs 0 credits, and idempotently updates encrypted mobile credentials. Returns JSON { ok, app_id, android_fcm_configured, ios_apns_configured }.",
    "annotations": {
      "title": "Configure Android FCM & iOS APNs Credentials",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    },
    "inputSchema": {
      "type": "object",
      "properties": {
        "app_id": {
          "type": "string",
          "description": "Target application ID in format app_xxxx (obtain from list_apps)"
        },
        "fcm_service_account_json": {
          "type": "string",
          "description": "Raw JSON string of the Google Firebase Service Account key file for Android FCM HTTP v1"
        },
        "apns_key_id": {
          "type": "string",
          "description": "10-character Apple Developer APNs Key ID (e.g., 'ABC123DEFG')"
        },
        "apns_team_id": {
          "type": "string",
          "description": "10-character Apple Developer Team ID"
        },
        "apns_bundle_id": {
          "type": "string",
          "description": "iOS application Bundle Identifier (e.g., 'id.company.app')"
        },
        "apns_p8_key": {
          "type": "string",
          "description": "Full PEM text content of Apple's AuthKey_XXXX.p8 private key file"
        }
      },
      "required": [
        "app_id"
      ]
    }
  },
  {
    "name": "configure_inapp_banner",
    "description": "Configure and publish an on-site In-App Popup or Banner (center modal, top sticky bar, or bottom slide-in card) rendered by the PushNotif SDK without requiring browser notification permission. Use this tool to display promotional popups or announcements to all active website visitors; do not use it to send OS lock-screen push notifications (use send_push_notification instead). Prerequisite: call list_apps first to obtain app_id. Requires PUSHNOTIF_API_KEY; saving configuration costs 0 credits, and each live visitor impression deducts 1 credit. Returns JSON { ok, app_id, inapp_enabled, inapp_style, inapp_trigger, inapp_freq }.",
    "annotations": {
      "title": "Configure In-App Popup & Sticky Promo Banner",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": false
    },
    "inputSchema": {
      "type": "object",
      "properties": {
        "app_id": {
          "type": "string",
          "description": "Target application ID in format app_xxxx (obtain from list_apps)"
        },
        "inapp_enabled": {
          "type": "boolean",
          "description": "Set true to activate the banner on the website, or false to pause it (default: true)"
        },
        "inapp_style": {
          "type": "string",
          "description": "Visual layout style: 'modal' (center dialog), 'top_bar' (sticky top ribbon), or 'bottom_slide' (corner toast card)"
        },
        "inapp_trigger": {
          "type": "string",
          "description": "Display trigger condition: 'immediate' (default), 'delay_5s', 'delay_10s', 'scroll_50', 'scroll_80', or custom DOM event 'event:<name>'"
        },
        "inapp_title": {
          "type": "string",
          "description": "Banner headline text (1 to 100 characters)"
        },
        "inapp_body": {
          "type": "string",
          "description": "Banner supporting message text (1 to 240 characters)"
        },
        "inapp_cta_text": {
          "type": "string",
          "description": "Optional call-to-action button label (e.g., 'Klaim Voucher →')"
        },
        "inapp_cta_url": {
          "type": "string",
          "description": "Optional HTTPS URL opened when the CTA button is clicked"
        },
        "inapp_accent": {
          "type": "string",
          "description": "Optional hex color code for the CTA button and accent border (default: '#0058BE')"
        },
        "inapp_freq": {
          "type": "string",
          "description": "Per-visitor frequency cap: 'once_per_session' (default), 'once_per_day', 'cooldown_3h', 'cooldown_12h', 'once_per_week', or 'always'"
        }
      },
      "required": [
        "app_id",
        "inapp_title",
        "inapp_body"
      ]
    }
  },
  {
    "name": "configure_rss_autopush",
    "description": "Configure automated 24/7 RSS, Atom, or XML Sitemap polling for an app_id, or trigger an immediate feed check and push broadcast via dispatch_now=true. Use this tool when a blog, news portal, or store wants newly published articles automatically broadcast as push notifications; do not use it for manual one-off messages (use send_push_notification instead). Prerequisite: call list_apps first to obtain app_id. Requires PUSHNOTIF_API_KEY; feed URLs are validated against SSRF rules, deduplicated by item GUID/URL, and deduct 1 credit per delivered subscriber when a new post is broadcast. Returns JSON { ok, app_id, rss_enabled, rss_feed_url, rss_interval, dispatched_now, latest_item_title }.",
    "annotations": {
      "title": "Configure 24/7 RSS & Sitemap Auto-Push",
      "readOnlyHint": false,
      "destructiveHint": false,
      "idempotentHint": true,
      "openWorldHint": true
    },
    "inputSchema": {
      "type": "object",
      "properties": {
        "app_id": {
          "type": "string",
          "description": "Target application ID in format app_xxxx (obtain from list_apps)"
        },
        "rss_enabled": {
          "type": "boolean",
          "description": "Set true to enable background RSS/Sitemap polling, or false to disable it"
        },
        "rss_feed_url": {
          "type": "string",
          "description": "Public HTTPS URL of the RSS 2.0, Atom, or XML Sitemap feed (e.g., 'https://example.com/feed')"
        },
        "rss_interval": {
          "type": "string",
          "description": "Polling frequency: '5m', '15m', '30m' (default), '1h', '3h', or 'daily_digest'"
        },
        "rss_prefix": {
          "type": "string",
          "description": "Optional prefix prepended to each notification title (e.g., 'Artikel Baru: ')"
        },
        "dispatch_now": {
          "type": "boolean",
          "description": "Set true to immediately fetch the latest feed entry and broadcast it to active subscribers right now"
        }
      },
      "required": [
        "app_id"
      ]
    }
  }
];

const server = new Server(
  {
    name: "pushnotif-mcp-server",
    version: "2.1.2",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const apiKey = (args && (args.api_key || args.apiKey)) || PUSHNOTIF_API_KEY;

  const headers = {
    "Content-Type": "application/json",
    "User-Agent": "PushNotif-MCP-Server/2.1.2 (+https://github.com/AarsyDesign/pushnotif-mcp)",
  };
  if (apiKey) {
    headers["Authorization"] = apiKey.startsWith("Bearer ") ? apiKey : `Bearer ${apiKey}`;
  }

  const response = await fetch(PUSHNOTIF_API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "tools/call",
      params: {
        name,
        arguments: args || {},
      },
    }),
  });

  const data = await response.json();
  if (data.error) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `PushNotif MCP Error (${data.error.code}): ${data.error.message}`,
        },
      ],
    };
  }

  return data.result || {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("PushNotif MCP Server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error starting PushNotif MCP Server:", err);
  process.exit(1);
});
