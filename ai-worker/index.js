const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json; charset=utf-8'
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders });
}

function extractOutputText(data) {
  if (typeof data?.output_text === 'string' && data.output_text.trim()) return data.output_text.trim();
  const chunks = [];
  for (const item of data?.output || []) {
    for (const part of item?.content || []) {
      if (typeof part?.text === 'string') chunks.push(part.text);
    }
  }
  return chunks.join('\n').trim();
}

function stripJsonFence(text) {
  return String(text || '')
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

/*
 * 免費備援資料庫：
 * OpenAI 額度不足、API 暫時失敗或尚未設定 API Key 時，
 * Worker 仍可根據常用沖繩景點資料產生可加入行程的結果。
 * 這裡刻意不寫死即時公車班次、票價、營業時間等容易變動的資訊。
 */
const OKINAWA_PLACES = [
  {
    keys: ['首里城', '首里'],
    title: '首里城',
    area: '那霸・首里',
    stay: '約 1.5～2 小時',
    transit: '單軌電車＋步行',
    time: '09:30',
    note: '適合安排在那霸市區半日行程的前段；參觀後可再往國際通或其他市區景點移動。實際開放時間與交通班次請出發前確認。',
    officialUrl: 'https://oki-park.jp/shurijo/'
  },
  {
    keys: ['波上宮', '波之上', '波上'],
    title: '波上宮',
    area: '那霸・若狹',
    stay: '約 45～60 分鐘',
    transit: '公車＋步行／計程車',
    time: '08:30',
    note: '靠近那霸市區與海邊，適合和市區行程串接；參拜後可再前往國際通方向。',
    officialUrl: 'https://naminouegu.jp/'
  },
  {
    keys: ['國際通', '國際通り'],
    title: '國際通',
    area: '那霸・牧志',
    stay: '約 1.5～3 小時',
    transit: '單軌電車＋步行',
    time: '16:00',
    note: '適合安排購物、吃飯與伴手禮；若當天還有其他市區景點，可放在下午至晚上。',
    officialUrl: 'https://naha-kokusaidori.okinawa/'
  },
  {
    keys: ['寶可夢中心', 'pokemon center', 'pokemon', 'pokemon center okinawa'],
    title: 'Pokémon Center OKINAWA',
    area: '浦添・PARCO CITY',
    stay: '約 1～1.5 小時',
    transit: '公車／計程車',
    time: '11:00',
    note: '可與 PARCO CITY 一起安排，減少跨區移動；實際店舖資訊請出發前確認。',
    officialUrl: 'https://www.pokemon.co.jp/shop/pokemongoods/okinawa/'
  },
  {
    keys: ['parco', 'parco city', 'parco city 沖繩', '浦添parco'],
    title: 'サンエー浦添西海岸 PARCO CITY',
    area: '浦添・西海岸',
    stay: '約 2～3 小時',
    transit: '公車／計程車',
    time: '13:00',
    note: '大型商場，適合和 Pokémon Center OKINAWA 串成同一區域行程；購物時間可依需求彈性調整。',
    officialUrl: 'https://www.parcocity.jp/'
  },
  {
    keys: ['瀨長島', '瀬長島', '瀨長島umihotaru', 'umihotaru'],
    title: '瀨長島 Umikaji Terrace',
    area: '豐見城・瀨長島',
    stay: '約 1.5～2 小時',
    transit: '公車／計程車',
    time: '15:30',
    note: '靠近那霸機場，適合安排在抵達日或離境日前後；可搭配夕陽與海景行程。',
    officialUrl: 'https://www.umikajiterrace.com/'
  },
  {
    keys: ['美國村', 'american village', 'americanvillage'],
    title: '美國村',
    area: '北谷',
    stay: '約 2～3 小時',
    transit: '公車／計程車',
    time: '15:00',
    note: '適合下午到傍晚安排，可與北谷海邊一起逛；市區跨區移動時間請依當日交通狀況確認。',
    officialUrl: 'https://www.okinawa-americanvillage.com/'
  },
  {
    keys: ['美麗海', '美麗海水族館', '沖繩美麗海水族館', 'churaumi', 'churaumi aquarium'],
    title: '沖繩美麗海水族館',
    area: '本部・海洋博公園',
    stay: '約 2～3 小時',
    transit: '租車／巴士',
    time: '10:00',
    note: '屬於北部長距離景點，建議和本部、古宇利島等北部行程一起規劃，避免一天內反覆往返那霸。',
    officialUrl: 'https://churaumi.okinawa/'
  },
  {
    keys: ['古宇利島', '古宇利', 'kouri'],
    title: '古宇利島',
    area: '今歸仁・古宇利',
    stay: '約 1.5～2 小時',
    transit: '租車／巴士',
    time: '13:30',
    note: '適合和北部景點串聯；若沒有租車，請預留較充裕的轉乘時間。',
    officialUrl: 'https://www.nakijin.jp/'
  },
  {
    keys: ['玉泉洞', '沖繩世界', 'okinawa world'],
    title: '沖繩世界・玉泉洞',
    area: '南城',
    stay: '約 2～3 小時',
    transit: '公車／租車',
    time: '10:00',
    note: '適合安排南部半日行程，可與知念岬等南部景點串聯。',
    officialUrl: 'https://www.gyokusendo.co.jp/'
  },
  {
    keys: ['dmm', 'kariyushi', 'dmm kariyushi', '水族館'],
    title: 'DMM Kariyushi 水族館',
    area: '豐見城',
    stay: '約 1.5～2 小時',
    transit: '公車／計程車',
    time: '10:30',
    note: '位於 iias 沖繩豐崎附近，適合和豐崎、瀨長島等南部／機場周邊行程串接。',
    officialUrl: 'https://kariyushi-aquarium.com/'
  },
  {
    keys: ['iias', '豐崎', '豐崎outlet', 'ashibinaa', 'ashibinaa outlet'],
    title: '沖繩 Outlet Mall ASHIBINAA',
    area: '豐見城・豐崎',
    stay: '約 2～3 小時',
    transit: '公車／計程車',
    time: '13:00',
    note: '適合安排購物半日；可和機場、瀨長島等南部景點搭配。',
    officialUrl: 'https://www.ashibinaa.com/'
  }
];

function normalizeText(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, '');
}

function findBuiltInPlace(request) {
  const q = normalizeText(request);
  let best = null;
  let bestLen = 0;
  for (const place of OKINAWA_PLACES) {
    for (const key of place.keys) {
      const k = normalizeText(key);
      if (k && q.includes(k) && k.length > bestLen) {
        best = place;
        bestLen = k.length;
      }
    }
  }
  return best;
}

function chooseBuiltInPlace(request, itinerary = []) {
  const exact = findBuiltInPlace(request);
  if (exact) return exact;

  const q = normalizeText(request);
  const categoryRules = [
    { words: ['購物', '逛街', '買東西', '伴手禮'], keys: ['國際通', 'parco', 'ashibinaa'] },
    { words: ['神社', '參拜', '祈福'], keys: ['波上宮', '首里城'] },
    { words: ['水族館', '海洋館'], keys: ['美麗海水族館', 'dmm kariyushi'] },
    { words: ['北部', '海邊', '海景'], keys: ['美國村', '古宇利島', '美麗海水族館'] }
  ];

  for (const rule of categoryRules) {
    if (rule.words.some(w => q.includes(normalizeText(w)))) {
      const found = rule.keys.map(k => findBuiltInPlace(k)).find(Boolean);
      if (found) return found;
    }
  }

  return {
    title: String(request || '沖繩景點').trim(),
    area: '沖繩',
    stay: '約 1～2 小時',
    transit: '依當日位置選擇大眾運輸／計程車',
    time: '待確認',
    note: '這個景點目前不在內建資料庫。可先加入行程；實際位置、開放時間、交通方式與停留時間請再確認。',
    officialUrl: ''
  };
}

function builtInResult({ place, day, itinerary, mode }) {
  const target = chooseBuiltInPlace(place, itinerary);
  const sameDay = itinerary.filter(x => String(x?.day || '') === String(day));

  let time = target.time;
  if (time !== '待確認' && sameDay.some(x => String(x?.time || '') === time)) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(time);
    if (m) {
      let minutes = Number(m[1]) * 60 + Number(m[2]) + 120;
      minutes = Math.min(minutes, 21 * 60);
      time = String(Math.floor(minutes / 60)).padStart(2, '0') + ':' + String(minutes % 60).padStart(2, '0');
    }
  }

  let note = target.note;
  if (mode === 'replan') {
    note = '內建行程模式：' + target.note + ' 已依目前 ' + day + ' 行程做基本時段避讓；若要精細比較跨區交通，請再使用 OpenAI 模式確認。';
  }

  return {
    title: target.title,
    day,
    time,
    stayDuration: target.stay,
    transitMode: target.transit,
    locationHint: target.area,
    note,
    transitTimeToNext: '待確認',
    transitKm: '待確認',
    officialUrl: target.officialUrl || ''
  };
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response('', { status: 204, headers: corsHeaders });
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/health') {
      return json({
        ok: true,
        service: 'okinawa-ai-itinerary',
        fallbackAvailable: true
      });
    }

    if (request.method !== 'POST' || url.pathname !== '/v1/itinerary') {
      return json({ error: 'Not found' }, 404);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: '請求內容不是有效 JSON' }, 400);
    }

    const place = String(body.place || '').trim();
    const day = String(body.day || 'DAY 1').trim();
    const mode = body.mode === 'replan' ? 'replan' : 'add';
    const itinerary = Array.isArray(body.itinerary) ? body.itinerary.slice(0, 80) : [];
    const trip = body.trip && typeof body.trip === 'object' ? body.trip : {};

    if (!place) return json({ error: '請提供景點或需求' }, 400);

    const fallback = () => json({
      ok: true,
      source: 'built-in',
      message: '目前使用內建沖繩行程模式。',
      result: builtInResult({ place, day, itinerary, mode })
    });

    if (!env.OPENAI_API_KEY) return fallback();

    const system = `你是「沖繩特種兵 4 日遊」的行程規劃助手。使用繁體中文回答。
你只能根據使用者提供的旅程資料與一般穩健的旅遊常識做規劃；不要捏造精確公車班次、票價、營業時間或距離。若資料不足，填「待確認」。
請注意使用者是 2026/10/23-10/26 的沖繩旅程。
輸出必須是單一 JSON 物件，不要 Markdown，不要加說明文字。欄位固定為：
{"title":"景點名稱","day":"DAY 1","time":"10:00","stayDuration":"約 1 小時","transitMode":"大眾運輸","locationHint":"地區","note":"簡短行程提醒","transitTimeToNext":"待確認","transitKm":"待確認","officialUrl":""}
若是重新編排，仍只輸出一個最適合加入/調整的行程點；不要輸出陣列。`;

    const user = JSON.stringify({ mode, request: place, targetDay: day, trip, currentItinerary: itinerary }, null, 2);

    let upstream;
    try {
      upstream = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: env.OPENAI_MODEL || 'gpt-5.6-luna',
          input: [
            { role: 'system', content: [{ type: 'input_text', text: system }] },
            { role: 'user', content: [{ type: 'input_text', text: user }] }
          ],
          max_output_tokens: 700
        })
      });
    } catch {
      return fallback();
    }

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) return fallback();

    const text = stripJsonFence(extractOutputText(data));
    if (!text) return fallback();

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      return fallback();
    }

    return json({ ok: true, source: 'openai', result });
  }
};
