const corsHeaders={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Methods':'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers':'Content-Type',
  'Content-Type':'application/json; charset=utf-8'
};

const PLACES=[
['首里城',['首里城','首里'],'那霸・首里','09:30','約 1.5～2 小時','單軌電車＋步行','適合那霸市區半日行程前段。','https://oki-park.jp/shurijo/'],
['波上宮',['波上宮','波之上','波上'],'那霸・若狹','08:30','約 45～60 分鐘','公車＋步行／計程車','靠近那霸市區與海邊，可與市區景點串接。','https://naminouegu.jp/'],
['國際通',['國際通','國際通り'],'那霸・牧志','16:00','約 1.5～3 小時','單軌電車＋步行','適合購物、晚餐與伴手禮。','https://naha-kokusaidori.okinawa/'],
['Pokémon Center OKINAWA',['寶可夢中心','pokemon center','pokemon','pokemon center okinawa'],'浦添・PARCO CITY','11:00','約 1～1.5 小時','公車／計程車','位於 PARCO CITY，同區安排可減少跨區移動。','https://www.pokemon.co.jp/shop/pokemongoods/okinawa/'],
['サンエー浦添西海岸 PARCO CITY',['parco','parco city','浦添parco','浦添西海岸'],'浦添・西海岸','13:00','約 2～3 小時','公車／計程車','大型商場，適合與 Pokémon Center 一起安排。','https://www.parcocity.jp/'],
['瀨長島 Umikaji Terrace',['瀨長島','瀬長島','umikaji'],'豐見城・瀨長島','15:30','約 1.5～2 小時','公車／計程車','靠近機場，適合抵達日或離境日前後。','https://www.umikajiterrace.com/'],
['美國村',['美國村','american village','americanvillage'],'北谷','15:00','約 2～3 小時','公車／計程車','適合下午至傍晚，可與北谷海邊串接。','https://www.okinawa-americanvillage.com/'],
['沖繩美麗海水族館',['美麗海','美麗海水族館','沖繩美麗海水族館','churaumi'],'本部・海洋博公園','10:00','約 2～3 小時','租車／巴士','北部長距離景點，適合與北部行程一起規劃。','https://churaumi.okinawa/'],
['古宇利島',['古宇利島','古宇利','kouri'],'今歸仁・古宇利','13:30','約 1.5～2 小時','租車／巴士','適合和美麗海等北部景點串聯。','https://www.nakijin.jp/'],
['沖繩世界・玉泉洞',['玉泉洞','沖繩世界','okinawa world'],'南城','10:00','約 2～3 小時','公車／租車','適合南部半日行程。','https://www.gyokusendo.co.jp/'],
['DMM Kariyushi 水族館',['dmm','kariyushi','dmm kariyushi'],'豐見城','10:30','約 1.5～2 小時','公車／計程車','適合和豐崎、瀨長島串接。','https://kariyushi-aquarium.com/'],
['沖繩 Outlet Mall ASHIBINAA',['ashibinaa','ashibinaa outlet','outlet'],'豐見城・豐崎','13:00','約 2～3 小時','公車／計程車','適合購物半日，可與機場、瀨長島搭配。','https://www.ashibinaa.com/'],
['波之上沙灘',['波之上沙灘','波上沙灘','naminoue beach'],'那霸・若狹','09:30','約 45～90 分鐘','步行／公車／計程車','那霸市區海灘，可與波上宮放在同一段。','https://www.naha-navi.or.jp/'],
['牧志公設市場',['牧志公設市場','牧志市場','第一牧志公設市場','makishi market'],'那霸・牧志','12:00','約 1～1.5 小時','單軌電車＋步行','適合午餐與市場採買，和國際通步行距離近。','https://www.makishi-public-market.com/'],
['壺屋通・壺屋燒物博物館',['壺屋','壺屋通','壺屋燒','壺屋燒物博物館','tsuboya'],'那霸・壺屋','14:00','約 1～1.5 小時','單軌電車＋步行','適合與國際通、牧志市場排在同一區。','https://www.city.naha.okinawa.jp/'],
['福州園',['福州園','fukushuen'],'那霸・久米','10:00','約 45～60 分鐘','單軌電車＋步行／公車','市區庭園景點，適合早上短停留。','https://www.naha-navi.or.jp/'],
['泊港魚市場・泊いゆまち',['泊港','泊港魚市場','泊いゆまち','tomari iyumachi'],'那霸・泊','09:00','約 45～60 分鐘','公車／計程車','適合早餐或早晨採買，可接那霸市區行程。','https://www.naha-navi.or.jp/'],
['沖繩縣立博物館・美術館',['沖繩縣立博物館','沖繩縣立美術館','おきみゅー','okinawa prefectural museum'],'那霸・新都心','10:00','約 1.5～2 小時','單軌電車＋步行','適合雨天或市區文化行程。','https://okimu.jp/'],
['首里金城町石疊道',['金城町石疊道','石疊道','首里石疊道','kinjo stone pavement'],'那霸・首里','11:30','約 45～60 分鐘','單軌電車＋步行','可與首里城安排在同一區，但有坡度。','https://www.naha-navi.or.jp/'],
['識名園',['識名園','shikinaen'],'那霸・識名','13:30','約 1～1.5 小時','公車／計程車','那霸南側歷史庭園，適合與首里區搭配。','https://www.city.naha.okinawa.jp/'],
['瀨長島夕陽',['瀨長島夕陽','瀨長島海景'],'豐見城・瀨長島','17:00','約 1 小時','公車／計程車','適合傍晚看飛機與海景，和 Umikaji Terrace 可連續安排。','https://www.umikajiterrace.com/'],
['豐崎海灘',['豐崎海灘','美らSUN海灘','美らSUNビーチ','toyossaki beach'],'豐見城・豐崎','15:00','約 1～1.5 小時','公車／計程車','靠近豐崎商圈，可與 ASHIBINAA、DMM 水族館串接。','https://www.tomigusuku-okinawa.jp/'],
['iias 沖繩豐崎',['iias','iias沖繩','iias toyosaki'],'豐見城・豐崎','12:00','約 1.5～2 小時','公車／計程車','豐崎大型商業設施，可與 DMM 水族館、海灘串接。','https://toyosaki.iias.jp/'],
['萬座毛',['萬座毛','manzamo','cape manzamo'],'恩納','10:30','約 1～1.5 小時','公車／計程車／租車','恩納海岸代表景點，適合中北部路線。','https://www.manzamo.jp/'],
['古宇利海洋塔',['古宇利海洋塔','kouri ocean tower','kouri tower'],'今歸仁・古宇利','15:00','約 1～1.5 小時','租車／巴士','可與古宇利島、古宇利大橋串接。','https://www.kouri-oceantower.com/'],
['今歸仁城跡',['今歸仁城','今歸仁城跡','nakijin castle'],'今歸仁・北部','09:00','約 1.5～2 小時','租車／巴士','北部歷史景點，適合與美麗海、古宇利島串聯。','https://www.nakijin.jp/'],
['殘波岬',['殘波岬','残波岬','cape zanpa','zanpa'],'讀谷','15:30','約 1～1.5 小時','公車／計程車／租車','適合西海岸下午行程，可接美國村或讀谷景點。','https://www.yomitan-kanko.jp/'],
['琉球村',['琉球村','ryukyu mura'],'恩納','13:00','約 1.5～2 小時','公車／計程車／租車','沖繩傳統文化體驗，適合恩納一帶行程。','https://www.ryukyumura.co.jp/'],
['沖繩兒童王國',['沖繩兒童王國','こどもの国','okinawa zoo'],'沖繩・胡差','10:00','約 2～3 小時','公車／計程車／租車','適合親子行程，可安排半日。','https://www.okzm.jp/'],
['DFS 沖繩 T Galleria',['DFS','DFS沖繩','T Galleria','dfs t galleria'],'那霸・新都心','11:00','約 1～2 小時','單軌電車＋步行','那霸市區購物點，可與新都心景點一起安排。','https://www.dfs.com/'],
['那霸機場',['那霸機場','沖繩機場','那霸空港','naha airport'],'那霸・機場','08:00','約 1～2 小時','單軌電車／公車／計程車','適合作為抵達或離境節點。','https://www.naha-airport.co.jp/']
].map(([title,keys,area,time,stay,transit,note,officialUrl])=>({title,keys,area,time,stay,transit,note,officialUrl}));

function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:corsHeaders});}
function norm(v){return String(v||'').toLowerCase().replace(/\s+/g,'').trim();}
function findPlace(q){const n=norm(q);let best=null,len=0;for(const p of PLACES){for(const k of p.keys){const kk=norm(k);if(kk&&n.includes(kk)&&kk.length>len){best=p;len=kk.length;}}}return best;}
function inferArea(q){const n=norm(q);if(/美麗海|古宇利|今歸仁|名護|本部/.test(n))return'沖繩北部';if(/美國村|北谷|讀谷|殘波|恩納|萬座/.test(n))return'中部・西海岸';if(/浦添|parco/.test(n))return'浦添';if(/豐見城|豐崎|瀨長島|瀬長島|ashibinaa|iias|dmm/.test(n))return'豐見城・豐崎';if(/首里|波上|國際通|牧志|壺屋|那霸|dfs|新都心|識名|泊/.test(n))return'那霸';return'沖繩';}
function genericPlace(q){const title=String(q||'沖繩景點').trim();const area=inferArea(title);return{title,area,time:'待確認',stay:'約 1～2 小時',transit:'依目前行程位置選擇單軌電車／公車／計程車',note:`已辨識為「${area}」方向，但目前沒有這個地點的內建詳細資料。可先加入行程，再確認實際位置、營業時間與交通。`,officialUrl:''};}
function areaRank(area){const a=norm(area);if(a.includes('本部')||a.includes('今歸仁')||a.includes('北谷')||a.includes('中部')||a.includes('西海岸'))return 5;if(a.includes('浦添'))return 4;if(a.includes('南城'))return 3;if(a.includes('豐見城')||a.includes('豐崎'))return 2;if(a.includes('那霸'))return 1;return 3;}
function timeToMin(t){const m=/^(\d{1,2}):(\d{2})$/.exec(String(t||''));return m?Number(m[1])*60+Number(m[2]):9999;}
function placeFromItem(x){const p=findPlace(x?.title||x?.name||'');return p||{title:x?.title||x?.name||'行程',area:x?.locationHint||inferArea(x?.title||x?.name||''),time:x?.time||'待確認',stay:x?.stayDuration||'待確認',transit:x?.transitMode||'待確認',note:x?.note||'',officialUrl:x?.officialUrl||''};}
function toItem(p,day,time){return{day,time:time||p.time||'待確認',stayDuration:p.stay,transitTimeToNext:'待確認',transitKm:'待確認',title:p.title,transitMode:p.transit,locationHint:p.area,officialUrl:p.officialUrl||'',note:p.note||''};}
function fallbackAdd(place,day,itinerary){const p=findPlace(place)||genericPlace(place);const same=itinerary.filter(x=>String(x?.day||'')===String(day));let time=p.time;if(time!=='待確認'&&same.some(x=>String(x?.time||'')===time)){const m=timeToMin(time)+120;time=String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0');}return toItem(p,day,time);}
function fallbackReplan(day,itinerary,newPlace){const list=itinerary.filter(x=>String(x?.day||'')===String(day)).map(placeFromItem);list.push(findPlace(newPlace)||genericPlace(newPlace));list.sort((a,b)=>areaRank(a.area)-areaRank(b.area)||timeToMin(a.time)-timeToMin(b.time));let cursor=9*60;return list.map(x=>{let t=timeToMin(x.time);if(t===9999||t<cursor)t=cursor;const stay=Math.max(45,parseInt(String(x.stay).match(/\d+/)?.[0]||60,10));cursor=t+stay;return toItem(x,day,String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0'));});}
function extractText(data){if(typeof data?.output_text==='string')return data.output_text.trim();return(data?.output||[]).flatMap(i=>i?.content||[]).map(c=>c?.text).filter(Boolean).join('\n').trim();}

async function openaiPlan(env,mode,place,day,itinerary,trip){
 if(!env.OPENAI_API_KEY)return null;
 const prompt=`你是沖繩旅遊行程規劃助手。請根據目前行程新增「${place}」到 ${day}。依地理區域、既有時間、停留時間與減少來回折返安排。請提供 title、day、time、stayDuration、transitMode、locationHint、note、transitTimeToNext、transitKm、officialUrl，以及 reorderedItinerary 陣列。mode=${mode}；若 mode=replan，reorderedItinerary 必須包含該日全部行程；若 mode=add，reorderedItinerary 可為空陣列。不要虛構即時公車班次、票價或即時路況，不確定就寫待確認。只輸出 JSON。\n目前行程：${JSON.stringify(itinerary)}\n旅行資訊：${JSON.stringify(trip)}`;
 const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${env.OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:env.OPENAI_MODEL||'gpt-5.6-luna',input:prompt,store:false,text:{format:{type:'json_object'}}})});
 if(!r.ok)throw new Error(`OpenAI HTTP ${r.status}`);
 const data=await r.json();const text=extractText(data);if(!text)throw new Error('OpenAI 沒有回傳內容');
 const parsed=JSON.parse(text);
 if(parsed&&parsed.result){return parsed;}
 return {result:parsed||{},reorderedItinerary:Array.isArray(parsed?.reorderedItinerary)?parsed.reorderedItinerary:[]};
}

export default{async fetch(request,env){
 if(request.method==='OPTIONS')return new Response('',{status:204,headers:corsHeaders});
 const url=new URL(request.url);
 if(request.method==='GET'&&url.pathname==='/health')return json({ok:true,service:'okinawa-ai-itinerary',fallbackAvailable:true,openaiConfigured:Boolean(env.OPENAI_API_KEY),placeCount:PLACES.length});
 if(request.method!=='POST'||url.pathname!=='/v1/itinerary')return json({error:'Not found'},404);
 let body;try{body=await request.json();}catch{return json({error:'請求內容不是有效 JSON'},400);}
 const place=String(body.place||'').trim();const day=String(body.day||'DAY 1').trim();const mode=body.mode==='replan'?'replan':'add';const itinerary=Array.isArray(body.itinerary)?body.itinerary.slice(0,80):[];const trip=body.trip&&typeof body.trip==='object'?body.trip:{};
 if(!place)return json({error:'請輸入景點或需求'},400);
 try{const ai=await openaiPlan(env,mode,place,day,itinerary,trip);if(ai&&ai.result){return json({ok:true,source:'openai',result:ai.result,reorderedItinerary:Array.isArray(ai.reorderedItinerary)?ai.reorderedItinerary:[]});}}catch(e){console.log('OpenAI fallback:',e?.message||e);}
 const result=mode==='replan'?fallbackReplan(day,itinerary,place):fallbackAdd(place,day,itinerary);
 return json({ok:true,source:'built-in',result:mode==='replan'?(result[0]||fallbackAdd(place,day,itinerary)):result,reorderedItinerary:mode==='replan'?result:[]});
}};
