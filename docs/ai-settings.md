# Life AI 設定

超級管理員在 `/admin` 的「AI 設定」選擇模型、編輯給 AI 的備註並儲存。手機原生版也提供同一組設定；既有安裝版本需要更新 App。前後端都以中央會員 `staff_role === owner` 驗證，不依 Email 判斷。

`GET/POST /api/admin/ai` 將模型與備註作為同一筆 `ai-settings` JSON 存入既有 SETTINGS KV，預設沿用 Llama 3.3。備註上限 8000 字；清空表示沒有額外寫作要求。「載入預設備註」只填入表單，儲存才生效。KV 跨地區更新可能需要約一分鐘，正在執行的解讀保留開始時的設定。

原文依據、命盤規則及健康等基本限制固定保留；自訂備註可調整文章結構、語氣、重點與合作建議。完整 305 段原文與 19 張圖不變。模型仍產生內部段落標記供既有來源 ID 檢查，確認後清除所有 `[原文段落…]` 再回傳文章；前端不再加回段落編號連結。來源 ID 檢查不是逐句事實驗證。

## 模型與計費

2026-11-12 按長文整理、多語解讀、指令遵循及用量成本選出以下五個 Workers AI 選項；這是 Life 用途的選擇，不宣稱客觀榜單排名。排除已退役或近期公告退役的模型。

- [Llama 3.3 70B](https://developers.cloudflare.com/workers-ai/models/llama-3.3-70b-instruct-fp8-fast/)：原本預設，敘事解讀。
- [GLM 4.7 Flash](https://developers.cloudflare.com/workers-ai/models/glm-4.7-flash/)：多語長文，較低用量成本。
- [Gemma 4 26B](https://developers.cloudflare.com/workers-ai/models/gemma-4-26b-a4b-it/)：長篇摘要與資訊整理。
- [Mistral Small 3.1 24B](https://developers.cloudflare.com/workers-ai/models/mistral-small-3.1-24b-instruct/)：條理化建議。
- [Llama 4 Scout](https://developers.cloudflare.com/workers-ai/models/llama-4-scout-17b-16e-instruct/)：跨段落整合。

GLM 與 Gemma 呼叫使用 `chat_template_kwargs.enable_thinking=false`，避免推理耗盡輸出長度；只取最終文章，不顯示 reasoning 欄位。兼容 Workers AI 的 response 與 choices/message/content 兩種回傳格式。

依 [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)，同帳戶每天共用 10,000 Neurons 免費額度，超額按實際用量收費。五個模型不是五份免費額度。延續 AI binding 的 Workers AI 帳戶計費，不新增 AI Gateway 預付點數、外部供應商或金鑰。會員 Battery 預留、成功扣款及失敗釋放流程不變。
