# AI 行程助手設定

目前網站的 AI 行程助手已經改成「GitHub Pages 前端 + Cloudflare Worker + OpenAI API」架構。

## 需要設定的 GitHub Secrets

到 GitHub Repository → Settings → Secrets and variables → Actions → New repository secret，新增：

- `OPENAI_API_KEY`：OpenAI API Key
- `CLOUDFLARE_API_TOKEN`：Cloudflare Workers 部署用 API Token
- `CLOUDFLARE_ACCOUNT_ID`：Cloudflare Account ID

不要把 OpenAI API Key 寫進 `index.html` 或其他公開程式碼。

## 部署 AI Worker

設定完三個 Secrets 後：

1. GitHub → Actions
2. 選 `Deploy Okinawa AI Worker`
3. 按 `Run workflow`
4. 等待部署完成
5. Cloudflare Worker 會使用名稱 `okinawa-ai-itinerary`

網站上的「AI 連線設定」可以貼上 Worker 的 `workers.dev` 網址。

## AI 功能

- AI 新增景點
- AI 重新編排行程
- 讀取目前旅程與既有行程
- 產生時間、停留時間、交通方向與提醒
- 可直接加入 Day 1～Day 4 行程
- Google Maps 仍以連結方式開啟，不需要把 Google API Key 放進前端

## 安全性

OpenAI API Key 只放在 Cloudflare Worker Secret，不放 GitHub Pages 前端。
