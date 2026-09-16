from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
if "currentTab = 'map'" not in s:
    marker="""      <button @click="currentTab = 'finance'" :class="currentTab === 'finance' ? 'text-[#183F46] font-bold scale-105' : 'text-stone-400'" class="flex flex-col items-center flex-1 py-1 transition duration-150"><i class="fa-solid fa-wallet text-base"></i><span class="text-[10px] mt-1">分帳</span></button>"""
    nav=marker+"\n      <button @click=\"currentTab = 'map'\" :class=\"currentTab === 'map' ? 'text-[#183F46] font-bold scale-105' : 'text-stone-400'\" class=\"flex flex-col items-center flex-1 py-1 transition duration-150\"><i class=\"fa-solid fa-map-location-dot text-base\"></i><span class=\"text-[10px] mt-1\">地圖</span></button>"
    if marker not in s:
        raise SystemExit('finance nav marker not found')
    s=s.replace(marker,nav,1)
p.write_text(s,encoding='utf-8')
assert "currentTab = 'map'" in s
print('MAP NAV OK')
