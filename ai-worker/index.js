const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json; charset=utf-8'
};

const PLACES = [
  ['首里城',['首里城','首里'],'那霸・首里','09:30','約 1.5～2 小時','單軌電車＋步行','適合那霸市區半日行程前段。','https://oki-park.jp/shurijo/'],
  ['波上宮',['波上宮','波之上','波上'],'那霸・若狹','08:30','約 45～60 分鐘','公車＋步行／計程車','靠近那霸市區與海邊，可與市區景點串接。','https://naminouegu.jp/'],
  ['國際通',['國際通','國際通り'],'那霸・牧志','16:00','約 1.5～3 小時','單軌電車＋步行','適合購物、晚餐與伴手禮。','https://naha-kokusaidori.okinawa/'],
  ['Pokémon Center OKINAWA',['寶可夢中心','pokemon center','pokemon','pokemon center okinawa'],'浦添・PARCO CITY','11:00','約 1～1.5 小時','公車／計程車','與 PARCO CITY 串成同區行程，可減少跨區移動。','https://www.pokemon.co.jp/shop/pokemongoods/okinawa/'],
  ['サンエー浦添西海岸 PARCO CITY',['parco','parco city','浦添parco'],'浦添・西海岸','13:00','約 2～3 小時','公車／計程車','大型商場，適合與 Pokémon Center 一起安排。','https://www.parcocity.jp/'],
  ['瀨長島 Umikaji Terrace',['瀨長島','瀬長島','umihotaru'],'豐見城・瀨長島','15:30','約 1.5～2 小時','公車／計程車','靠近機場，適合抵達日或離境日前後。','https://www.umikajiterrace.com/'],
  ['美國村',['美國村','american village','americanvillage'],'北谷','15:00','約 2～3 小時','公車／計程車','適合下午至傍晚，可與北谷海邊串接。','https://www.okinawa-americanvillage.com/'],
  ['沖繩美麗海水族館',['美麗海','美麗海水族館','沖繩美麗海水族館','churaumi'],'本部・海洋博公園','10:00','約 2～3 小時','租車／巴士','北部長距離景點，適合與北部行程一起規劃。','https://churaumi.okinawa/'],
  ['古宇利島',['古宇利島','古宇利','kouri'],'今歸仁・古宇利','13:30','約 1.5～2 小時','租車／巴士','適合和美麗海等北部景點串聯。','https://www.nakijin.jp/'],
  ['沖繩世界・玉泉洞',['玉泉洞','沖繩世界','okinawa world'],'南城','10:00','約 2～3 小時','公車／租車','適合南部半日行程。','https://www.gyokusendo.co.jp/'],
  ['DMM Kariyushi 水族館',['dmm','kariyushi','dmm kariyushi'],'豐見城','10:30','約 1.5～2 小時','公車／計程車','適合和豐崎、瀨長島串接。','https://kariyushi-aquarium.com/'],
  ['沖繩 Outlet Mall ASHIBINAA',['ashibinaa','ashibinaa outlet','outlet'],'豐見城・豐崎','13:00','約 2～3 小時','公車／計程車','適合購物半日，可與機場、瀨長島搭配。','https://www.ashibinaa.com/']
].map(([title,keys,area,time,stay,transit,note,officialUrl])=>({title,keys,area,time,stay,transit,note,officialUrl}));

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:corsHeaders});}
function norm(v){return String(v||'').toLowerCase().replace(/\s+/g,'').trim();}
function findPlace(q){const n=norm(q);let best=null;let len=0;for(const p of PLACES){for(const k of p.keys){const kk=norm(k);if(kk&&n.includes(kk)&&kk.length>len){best=p;len=kk.length;}}}return best;}
function genericPlace(q){return {title:String(q||'沖繩景點').trim(),area:'沖繩',time:'待確認',stay:'約 1～2 小時',transit:'依當日位置選擇大眾運輸／計程車',note:'目前沒有這個地點的內建資料；請再確認實際位置、營業時間與交通。',officialUrl:''};}
function areaRank(area){const a=norm(area);if(a.includes('本部')||a.includes('今歸仁')||a.includes('北谷'))return 5;if(a.includes('浦添'))return 4;if(a.includes('南城'))return 3;if(a.includes('豐見城'))return 2;if(a.includes('那霸'))return 1;return 3;}
function timeToMin(t){const m=/^(\d{1,2}):(\d{2})$/.exec(String(t||''));return m?Number(m[1])*60+Number(m[2]):9999;}
function placeFromItem(x){const p=findPlace(x?.title||x?.name||'');return p||{title:x?.title||x?.name||'行程',area:x?.locationHint||'沖繩',time:x?.time||'待確認',stay:x?.stayDuration||'待確認',transit:x?.transitMode||'待確認',note:x?.note||'',officialUrl:x?.officialUrl||''};}
function toItem(p,day,timeOverride){return {day,time:timeOverride||p.time||'待確認',stayDuration:p.stay,transitTimeToNext:'待確認',transitKm:'待確認',title:p.title,transitMode:p.transit,locationHint:p.area,officialUrl:p.officialUrl||'',note:p.note};}
function fallbackAdd(place,day,itinerary){const p=findPlace(place)||genericPlace(place);const same=itinerary.filter(x=>String(x?.day||'')===String(day));let time=p.time;if(time!=='待確認'&&same.some(x=>String(x?.time||'')===time)){let m=timeToMin(time)+120;time=String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0');}return {title:p.title,day,time,stayDuration:p.stay,transitMode:p.transit,locationHint:p.area,note:p.note+' 新增景點後，可再使用「AI 重新編排」把同區域景點集中。',transitTimeToNext:'待確認',transitKm:'待確認',officialUrl:p.officialUrl||''};}
function fallbackReplan(day,itinerary,newPlace){const list=itinerary.filter(x=>String(x?.day||'')===String(day)).map(placeFromItem);const p=findPlace(newPlace)||genericPlace(newPlace);list.push(p);list.sort((a,b)=>areaRank(a.area)-areaRank(b.area)||timeToMin(a.time)-timeToMin(b.time));let cursor=9*60;const out=list.map((x,i)=>{let t=timeToMin(x.time);if(t===9999||t<cursor)t=cursor;cursor=t+Math.max(45,parseInt(String(x.stay).match(/\d+/)?.[0]||60,10));return toItem(x,day,String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0'));});return out;}
function extractText(data){if(typeof data?.output_text==='string')return data.output_text.trim();return (data?.output||[]).flatMap(i=>i?.content||[]).map(c=>c?.text).filter(Boolean).join('\n').trim();}

async function openaiPlan(env,mode,place,day,itinerary,trip){
  if(!env.OPENAI_API_KEY)return null;
  const schema={type:'object',properties:{result:{type:'object',properties:{title:{type:'string'},day:{type:'string'},time:{type:'string'},stayDuration:{type:'string'},transitMode:{type:'string'},locationHint:{type:'string'},note:{type:'string'},transitTimeToNext:{type:'string'},transitKm:{type:'string'},officialUrl:{type:'string'}},required:['title','day','time','stayDuration','transitMode','locationHint','note','transitTimeToNext','transitKm','officialUrl'],additionalProperties:false},reorderedItinerary:{type:'array',items:{type:'object',properties:{day:{type:'number'},time:{type:'string'},stayDuration:{type:'string'},transitTimeToNext:{type:'string'},transitKm:{type:'string'},title:{type:'string'},transitMode:{type:'string'},locationHint:{type:'string'},officialUrl:{type:'string'},note:{type:'string'}},required:['day','time','stayDuration','transitTimeToNext','transitKm','title','transitMode','locationHint','officialUrl','note'],additionalProperties:false}},required:['result','reorderedItinerary'],additionalProperties:false};
  const prompt=`你是沖繩旅遊行程規劃助手。請根據使用者目前已安排的行程，新增「${place}」到 ${day}，並依地理區域、既有時間、停留時間與避免來回折返的原則安排。mode=${mode}。若 mode=replan，請重新排序該日全部行程；若 mode=add，仍請在 result 給出合理的新增時間。不要虛構即時公車班次、票價或即時路況。\n目前行程：${JSON.stringify(itinerary)}\n旅行資訊：${JSON.stringify(trip)}\n請只回傳符合 schema 的 JSON。`;
  const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Authorization':`Bearer ${env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:env.OPENAI_MODEL||'gpt-5.6-luna',input:prompt,store:false,text:{format:{type:'json_schema',name:'okinawa_itinerary',strict:true,schema}}})});
  if(!r.ok)throw new Error('OpenAI HTTP '+r.status);
  const data=await r.json();const text=extractText(data);if(!text)throw new Error('OpenAI 沒有回傳內容');return JSON.parse(text);
}

export default {async fetch(request,env){if(request.method==='OPTIONS')return new Response('',{status:204,headers:corsHeaders});const url=new URL(request.url);if(request.method==='GET'&&url.pathname==='/health')return json({ok:true,service:'okinawa-ai-itinerary',fallbackAvailable:true});if(request.method!=='POST'||url.pathname!=='/v1/itinerary')return json({error:'Not found'},404);let body;try{body=await request.json();}catch{return json({error:'請求內容不是有效 JSON'},400);}const place=String(body.place||'').trim();const day=String(body.day||'DAY 1').trim();const mode=body.mode==='replan'?'replan':'add';const itinerary=Array.isArray(body.itinerary)?body.itinerary.slice(0,80):[];const trip=body.trip&&typeof body.trip==='object'?body.trip:{};if(!place)return json({error:'請輸入景點或需求'},400);
  try{const ai=await openaiPlan(env,mode,place,day,itinerary,trip);if(ai)return json({ok:true,source:'openai',result:ai.result,reorderedItinerary:Array.isArray(ai.reorderedItinerary)?ai.reorderedItinerary:[]});}catch(e){/* fall through to free mode */}
  const result=mode==='replan'?fallbackReplan(day,itinerary,place):fallbackAdd(place,day,itinerary);const reordered=mode==='replan'?result:[];return json({ok:true,source:'built-in',result:mode==='replan'?(result[0]||fallbackAdd(place,day,itinerary)):result,reorderedItinerary:reordered});
}};
