from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')
s = s.replace('<script>window.alert = function() {};</script>\n', '')
s = s.replace('<script>window.alert = function() {};</script>', '')

# The original AI UI remains untouched. This small layer replaces only the AI
# interaction functions so existing itinerary data and the rest of the Vue app
# are preserved.
if 'AI_ITINERARY_REPAIR_V2' not in s:
    script = r'''
<script id="AI_ITINERARY_REPAIR_V2">
(function(){
  const esc=(v)=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const endpoint2=()=>String(localStorage.getItem('okinawa_ai_endpoint')||'').trim().replace(/\/$/,'');
  const getItinerary=()=>{try{const x=JSON.parse(localStorage.getItem('oki_sleek_itin')||'[]');return Array.isArray(x)?x:[]}catch(e){return []}};
  const getTrip=()=>{try{return JSON.parse(localStorage.getItem('oki_sleek_tripinfo')||'{}')}catch(e){return {}}};
  const modal=()=>document.getElementById('ai-itinerary-modal');
  const resultEl=()=>document.getElementById('ai-result');

  function showError(message){
    const el=resultEl();
    if(el)el.innerHTML='<div style="padding:14px;border-radius:16px;background:#fff4e8;color:#9a6b3a;font-size:11px;line-height:1.7">AI 暫時無法回覆。<br>'+esc(message||'連線失敗')+'</div>';
  }

  window.runAIItinerary=async function(){
    const placeEl=document.getElementById('ai-place-input');
    const dayEl=document.getElementById('ai-day-input');
    const place=(placeEl?.value||'').trim();
    const day=dayEl?.value||'DAY 1';
    const el=resultEl();
    if(!place){if(el)el.innerHTML='<div style="padding:12px;border-radius:14px;background:#fff4e8;color:#9a6b3a;font-size:11px">請先輸入景點或需求。</div>';return;}
    const base=endpoint2();
    if(!base){showError('尚未設定 AI Worker，請先按「設定 AI 連線」。');return;}
    const mode=modal()?.dataset.mode||'add';
    if(el)el.innerHTML='<div style="padding:14px;border-radius:16px;background:white;color:#7a8582;font-size:11px"><i class="fa-solid fa-spinner fa-spin"></i> AI 正在分析目前行程，尋找順路位置…</div>';
    try{
      const r=await fetch(base+'/v1/itinerary',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode,place,day,trip:getTrip(),itinerary:getItinerary()})});
      const data=await r.json().catch(()=>({}));
      if(!r.ok||!data.ok)throw new Error(data.error||('HTTP '+r.status));
      window.__aiPendingResult=data.result||{};
      window.__aiReordered=Array.isArray(data.reorderedItinerary)?data.reorderedItinerary:[];
      window.__aiSource=data.source||'built-in';
      render(data.result||{},day,place,mode,window.__aiReordered,window.__aiSource);
    }catch(e){showError(e.message||'連線失敗');}
  };

  function render(r,day,place,mode,reordered,source){
    const el=resultEl();if(!el)return;
    const title=r.title||place;
    const maps='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(title+' 沖繩');
    const sourceLabel=source==='openai'?'✨ OpenAI AI':'🟡 免費備援模式';
    if(mode==='replan'){
      const list=reordered.length?reordered:[r];
      el.innerHTML='<div style="background:white;border:1px solid #dce2df;border-radius:18px;padding:15px">'
        +'<div style="font-size:9px;color:#78B6B2;font-weight:900">'+esc(day)+' · '+sourceLabel+'</div>'
        +'<div style="font:700 20px Georgia;color:#183F46;margin-top:3px">AI 順路重新編排</div>'
        +'<div style="font-size:10px;color:#7a8582;margin-top:5px;line-height:1.6">AI 會保留其他日期，只重新整理你指定的 '+esc(day)+'；實際公車班次與即時路況仍需另外確認。</div>'
        +'<div style="margin-top:12px">'+list.map((x,i)=>'<div style="display:flex;gap:9px;align-items:flex-start;padding:9px 0;border-top:1px solid #edf0ee"><div style="width:46px;text-align:right;font-weight:900;color:#183F46;font-size:11px">'+esc(x.time||'待定')+'</div><div style="width:8px;height:8px;margin-top:4px;border-radius:50%;background:#78B6B2;flex:0 0 auto"></div><div style="flex:1;font-size:11px;color:#53615f"><b style="color:#183F46">'+esc(x.title||'行程')+'</b><br><span style="font-size:9px">'+esc(x.locationHint||'')+' · '+esc(x.stayDuration||'')+'</span></div></div>').join('')+'</div>'
        +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:12px"><button type="button" onclick="window.applyAIReplan()" style="border:0;border-radius:14px;padding:11px;background:#78B6B2;color:white;font-weight:900;font-size:11px">套用重新編排</button><button type="button" onclick="window.closeAIItinerary()" style="border:1px solid #dce2df;border-radius:14px;padding:11px;background:white;color:#183F46;font-weight:900;font-size:11px">先不要變更</button></div>'
        +'</div>';
      return;
    }
    el.innerHTML='<div style="background:white;border:1px solid #dce2df;border-radius:18px;padding:15px">'
      +'<div style="font-size:9px;color:#78B6B2;font-weight:900">'+esc(r.day||day)+' · '+sourceLabel+'</div>'
      +'<div style="font:700 20px Georgia;color:#183F46;margin-top:3px">'+esc(title)+'</div>'
      +'<div style="margin-top:12px;font-size:11px;color:#53615f;line-height:1.75"><b>建議時間</b>　'+esc(r.time||'待確認')+'<br><b>建議停留</b>　'+esc(r.stayDuration||'待確認')+'<br><b>交通方向</b>　'+esc(r.transitMode||'待確認')+'<br><b>地點</b>　'+esc(r.locationHint||'待確認')+'<br><b>行程提醒</b><br>'+esc(r.note||'')+'</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:12px"><a href="'+maps+'" target="_blank" rel="noopener" style="text-align:center;text-decoration:none;border-radius:14px;padding:11px;background:#DDEDEA;color:#183F46;font-weight:900;font-size:11px">開 Google Maps</a><button type="button" onclick="window.aiSaveStop()" style="border:0;border-radius:14px;padding:11px;background:#78B6B2;color:white;font-weight:900;font-size:11px">加入今天行程</button></div>'
      +'</div>';
  }

  window.aiSaveStop=function(){
    const r=window.__aiPendingResult||{};
    const list=getItinerary();
    const n=Number(String(r.day||document.getElementById('ai-day-input')?.value||'DAY 1').replace(/\D/g,''))||1;
    const item={day:n,time:r.time||'12:00',stayDuration:r.stayDuration||'1 小時',transitTimeToNext:r.transitTimeToNext||'待確認',transitKm:r.transitKm||'待確認',title:r.title||'AI 建議景點',transitMode:r.transitMode||'大眾運輸',locationHint:r.locationHint||'沖繩本島',officialUrl:r.officialUrl||'',note:r.note||'AI 建議行程'};
    list.push(item);
    localStorage.setItem('oki_sleek_itin',JSON.stringify(list));
    localStorage.setItem('oki_sleek_active_day',String(n));
    const el=resultEl();if(el)el.innerHTML='<div style="padding:16px;border-radius:16px;background:#e8f5f2;color:#183F46;font-size:11px;line-height:1.7;text-align:center"><b>🟢 已加入 DAY '+n+' 行程</b><br>'+esc(item.title)+' 已保留原本行程，新增景點不會覆蓋其他行程。</div>';
    setTimeout(()=>location.reload(),500);
  };

  window.applyAIReplan=function(){
    const reordered=Array.isArray(window.__aiReordered)?window.__aiReordered:[];
    if(!reordered.length)return;
    const day=Number(String(reordered[0]?.day||document.getElementById('ai-day-input')?.value||'DAY 1').replace(/\D/g,''))||1;
    const old=getItinerary();
    const keep=old.filter(x=>Number(x?.day)!==day);
    const clean=reordered.map(x=>({day:Number(x.day)||day,time:x.time||'12:00',stayDuration:x.stayDuration||'1 小時',transitTimeToNext:x.transitTimeToNext||'待確認',transitKm:x.transitKm||'待確認',title:x.title||'AI 行程',transitMode:x.transitMode||'大眾運輸',locationHint:x.locationHint||'沖繩本島',officialUrl:x.officialUrl||'',note:x.note||''}));
    localStorage.setItem('oki_sleek_itin',JSON.stringify(keep.concat(clean)));
    localStorage.setItem('oki_sleek_active_day',String(day));
    const el=resultEl();if(el)el.innerHTML='<div style="padding:16px;border-radius:16px;background:#e8f5f2;color:#183F46;font-size:11px;line-height:1.7;text-align:center"><b>🟢 '+esc('DAY '+day)+' 已重新編排</b><br>其他天的行程沒有被修改。</div>';
    setTimeout(()=>location.reload(),500);
  };

  window.testAI=async function(){
    const card=document.getElementById('ai-itinerary-assistant');
    const info=document.getElementById('ai-connection-status');
    let out=document.getElementById('ai-test-result');
    if(!out&&card){out=document.createElement('div');out.id='ai-test-result';out.style='margin-top:8px;padding:10px 12px;border-radius:12px;background:#f7f6f0;color:#7a8582;font-size:10px;line-height:1.6';card.querySelector('.relative.z-10')?.appendChild(out);}
    const base=endpoint2();
    if(!base){if(info)info.textContent='AI 尚未連線';if(out)out.textContent='尚未設定 AI Worker 網址，請先按「AI 連線設定」。';return false;}
    if(info)info.textContent='AI 測試中…';
    try{const r=await fetch(base+'/health?ts='+Date.now(),{cache:'no-store'});const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error('HTTP '+r.status);if(info)info.textContent='AI 後端已連線';if(out){out.style.background='#e8f5f2';out.style.color='#183F46';out.innerHTML='<b>🟢 AI 後端連線成功</b><br>Worker：'+esc(base)+'<br>回應：'+esc(data.message||'OK');}return true;}catch(e){if(info)info.textContent='AI 連線失敗';if(out){out.style.background='#fff4e8';out.style.color='#9a6b3a';out.textContent='🔴 '+(e.message||'連線失敗');}return false;}
  };
})();
</script>
'''
    s = s.replace('</body>', script + '</body>', 1)

p.write_text(s, encoding='utf-8')
