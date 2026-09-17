from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')
marker = '<!-- ================= 頁籤 1: 每日行程 ================= -->'
if 'AI_ITINERARY_ASSISTANT_V1' in s:
    raise SystemExit(0)
card = '''
        <!-- AI_ITINERARY_ASSISTANT_V1 -->
        <div id="ai-itinerary-assistant" class="rounded-[28px] bg-white border border-[#DDEDEA] p-5 shadow-sm relative overflow-hidden">
          <div class="relative z-10">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-[9px] tracking-[.24em] font-black text-[#78B6B2]">AI ITINERARY MODE</div>
                <h3 class="editorial-title text-[24px] text-[#183F46] mt-1">AI 行程助手</h3>
                <p class="text-[11px] text-stone-400 mt-1 leading-relaxed">輸入想去的地方，先幫你整理景點、停留時間與交通方向；確認後再加入今天的 AI 行程。</p>
              </div>
              <div class="w-10 h-10 rounded-2xl bg-[#183F46] text-white flex items-center justify-center shrink-0"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
            </div>
            <div class="grid grid-cols-2 gap-2 mt-4">
              <button type="button" onclick="window.openAIItineraryAdd()" class="rounded-2xl bg-[#183F46] text-white py-3 text-[11px] font-black"><i class="fa-solid fa-plus mr-1"></i> AI 新增景點</button>
              <button type="button" onclick="window.openAIItineraryReplan()" class="rounded-2xl bg-[#DDEDEA] text-[#183F46] py-3 text-[11px] font-black"><i class="fa-solid fa-route mr-1"></i> AI 重新編排</button>
            </div>
            <div class="mt-3 text-[9px] text-stone-400"><i class="fa-solid fa-circle-info"></i> 接上 Google Places / Routes API 後，可自動取得距離、時間與公車路線。</div>
          </div>
        </div>
'''
if marker not in s:
    raise SystemExit('itinerary marker not found')
s = s.replace(marker, marker + card, 1)
script = '''
<script id="AI_ITINERARY_ASSISTANT_V1">
(function(){
  const known={
    '美麗海水族館':['沖繩北部代表性水族館','約 3～3.5 小時','巴士／自駕'],
    '美國村':['海濱商圈與夕陽景點','約 1.5～2 小時','巴士／計程車'],
    '波上宮':['那霸市區海崖上的神社','約 40～60 分鐘','公車／計程車'],
    '寶可夢中心':['沖繩限定 Pokémon Center 購物點','約 1 小時','計程車／單軌'],
    'PARCO CITY':['大型購物中心與電器採買點','約 2～3 小時','計程車／公車'],
    'Rycom':['大型複合商場與 KOJIMA × Bic Camera','約 2～3 小時','公車／計程車']
  };
  function close(){const x=document.getElementById('ai-itinerary-modal');if(x)x.remove()}
  function open(kind){close();const title=kind==='replan'?'AI 重新編排行程':'AI 幫我新增景點';const m=document.createElement('div');m.id='ai-itinerary-modal';m.style='position:fixed;inset:0;z-index:9999;background:rgba(24,63,70,.45);backdrop-filter:blur(8px);display:flex;align-items:flex-end;justify-content:center;padding:14px';m.innerHTML=`<div style="width:min(100%,520px);background:#f7f6f0;border-radius:28px;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,.2);max-height:88vh;overflow:auto"><div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-size:9px;letter-spacing:.22em;color:#78B6B2;font-weight:900">AI ITINERARY</div><div style="font:700 24px Georgia;color:#183F46;margin-top:4px">${title}</div></div><button onclick="window.closeAIItinerary()" style="border:0;background:white;border-radius:12px;width:36px;height:36px">×</button></div><p style="font-size:11px;color:#7a8582;line-height:1.7;margin:10px 0">輸入景點名稱，AI 先整理特色、建議停留時間與交通方向。確認後可存成 AI 行程暫存。</p><div style="display:grid;grid-template-columns:1fr 100px;gap:8px"><input id="ai-place-input" placeholder="例如：首里城、瀨長島、國際通" style="border:1px solid #dce2df;border-radius:14px;padding:12px;font-size:12px;background:white;outline:none"><select id="ai-day-input" style="border:1px solid #dce2df;border-radius:14px;padding:12px;font-size:12px;background:white"><option>DAY 1</option><option>DAY 2</option><option>DAY 3</option><option>DAY 4</option></select></div><button onclick="window.runAIItinerary()" style="width:100%;margin-top:9px;border:0;border-radius:15px;padding:12px;background:#183F46;color:white;font-weight:900;font-size:11px">開始整理</button><div id="ai-result" style="margin-top:12px"></div><div style="font-size:9px;color:#9aa29f;margin-top:10px;line-height:1.6">目前是前端 AI 行程助手預覽；正式串接 Google Places / Routes API 時，再由後端安全保存 API Key。</div></div>`;document.body.appendChild(m)}
  window.openAIItineraryAdd=()=>open('add');window.openAIItineraryReplan=()=>open('replan');window.closeAIItinerary=close;
  window.runAIItinerary=function(){const place=(document.getElementById('ai-place-input')||{}).value?.trim();const day=(document.getElementById('ai-day-input')||{}).value||'DAY 1';if(!place){document.getElementById('ai-result').innerHTML='<div style="padding:12px;border-radius:14px;background:#fff4e8;color:#9a6b3a;font-size:11px">請先輸入景點名稱。</div>';return}const k=Object.keys(known).find(x=>place.includes(x));const d=known[k]||['AI 依景點資料整理特色與注意事項','約 1～2 小時（可再調整）','Google Maps 路線'];const maps='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(place+' 沖繩');document.getElementById('ai-result').innerHTML=`<div style="background:white;border:1px solid #dce2df;border-radius:18px;padding:15px"><div style="font-size:9px;color:#78B6B2;font-weight:900">${day} · AI 整理結果</div><div style="font:700 20px Georgia;color:#183F46;margin-top:3px">${place}</div><div style="margin-top:12px;font-size:11px;color:#53615f;line-height:1.7"><b>景點特色</b><br>${d[0]}<br><br><b>建議停留</b>　${d[1]}<br><b>交通方向</b>　${d[2]}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:12px"><a href="${maps}" target="_blank" rel="noopener" style="text-align:center;text-decoration:none;border-radius:14px;padding:11px;background:#DDEDEA;color:#183F46;font-weight:900;font-size:11px">開 Google Maps</a><button onclick="window.aiSaveStop(${JSON.stringify(place)},${JSON.stringify(day)})" style="border:0;border-radius:14px;padding:11px;background:#78B6B2;color:white;font-weight:900;font-size:11px">加入 AI 暫存</button></div></div>`}
  window.aiSaveStop=function(place,day){const a=JSON.parse(localStorage.getItem('okinawa_ai_stops')||'[]');a.push({place,day,createdAt:new Date().toISOString()});localStorage.setItem('okinawa_ai_stops',JSON.stringify(a));alert('已加入 AI 行程暫存。')};
})();
</script>
'''
s = s.replace('</body>', script + '</body>', 1)
p.write_text(s, encoding='utf-8')
