# PushNotif Official MCP Server — Installation Guide for AI Agents (Cline / Claude / Cursor)

PushNotif provides 24 native MCP tools for sending Web Push (VAPID), Android (FCM), iOS (APNs), In-App Popups/Banners, Social Proof Toasts, Automated RSS-to-Push, and Transactional Email OTPs.

## Option 1: Zero-Install Remote Streamable HTTP (Recommended)

Add the remote Streamable HTTP endpoint directly to your MCP configuration (`cline_mcp_settings.json` or `.mcp.json`):

```json
{
  "mcpServers": {
    "pushnotif": {
      "url": "https://pushnotif.biz.id/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_PUSHNOTIF_API_KEY"
      }
    }
  }
}
```

> **Note:** An API key is optional for initial setup! You can connect without an `Authorization` header and use the built-in `register_new_account` or `login_existing_account` tools directly from your AI agent to create a workspace and claim **1,000 free push notifications**.

## Option 2: Local Stdio Bridge via `npx`

If your MCP client requires a `stdio` command, run the zero-dependency bridge via `npx`:

```json
{
  "mcpServers": {
    "pushnotif": {
      "command": "npx",
      "args": ["-y", "pushnotif-mcp"],
      "env": {
        "PUSHNOTIF_API_KEY": "YOUR_PUSHNOTIF_API_KEY"
      }
    }
  }
}
```

## Verification

Once connected, call `list_apps` (or `register_new_account` if you do not have an API key yet) to verify the connection.
