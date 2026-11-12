# 驗收與差異清單

採用串接指令 2026-11-09.6。此為全新 App，沒有重做或修改中央會員系統。

| 項目 | 實作狀態與驗證 |
|---|---|
| 1. Battery 錯誤 | 已補上；預留失敗不得執行 AI、失敗釋放，測試通過；真實扣款待服務金鑰 |
| 2. 量子電池 | 已補上；餘額直接取中央，固定 SDK 顯示，不自行乘倍數 |
| 3. 官方 SDK | 已符合；前後端單檔原樣使用，OpenAPI 產生型別 |
| 4. 啟動檢查 | 已補上；正式網頁與原生啟動/前景讀中央，維護/停用/最低版本/純文字公告；測試版僅匿名預覽 |
| 5. Token/JWKS | 已補上；ES256/iss/aud/exp/sub/app_id，快取並於未知 kid 重抓 |
| 6. 刪除帳號 | 已補上；即時永久刪除、無撤回期、不自動取消訂閱的確認文案；未操作真實帳號刪除 |
| 7. 條款 | 已補上；consent_required 顯示同意流程，使用官方 acceptConsent |
| 8. Passkey | 已補上網頁與原生登入/新增/列表/刪除；原生取消與重複憑證錯誤映射有測試。Android 簽章未登記，不宣稱可用 |
| 9. 設定/網址/客服 | 已補上；官方三區塊、原生 App 內會員視窗、網頁 History API、固定客服入口；瀏覽器路由/刷新/返回測試通過 |
| 10. Service Binding | 選用項目，未使用；保持官方 HTTPS 呼叫 |
| 11. Admin | 已補上；/admin、owner 入口與每個後端 API 驗證、最新串接指令卡片 |
| 12. 更新方式 | 已符合；中央只讀；後續只補差異，main 受 PR/verify/gitleaks 保護 |

## 已實測

- 正式網址 https://life.starry.phd，匿名 web SSO 往返成功，回到原路徑。
- 305/305 原文段落逐字比對相同，差異 0；19/19 原圖二進位 SHA-256 相同。
- D1 305 區塊、14,956 字，八方向分類、連線/主題索引、FTS5 全文索引。
- 桌面及 390px 手機視窗：命盤、重新整理、搜尋/分類、上一頁/下一頁、無橫向溢出。
- 16 項單元/安全邊界測試；型別與正式打包；gitleaks。
- 原生 iOS/Android 型別與 Metro/Hermes bundle 匯出。

## 尚未可宣稱通過

- 有登入身分的 Apple/Google/Passkey、跨 App 真實 SSO、實機 Keychain、owner 操作、真實 Battery/AI 端到端。
- 未建置簽署 APK/IPA、未提交或發布 App Store/Google Play。
- AI 用量已獲業主授權、production AI_ENABLED 已啟用；服務 Secret 尚未提供，因此目前不會執行 AI。

## 業主確實需要處理

Cloudflare → starry.phd@gmail.com → Workers & Pages → life-api → Settings → Variables and Secrets → Add → Secret，名稱 `STARRY_BATTERY_KEY`，填入中央為 life 提供的服務金鑰。不要貼入聊天、GitHub 或前端。測試環境要驗收扣款時，對 life-api-staging 另設定 Secret，並於驗收時啟用 AI。

原生 Android 上架/內測前，於中央 Admin Lite 登記對應實際安裝 APK 的 SHA-256：Play Console 的 App signing key certificate（不是 Upload key）；EAS 內測透過 eas credentials -p android；本機 APK 透過 apksigner verify --print-certs。不同簽章各登記一組。
