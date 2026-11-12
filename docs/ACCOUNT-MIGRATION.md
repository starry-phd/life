# Life Cloudflare 帳戶遷移

使用者於 2026-11-12 更正：唯一可開發及部署帳戶為 starry.phd@gmail.com，禁止在 yukidu@gmail.com 開發任何 App。

## 已完成（2026-11-12）
- 已取得建立兩個 Worker、兩個 D1、兩個 KV、相關用量費用、切換網域及停用舊端點的明確核准。
- API 確認目標帳戶名稱為 starry.phd@gmail.com。
- 新 Worker：life-api-staging、life-api。
- 新 D1：life-knowledge-staging、life-knowledge；正式資料庫 305/305 段逐字相同，共14,956字。
- 新 KV：life-settings-staging、life-settings；來源兩套 KV 皆無設定資料。
- life.starry.phd 已直接綁定此帳戶的 life-api，不再跨帳戶轉發。
- 新 staging 的命盤、搜尋/分類、刷新、上一頁/下一頁及手機版測試通過。
- 切換後正式匿名 SSO 往返與命盤測試通過；19/19 張原圖 SHA-256 完全一致。
- 舊 yukidu@gmail.com 的 life-api、life-api-staging：workers.dev 與 preview 端點皆停用，AI_ENABLED=false。
- 舊 life-domain 已解除正式網域、停用公開端點；保留程式但不再服務。
- 舊 D1、KV 與 Worker 保留備份，未刪除；既有 life-starry 未修改。
- 全域及專案 AGENTS.md 已寫入永久規則；部署工具會先驗證 account.name，錯誤或無法驗證一律阻擋。

## 尚需設定
新付費帳戶的 life-api 尚無 STARRY_BATTERY_KEY。正式 AI_ENABLED=true（已有用量授權），但缺少服務金鑰時不會預留電池或執行 AI。請只在新帳戶的 Workers Secret 設定，不要再於舊帳戶設定或部署。
