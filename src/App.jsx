import { useMemo, useState } from 'react'
import './App.css'

const saveKey = 'tourism-crowd-parking-alert.saved'
const postKey = 'tourism-crowd-parking-alert.posts'
const locationSeeds = [
  { area: '浅草', pref: '東京都', spot: '浅草寺', station: '浅草駅', parking: '雷門地下駐車場' },
  { area: '上野', pref: '東京都', spot: '上野恩賜公園', station: '上野駅', parking: '上野パーキングセンター' },
  { area: 'お台場', pref: '東京都', spot: 'ダイバーシティ東京', station: '台場駅', parking: '青海臨時駐車場' },
  { area: '鎌倉', pref: '神奈川県', spot: '鶴岡八幡宮', station: '鎌倉駅', parking: '鶴岡八幡宮参拝者駐車場' },
  { area: '箱根', pref: '神奈川県', spot: '大涌谷', station: '早雲山駅', parking: '大涌谷駐車場' },
  { area: '横浜みなとみらい', pref: '神奈川県', spot: '赤レンガ倉庫', station: '馬車道駅', parking: '赤レンガ駐車場' },
  { area: '川越', pref: '埼玉県', spot: '蔵造りの町並み', station: '本川越駅', parking: '川越まつり会館駐車場' },
  { area: '秩父', pref: '埼玉県', spot: '三峯神社', station: '西武秩父駅', parking: '三峯神社駐車場' },
  { area: '日光', pref: '栃木県', spot: '日光東照宮', station: '東武日光駅', parking: '日光東照宮大駐車場' },
  { area: '那須', pref: '栃木県', spot: '那須どうぶつ王国', station: '黒田原駅', parking: '那須どうぶつ王国駐車場' },
  { area: '軽井沢', pref: '長野県', spot: '旧軽井沢銀座', station: '軽井沢駅', parking: '軽井沢駅北口駐車場' },
  { area: '白馬', pref: '長野県', spot: '白馬岩岳', station: '白馬駅', parking: '白馬岩岳駐車場' },
  { area: '松本', pref: '長野県', spot: '松本城', station: '松本駅', parking: '松本城大手門駐車場' },
  { area: '金沢', pref: '石川県', spot: '兼六園', station: '金沢駅', parking: '兼六駐車場' },
  { area: '富山', pref: '富山県', spot: '富岩運河環水公園', station: '富山駅', parking: '環水公園駐車場' },
  { area: '高山', pref: '岐阜県', spot: '古い町並', station: '高山駅', parking: '高山駅西駐車場' },
  { area: '白川郷', pref: '岐阜県', spot: '荻町合掌造り集落', station: '白川郷バスターミナル', parking: 'せせらぎ公園駐車場' },
  { area: '名古屋', pref: '愛知県', spot: '名古屋城', station: '名古屋城駅', parking: '名古屋城正門前駐車場' },
  { area: '犬山', pref: '愛知県', spot: '犬山城', station: '犬山遊園駅', parking: '犬山城第1駐車場' },
  { area: '伊勢', pref: '三重県', spot: '伊勢神宮 内宮', station: '五十鈴川駅', parking: '内宮A駐車場' },
  { area: '鳥羽', pref: '三重県', spot: '鳥羽水族館', station: '鳥羽駅', parking: '鳥羽水族館駐車場' },
  { area: '京都', pref: '京都府', spot: '清水寺', station: '清水五条駅', parking: '清水坂観光駐車場' },
  { area: '嵐山', pref: '京都府', spot: '渡月橋', station: '嵐山駅', parking: '嵐山観光駐車場' },
  { area: '大阪', pref: '大阪府', spot: '大阪城', station: '大阪城公園駅', parking: '森ノ宮駐車場' },
  { area: '難波', pref: '大阪府', spot: '道頓堀', station: 'なんば駅', parking: '湊町駐車場' },
  { area: '神戸', pref: '兵庫県', spot: 'ハーバーランド', station: '神戸駅', parking: 'ハーバーパーク' },
  { area: '姫路', pref: '兵庫県', spot: '姫路城', station: '姫路駅', parking: '姫山駐車場' },
  { area: '奈良', pref: '奈良県', spot: '奈良公園', station: '近鉄奈良駅', parking: '登大路駐車場' },
  { area: '白浜', pref: '和歌山県', spot: 'アドベンチャーワールド', station: '白浜駅', parking: '第1駐車場' },
  { area: '倉敷', pref: '岡山県', spot: '倉敷美観地区', station: '倉敷駅', parking: '市営中央駐車場' },
  { area: '広島', pref: '広島県', spot: '宮島', station: '宮島口駅', parking: '宮島口旅客ターミナル駐車場' },
  { area: '松山', pref: '愛媛県', spot: '道後温泉', station: '道後温泉駅', parking: '道後温泉駐車場' },
  { area: '高知', pref: '高知県', spot: 'ひろめ市場', station: '高知駅', parking: '県庁前地下駐車場' },
  { area: '福岡', pref: '福岡県', spot: '太宰府天満宮', station: '太宰府駅', parking: '太宰府駐車センター' },
  { area: '長崎', pref: '長崎県', spot: 'グラバー園', station: '大浦天主堂駅', parking: '松が枝町駐車場' },
  { area: '熊本', pref: '熊本県', spot: '熊本城', station: '熊本城・市役所前駅', parking: '城彩苑駐車場' },
  { area: '由布院', pref: '大分県', spot: '湯の坪街道', station: '由布院駅', parking: '由布院駅前駐車場' },
  { area: '宮崎', pref: '宮崎県', spot: '青島神社', station: '青島駅', parking: '青島参道南広場駐車場' },
  { area: '鹿児島', pref: '鹿児島県', spot: '仙巌園', station: '仙巌園駅', parking: '仙巌園駐車場' },
  { area: '那覇', pref: '沖縄県', spot: '首里城公園', station: '首里駅', parking: '首里城公園駐車場' },
]

const categoryBlueprints = [
  {
    key: 'mixed-crowd',
    category: '混雑',
    label: '混雑ピーク予測',
    window: '11:00-13:00',
    baseScore: 95,
    channels: ['LINE', 'X', 'メール'],
    revenue: '観光予約',
    source: '観光協会公開情報 + 現地投稿',
  },
  {
    key: 'parking-vacancy',
    category: '駐車場',
    label: '駐車場空き変動',
    window: '09:30-11:30',
    baseScore: 92,
    channels: ['LINE', 'X', 'Slack'],
    revenue: '駐車場送客',
    source: '施設案内 + 駐車場案内板投稿',
  },
  {
    key: 'around-spot',
    category: '観光',
    label: '周辺導線提案',
    window: '15:00-17:00',
    baseScore: 89,
    channels: ['LINE', 'メール'],
    revenue: '飲食送客',
    source: '商店会情報 + ユーザー投稿',
  },
]

const alerts = locationSeeds.flatMap((location, locationIndex) => (
  categoryBlueprints.map((blueprint, blueprintIndex) => {
    const id = `tourism-crowd-parking-alert-${locationIndex + 1}-${blueprint.key}`
    const score = Math.max(70, blueprint.baseScore - ((locationIndex * 2 + blueprintIndex) % 17))
    const waitMin = 8 + ((locationIndex + blueprintIndex * 3) % 34)
    const parkingVacancy = 6 + ((locationIndex * 3 + blueprintIndex * 5) % 62)
    const updateHour = (8 + ((locationIndex + blueprintIndex) % 11)).toString().padStart(2, '0')
    const updateMin = ((locationIndex * 7 + blueprintIndex * 13) % 60).toString().padStart(2, '0')

    return {
      id,
      title: `${location.spot} ${blueprint.label}`,
      area: `${location.pref} ${location.area}`,
      category: blueprint.category,
      score,
      summary: `${location.spot}（最寄: ${location.station}）周辺の${blueprint.category}通知。${location.parking}の空きと、観光導線の変化を条件一致で通知します。`,
      channels: blueprint.channels,
      tags: [location.pref, location.area, location.spot, blueprint.category, '通知', '観光'],
      revenue: blueprint.revenue,
      source: blueprint.source,
      spot: location.spot,
      station: location.station,
      parking: location.parking,
      waitMin,
      parkingVacancy,
      updatedAt: `2026-08-11 ${updateHour}:${updateMin}`,
    }
  })
))
const revenuePlans = [
  "駐車場送客",
  "観光予約",
  "飲食送客",
  "チケット affiliate",
  "地域広告"
]
const channels = [
  "LINE",
  "X",
  "メール",
  "Slack"
]
const faqs = [
  ['通知からどう収益化しますか？', '無料通知で接点を作り、条件一致時に予約、掲載、クーポン、有料通知、スポンサー枠へ誘導します。'],
  ['LINE・X・メール・Slackの使い分けは？', 'LINEは個人の即時通知、Xは拡散、メールは週次まとめ、Slackは店舗や法人運用向けです。'],
  ['SEO/AIO/LLMOの狙いは？', '地域名、カテゴリ、条件、通知、口コミ、FAQを組み合わせたロングテールページを作ります。'],
]

function readArray(key) {
  try { return JSON.parse(localStorage.getItem(key)) ?? [] } catch { return [] }
}

function App() {
  const [query, setQuery] = useState('名古屋')
  const [category, setCategory] = useState('すべて')
  const [saved, setSaved] = useState(() => readArray(saveKey))
  const [posts, setPosts] = useState(() => readArray(postKey))
  const [form, setForm] = useState({ title: '', channel: 'LINE', memo: '' })
  const categories = ['すべて', ...new Set(alerts.map((item) => item.category))]

  const filtered = useMemo(() => alerts.filter((item) => {
    const text = [
      item.title,
      item.area,
      item.category,
      item.summary,
      item.spot,
      item.station,
      item.parking,
      item.source,
      item.channels.join(' '),
      item.tags.join(' '),
    ].join(' ')
    return text.includes(query) && (category === 'すべて' || item.category === category)
  }), [query, category])

  function toggleSave(id) {
    const next = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id]
    setSaved(next)
    localStorage.setItem(saveKey, JSON.stringify(next))
  }

  function addPost(event) {
    event.preventDefault()
    if (!form.title.trim() || !form.memo.trim()) return
    const next = [{ ...form, id: crypto.randomUUID(), date: new Date().toLocaleDateString('ja-JP') }, ...posts]
    setPosts(next)
    localStorage.setItem(postKey, JSON.stringify(next))
    setForm({ title: '', channel: 'LINE', memo: '' })
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">観光スポット混雑・駐車場空き通知</p>
          <h1>Tourism Crowd Parking Alert</h1>
          <p className="lead">観光地の混雑、駐車場空き、周辺飲食、チケットを通知し、観光予約、駐車場、飲食へ送客する。</p>
        </div>
        <aside className="hero-panel">
          <span>tourismparking.jp / tourism-crowd-parking-alert</span>
          <strong>通知の瞬間に、予約・掲載・クーポン・有料導線へつなげる。</strong>
          <p>LINE、X、メール、Slackを入口に、UGCで鮮度を作りながら収益導線を太くします。</p>
        </aside>
      </section>
      <section className="controls" aria-label="検索条件">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="地域・カテゴリ・通知条件で検索" />
        <select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select>
      </section>
      <section className="metrics">
        <article><span>Alert seeds</span><strong>{alerts.length}</strong></article>
        <article><span>Channels</span><strong>{channels.length}</strong></article>
        <article><span>Saved</span><strong>{saved.length}</strong></article>
        <article><span>UGC</span><strong>{posts.length}</strong></article>
      </section>
      <section className="alert-grid">
        {filtered.map((alert) => (
          <article className="alert-card" key={alert.id}>
            <div className="card-top"><span>{alert.area} / {alert.category}</span><b>{alert.score}</b></div>
            <h2>{alert.title}</h2>
            <p>{alert.summary}</p>
            <p>スポット: {alert.spot} / 最寄駅: {alert.station}</p>
            <p>駐車場: {alert.parking}</p>
            <p>推定待機: {alert.waitMin}分 / 空き台数目安: {alert.parkingVacancy}台</p>
            <p>データ更新: {alert.updatedAt} / 参照: {alert.source}</p>
            <div className="tag-row">{alert.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <div className="channel-row">{alert.channels.map((channel) => <span key={channel}>{channel}</span>)}</div>
            <p className="revenue">収益導線: {alert.revenue}</p>
            <button type="button" onClick={() => toggleSave(alert.id)}>{saved.includes(alert.id) ? '保存済み' : '通知導線に保存'}</button>
          </article>
        ))}
      </section>
      <section className="split">
        <div className="panel">
          <h2>技術選定</h2>
          <article><b>Frontend</b><p>Vite + React 19。静的MVPとして軽く、GitHub Pagesへ展開しやすい構成です。</p></article>
          <article><b>通知連携</b><p>初期はUI設計、次段階でLINE Messaging API、X API、SendGrid/Mailgun、Slack Incoming Webhooksを接続します。</p></article>
          <article><b>Data</b><p>MVPは静的seed + localStorage。運用時はSupabaseまたはCloudflare D1へ移行します。</p></article>
          <article><b>収益ルート</b><p>{revenuePlans.join(' / ')}</p></article>
        </div>
        <div className="panel">
          <h2>UGC・通知リクエスト</h2>
          <p>現地確認、在庫、空席、価格、閉店、口コミ、通知希望条件を集めて、鮮度と検索ページを増やします。</p>
          <form className="ugc-form" onSubmit={addPost}>
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="通知リクエスト名" />
            <input value={form.channel} onChange={(event) => setForm({ ...form, channel: event.target.value })} placeholder="LINE / X / メール / Slack" />
            <input value={form.memo} onChange={(event) => setForm({ ...form, memo: event.target.value })} placeholder="条件・口コミ・現地メモ" />
            <button>投稿</button>
          </form>
          <div className="post-list">
            {posts.length === 0 && <p className="empty">公開後は通知希望とUGCで鮮度を作ります。</p>}
            {posts.map((post) => <article key={post.id}><b>{post.title}</b><p>{post.memo}</p><small>{post.channel} / {post.date}</small></article>)}
          </div>
        </div>
      </section>
      <section className="seo-section">
        <h2>SEO / AIO / LLMO</h2>
        <div className="seo-grid">
          <article><b>地域ページ</b><p>地域名、駅名、施設名ごとに通知ニーズを拾います。</p></article>
          <article><b>条件ページ</b><p>空き、値下げ、閉店、在庫、混雑、期限など行動直前の検索を狙います。</p></article>
          <article><b>法人ページ</b><p>掲載、スポンサー、Slack通知、レポート、SaaS契約へつなげます。</p></article>
        </div>
      </section>
      <section className="faq-section">
        <h2>FAQ</h2>
        <div className="faq-grid">{faqs.map(([q, a]) => <article key={q}><h3>{q}</h3><p>{a}</p></article>)}</div>
      </section>
    </main>
  )
}

export default App
