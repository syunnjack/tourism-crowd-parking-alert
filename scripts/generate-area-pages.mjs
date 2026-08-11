import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(process.cwd())
const appFile = resolve(root, 'src', 'App.jsx')
const publicDir = resolve(root, 'public')
const areasDir = resolve(publicDir, 'areas')
const sitemapFile = resolve(publicDir, 'sitemap.xml')

const appSource = readFileSync(appFile, 'utf8')
const locationMatch = appSource.match(/const locationSeeds = \[(.*?)\]\s*const categoryBlueprints = \[/s)
const blueprintMatch = appSource.match(/const categoryBlueprints = \[(.*?)\]\s*const alerts =/s)

if (!locationMatch || !blueprintMatch) {
  throw new Error('locationSeeds または categoryBlueprints を App.jsx から抽出できませんでした。')
}

const locationSeeds = Function(`return [${locationMatch[1]}]`)()
const categoryBlueprints = Function(`return [${blueprintMatch[1]}]`)()

const alerts = locationSeeds.flatMap((location, locationIndex) => (
  categoryBlueprints.map((blueprint, blueprintIndex) => {
    const score = Math.max(70, blueprint.baseScore - ((locationIndex * 2 + blueprintIndex) % 17))
    const waitMin = 8 + ((locationIndex + blueprintIndex * 3) % 34)
    const parkingVacancy = 6 + ((locationIndex * 3 + blueprintIndex * 5) % 62)
    const updateHour = String(8 + ((locationIndex + blueprintIndex) % 11)).padStart(2, '0')
    const updateMin = String((locationIndex * 7 + blueprintIndex * 13) % 60).padStart(2, '0')
    return {
      id: `tourism-crowd-parking-alert-${locationIndex + 1}-${blueprint.key}`,
      pref: location.pref,
      areaName: location.area,
      spot: location.spot,
      station: location.station,
      parking: location.parking,
      title: `${location.spot} ${blueprint.label}`,
      category: blueprint.category,
      score,
      summary: `${location.spot}（最寄: ${location.station}）周辺の${blueprint.category}通知。${location.parking}の空きと、観光導線の変化を条件一致で通知します。`,
      channels: blueprint.channels,
      revenue: blueprint.revenue,
      source: blueprint.source,
      waitMin,
      parkingVacancy,
      updatedAt: `2026-08-11 ${updateHour}:${updateMin}`,
    }
  })
))

const escapeHtml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')

const routePath = (location) => `/areas/${location.pref}/${location.area}/${location.spot}/`
const areaPages = locationSeeds.map((location) => ({
  ...location,
  path: routePath(location),
  alerts: alerts.filter((item) => item.spot === location.spot && item.pref === location.pref),
}))

rmSync(areasDir, { recursive: true, force: true })

for (const area of areaPages) {
  const outputDir = resolve(publicDir, '.' + area.path)
  mkdirSync(outputDir, { recursive: true })

  const cards = area.alerts.map((alert) => `
    <article class="alert-card">
      <div class="card-top"><span>${escapeHtml(alert.category)}</span><strong>${alert.score}</strong></div>
      <h2>${escapeHtml(alert.title)}</h2>
      <p>${escapeHtml(alert.summary)}</p>
      <ul>
        <li>最寄駅: ${escapeHtml(alert.station)}</li>
        <li>駐車場: ${escapeHtml(alert.parking)}</li>
        <li>推定待機: ${alert.waitMin}分</li>
        <li>空き台数目安: ${alert.parkingVacancy}台</li>
        <li>参照: ${escapeHtml(alert.source)}</li>
      </ul>
      <p class="meta">通知: ${escapeHtml(alert.channels.join(' / '))} / 収益導線: ${escapeHtml(alert.revenue)}</p>
    </article>`).join('')

  const html = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(area.pref)} ${escapeHtml(area.spot)} の混雑・駐車場通知 | tourismparking.jp</title>
    <meta name="description" content="${escapeHtml(area.pref)} ${escapeHtml(area.spot)} 周辺の混雑、駐車場空き、周辺飲食、チケット通知をまとめた個別ページです。" />
    <style>
      :root { color: #1f2320; background: #f4f1ea; }
      * { box-sizing: border-box; }
      body { margin: 0; font-family: Inter, "Yu Gothic", Meiryo, sans-serif; background: #f4f1ea; color: #1f2320; }
      main { width: min(1080px, calc(100% - 32px)); margin: 0 auto; padding: 28px 0 52px; }
      .hero, .alert-card, .summary { border: 1px solid rgba(31, 35, 32, .13); border-radius: 10px; background: #fff; box-shadow: 0 18px 44px rgba(42, 36, 28, .08); }
      .hero { padding: 24px; margin-bottom: 20px; }
      .eyebrow { margin: 0; color: #79502c; font-size: 13px; font-weight: 800; text-transform: uppercase; }
      h1 { margin: 8px 0 14px; font-size: clamp(34px, 5vw, 56px); line-height: 1.05; }
      p, li { line-height: 1.75; color: #5c5a52; }
      .summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; padding: 18px; margin-bottom: 18px; }
      .summary article { padding: 8px; }
      .summary strong { display: block; font-size: 28px; color: #1f2320; }
      .alert-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
      .alert-card { padding: 18px; }
      .card-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; color: #716b61; font-size: 13px; }
      .card-top strong { display: grid; place-items: center; min-width: 46px; height: 46px; border-radius: 50%; background: #1f2320; color: #fff; }
      .meta { border-left: 4px solid #79502c; padding-left: 10px; }
      a { color: #1f2320; }
      .home-link { display: inline-flex; margin-top: 12px; font-weight: 700; }
      @media (max-width: 860px) { .summary, .alert-grid { grid-template-columns: 1fr; } }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <p class="eyebrow">個別エリア通知ページ</p>
        <h1>${escapeHtml(area.pref)} ${escapeHtml(area.spot)}</h1>
        <p>${escapeHtml(area.area)} 周辺の混雑、駐車場、飲食、チケット通知をまとめています。現地導線の比較、待機時間の短い枠、周辺送客の判断材料として使えます。</p>
        <p>最寄駅: ${escapeHtml(area.station)} / 駐車場: ${escapeHtml(area.parking)}</p>
        <a class="home-link" href="../../../../">一覧へ戻る</a>
      </section>
      <section class="summary">
        <article><span>Alert</span><strong>${area.alerts.length}</strong></article>
        <article><span>最高注目度</span><strong>${Math.max(...area.alerts.map((item) => item.score))}</strong></article>
        <article><span>最短待機</span><strong>${Math.min(...area.alerts.map((item) => item.waitMin))}分</strong></article>
        <article><span>最大空き台数</span><strong>${Math.max(...area.alerts.map((item) => item.parkingVacancy))}台</strong></article>
      </section>
      <section class="alert-grid">${cards}
      </section>
    </main>
  </body>
</html>`

  writeFileSync(resolve(outputDir, 'index.html'), html)
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://tourismparking.jp/</loc><priority>1.0</priority></url>
${areaPages.map((area) => `  <url><loc>https://tourismparking.jp${encodeURI(area.path)}</loc><priority>0.8</priority></url>`).join('\n')}
</urlset>
`

writeFileSync(sitemapFile, sitemap)
console.log(`Generated ${areaPages.length} area pages and updated sitemap.`)