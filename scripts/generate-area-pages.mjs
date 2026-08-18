import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(process.cwd())
const appFile = resolve(root, 'src', 'App.jsx')
const publicDir = resolve(root, 'public')
const areasDir = resolve(publicDir, 'areas')
const sitemapsDir = resolve(publicDir, 'sitemaps')
const sitemapFile = resolve(publicDir, 'sitemap.xml')
const coreSitemapFile = resolve(sitemapsDir, 'core.xml')
const areasSitemapFile = resolve(sitemapsDir, 'areas.xml')
const robotsFile = resolve(publicDir, 'robots.txt')

const appSource = readFileSync(appFile, 'utf8')
const locationMatch = appSource.match(/const locationSeeds = \[(.*?)\]\s*const categoryBlueprints = \[/s)
const blueprintMatch = appSource.match(/const categoryBlueprints = \[(.*?)\]\s*const alerts =/s)

if (!locationMatch || !blueprintMatch) {
  throw new Error('locationSeeds または categoryBlueprints を App.jsx から抽出できませんでした。')
}

const locationSeeds = Function(`return [${locationMatch[1]}]`)()
const categoryBlueprints = Function(`return [${blueprintMatch[1]}]`)()

const regionMap = {
  '北海道': '北海道',
  '青森県': '東北',
  '岩手県': '東北',
  '宮城県': '東北',
  '秋田県': '東北',
  '山形県': '東北',
  '福島県': '東北',
  '茨城県': '関東',
  '栃木県': '関東',
  '群馬県': '関東',
  '埼玉県': '関東',
  '千葉県': '関東',
  '東京都': '関東',
  '神奈川県': '関東',
  '山梨県': '中部',
  '長野県': '中部',
  '富山県': '中部',
  '石川県': '中部',
  '福井県': '中部',
  '岐阜県': '中部',
  '静岡県': '中部',
  '愛知県': '中部',
  '三重県': '中部',
  '滋賀県': '近畿',
  '京都府': '近畿',
  '大阪府': '近畿',
  '兵庫県': '近畿',
  '奈良県': '近畿',
  '和歌山県': '近畿',
  '岡山県': '中国',
  '広島県': '中国',
  '山口県': '中国',
  '鳥取県': '中国',
  '島根県': '中国',
  '徳島県': '四国',
  '香川県': '四国',
  '愛媛県': '四国',
  '高知県': '四国',
  '福岡県': '九州',
  '佐賀県': '九州',
  '長崎県': '九州',
  '熊本県': '九州',
  '大分県': '九州',
  '宮崎県': '九州',
  '鹿児島県': '九州',
  '沖縄県': '沖縄',
}

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
      area: `${location.pref} ${location.area}`,
      spot: location.spot,
      station: location.station,
      parking: location.parking,
      title: `${location.spot} ${blueprint.label}`,
      category: blueprint.category,
      score,
      summary: `${location.spot}（最寄: ${location.station}）周辺の${blueprint.category}情報です。${location.parking}の空きや、立ち寄りやすい周辺情報の変化を条件に合わせて確認できます。`,
      channels: blueprint.channels,
      revenue: blueprint.revenue,
      source: blueprint.source,
      waitMin,
      parkingVacancy,
      updatedAt: `2026-08-11 ${updateHour}:${updateMin}`,
    }
  })
))

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')

const routePath = (location) => `/areas/${location.pref}/${location.area}/${location.spot}/`
const areaPages = locationSeeds.map((location) => ({
  ...location,
  path: routePath(location),
  region: regionMap[location.pref] ?? 'その他',
  alerts: alerts.filter((item) => item.spot === location.spot && item.pref === location.pref),
}))

const renderRouteList = (items) => items.length === 0
  ? '<p class="empty-note">関連エリアは準備中です。</p>'
  : `<div class="related-grid">${items.map((item) => `
      <a class="related-link" href="${encodeURI(`https://tourismparking.jp${item.path}`)}">
        <strong>${escapeHtml(item.pref)} ${escapeHtml(item.spot)}</strong>
        <span>${escapeHtml(item.area)} / ${escapeHtml(item.station)}</span>
      </a>`).join('')}
    </div>`

const renderRanking = (title, items, formatter) => `
  <section class="section-box">
    <h2>${title}</h2>
    <div class="ranking-grid">${items.map((item, index) => `
      <article>
        <h3>${index + 1}. ${escapeHtml(item.title)}</h3>
        <p>${formatter(item)}</p>
      </article>`).join('')}
    </div>
  </section>`

rmSync(areasDir, { recursive: true, force: true })
rmSync(sitemapsDir, { recursive: true, force: true })
mkdirSync(sitemapsDir, { recursive: true })

for (const area of areaPages) {
  const outputDir = resolve(publicDir, '.' + area.path)
  mkdirSync(outputDir, { recursive: true })

  const relatedSamePref = areaPages
    .filter((item) => item.pref === area.pref && item.spot !== area.spot)
    .slice(0, 4)

  const relatedSameRegion = areaPages
    .filter((item) => item.region === area.region && item.pref !== area.pref)
    .slice(0, 4)

  const nearbyTopScore = alerts
    .filter((item) => item.pref === area.pref && item.spot !== area.spot)
    .sort((left, right) => right.score - left.score || left.waitMin - right.waitMin)
    .slice(0, 5)

  const nearbyFastest = alerts
    .filter((item) => regionMap[item.pref] === area.region && item.spot !== area.spot)
    .sort((left, right) => left.waitMin - right.waitMin || right.score - left.score)
    .slice(0, 5)

  const faqItems = [
    {
      question: `${area.spot} の混雑通知は何分単位で更新されますか？`,
      answer: `${area.spot} 周辺は公開情報と現地投稿をもとに、最短15分単位で再計算する前提の通知設計です。`,
    },
    {
      question: `${area.spot} の駐車場通知は何が分かりますか？`,
      answer: `${area.parking} を中心に、推定待機時間、空き台数目安、周辺スポット情報の変化を一覧で確認できます。`,
    },
    {
      question: `${area.spot} ページでは何が見られますか？`,
      answer: `混雑状況、駐車場の空き、近くで立ち寄れる飲食店やチケット情報をまとめて確認できます。`,
    },
  ]

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Tourism Crowd Parking Alert', item: 'https://tourismparking.jp/' },
      { '@type': 'ListItem', position: 2, name: area.pref, item: `https://tourismparking.jp/areas/${area.pref}/` },
      { '@type': 'ListItem', position: 3, name: area.area, item: `https://tourismparking.jp/areas/${area.pref}/${area.area}/` },
      { '@type': 'ListItem', position: 4, name: area.spot, item: `https://tourismparking.jp${area.path}` },
    ],
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${area.pref} ${area.spot} の混雑・駐車場情報`,
    url: `https://tourismparking.jp${area.path}`,
    description: `${area.pref} ${area.spot} 周辺の混雑、駐車場、飲食、チケット情報をまとめた個別ページです。`,
    isPartOf: 'https://tourismparking.jp/',
  }

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
      <p class="meta">通知: ${escapeHtml(alert.channels.join(' / '))} / おすすめ情報: ${escapeHtml(alert.revenue)}</p>
    </article>`).join('')

  const faqHtml = faqItems.map((item) => `
        <article>
          <h3>${escapeHtml(item.question)}</h3>
          <p>${escapeHtml(item.answer)}</p>
        </article>`).join('')

  const saveIds = area.alerts.map((item) => item.id)
  const appUrl = `https://tourismparking.jp/?q=${encodeURIComponent(area.spot)}&pref=${encodeURIComponent(area.pref)}`
  // sitemap と同じ形（encodeURI）で書く。canonical と sitemap がずれると、
  // どちらを正規と見なすか検索エンジンが判断できなくなる。
  const pageUrl = encodeURI(`https://tourismparking.jp${area.path}`)

  const html = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(area.pref)} ${escapeHtml(area.spot)} の混雑・駐車場情報 | tourismparking.jp</title>
    <meta name="description" content="${escapeHtml(area.pref)} ${escapeHtml(area.spot)} 周辺の混雑、駐車場空き、周辺飲食、チケット情報をまとめた個別ページです。" />
    <link rel="canonical" href="${pageUrl}" />
    <meta property="og:title" content="${escapeHtml(area.pref)} ${escapeHtml(area.spot)} の混雑・駐車場情報" />
    <meta property="og:description" content="${escapeHtml(area.pref)} ${escapeHtml(area.spot)} 周辺の混雑、駐車場空き、周辺飲食、チケット情報をまとめた個別ページです。" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Tourism Crowd Parking Alert" />
    <meta property="og:locale" content="ja_JP" />
    <script type="application/ld+json">${JSON.stringify(collectionJsonLd)}</script>
    <script type="application/ld+json">${JSON.stringify(breadcrumbJsonLd)}</script>
    <script type="application/ld+json">${JSON.stringify(faqJsonLd)}</script>
    <style>
      :root { color: #1f2320; background: #f4f1ea; }
      * { box-sizing: border-box; }
      body { margin: 0; font-family: Inter, "Yu Gothic", Meiryo, sans-serif; background: #f4f1ea; color: #1f2320; }
      main { width: min(1080px, calc(100% - 32px)); margin: 0 auto; padding: 28px 0 52px; }
      .hero, .alert-card, .summary, .section-box { border: 1px solid rgba(31, 35, 32, .13); border-radius: 10px; background: #fff; box-shadow: 0 18px 44px rgba(42, 36, 28, .08); }
      .hero { padding: 24px; margin-bottom: 20px; }
      .cta-box { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
      .eyebrow { margin: 0; color: #79502c; font-size: 13px; font-weight: 800; text-transform: uppercase; }
      h1 { margin: 8px 0 14px; font-size: clamp(34px, 5vw, 56px); line-height: 1.05; }
      h2, h3 { margin-top: 0; }
      p, li { line-height: 1.75; color: #5c5a52; }
      .summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; padding: 18px; margin-bottom: 18px; }
      .summary article { padding: 8px; }
      .summary strong { display: block; font-size: 28px; color: #1f2320; }
      .alert-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
      .alert-card { padding: 18px; }
      .section-box { padding: 18px; margin-top: 18px; }
      .card-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; color: #716b61; font-size: 13px; }
      .card-top strong { display: grid; place-items: center; min-width: 46px; height: 46px; border-radius: 50%; background: #1f2320; color: #fff; }
      .meta { border-left: 4px solid #79502c; padding-left: 10px; }
      a { color: #1f2320; }
      .home-link { display: inline-flex; margin-top: 12px; font-weight: 700; }
      .cta-link, .save-button { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 10px 14px; border-radius: 8px; background: #1f2320; color: #fff; text-decoration: none; border: 0; cursor: pointer; font: inherit; font-weight: 800; }
      .related-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
      .related-link { display: grid; gap: 4px; padding: 14px; border-radius: 8px; background: #f4f1ea; text-decoration: none; }
      .related-link span { color: #716b61; font-size: 13px; }
      .ranking-grid, .faq-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
      .ranking-grid article, .faq-grid article { padding: 12px; border-radius: 8px; background: #f4f1ea; }
      .empty-note { margin: 0; }
      @media (max-width: 860px) { .summary, .alert-grid, .related-grid, .ranking-grid, .faq-grid { grid-template-columns: 1fr; } }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <p class="eyebrow">個別エリア情報ページ</p>
        <h1>${escapeHtml(area.pref)} ${escapeHtml(area.spot)}</h1>
        <p>${escapeHtml(area.area)} 周辺の混雑、駐車場、飲食、チケット情報をまとめています。出発前の比較や、待機時間の短いスポット探しに役立ちます。</p>
        <p>最寄駅: ${escapeHtml(area.station)} / 駐車場: ${escapeHtml(area.parking)}</p>
        <div class="cta-box">
          <a class="cta-link" href="${appUrl}">この条件で見る</a>
          <button class="save-button" type="button" data-save-ids='${JSON.stringify(saveIds)}'>このエリアを保存する</button>
        </div>
        <a class="home-link" href="/areas/">すべてのエリア一覧を見る</a>
        <a class="home-link" href="/">トップへ戻る</a>
      </section>
      <section class="summary">
        <article><span>掲載中の情報</span><strong>${area.alerts.length}</strong></article>
        <article><span>最高注目度</span><strong>${Math.max(...area.alerts.map((item) => item.score))}</strong></article>
        <article><span>最短待機</span><strong>${Math.min(...area.alerts.map((item) => item.waitMin))}分</strong></article>
        <article><span>最大空き台数</span><strong>${Math.max(...area.alerts.map((item) => item.parkingVacancy))}台</strong></article>
      </section>
      <section class="section-box">
        <h2>同じ都道府県の関連エリア</h2>
        ${renderRouteList(relatedSamePref)}
      </section>
      <section class="section-box">
        <h2>${escapeHtml(area.region)}エリアの関連スポット</h2>
        ${renderRouteList(relatedSameRegion)}
      </section>
      ${renderRanking('同県内の注目度ランキング', nearbyTopScore, (item) => `${escapeHtml(item.area)} / 注目度 ${item.score} / 待機 ${item.waitMin}分`)}
      ${renderRanking('同地域の待機時間ランキング', nearbyFastest, (item) => `${escapeHtml(item.area)} / 待機 ${item.waitMin}分 / 空き ${item.parkingVacancy}台`)}
      <section class="alert-grid">${cards}
      </section>
      <section class="section-box">
        <h2>FAQ</h2>
        <div class="faq-grid">${faqHtml}
        </div>
      </section>
    </main>
    <script>
      const button = document.querySelector('[data-save-ids]');
      if (button) {
        button.addEventListener('click', () => {
          const key = 'tourism-crowd-parking-alert.saved';
          const ids = JSON.parse(button.dataset.saveIds || '[]');
          const current = JSON.parse(localStorage.getItem(key) || '[]');
          const next = [...new Set([...current, ...ids])];
          localStorage.setItem(key, JSON.stringify(next));
          button.textContent = '保存済み';
          button.disabled = true;
        });
      }
    </script>
  </body>
</html>`

  writeFileSync(resolve(outputDir, 'index.html'), html)
}

// エリア一覧ページ。これまで78ページへの入口が無く、各ページの「一覧へ戻る」も
// トップ（JavaScriptで描画するアプリ）に飛ぶだけだった。検索エンジンにとっては
// 78ページが孤立している状態なので、静的な一覧を1枚作って入口にする。
const areasIndexUrl = 'https://tourismparking.jp/areas/'
const groupedByRegion = areaPages.reduce((acc, area) => {
  const region = area.region
  acc[region] = acc[region] ?? {}
  acc[region][area.pref] = acc[region][area.pref] ?? []
  acc[region][area.pref].push(area)
  return acc
}, {})

const areasIndexJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: '観光スポット別の混雑・駐車場情報 一覧',
  url: areasIndexUrl,
  description: `全国${areaPages.length}か所の観光スポットについて、混雑・駐車場・周辺情報をまとめたページの一覧です。`,
}

const areasIndexHtml = `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>観光スポット別 混雑・駐車場情報の一覧 | tourismparking.jp</title>
    <meta name="description" content="全国${areaPages.length}か所の観光スポットについて、混雑状況や駐車場の空き、周辺情報をまとめたページの一覧です。地方・都道府県から探せます。" />
    <link rel="canonical" href="${areasIndexUrl}" />
    <meta property="og:title" content="観光スポット別 混雑・駐車場情報の一覧" />
    <meta property="og:description" content="全国${areaPages.length}か所の観光スポットの混雑・駐車場情報をまとめた一覧です。" />
    <meta property="og:url" content="${areasIndexUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Tourism Crowd Parking Alert" />
    <meta property="og:locale" content="ja_JP" />
    <script type="application/ld+json">${JSON.stringify(areasIndexJsonLd)}</script>
    <style>
      :root { color: #1f2320; background: #f4f1ea; }
      * { box-sizing: border-box; }
      body { margin: 0; font-family: Inter, "Yu Gothic", Meiryo, sans-serif; background: #f4f1ea; color: #1f2320; }
      main { width: min(1080px, calc(100% - 32px)); margin: 0 auto; padding: 28px 0 52px; }
      .hero, .section-box { border: 1px solid rgba(31, 35, 32, .13); border-radius: 10px; background: #fff; box-shadow: 0 18px 44px rgba(42, 36, 28, .08); padding: 24px; }
      .section-box { margin-top: 18px; padding: 18px; }
      .eyebrow { margin: 0; color: #79502c; font-size: 13px; font-weight: 800; text-transform: uppercase; }
      h1 { margin: 8px 0 14px; font-size: clamp(30px, 4.5vw, 48px); line-height: 1.1; }
      h2 { margin: 0 0 12px; font-size: 20px; }
      h3 { margin: 16px 0 8px; font-size: 15px; color: #5c5a52; }
      p, li { line-height: 1.75; color: #5c5a52; }
      .area-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
      .area-link { display: grid; gap: 4px; padding: 14px; border-radius: 8px; background: #f4f1ea; text-decoration: none; color: #1f2320; }
      .area-link strong { font-size: 15px; }
      .area-link span { font-size: 12px; color: #716b61; }
      .home-link { display: inline-flex; margin-top: 12px; font-weight: 700; color: #1f2320; }
      @media (max-width: 640px) { .area-grid { grid-template-columns: 1fr; } }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <p class="eyebrow">AREA INDEX</p>
        <h1>観光スポット別の混雑・駐車場情報</h1>
        <p>全国${areaPages.length}か所の観光スポットについて、混雑の傾向、駐車場の空き、周辺の立ち寄り先をまとめています。地方と都道府県から探せます。</p>
        <a class="home-link" href="/">トップへ戻る</a>
      </section>
${Object.entries(groupedByRegion).map(([region, prefs]) => `      <section class="section-box">
        <h2>${escapeHtml(region)}</h2>
${Object.entries(prefs).map(([pref, items]) => `        <h3>${escapeHtml(pref)}</h3>
        <div class="area-grid">${items.map((item) => `
          <a class="area-link" href="${encodeURI(item.path)}">
            <strong>${escapeHtml(item.spot)}</strong>
            <span>${escapeHtml(item.area)} / 最寄: ${escapeHtml(item.station)}</span>
          </a>`).join('')}
        </div>`).join('')}
      </section>`).join('')}
    </main>
  </body>
</html>`

mkdirSync(areasDir, { recursive: true })
writeFileSync(resolve(areasDir, 'index.html'), areasIndexHtml)

const coreSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://tourismparking.jp/</loc><priority>1.0</priority></url>
  <url><loc>https://tourismparking.jp/areas/</loc><priority>0.9</priority></url>
</urlset>
`

const areasSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${areaPages.map((area) => `  <url><loc>https://tourismparking.jp${encodeURI(area.path)}</loc><priority>0.8</priority></url>`).join('\n')}
</urlset>
`

const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>https://tourismparking.jp/sitemaps/core.xml</loc></sitemap>
  <sitemap><loc>https://tourismparking.jp/sitemaps/areas.xml</loc></sitemap>
</sitemapindex>
`

writeFileSync(coreSitemapFile, coreSitemap)
writeFileSync(areasSitemapFile, areasSitemap)
writeFileSync(sitemapFile, sitemapIndex)
writeFileSync(robotsFile, 'User-agent: *\nAllow: /\n\nSitemap: https://tourismparking.jp/sitemap.xml\n')
console.log(`Generated ${areaPages.length} area pages and updated sitemap.`)
