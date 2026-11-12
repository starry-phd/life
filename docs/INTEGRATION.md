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
2. Metered AI usage was approved by the owner in this session; production `AI_ENABLED=true`; model @cf/meta/llama-3.3-70b-instruct-fp8-fast.
3. Authenticated acceptance: Apple/Google relay, cross-App SSO, Passkey registration and removal, owner page, consent and Battery charge/release with a test member.
4. Native release needs development builds and device testing. No Store submission is authorized by this project.
5. Android Passkey fingerprints: Google Play Console > Setup > App integrity > App signing key certificate SHA-256 (not upload key). EAS internal build: `eas credentials -p android`, inspect the actual build signing certificate; local APK: `apksigner verify --print-certs app.apk`. Register each actual signing certificate in central Admin Lite. Until then Android native Passkey is not claimed to work.

## 完整索引資料庫

`npm run index:content` 從原文產生分類索引與 D1 SQL migration。305 區塊、14,956 字、19 圖，原文逐段 SHA-256。D1 保存全部文字、標題、原圖來源、段落順序、原文網址；`block_categories` 對應八方向，另建連線/主題索引與 FTS5 trigram 全文索引（繁體中文）。短關鍵詞在前端以逐字比對補足 trigram 的三字限制。

AI 從 D1 讀取完整原文，另讀取所選方向的段落索引；資料庫筆數不完整時不執行或扣款。前端知識庫可依方向及文字搜尋，原文可用 `/library#source-<id>` 精確引用。

## 原生 App

`native/` 使用 Expo development build，主功能是 React Native 畫面，圖表是原生 SVG。Apple/Google 使用瀏覽器中繼，Passkey 使用 react-native-passkey。iOS Keychain entitlement 的第一個群組固定為 `$(AppIdentifierPrefix)phd.starry.shared`，Keychain service/key 固定 `starry.sso`；App 不填 Apple Team ID。Android 共用儲存依指令略過。

已驗證型別與 iOS/Android Metro/Hermes 打包；尚未登入真實會員、實機 Passkey、跨 App Keychain、帳號刪除或商店內測驗收，不能視為已可上架。

## 部署

前端與19張圖以 Worker binary modules 封裝，因連接工具無法替靜態資產上傳傳遞獨立 upload JWT。`scripts/deploy.mjs` 可重現此部署；使用環境變數 `CLOUDFLARE_ACCOUNT_ID`、`CLOUDFLARE_API_TOKEN`、`KNOWLEDGE_DATABASE_ID`、`SETTINGS_NAMESPACE_ID`，不存入 Git。先建置及部署 staging，驗證後才部署 production。網域所在帳號的 `life-domain` 僅轉發，App、D1 與 KV 都在指定的 yukidu 帳號；既有 life-starry 未修改。

正式全文比對：305/305段文字相同，差異0；D1 FTS搜尋「安全感」可命中6筆。
