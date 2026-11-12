# Life Cloudflare 帳戶遷移

使用者於 2026-11-12 更正：唯一可開發及部署帳戶為 starry.phd@gmail.com，禁止在 yukidu@gmail.com 開發任何 App。

## 已查核
- 目標帳戶名稱經 API 確認為 starry.phd@gmail.com。
- 目標已有 life-domain 與 life.starry.phd；尚無 Life D1、KV、life-api 或 life-api-staging。
- 來源正式 D1：305 個原文區塊、14,956 字；正式 KV 無設定資料。
- 來源 life-api 尚無 STARRY_BATTERY_KEY；AI 開關已開，但沒有金鑰不會執行。
- 全域及專案 AGENTS.md 已寫入永久規則；部署腳本在任何寫入前驗證帳戶名稱。

## 待核准的具體遷移
在 starry.phd@gmail.com 建立：
- D1：life-knowledge-staging、life-knowledge
- KV：life-settings-staging、life-settings
- Workers：life-api-staging、life-api（含 Workers AI binding）

先匯入全文、部署 staging，逐段與逐圖驗證；CI 全綠後部署 production；將 life.starry.phd 從同帳戶的 life-domain 改為直接綁定 life-api。確認匿名 SSO、命盤、原文搜尋與 API 狀態後，停用舊帳戶 Life 的公開 workers.dev 端點與 AI 開關。保留舊資料及 Worker，不刪除任何既有資源。

## 阻擋原因
自動核准審查拒絕建立 life-knowledge-staging，理由：建立持久 D1 資料庫可能產生費用，使用者原規則要求個別核准。上述建立與遷移可能按目標付費帳戶用量計費，尚未執行；網站目前仍由舊部署服務。
