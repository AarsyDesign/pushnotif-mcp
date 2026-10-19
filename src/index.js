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
    "description": "[PENDAFTARAN AKUN BARU - TAHAP 1] Kirim kode OTP 6 digit ke email pengguna untuk mendaftar akun PushNotif baru (otomatis mengecek duplikasi email). Bisa dipanggil tanpa API Key.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "email": {
          "type": "string",
          "description": "Alamat email pengguna yang akan didaftarkan"
        },
        "name": {
          "type": "string",
          "description": "Nama pengguna atau nama perusahaan/workspace"
        }
      },
      "required": [
        "email"
      ]
    }
  },
  {
    "name": "register_new_account",
    "description": "[PENDAFTARAN AKUN BARU - TAHAP 2] Verifikasi kode OTP 6 digit dari email, buat akun baru PushNotif (otomatis dapat 1.000 Kuota Gratis selamanya), daftarkan website pertama, dan kembalikan API Key (pn_live_...). Bisa dipanggil tanpa API Key.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": "Nama pengguna atau workspace"
        },
        "email": {
          "type": "string",
          "description": "Alamat email pengguna (sama dengan saat request_registration_otp)"
        },
        "password": {
          "type": "string",
          "description": "Password akun baru (minimal 6 karakter)"
        },
        "otp_code": {
          "type": "string",
          "description": "Kode OTP 6 angka yang diterima pengguna di inbox email"
        },
        "site_name": {
          "type": "string",
          "description": "Nama website atau aplikasi pertama"
        },
        "site_url": {
          "type": "string",
          "description": "URL lengkap website pertama (diawali https://)"
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
    "description": "[LOGIN AKUN LAMA VIA CHAT] Masuk ke akun PushNotif yang sudah terdaftar menggunakan email dan password untuk mengambil API Key (pn_live_...) dan daftar aplikasi tanpa membuka dashboard web.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "email": {
          "type": "string",
          "description": "Alamat email akun PushNotif"
        },
        "password": {
          "type": "string",
          "description": "Password akun PushNotif"
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
    "description": "Lihat daftar semua aplikasi/website terdaftar beserta App ID, URL, jumlah pelanggan aktif, dan saldo kredit akun PushNotif.",
    "inputSchema": {
      "type": "object",
      "properties": {}
    }
  },
  {
    "name": "create_app",
    "description": "Daftarkan website atau aplikasi baru ke akun PushNotif dan buat pasangan kunci VAPID otomatis.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "site_name": {
          "type": "string",
          "description": "Nama website atau aplikasi"
        },
        "site_url": {
          "type": "string",
          "description": "URL domain lengkap dengan https://"
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
    "description": "Kirim push notifikasi serentak ke seluruh pelanggan aktif di Web, Android APK (FCM), dan iOS (APNs).",
    "inputSchema": {
      "type": "object",
      "properties": {
        "app_id": {
          "type": "string",
          "description": "App ID tujuan (misal: app_xxxx)"
        },
        "title": {
          "type": "string",
          "description": "Judul pesan notifikasi"
        },
        "body": {
          "type": "string",
          "description": "Isi pesan notifikasi"
        },
        "url": {
          "type": "string",
          "description": "URL tujuan saat notifikasi diketuk"
        },
        "segment": {
          "type": "string",
          "description": "Filter segmen pelanggan (default: all)"
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
    "description": "Ambil panduan kode integrasi SDK lengkap (Web Push, Next.js/React, Laravel, Flutter Android/iOS) untuk sebuah App ID.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "app_id": {
          "type": "string",
          "description": "App ID yang ingin diambil panduannya"
        },
        "framework": {
          "type": "string",
          "description": "Nama framework (misal: Next.js / React, Flutter, Laravel)"
        }
      },
      "required": [
        "app_id"
      ]
    }
  },
  {
    "name": "update_profile",
    "description": "Ubah nama perusahaan/workspace atau ganti password akun PushNotif Anda.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": "Nama perusahaan atau pemilik workspace baru"
        },
        "new_password": {
          "type": "string",
          "description": "Opsional: password baru (minimal 6 karakter)"
        }
      },
      "required": [
        "name"
      ]
    }
  },
  {
    "name": "update_app_branding",
    "description": "Ubah pengaturan merek aplikasi (URL logo icon_url, judul sambutan welcome_title, isi sambutan welcome_body, atau status welcome_enabled).",
    "inputSchema": {
      "type": "object",
      "properties": {
        "app_id": {
          "type": "string",
          "description": "App ID yang ingin diubah (misal: app_xxxx)"
        },
        "icon_url": {
          "type": "string",
          "description": "URL gambar logo PNG/JPG aplikasi"
        },
        "welcome_enabled": {
          "type": "boolean",
          "description": "Aktifkan/matikan pesan sambutan otomatis"
        },
        "welcome_title": {
          "type": "string",
          "description": "Judul notifikasi sambutan saat user baru klik Izinkan"
        },
        "welcome_body": {
          "type": "string",
          "description": "Isi pesan notifikasi sambutan"
        }
      },
      "required": [
        "app_id"
      ]
    }
  },
  {
    "name": "create_qris_invoice",
    "description": "Buat tagihan isi saldo kredit via QRIS (starter=Rp20.000/+100.000 kredit, growth=Rp50.000/+250.000 kredit, scale=Rp100.000/+500.000 kredit, atau nominal custom) dan dapatkan link halaman pembayaran QRIS.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "package_id": {
          "type": "string",
          "description": "Pilih paket: starter, growth, atau pro (opsional jika mengisi amount_rp)"
        },
        "amount_rp": {
          "type": "integer",
          "description": "Nominal Rupiah top-up (default: 20000)"
        }
      }
    }
  },
  {
    "name": "schedule_push_notification",
    "description": "Jadwalkan pengiriman push notifikasi pada waktu tertentu (scheduled_for ISO-8601) atau berulang otomatis (once, daily, twice_daily, weekly), maupun batalkan jadwal yang belum dikirim (cancel_campaign_id).",
    "inputSchema": {
      "type": "object",
      "properties": {
        "app_id": {
          "type": "string",
          "description": "App ID tujuan (misal: app_xxxx)"
        },
        "title": {
          "type": "string",
          "description": "Judul pesan notifikasi"
        },
        "body": {
          "type": "string",
          "description": "Isi pesan notifikasi"
        },
        "url": {
          "type": "string",
          "description": "URL tujuan saat notifikasi diketuk"
        },
        "scheduled_for": {
          "type": "string",
          "description": "Waktu kirim format ISO-8601 (misal: 2026-10-17T06:00:00Z)"
        },
        "recurrence_rule": {
          "type": "string",
          "description": "Aturan perulangan: once, daily, twice_daily, weekly, monthly, every_30m, every_3h, every_6h, atau ekspresi cron kustom (misal: 0 5,12,15,18,19 * * *)"
        },
        "cancel_campaign_id": {
          "type": "string",
          "description": "Isi jika ingin membatalkan/menghapus jadwal kampanye (cmp_sch_xxxx)"
        }
      }
    }
  },
  {
    "name": "get_campaign_analytics",
    "description": "Lihat laporan analitik riwayat pengiriman kampanye (jumlah terkirim, jumlah klik, rasio klik CTR %, kredit terpakai) beserta daftar jadwal antrean aktif.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "app_id": {
          "type": "string",
          "description": "Opsional: filter untuk App ID tertentu"
        },
        "limit": {
          "type": "integer",
          "description": "Jumlah riwayat kampanye terakhir yang ditampilkan (default: 10)"
        }
      }
    }
  },
  {
    "name": "list_subscribers",
    "description": "Lihat daftar pelanggan/perangkat aktif beserta ringkasan jumlah per platform (Web Browser, Android APK FCM, iOS APNs).",
    "inputSchema": {
      "type": "object",
      "properties": {
        "app_id": {
          "type": "string",
          "description": "Opsional: filter untuk App ID tertentu"
        },
        "limit": {
          "type": "integer",
          "description": "Jumlah baris pelanggan terbaru yang ditampilkan (default: 15)"
        }
      }
    }
  },
  {
    "name": "check_billing_and_qris_status",
    "description": "Cek status pembayaran tagihan QRIS (PENDING/PAID), riwayat mutasi saldo kredit, dan link faktur pembayaran resmi.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "order_id": {
          "type": "string",
          "description": "Opsional: ID tagihan QRIS tertentu yang ingin dicek (misal: ord_xxxx)"
        }
      }
    }
  },
  {
    "name": "configure_mobile_credentials",
    "description": "Simpan kredensial aplikasi HP Native: isi JSON Firebase Service Account untuk Android APK (FCM HTTP v1) atau kunci Apple APNs (.p8, Key ID, Team ID, Bundle ID) untuk iOS Native.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "app_id": {
          "type": "string",
          "description": "App ID yang ingin dikonfigurasi"
        },
        "fcm_service_account_json": {
          "type": "string",
          "description": "Isi teks file service-account.json Firebase untuk Android APK"
        },
        "apns_key_id": {
          "type": "string",
          "description": "Apple APNs Key ID (10 karakter)"
        },
        "apns_team_id": {
          "type": "string",
          "description": "Apple Developer Team ID (10 karakter)"
        },
        "apns_bundle_id": {
          "type": "string",
          "description": "iOS App Bundle ID (misal: id.perusahaan.app)"
        },
        "apns_p8_key": {
          "type": "string",
          "description": "Isi teks file AuthKey_XXXX.p8 dari Apple Developer"
        }
      },
      "required": [
        "app_id"
      ]
    }
  },
  {
    "name": "configure_inapp_banner",
    "description": "Atur dan tayangkan In-App Popup & Banner (Modal Tengah, Top Sticky Bar, atau Bottom Slide-in) beserta pemicu/trigger kustom (immediate, delay_5s, delay_10s, scroll_50, scroll_80, atau event:nama_event) untuk Web maupun Android/iOS Native.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "app_id": {
          "type": "string",
          "description": "App ID yang ingin diatur"
        },
        "inapp_enabled": {
          "type": "boolean",
          "description": "True untuk mengaktifkan banner di website/aplikasi"
        },
        "inapp_style": {
          "type": "string",
          "description": "Gaya tampilan: modal, top_bar, atau bottom_slide"
        },
        "inapp_trigger": {
          "type": "string",
          "description": "Pemicu muncul: immediate, delay_5s, delay_10s, scroll_50, scroll_80, atau event:nama_event (misal: event:add_to_cart, event:payment_success)"
        },
        "inapp_title": {
          "type": "string",
          "description": "Judul pengumuman/promo"
        },
        "inapp_body": {
          "type": "string",
          "description": "Isi pesan singkat"
        },
        "inapp_cta_text": {
          "type": "string",
          "description": "Teks tombol aksi (CTA)"
        },
        "inapp_cta_url": {
          "type": "string",
          "description": "URL tujuan saat tombol diklik"
        },
        "inapp_accent": {
          "type": "string",
          "description": "Kode warna HEX tombol (misal: #0058BE, #047857, #E11D48)"
        },
        "inapp_freq": {
          "type": "string",
          "description": "Frekuensi tampil: once_per_session, once_per_day, always, cooldown_3h, cooldown_12h, once_per_week"
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
    "description": "Atur otomatisasi Auto-Push RSS / Sitemap / Atom Feed (atau picu pengecekan & pengiriman langsung sekarang via dispatch_now=true) agar konten baru otomatis dikirim sebagai Push Notification.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "app_id": {
          "type": "string",
          "description": "App ID tujuan"
        },
        "rss_enabled": {
          "type": "boolean",
          "description": "True untuk mengaktifkan pemantau RSS otomatis"
        },
        "rss_feed_url": {
          "type": "string",
          "description": "URL RSS/Atom/Sitemap website (misal: https://domain.com/rss.xml)"
        },
        "rss_interval": {
          "type": "string",
          "description": "Interval cek: 5m, 15m, 30m, 1h, 3h, atau daily_digest"
        },
        "rss_prefix": {
          "type": "string",
          "description": "Awalan judul notifikasi (misal: Artikel Baru:)"
        },
        "dispatch_now": {
          "type": "boolean",
          "description": "Set true jika ingin langsung menarik item RSS terbaru dan menembak Push Notification detik ini juga"
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
    version: "2.1.0",
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
    "User-Agent": "PushNotif-MCP-Server/2.1.0 (+https://github.com/AarsyDesign/pushnotif-mcp)",
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
