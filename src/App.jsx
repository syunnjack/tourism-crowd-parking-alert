import { useEffect, useMemo, useState } from 'react'
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
  { area: '札幌', pref: '北海道', spot: '大通公園', station: '大通駅', parking: '大通地下駐車場' },
  { area: '小樽', pref: '北海道', spot: '小樽運河', station: '小樽駅', parking: '小樽港第1駐車場' },
  { area: '函館', pref: '北海道', spot: '函館山', station: '函館駅', parking: '函館山ロープウェイ山麓駐車場' },
  { area: '旭川', pref: '北海道', spot: '旭山動物園', station: '旭川駅', parking: '旭山動物園東門駐車場' },
  { area: '仙台', pref: '宮城県', spot: '仙台城跡', station: '国際センター駅', parking: '仙台城跡駐車場' },
  { area: '松島', pref: '宮城県', spot: '松島海岸', station: '松島海岸駅', parking: '松島海岸観光駐車場' },
  { area: '山形', pref: '山形県', spot: '蔵王温泉', station: '山形駅', parking: '蔵王温泉大露天風呂駐車場' },
  { area: '福島', pref: '福島県', spot: '鶴ヶ城', station: '会津若松駅', parking: '鶴ヶ城西出丸駐車場' },
  { area: '水戸', pref: '茨城県', spot: '偕楽園', station: '水戸駅', parking: '偕楽園桜山第一駐車場' },
  { area: 'ひたちなか', pref: '茨城県', spot: '国営ひたち海浜公園', station: '勝田駅', parking: '西駐車場' },
  { area: '前橋', pref: '群馬県', spot: '赤城山', station: '前橋駅', parking: '赤城山大沼駐車場' },
  { area: '草津', pref: '群馬県', spot: '湯畑', station: '長野原草津口駅', parking: '天狗山第1駐車場' },
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
  { area: '北九州', pref: '福岡県', spot: '門司港レトロ', station: '門司港駅', parking: '門司港レトロ駐車場' },
  { area: '佐賀', pref: '佐賀県', spot: '吉野ヶ里歴史公園', station: '吉野ヶ里公園駅', parking: '東口駐車場' },
  { area: '長崎', pref: '長崎県', spot: 'グラバー園', station: '大浦天主堂駅', parking: '松が枝町駐車場' },
  { area: '熊本', pref: '熊本県', spot: '熊本城', station: '熊本城・市役所前駅', parking: '城彩苑駐車場' },
  { area: '阿蘇', pref: '熊本県', spot: '草千里ヶ浜', station: '阿蘇駅', parking: '草千里駐車場' },
  { area: '由布院', pref: '大分県', spot: '湯の坪街道', station: '由布院駅', parking: '由布院駅前駐車場' },
  { area: '別府', pref: '大分県', spot: '海地獄', station: '別府駅', parking: '海地獄駐車場' },
  { area: '宮崎', pref: '宮崎県', spot: '青島神社', station: '青島駅', parking: '青島参道南広場駐車場' },
  { area: '鹿児島', pref: '鹿児島県', spot: '仙巌園', station: '仙巌園駅', parking: '仙巌園駐車場' },
  { area: '霧島', pref: '鹿児島県', spot: '霧島神宮', station: '霧島神宮駅', parking: '霧島神宮駐車場' },
  { area: '那覇', pref: '沖縄県', spot: '首里城公園', station: '首里駅', parking: '首里城公園駐車場' },
  { area: '恩納村', pref: '沖縄県', spot: '万座毛', station: '名護バスターミナル', parking: '万座毛駐車場' },
  { area: '石垣', pref: '沖縄県', spot: '川平湾', station: '石垣港離島ターミナル', parking: '川平公園駐車場' },
  { area: '弘前', pref: '青森県', spot: '弘前公園', station: '弘前駅', parking: '弘前公園観光館駐車場' },
  { area: '八戸', pref: '青森県', spot: '蕪島', station: '鮫駅', parking: '蕪島駐車場' },
  { area: '盛岡', pref: '岩手県', spot: '盛岡城跡公園', station: '盛岡駅', parking: '盛岡城跡公園地下駐車場' },
  { area: '平泉', pref: '岩手県', spot: '中尊寺', station: '平泉駅', parking: '中尊寺第1駐車場' },
  { area: '秋田', pref: '秋田県', spot: '角館武家屋敷通り', station: '角館駅', parking: '桜並木駐車場' },
  { area: '男鹿', pref: '秋田県', spot: '寒風山', station: '男鹿駅', parking: '寒風山回転展望台駐車場' },
  { area: '酒田', pref: '山形県', spot: '山居倉庫', station: '酒田駅', parking: '山居倉庫観光駐車場' },
  { area: '米沢', pref: '山形県', spot: '上杉神社', station: '米沢駅', parking: '上杉城史苑駐車場' },
  { area: '郡山', pref: '福島県', spot: '磐梯熱海温泉', station: '磐梯熱海駅', parking: '温泉街駐車場' },
  { area: 'いわき', pref: '福島県', spot: 'アクアマリンふくしま', station: '泉駅', parking: '東駐車場' },
  { area: '宇都宮', pref: '栃木県', spot: '大谷資料館', station: '宇都宮駅', parking: '大谷資料館駐車場' },
  { area: '甲府', pref: '山梨県', spot: '昇仙峡', station: '甲府駅', parking: '昇仙峡滝上駐車場' },
  { area: '河口湖', pref: '山梨県', spot: '大石公園', station: '河口湖駅', parking: '大石公園駐車場' },
  { area: '福井', pref: '福井県', spot: '東尋坊', station: '芦原温泉駅', parking: '東尋坊駐車場' },
  { area: '敦賀', pref: '福井県', spot: '気比の松原', station: '敦賀駅', parking: '松原海岸駐車場' },
  { area: '浜松', pref: '静岡県', spot: '浜名湖ガーデンパーク', station: '浜松駅', parking: '北駐車場' },
  { area: '熱海', pref: '静岡県', spot: '熱海サンビーチ', station: '熱海駅', parking: '親水公園駐車場' },
  { area: '津', pref: '三重県', spot: '御殿場海岸', station: '津駅', parking: '御殿場海岸駐車場' },
  { area: '彦根', pref: '滋賀県', spot: '彦根城', station: '彦根駅', parking: '二の丸駐車場' },
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
    revenue: '駐車場情報',
    source: '施設案内 + 駐車場案内板投稿',
  },
  {
    key: 'around-spot',
    category: '観光',
    label: '周辺スポット案内',
    window: '15:00-17:00',
    baseScore: 89,
    channels: ['LINE', 'メール'],
    revenue: '周辺グルメ',
    source: '商店会情報 + ユーザー投稿',
  },
  {
    key: 'food-coupon',
    category: '飲食',
    label: '周辺飲食クーポン通知',
    window: '12:00-14:00',
    baseScore: 88,
    channels: ['LINE', 'X', 'メール'],
    revenue: '周辺グルメ',
    source: '飲食店公開情報 + 口コミ投稿',
  },
  {
    key: 'ticket-sale',
    category: 'チケット',
    label: '当日券・割引枠通知',
    window: '10:00-16:00',
    baseScore: 87,
    channels: ['LINE', 'メール'],
    revenue: 'チケット情報',
    source: 'チケット販売情報 + 施設案内',
  },
  {
    key: 'event-traffic',
    category: 'イベント',
    label: 'イベント開催日交通警戒',
    window: '16:00-20:00',
    baseScore: 86,
    channels: ['LINE', 'X', 'Slack'],
    revenue: '地域広告',
    source: '自治体イベント情報 + 現地投稿',
  },
  {
    key: 'family-route',
    category: 'ファミリー',
    label: '子連れ優先ルート通知',
    window: '09:00-12:00',
    baseScore: 85,
    channels: ['LINE', 'メール'],
    revenue: '観光予約',
    source: '家族向け口コミ + 観光協会案内',
  },
  {
    key: 'night-lightup',
    category: '夜間観光',
    label: 'ライトアップ混雑通知',
    window: '18:00-21:00',
    baseScore: 84,
    channels: ['LINE', 'X'],
    revenue: '観光予約',
    source: '施設営業時間情報 + 現地SNS投稿',
  },
  {
    key: 'rain-shift',
    category: '雨天代替',
    label: '雨天時代替スポット通知',
    window: '08:00-10:00',
    baseScore: 83,
    channels: ['LINE', 'メール', 'Slack'],
    revenue: '地域広告',
    source: '天候API想定 + 施設公開情報',
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
      pref: location.pref,
      areaName: location.area,
      title: `${location.spot} ${blueprint.label}`,
      area: `${location.pref} ${location.area}`,
      category: blueprint.category,
      score,
      summary: `${location.spot}（最寄: ${location.station}）周辺の${blueprint.category}情報です。${location.parking}の空きや、立ち寄りやすい周辺情報の変化を条件に合わせて確認できます。`,
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
  "駐車場情報",
  "観光予約",
  "周辺グルメ",
  "チケット情報",
  "地域広告"
]
const channels = [
  "LINE",
  "X",
  "メール",
  "Slack"
]
const faqs = [
  ['通知を見ると何が分かりますか？', '混雑状況、駐車場の空き、近くで立ち寄れる飲食店やチケット情報を、条件に合わせてまとめて確認できます。'],
  ['LINE・X・メール・Slackの使い分けは？', 'LINEは個人の即時通知、Xは拡散、メールは週次まとめ、Slackは店舗や法人運用向けです。'],
  ['エリア別ページでは何が見られますか？', '地域ごとの混雑、駐車場、周辺スポット情報をまとめて見比べやすくしています。'],
]

function readArray(key) {
  try { return JSON.parse(localStorage.getItem(key)) ?? [] } catch { return [] }
}

function buildAreaRoute(location, index) {
  return {
    id: `seo-area-${index + 1}`,
    pref: location.pref,
    areaName: location.area,
    spot: location.spot,
    station: location.station,
    parking: location.parking,
    url: `/areas/${location.pref}/${location.area}/${location.spot}/`,
  }
}

function regionOfPrefecture(pref) {
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
  return regionMap[pref] ?? 'その他'
}

const regionLayout = {
  '北海道': { x: 420, y: 50 },
  '東北': { x: 360, y: 120 },
  '関東': { x: 350, y: 210 },
  '中部': { x: 270, y: 220 },
  '近畿': { x: 210, y: 280 },
  '中国': { x: 130, y: 300 },
  '四国': { x: 180, y: 360 },
  '九州': { x: 90, y: 410 },
  '沖縄': { x: 30, y: 500 },
}

function heatLevel(alertCount) {
  if (alertCount >= 27) return 'heat-4'
  if (alertCount >= 18) return 'heat-3'
  if (alertCount >= 9) return 'heat-2'
  return 'heat-1'
}

function App() {
  const pageSize = 24
  const siteBase = typeof window !== 'undefined' && window.location.pathname.startsWith('/tourism-crowd-parking-alert/') ? '/tourism-crowd-parking-alert' : ''
  const initialParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const [query, setQuery] = useState(initialParams?.get('q') ?? '名古屋')
  const [category, setCategory] = useState(initialParams?.get('category') ?? 'すべて')
  const [prefecture, setPrefecture] = useState(initialParams?.get('pref') ?? 'すべて')
  const [sortBy, setSortBy] = useState(initialParams?.get('sort') ?? 'score')
  const [page, setPage] = useState(1)
  const [saved, setSaved] = useState(() => readArray(saveKey))
  const [posts, setPosts] = useState(() => readArray(postKey))
  const [form, setForm] = useState({ title: '', channel: 'LINE', memo: '' })
  const prefectures = ['すべて', ...new Set(alerts.map((item) => item.pref))]
  const categories = ['すべて', ...new Set(alerts.map((item) => item.category))]

  const filtered = useMemo(() => alerts
    .filter((item) => {
      const text = [
        item.title,
        item.area,
        item.areaName,
        item.pref,
        item.category,
        item.summary,
        item.spot,
        item.station,
        item.parking,
        item.source,
        item.channels.join(' '),
        item.tags.join(' '),
      ].join(' ')
      return text.includes(query)
        && (prefecture === 'すべて' || item.pref === prefecture)
        && (category === 'すべて' || item.category === category)
    })
    .sort((left, right) => {
      if (sortBy === 'wait') return left.waitMin - right.waitMin || right.score - left.score
      if (sortBy === 'vacancy') return right.parkingVacancy - left.parkingVacancy || right.score - left.score
      if (sortBy === 'updated') return right.updatedAt.localeCompare(left.updatedAt)
      return right.score - left.score || left.waitMin - right.waitMin
    }), [query, prefecture, category, sortBy])

  const visibleAlerts = useMemo(() => filtered.slice(0, page * pageSize), [filtered, page])
  const hasMore = visibleAlerts.length < filtered.length
  const prefectureSummary = useMemo(() => Object.values(alerts.reduce((accumulator, item) => {
    const bucket = accumulator[item.pref] ?? {
      pref: item.pref,
      alertCount: 0,
      totalScore: 0,
      totalWait: 0,
      topSpot: item.spot,
      maxScore: item.score,
    }
    bucket.alertCount += 1
    bucket.totalScore += item.score
    bucket.totalWait += item.waitMin
    if (item.score > bucket.maxScore) {
      bucket.maxScore = item.score
      bucket.topSpot = item.spot
    }
    accumulator[item.pref] = bucket
    return accumulator
  }, {})).map((item) => ({
    ...item,
    averageScore: Math.round(item.totalScore / item.alertCount),
    averageWait: Math.round(item.totalWait / item.alertCount),
  })).sort((left, right) => right.alertCount - left.alertCount || right.averageScore - left.averageScore), [])
  const areaRoutes = useMemo(() => locationSeeds.slice(0, 12).map((location, index) => {
    const route = buildAreaRoute(location, index)
    const routeAlerts = alerts.filter((item) => item.spot === location.spot)
    return {
      ...route,
      alertCount: routeAlerts.length,
      topScore: Math.max(...routeAlerts.map((item) => item.score)),
      categories: [...new Set(routeAlerts.map((item) => item.category))].slice(0, 3),
    }
  }), [])
  const rankings = useMemo(() => ({
    score: [...alerts].sort((left, right) => right.score - left.score).slice(0, 5),
    wait: [...alerts].sort((left, right) => left.waitMin - right.waitMin || right.score - left.score).slice(0, 5),
    vacancy: [...alerts].sort((left, right) => right.parkingVacancy - left.parkingVacancy || right.score - left.score).slice(0, 5),
  }), [])
  const regionSummary = useMemo(() => Object.values(alerts.reduce((accumulator, item) => {
    const region = regionOfPrefecture(item.pref)
    const bucket = accumulator[region] ?? { region, alertCount: 0, maxScore: 0, prefectures: new Set() }
    bucket.alertCount += 1
    bucket.maxScore = Math.max(bucket.maxScore, item.score)
    bucket.prefectures.add(item.pref)
    accumulator[region] = bucket
    return accumulator
  }, {})).map((item) => ({
    ...item,
    prefectureCount: item.prefectures.size,
    prefectures: [...item.prefectures],
  })), [])
  const prefectureHeatmap = useMemo(() => prefectureSummary
    .map((item) => ({
      ...item,
      heatClass: heatLevel(item.alertCount),
    }))
    .sort((left, right) => right.alertCount - left.alertCount || right.averageScore - left.averageScore), [prefectureSummary])

  useEffect(() => {
    setPage(1)
  }, [query, prefecture, category, sortBy])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams()
    if (query !== '') params.set('q', query)
    if (prefecture !== 'すべて') params.set('pref', prefecture)
    if (category !== 'すべて') params.set('category', category)
    if (sortBy !== 'score') params.set('sort', sortBy)
    const next = `${siteBase || ''}/${params.toString() === '' ? '' : `?${params.toString()}`}`
    window.history.replaceState({}, '', next)
  }, [query, prefecture, category, sortBy, siteBase])

  function applyAreaPreset(route) {
    setPrefecture(route.pref)
    setCategory('すべて')
    setQuery(route.spot)
  }

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
          <p className="eyebrow">観光前に役立つおでかけ通知</p>
          <h1>Tourism Crowd Parking Alert</h1>
          <p className="lead">観光前に、混雑状況や駐車場の空き、近くの飲食店やチケット情報をまとめて確認できるサービスです。</p>
        </div>
        <aside className="hero-panel">
          <span>全国の観光地情報をまとめてチェック</span>
          <strong>必要な情報を出発前にまとめて受け取り、次の行動を迷わず選べる。</strong>
          <p>LINE、X、メール、Slackを入口に、最新情報や口コミを集めながら、予約や周辺スポット探しまでスムーズにつなげます。</p>
        </aside>
      </section>
      <section className="controls controls-search" aria-label="検索条件">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="地域・カテゴリ・通知条件で検索" />
        <select value={prefecture} onChange={(event) => setPrefecture(event.target.value)}>{prefectures.map((item) => <option key={item}>{item}</option>)}</select>
        <select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select>
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
          <option value="score">注目度順</option>
          <option value="wait">待機時間が短い順</option>
          <option value="vacancy">空き台数が多い順</option>
          <option value="updated">更新が新しい順</option>
        </select>
      </section>
      <section className="controls" aria-label="検索サマリー">
        <p className="filter-summary">条件: {prefecture} / {category} / {sortBy === 'score' ? '注目度順' : sortBy === 'wait' ? '待機時間順' : sortBy === 'vacancy' ? '空き台数順' : '更新順'}</p>
        <span>{query === '' ? 'キーワード未指定' : `キーワード: ${query}`}</span>
      </section>
      <section className="metrics">
        <article><span>掲載中の情報</span><strong>{alerts.length}</strong></article>
        <article><span>対応通知</span><strong>{channels.length}</strong></article>
        <article><span>保存件数</span><strong>{saved.length}</strong></article>
        <article><span>口コミ投稿</span><strong>{posts.length}</strong></article>
      </section>
      <section className="split split-rankings">
        <div className="panel">
          <h2>注目度ランキング</h2>
          <div className="ranking-list">
            {rankings.score.map((item) => <article key={item.id}><b>{item.title}</b><p>{item.area} / 注目度 {item.score}</p></article>)}
          </div>
        </div>
        <div className="panel">
          <h2>空き・待機ランキング</h2>
          <div className="ranking-list">
            {rankings.wait.map((item) => <article key={item.id}><b>{item.title}</b><p>待機 {item.waitMin}分 / 空き {item.parkingVacancy}台</p></article>)}
            {rankings.vacancy.slice(0, 2).map((item) => <article key={`${item.id}-vacancy`}><b>{item.title}</b><p>空き台数多め {item.parkingVacancy}台 / 注目度 {item.score}</p></article>)}
          </div>
        </div>
      </section>
      <section className="seo-section">
        <h2>都道府県ヒートマップ</h2>
        <div className="map-panel">
          <div className="pref-heatmap" aria-label="都道府県別ヒートマップ">
            {prefectureHeatmap.map((item) => (
              <button type="button" key={item.pref} className={`pref-tile ${item.heatClass}`} onClick={() => setPrefecture(item.pref)}>
                <strong>{item.pref}</strong>
                <span>{item.alertCount}件</span>
                <small>{item.averageScore}</small>
              </button>
            ))}
          </div>
          <div className="map-legend">
            {regionSummary.map((item) => <article key={`${item.region}-legend`}><b>{item.region}</b><p>{item.prefectures.join(' / ')}</p></article>)}
          </div>
        </div>
      </section>
      <section className="seo-section">
        <h2>都道府県別集計</h2>
        <div className="seo-grid">
          {prefectureSummary.slice(0, 6).map((summary) => (
            <article key={summary.pref}>
              <b>{summary.pref}</b>
              <p>登録 alert: {summary.alertCount}件 / 平均注目度: {summary.averageScore}</p>
              <p>平均待機: {summary.averageWait}分 / 代表スポット: {summary.topSpot}</p>
              <button type="button" onClick={() => setPrefecture(summary.pref)}>この都道府県で絞り込む</button>
            </article>
          ))}
        </div>
      </section>
      <section className="controls" aria-label="表示状態">
        <p>表示中: {visibleAlerts.length} / 検索一致: {filtered.length}</p>
        {hasMore ? <button type="button" onClick={() => setPage((value) => value + 1)}>さらに24件表示</button> : <span>すべて表示済み</span>}
      </section>
      <section className="alert-grid">
        {visibleAlerts.map((alert) => (
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
            <p className="revenue">おすすめ情報: {alert.revenue}</p>
            <button type="button" onClick={() => toggleSave(alert.id)}>{saved.includes(alert.id) ? '保存済み' : '保存する'}</button>
          </article>
        ))}
      </section>
      <section className="split">
        <div className="panel">
          <h2>このサービスで分かること</h2>
          <article><b>今の状況</b><p>観光地の混雑や駐車場の空き状況を、出発前にまとめて確認できます。</p></article>
          <article><b>移動の判断</b><p>LINE、X、メール、Slackで情報を受け取り、立ち寄る場所や時間帯を決めやすくします。</p></article>
          <article><b>現地で役立つ情報</b><p>周辺の飲食店、チケット、雨天時の代替スポットなどもあわせてチェックできます。</p></article>
          <article><b>チェックできるテーマ</b><p>{revenuePlans.join(' / ')}</p></article>
        </div>
        <div className="panel">
          <h2>口コミ・通知リクエスト</h2>
          <p>現地の様子や空き状況、口コミ、知りたい条件を投稿して、ほかの利用者と情報を共有できます。</p>
          <form className="ugc-form" onSubmit={addPost}>
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="投稿タイトル" />
            <input value={form.channel} onChange={(event) => setForm({ ...form, channel: event.target.value })} placeholder="LINE / X / メール / Slack" />
            <input value={form.memo} onChange={(event) => setForm({ ...form, memo: event.target.value })} placeholder="条件・口コミ・現地メモ" />
            <button>投稿</button>
          </form>
          <div className="post-list">
            {posts.length === 0 && <p className="empty">まだ投稿はありません。気になる条件や現地の様子を最初に共有できます。</p>}
            {posts.map((post) => <article key={post.id}><b>{post.title}</b><p>{post.memo}</p><small>{post.channel} / {post.date}</small></article>)}
          </div>
        </div>
      </section>
      <section className="seo-section">
        <h2>エリア別の便利ページ</h2>
        <div className="seo-grid">
          {areaRoutes.map((route) => (
            <article key={route.id}>
              <b>{route.pref} {route.spot}</b>
              <p>想定URL: {route.url}</p>
              <p>確認できるカテゴリ: {route.categories.join(' / ')} / 情報件数: {route.alertCount}</p>
              <p>最寄駅: {route.station} / 駐車場: {route.parking} / 最大注目度: {route.topScore}</p>
              <div className="route-actions">
                <button type="button" onClick={() => applyAreaPreset(route)}>この条件で見る</button>
                <a className="route-link" href={encodeURI(`${siteBase}${route.url}`)}>詳細を見る</a>
              </div>
            </article>
          ))}
        </div>
        <div className="seo-grid">
          <article><b>地域ページ</b><p>地域名、駅名、施設名ごとに、出発前に知りたい情報を探しやすくしています。</p></article>
          <article><b>条件ページ</b><p>空き、値下げ、在庫、混雑、期限など、その場で判断したい条件から探せます。</p></article>
          <article><b>施設向け情報</b><p>情報更新や通知連携を相談したい施設向けの案内も用意しています。</p></article>
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
