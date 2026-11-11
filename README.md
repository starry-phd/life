# Life · 生命靈數

獨立生日命盤、全文知識庫與八大方向 AI 解讀。網域 `life.starry.phd`，中央會員 `id.starry.phd`，後端 `life-api`。

## 本機

Node 22+，`npm ci`、`npm run dev`。`npm run ci` 執行型別、算法/電池邊界測試與正式建置。

## 內容與算法

- `src/profile/astro.ts`、`src/web/chart.ts` 原樣抽出 hglobal1985/id 的計算與圖表。
- `src/numerology.ts` 增加真實日期驗證、網站規則模式、18 種連線依據。
- `content/connection-effect.json` 收錄原頁全部 305 個內容區塊、19 張圖。使用者已確認擁有網站及使用權。
- 前端不傳姓名、信箱或完整生日給 AI。結果引用原文段落，健康不診斷、財運不保證、小人以溝通界線處理。

## 串接與發布

採用 **2026-11-09.6**。細節與尚需驗收項目見 [INTEGRATION](docs/INTEGRATION.md)。main 僅由 PR 合併，CI 與 gitleaks 必須全綠。中央 ID 程式與資料一律不修改。

`STARRY_BATTERY_KEY` 只能存在 Workers Secrets。AI 未設定時明確顯示未啟用，絕不繞過電池直接呼叫 AI。
