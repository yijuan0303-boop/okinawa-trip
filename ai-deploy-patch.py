from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

# Remove the old alert() suppression so normal browser dialogs are available elsewhere.
s = s.replace('<script>window.alert = function() {};</script>\n', '')
s = s.replace('<script>window.alert = function() {};</script>', '')

# Keep the visible, in-card AI connection test idempotent. This workflow can
# run more than once after a push, so never inject the same function twice.
needle = "window.openAIItineraryAdd=()=>open('add');window.openAIItineraryReplan=()=>open('replan');window.closeAIItinerary=close;window.configureAI=configure;window.testAI=test;window.runAIItinerary=run;"
if needle in s and "window.testAI = async function(){" not in s:
    replacement = needle + r'''
  window.testAI = async function(){
    const card = document.getElementById('ai-itinerary-assistant');
    const info = document.getElementById('ai-connection-status');
    let result = document.getElementById('ai-test-result');
    if (!result && card) {
      result = document.createElement('div');
      result.id = 'ai-test-result';
      result.style = 'margin-top:8px;padding:10px 12px;border-radius:12px;background:#f7f6f0;color:#7a8582;font-size:10px;line-height:1.6';
      card.querySelector('.relative.z-10')?.appendChild(result);
    }
    const base = endpoint();
    if (!base) {
      if (info) info.textContent = 'AI 尚未連線';
      if (result) {
        result.style.background = '#fff4e8';
        result.style.color = '#9a6b3a';
        result.textContent = '尚未設定 AI Worker 網址，請先按「AI 連線設定」。';
      }
      return false;
    }
    if (info) info.textContent = 'AI 測試中…';
    if (result) {
      result.style.background = '#f7f6f0';
      result.style.color = '#7a8582';
      result.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 正在測試網站 → Cloudflare Worker → AI 後端…';
    }
    try {
      const r = await fetch(base + '/health?ts=' + Date.now(), { cache:'no-store', headers:{'Accept':'application/json'} });
      const text = await r.text();
      let data = {};
      try { data = JSON.parse(text || '{}'); } catch (_) {}
      if (!r.ok) throw new Error('HTTP ' + r.status + (data.error ? ' · ' + data.error : ''));
      if (info) info.textContent = 'AI 後端已連線';
      if (result) {
        result.style.background = '#e8f5f2';
        result.style.color = '#183F46';
        result.innerHTML = '<b>🟢 AI 後端連線成功</b><br>Worker：' + escapeHtml(base) + '<br>回應：' + escapeHtml(data.message || data.status || 'OK');
      }
      return true;
    } catch (e) {
      if (info) info.textContent = 'AI 連線失敗';
      if (result) {
        result.style.background = '#fff4e8';
        result.style.color = '#9a6b3a';
        result.innerHTML = '<b>🔴 AI 後端連線失敗</b><br>' + escapeHtml(e.message || '連線失敗') + '<br><span style="font-size:9px">請確認 Worker 網址、/health 路徑與 Cloudflare 部署狀態。</span>';
      }
      return false;
    }
  };
'''
    s = s.replace(needle, replacement, 1)

p.write_text(s, encoding='utf-8')
