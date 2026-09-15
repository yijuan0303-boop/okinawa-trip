from pathlib import Path
import re

p = Path('index.html')
s = p.read_text(encoding='utf-8')

def once(old, new, label):
    global s
    if old not in s:
        raise SystemExit(f'missing anchor: {label}')
    s = s.replace(old, new, 1)

# 1) Homepage tab
once("const currentTab = ref('itinerary');", "const currentTab = ref('overview');", 'currentTab')

# 2) Overview section
marker = '      <!-- ================= 頁籤 1: 每日行程 ================= -->'
overview = '''      <!-- ================= 總覽 ================= -->
      <section v-if="currentTab === 'overview'" class="space-y-5">
        <div class="px-1 pt-1">
          <div class="text-[10px] tracking-[.22em] text-stone-400 font-bold uppercase">TRIP OVERVIEW</div>
          <h2 class="editorial-title text-[30px] text-[#183F46] mt-1">旅程總覽</h2>
          <p class="text-[11px] text-stone-400 mt-2">{{ tripInfo.dates }} · 沖繩 4 日旅行手帳</p>
        </div>
        <div class="rounded-[28px] bg-[#183F46] text-white p-5 relative overflow-hidden">
          <div class="relative z-10">
            <div class="text-[9px] tracking-[.25em] opacity-70">OKINAWA · 2026</div>
            <div class="editorial-title text-[26px] mt-2">{{ tripInfo.title }}</div>
            <div class="text-[11px] opacity-75 mt-2">{{ tripInfo.subtitle }}</div>
          </div>
          <div class="island-glow"></div>
        </div>
        <div class="space-y-2">
          <button v-for="d in 4" :key="d" @click="activeDay = d; currentTab = 'itinerary'" class="w-full text-left bg-white border border-stone-200 rounded-2xl p-4 flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-[#DDEDEA] text-[#183F46] flex flex-col items-center justify-center shrink-0">
              <span class="text-[8px] font-bold">DAY</span><span class="text-[17px] font-black leading-none">{{ d }}</span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-[9px] text-stone-400">{{ getDayDate(d) }} · {{ getDayWeekday(d) }}</div>
              <div class="text-[15px] font-black text-[#183F46] mt-1">{{ getDayStrategy(d).title }}</div>
              <div class="text-[10px] text-stone-400 mt-1 truncate">{{ itineraryList.filter(x => x.day === d).length }} 個行程點</div>
            </div>
            <i class="fa-solid fa-chevron-right text-[10px] text-stone-300"></i>
          </button>
        </div>
      </section>

'''
if marker not in s:
    raise SystemExit('missing anchor: overview marker')
s = s.replace(marker, overview + marker, 1)

# 3) Bottom navigation: replace the existing nav block only
nav_re = re.compile(r'    <!-- 底部導覽列[^\n]*-->\s*<nav class="fixed bottom-0[\s\S]*?</nav>', re.M)
nav = '''    <!-- 底部導覽列 -->
    <nav class="fixed bottom-0 max-w-md w-full bottom-glass border-t border-stone-200 py-2.5 px-2 z-40 flex justify-around items-center">
      <button @click="currentTab = 'overview'" :class="currentTab === 'overview' ? 'text-[#183F46] font-bold scale-105' : 'text-stone-400'" class="flex flex-col items-center flex-1 py-1 transition duration-150"><i class="fa-solid fa-compass text-base"></i><span class="text-[10px] mt-1">總覽</span></button>
      <button @click="currentTab = 'itinerary'" :class="currentTab === 'itinerary' ? 'text-[#183F46] font-bold scale-105' : 'text-stone-400'" class="flex flex-col items-center flex-1 py-1 transition duration-150"><i class="fa-solid fa-calendar-days text-base"></i><span class="text-[10px] mt-1">行程</span></button>
      <button @click="currentTab = 'malls'" :class="currentTab === 'malls' ? 'text-[#183F46] font-bold scale-105' : 'text-stone-400'" class="flex flex-col items-center flex-1 py-1 transition duration-150"><i class="fa-solid fa-building-flag text-base"></i><span class="text-[10px] mt-1">百貨</span></button>
      <button @click="currentTab = 'guide'" :class="currentTab === 'guide' ? 'text-[#183F46] font-bold scale-105' : 'text-stone-400'" class="flex flex-col items-center flex-1 py-1 transition duration-150"><i class="fa-solid fa-suitcase-rolling text-base"></i><span class="text-[10px] mt-1">旅前</span></button>
      <button @click="currentTab = 'finance'" :class="currentTab === 'finance' ? 'text-[#183F46] font-bold scale-105' : 'text-stone-400'" class="flex flex-col items-center flex-1 py-1 transition duration-150"><i class="fa-solid fa-wallet text-base"></i><span class="text-[10px] mt-1">分帳</span></button>
      <button @click="currentTab = 'coupons'" :class="currentTab === 'coupons' ? 'text-[#183F46] font-bold scale-105' : 'text-stone-400'" class="flex flex-col items-center flex-1 py-1 transition duration-150"><i class="fa-solid fa-ticket text-base"></i><span class="text-[10px] mt-1">優惠券</span></button>
    </nav>'''
if not nav_re.search(s):
    raise SystemExit('missing anchor: bottom nav')
s = nav_re.sub(nav, s, count=1)

# 4) Itinerary departure time field and data wiring
once("        const itineraryForm = ref({\n          title: '',\n          time: '',", "        const itineraryForm = ref({\n          title: '',\n          departureTime: '',\n          time: '',", 'itinerary form')
once("          itineraryForm.value = {\n            title: '',\n            time: '12:00',", "          itineraryForm.value = {\n            title: '',\n            departureTime: '',\n            time: '12:00',", 'add itinerary form')
once("          itineraryForm.value = {\n            title: item.title,\n            time: item.time,", "          itineraryForm.value = {\n            title: item.title,\n            departureTime: item.departureTime || '',\n            time: item.time,", 'edit itinerary form')
once("            editingTarget.value.time = itineraryForm.value.time;", "            editingTarget.value.departureTime = itineraryForm.value.departureTime || '';\n            editingTarget.value.time = itineraryForm.value.time;", 'edit save departure')
once("            itineraryList.value.push({\n              day: activeDay.value,\n              time: itineraryForm.value.time || '12:00',", "            itineraryList.value.push({\n              day: activeDay.value,\n              departureTime: itineraryForm.value.departureTime || '',\n              time: itineraryForm.value.time || '12:00',", 'new save departure')

# Timeline display
once('<div class="timeline-time">{{ item.time }}</div>', '<div class="timeline-time"><div v-if="item.departureTime" class="text-[9px] text-[#78B6B2] mb-0.5">出發 {{ item.departureTime }}</div><div>{{ item.time }}</div></div>', 'timeline departure')

# Modal: add departure field before arrival field
arrival = '<div class="grid grid-cols-3 gap-2">\n          <div>\n            <label class="text-[10px] text-stone-500 font-bold block mb-1">抵達時間</label>'
dep = '<div class="grid grid-cols-3 gap-2">\n          <div>\n            <label class="text-[10px] text-stone-500 font-bold block mb-1">出發時間</label>\n            <input v-model="itineraryForm.departureTime" type="time" class="w-full bg-stone-50 p-2.5 rounded-xl text-xs border border-stone-200 outline-none font-mono">\n          </div>\n          <div>\n            <label class="text-[10px] text-stone-500 font-bold block mb-1">抵達時間</label>'
once(arrival, dep, 'departure input')

# 5) Finance: show last update and silence the exchange-rate alert
rate_line = '匯率來源：臺灣銀行牌告匯率。新增日圓支出時會記住當下匯率，不會因之後更新匯率而改變舊帳。'
once(rate_line, rate_line + '<span v-if="botRateUpdated" class="block mt-1 text-stone-400">最後更新：{{ botRateUpdated }}</span>', 'rate update time')
once("alert('目前無法取得臺銀匯率，請稍後再試。');", "console.warn('目前無法取得臺銀匯率，請稍後再試。');", 'rate alert')

# Sanity checks
checks = [
    "const currentTab = ref('overview');",
    '總覽', '出發時間', '最後更新：{{ botRateUpdated }}',
    "currentTab = 'itinerary'", "currentTab = 'finance'", "currentTab = 'coupons'"
]
for c in checks:
    if c not in s:
        raise SystemExit(f'validation failed: {c}')
if s.count('<nav class="fixed bottom-0') != 1:
    raise SystemExit('validation failed: nav count')
if s.count("const currentTab = ref('") != 1:
    raise SystemExit('validation failed: currentTab declaration count')

p.write_text(s, encoding='utf-8')
print('UI patch applied and validated')
