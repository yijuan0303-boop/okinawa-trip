from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

# Expose the real Vue itinerary state so the AI helper never treats an empty
# localStorage key as the source of truth. The original app stores the live
# itinerary in the Vue ref `itineraryList` and persists it with saveData().
marker = 'AI_VUE_BRIDGE_V1'
if marker not in s:
    needle = '\n        return {\n          currentTab,'
    bridge = '''\n        // AI_VUE_BRIDGE_V1: expose the live Vue itinerary to the AI helper.\n        window.__okiAI = {\n          getItinerary: () => itineraryList.value,\n          getTripInfo: () => tripInfo.value,\n          save: () => saveData()\n        };\n'''
    if needle not in s:
        raise SystemExit('Could not find the Vue setup return block')
    s = s.replace(needle, bridge + needle, 1)

    runtime = r'''<script id="AI_VUE_BRIDGE_RUNTIME_V1">
(function(){
  const bridge=()=>window.__okiAI;
  const read=(key,def)=>{try{const x=JSON.parse(localStorage.getItem(key)||'null');return x??def}catch(e){return def}};
  const endpoint=()=>String(localStorage.getItem('okinawa_ai_endpoint')||'').trim().replace(/\/$/,'');
  const result=()=>document.getElementById('ai-result');
  const modal=()=>document.getElementById('ai-itinerary-modal');
  const showErr=(msg)=>{const e=result();if(e)e.innerHTML='<div style="padding:14px;border-radius:16px;background:#fff4e8;color:#9a6b3a;font-size:11px;line-height:1.7">AI 暫時無法回覆。<br>'+String(msg||'連線失敗').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))+'</div>'};

  // Keep the original AI UI, but synchronize its storage input from the live
  // Vue ref immediately before the request. This prevents an empty/stale
  // localStorage key from hiding the four-day itinerary.
  const originalRun=window.runAIItinerary;
  if(typeof originalRun==='function'){
    window.runAIItinerary=async function(){
      const b=bridge(), list=b?.getItinerary?.();
      if(!Array.isArray(list)||!list.length){showErr('目前頁面沒有可供 AI 參考的行程。');return;}
      localStorage.setItem('oki_sleek_itin',JSON.stringify(list));
      const ti=b?.getTripInfo?.();
      if(ti) localStorage.setItem('oki_sleek_tripinfo',JSON.stringify(ti));
      return originalRun.apply(this,arguments);
    };
  }

  // The original save handler is now safe because the request above has
  // synchronized storage from Vue. After it writes, the page reloads and the
  // normal Vue loadData() restores the complete four-day list.
  window.__okiAIBridgeReady=true;
})();
</script>
'''
    s = s.replace('</body>', runtime + '\n</body>', 1)

p.write_text(s, encoding='utf-8')
