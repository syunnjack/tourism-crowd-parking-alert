# Tourism Crowd Parking Alert

観光スポット混雑・駐車場空き通知

## Repository

Recommended repository name: `tourism-crowd-parking-alert`

## Domain candidates

Confirmed domain: `tourismparking.jp`

Other candidates:

- `tourismparking.jp`
- `spotcrowd.jp`
- `parkingalert.jp`
- `kankowatch.jp`

## Concept

観光前に、混雑状況や駐車場の空き、近くの飲食店やチケット情報をまとめて確認できるサービスです。

## Technical Selection

- Frontend: Vite + React 19
- Styling: Plain CSS
- Initial data: Static alert seed records in `src/App.jsx`
- Local state: localStorage for MVP saved alerts and UGC requests
- Notification integrations: LINE Messaging API, X API, transactional email provider, Slack Incoming Webhooks
- Future data layer: Supabase or Cloudflare D1
- SEO/AIO/LLMO: structured data, answer block, FAQ, sitemap, robots and `llms.txt`

## Revenue Paths

- 駐車場送客
- 観光予約
- 飲食送客
- チケット affiliate
- 地域広告

## Commands

```bash
npm install
npm run dev
npm run lint
npm run build
```

## GitHub Pages Deploy

- Workflow file: `.github/workflows/deploy-pages.yml`
- Trigger: push to `main` or `master`
- Output: `dist` directory

If GitHub Pages is not enabled yet:

1. Open repository Settings > Pages
2. Set Build and deployment source to GitHub Actions
3. Push to `main` or run the workflow manually
