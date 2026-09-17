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

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response('', { status: 204, headers: corsHeaders });
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/health') {
      return json({ ok: true, service: 'okinawa-ai-itinerary' });
    }

    if (request.method !== 'POST' || url.pathname !== '/v1/itinerary') {
      return json({ error: 'Not found' }, 404);
    }

    if (!env.OPENAI_API_KEY) return json({ error: 'AI backend 尚未設定 OPENAI_API_KEY' }, 500);

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

    const system = `你是「沖繩特種兵 4 日遊」的行程規劃助手。使用繁體中文回答。\n你只能根據使用者提供的旅程資料與一般穩健的旅遊常識做規劃；不要捏造精確公車班次、票價、營業時間或距離。若資料不足，填「待確認」。\n請注意使用者是 2026/10/23-10/26 的沖繩旅程。\n輸出必須是單一 JSON 物件，不要 Markdown，不要加說明文字。欄位固定為：\n{"title":"景點名稱","day":"DAY 1","time":"10:00","stayDuration":"約 1 小時","transitMode":"大眾運輸","locationHint":"地區","note":"簡短行程提醒","transitTimeToNext":"待確認","transitKm":"待確認","officialUrl":""}\n若是重新編排，仍只輸出一個最適合加入/調整的行程點；不要輸出陣列。`;

    const user = JSON.stringify({ mode, request: place, targetDay: day, trip, currentItinerary: itinerary }, null, 2);

    const upstream = await fetch('https://api.openai.com/v1/responses', {
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

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return json({ error: data?.error?.message || 'OpenAI API 呼叫失敗', status: upstream.status }, 502);
    }

    const text = stripJsonFence(extractOutputText(data));
    if (!text) return json({ error: 'AI 沒有回傳內容' }, 502);

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      return json({ error: 'AI 回傳格式異常', raw: text.slice(0, 2000) }, 502);
    }

    return json({ ok: true, result });
  }
};
