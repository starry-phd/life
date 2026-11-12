# Life 專案永久規則

- Cloudflare 唯一允許的開發、建立及部署帳戶：**starry.phd@gmail.com**（付費帳戶）。
- **禁止在 yukidu@gmail.com 開發、建立或部署任何 App。** 舊資源僅可依授權讀取、遷移、停用；刪除仍需個別核准。
- 每次雲端寫入前，使用 API 確認 account.name，不能依登入信箱或預設帳戶推測。
- 使用 scripts/deploy.mjs 部署；此工具會先驗證帳戶名稱，錯誤帳戶一律拒絕。
- Repo：starry-phd/life；正式網域：life.starry.phd；Worker：life-api、life-api-staging。
- 不提交 token、Secret、.env 或 Cloudflare 帳戶 ID。先 staging 驗證，再 production。main 只經 PR、全數 CI 通過才合併。
- Starry ID 程式、設定與資料庫只讀；只使用官方 SDK 串接。後續更新只補差異。
