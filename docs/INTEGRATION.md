# Starry ID integration — 2026-11-09.6

Central remains read-only. No central config, DB, identities or membership code is copied or modified.

- Official frontend/backend SDK files are vendored unchanged from starry-phd/id/main.
- OpenAPI types generated with `npm run generate:api`; CI rejects drift.
- Central status/config checked on startup and foreground, notices are plain text.
- Browser relay, Passkey, web SSO, refresh and concurrency use official SDK.
- Settings order/labels from `starrySettingsBlocks`; backend verifies owner for every admin request.
- JWT: ES256, central production issuer, starry audience, exp/sub/app_id required, app_id=life. JWKS cached 10 minutes and refreshed for an unknown kid.
- Battery: reserve before AI, commit before response, release on error. 409/503 fail closed. No client-controlled charge amount.
- AI disabled until backend `STARRY_BATTERY_KEY` is configured and `AI_ENABLED=true` is explicitly enabled. No secrets in Git.
- Central member id is user_id; no local member database. Birthday remains in per-tab session storage, sent to own API for server calculation; the AI only sees derived numbers, mode and direction.
- All content in `content/connection-effect.json` is source-preserving and traceable by block id. All 19 original diagrams are bundled in public/diagrams.
- Source calculation/chart copied from hglobal1985/id commit 66d75c1b02beeeac8f716d3d82fd1dc54c4cdb5c, with original files unchanged. Article mode is an additional adapter, including zodiac expansion and optional blood type. Original mode stays the default.

## Release prerequisites

1. Configure service key in Worker Secrets for each environment, never in an Issue, PR or chat.
2. Approve metered AI usage before changing `AI_ENABLED` to true; model @cf/meta/llama-3.3-70b-instruct-fp8-fast.
3. Authenticated acceptance: Apple/Google relay, cross-App SSO, Passkey registration and removal, owner page, consent and Battery charge/release with a test member.
4. Native release needs development builds and device testing. No Store submission is authorized by this project.
5. Android Passkey fingerprints: Google Play Console > Setup > App integrity > App signing key certificate SHA-256 (not upload key). EAS internal build: `eas credentials -p android`, inspect the actual build signing certificate; local APK: `apksigner verify --print-certs app.apk`. Register each actual signing certificate in central Admin Lite. Until then Android native Passkey is not claimed to work.

## 完整索引資料庫

`npm run index:content` 從原文產生分類索引與 D1 SQL migration。305 區塊、14,956 字、19 圖，原文逐段 SHA-256。D1 保存全部文字、標題、原圖來源、段落順序、原文網址；`block_categories` 對應八方向，另建連線/主題索引與 FTS5 trigram 全文索引（繁體中文）。短關鍵詞在前端以逐字比對補足 trigram 的三字限制。

AI 從 D1 讀取完整原文，另讀取所選方向的段落索引；資料庫筆數不完整時不執行或扣款。前端知識庫可依方向及文字搜尋，原文可用 `/library#source-<id>` 精確引用。
