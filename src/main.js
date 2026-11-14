import './style.css';
import { createAquarium } from './aquarium3d.js';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const $ = id => document.getElementById(id);
const defaults = {
  coins:250, level:1, xp:0, food:80, water:92, clean:85,
  fish:['guppy','neon','gold'], plants:[], decor:[],
  quests:{feed:0,water:0}, claimed:false,
  createdAt:Date.now(), bornAt:{}, theme:'bright',
  autoFeed:false, feedTime:'08:00', lastAutoFeedDate:'', quality:'high',
  photos:[], layout:{}
};
function load(){
  try{return JSON.parse(localStorage.getItem('aquarium-world-save-v2')||localStorage.getItem('aquarium-world-save')||'{}')}
  catch{return {}}
}
let state={...defaults,...load()};
state.quests={...defaults.quests,...(state.quests||{})};
state.fish=Array.isArray(state.fish)?state.fish:defaults.fish;
state.plants=Array.isArray(state.plants)?state.plants:[];
state.decor=Array.isArray(state.decor)?state.decor:[];
state.photos=Array.isArray(state.photos)?state.photos:[];
state.bornAt=state.bornAt||{};state.layout=state.layout||{};
if(!state.createdAt)state.createdAt=Date.now();
state.fish.forEach(id=>{if(!state.bornAt[id])state.bornAt[id]=state.createdAt});
const creatures=[
 {id:'guppy',name:'Cá bảy màu',emoji:'🐠',price:0,type:'fish',desc:'Đuôi xòe nhiều màu'},
 {id:'neon',name:'Cá neon',emoji:'🐟',price:0,type:'fish',desc:'Sọc xanh phát sáng'},
 {id:'gold',name:'Cá vàng',emoji:'🐡',price:0,type:'fish',desc:'Người bạn đáng yêu'},
 {id:'angelfish',name:'Cá thần tiên',emoji:'🐠',price:90,type:'fish',desc:'Vây dài thanh lịch'},
 {id:'clown',name:'Cá hề',emoji:'🐠',price:120,type:'fish',desc:'Màu cam nổi bật'},
 {id:'discus',name:'Cá đĩa',emoji:'🐟',price:160,type:'fish',desc:'Viên ngọc thủy cung'},
 {id:'betta',name:'Cá betta',emoji:'🐟',price:240,type:'fish',desc:'Vây dài rực rỡ'},
 {id:'shrimp',name:'Tép cảnh',emoji:'🦐',price:75,type:'invert',desc:'Tép nhỏ dọn rêu'},
 {id:'snail',name:'Ốc nerita',emoji:'🐌',price:65,type:'invert',desc:'Ốc ăn rêu hiền lành'},
 {id:'crab',name:'Cua mini',emoji:'🦀',price:130,type:'invert',desc:'Cua cảnh bò đáy bể'}
];
const plants=[
 {id:'javafern',name:'Dương xỉ Java',emoji:'🌿',price:55,desc:'Lá xanh mềm, dễ chăm'},
 {id:'vallisneria',name:'Cỏ thìa dài',emoji:'🌱',price:65,desc:'Lá dài đung đưa'},
 {id:'anubias',name:'Ráy thủy sinh',emoji:'🍃',price:75,desc:'Lá bản rộng'},
 {id:'redplant',name:'Hồng liễu',emoji:'🍁',price:95,desc:'Sắc đỏ nổi bật'},
 {id:'moss',name:'Rêu mini',emoji:'🟢',price:45,desc:'Tạo thảm xanh'},
 {id:'hornwort',name:'Rong đuôi chó',emoji:'🌾',price:60,desc:'Cụm rong dày'}
];
const decor=[
 {id:'coral',name:'San hô hồng',emoji:'🪸',price:110,desc:'Điểm nhấn màu sắc'},
 {id:'redcoral',name:'San hô đỏ',emoji:'🪸',price:125,desc:'Tạo góc rạn san hô'},
 {id:'driftwood',name:'Gỗ lũa',emoji:'🪵',price:90,desc:'Phong cách tự nhiên'},
 {id:'cave',name:'Hang đá',emoji:'🪨',price:100,desc:'Nơi trú ẩn cho cá'},
 {id:'temple',name:'Tiểu cảnh cổ',emoji:'🏛️',price:150,desc:'Ngôi đền dưới nước'}
];
const aquarium=createAquarium($('aquarium3d'));
aquarium.setQuality(state.quality||'high');
let activeShop='creatures';
let scheduleTimer=null;
function toast(msg){
 const el=$('toast');el.textContent=msg;el.classList.add('show');
 clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2600);
}
function save(){
 localStorage.setItem('aquarium-world-save-v2',JSON.stringify(state));
 render();
}
function addXp(n){
 state.xp+=n;
 if(state.xp>=100){state.xp-=100;state.level++;state.coins+=50;toast(`Lên cấp ${state.level}! +50 xu ✨`)}
}
function pct(v){return Math.max(0,Math.min(100,Math.round(v)))}
function ageDays(){return Math.max(0,(Date.now()-state.createdAt)/86400000)}
function stageText(days){return days<1?'Cá và cây non':days<7?'Đang lớn nhanh':days<30?'Trưởng thành dần':'Hệ sinh thái ổn định'}
function getCatalogItem(id){return [...creatures,...plants,...decor].find(x=>x.id===id)}
function render(){
 $('coins').textContent=state.coins;$('level').textContent=state.level;
 $('fishCount').textContent=state.fish.length;
 $('collectionCount').textContent=String(new Set(state.fish).size).padStart(2,'0')+' LOÀI';
 [['food',state.food],['water',state.water],['clean',state.clean]].forEach(([k,v])=>{
   $(k+'Value').textContent=pct(v)+'%';$(k+'Bar').style.width=pct(v)+'%';
 });
 $('waterLabel').textContent=state.water>55?'Nước tốt':'Cần thay nước';
 const health=Math.min(state.food,state.water,state.clean);
 $('tankMood').textContent=health>65?'Hệ sinh thái cân bằng':health>35?'Bể cá cần được chăm sóc':'Sinh vật cần được chăm sóc';
 $('healthPill').textContent=health>65?'TỐT':health>35?'CHÚ Ý':'NGUY CẤP';
 $('feedQuest').style.width=(state.quests.feed?100:0)+'%';
 $('waterQuest').style.width=(state.quests.water?100:0)+'%';
 $('feedQuestText').textContent=(state.quests.feed?1:0)+'/1';
 $('waterQuestText').textContent=(state.quests.water?1:0)+'/1';
 $('claimBtn').disabled=!(state.quests.feed&&state.quests.water)||state.claimed;
 const days=ageDays();
 $('growthAge').textContent=`Ngày ${Math.floor(days)+1}`;
 $('growthStage').textContent=stageText(days);
 $('fishList').innerHTML=state.fish.map(id=>{
   const f=getCatalogItem(id)||creatures[0];const born=state.bornAt[id]||state.createdAt;
   const d=Math.max(0,(Date.now()-born)/86400000);
   return `<div class="fish-card"><span class="fish-art">${f.emoji}</span><div><b>${f.name}</b><small>${d<1?'Cá non':d<7?'Đang lớn':'Đã trưởng thành'} · ${Math.floor(d)+1} ngày</small></div></div>`;
 }).join('');
 const ownedPlants=state.plants.map(id=>getCatalogItem(id)?.name).filter(Boolean);
 const ownedDecor=state.decor.map(id=>getCatalogItem(id)?.name).filter(Boolean);
 if(ownedPlants.length||ownedDecor.length){
   $('fishList').innerHTML += [...ownedPlants,...ownedDecor].map((name,i)=>`<div class="fish-card"><span class="fish-art">${i<ownedPlants.length?'🌿':'🪸'}</span><div><b>${name}</b><small>Đã bố trí trong bể</small></div></div>`).join('');
 }
 aquarium.setSpecies(state.fish,state.fish.map(id=>Math.max(0,(Date.now()-(state.bornAt[id]||state.createdAt))/86400000)),state.layout);
 aquarium.setGrowth(days);
 aquarium.setEnvironment(state.plants,state.decor,state.layout);
 renderShop();
 renderPhotos();
}
function renderShop(){
 const list=activeShop==='creatures'?creatures:activeShop==='plants'?plants:decor;
 $('shopGrid').innerHTML=list.filter(x=>x.price>0).map(item=>{
   const owned=activeShop==='creatures'?state.fish.includes(item.id):activeShop==='plants'?state.plants.includes(item.id):state.decor.includes(item.id);
   return `<div class="shop-card"><div class="art">${item.emoji}</div><b>${item.name}</b><small>${item.desc}</small><button class="buy-btn" data-buy="${item.id}" ${owned||state.coins<item.price?'disabled':''}>${owned?'ĐÃ SỞ HỮU':'🪙 '+item.price+' XU'}</button></div>`;
 }).join('');
 document.querySelectorAll('[data-buy]').forEach(b=>b.addEventListener('click',()=>buy(b.dataset.buy)));
 document.querySelectorAll('[data-shop-tab]').forEach(b=>b.classList.toggle('active',b.dataset.shopTab===activeShop));
}
function renderPhotos(){
 const grid=$('photoGrid');
 if(!state.photos.length){grid.innerHTML='<span class="photo-empty">Chưa có ảnh nào. Hãy chụp khoảnh khắc đầu tiên!</span>';return}
 grid.innerHTML=state.photos.map((p,i)=>`<div class="photo-card"><img class="photo-thumb" src="${p.data}" alt="Ảnh bể cá ${i+1}"><button data-photo="${i}" title="Tải ảnh">⬇</button></div>`).join('');
 grid.querySelectorAll('[data-photo]').forEach(btn=>btn.onclick=()=>downloadData(state.photos[Number(btn.dataset.photo)].data,`Aquarium-World-${Number(btn.dataset.photo)+1}.jpg`));
}
function spend(n){if(state.coins<n){toast('Bạn chưa đủ xu. Hãy hoàn thành nhiệm vụ!');return false}state.coins-=n;return true}
function buy(id){
 const item=getCatalogItem(id);if(!item||item.price<=0)return;
 const owned=creatures.some(x=>x.id===id)?state.fish.includes(id):plants.some(x=>x.id===id)?state.plants.includes(id):state.decor.includes(id);
 if(owned){toast('Bạn đã sở hữu vật phẩm này rồi.');return}
 if(!spend(item.price))return;
 if(creatures.some(x=>x.id===id)){state.fish.push(id);state.bornAt[id]=Date.now()}
 else if(plants.some(x=>x.id===id))state.plants.push(id);
 else state.decor.push(id);
 addXp(15);save();toast(`Đã thêm ${item.name} vào thủy cung!`);
}
function downloadData(data,name){
 const a=document.createElement('a');a.href=data;a.download=name;document.body.appendChild(a);a.click();a.remove();
}
function takePhoto(){
 try{
   const raw=aquarium.capturePhoto();
   const image=new Image();
   image.onload=()=>{
     const canvas=document.createElement('canvas');const scale=Math.min(1,1200/image.width);
     canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);
     canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
     const data=canvas.toDataURL('image/jpeg',.76);
     state.photos.unshift({data,at:new Date().toISOString()});state.photos=state.photos.slice(0,4);
     save();downloadData(data,`Aquarium-World-${new Date().toISOString().slice(0,10)}.jpg`);
     toast('Đã chụp và lưu ảnh bể cá! 📸');
   };
   image.src=raw;
 }catch(e){toast('Không thể chụp ảnh trên thiết bị này.')}
}
function applyTheme(theme){
 state.theme=['bright','ocean','dark'].includes(theme)?theme:'bright';
 document.body.dataset.theme=state.theme;
 $('themeSelect').value=state.theme;
}
async function configureNativeReminder(){
 if(!Capacitor.isNativePlatform())return false;
 try{
   await LocalNotifications.cancel({notifications:[{id:2101}]});
   if(!state.autoFeed)return true;
   let permission=await LocalNotifications.checkPermissions();
   if(permission.display!=='granted')permission=await LocalNotifications.requestPermissions();
   if(permission.display!=='granted'){toast('Bạn chưa cấp quyền thông báo cho ứng dụng.');return false}
   if(state.autoFeed){
     const [hour,minute]=state.feedTime.split(':').map(Number);
     await LocalNotifications.schedule({notifications:[{
       id:2101,title:'Aquarium World – Đến giờ cho cá ăn',
       body:'Mở thủy cung để kiểm tra đàn cá và hoàn tất lịch chăm sóc.',
       schedule:{on:{hour,minute},repeats:true},
       extra:{action:'scheduled-feeding'}
     }]});
   }
   return true;
 }catch(e){console.warn('Local notification scheduling failed',e);toast('Không thể tạo lịch nhắc trên Android. Kiểm tra quyền thông báo.');return false}
}
async function saveSchedule(){
 state.autoFeed=$('autoFeedToggle').checked;state.feedTime=$('feedTime').value||'08:00';
 if(state.autoFeed&&!/^\d\d:\d\d$/.test(state.feedTime)){toast('Vui lòng chọn giờ hợp lệ.');return}
 localStorage.setItem('aquarium-world-save-v2',JSON.stringify(state));
 if(Capacitor.isNativePlatform())await configureNativeReminder();
 else if(state.autoFeed&&'Notification'in window&&Notification.permission==='default'){
   try{await Notification.requestPermission()}catch{}
 }
 toast(state.autoFeed?'Đã lưu lịch cho ăn hằng ngày.':'Đã tắt lịch cho ăn.');
}
function maybeScheduledFeed(){
 if(!state.autoFeed)return;
 const now=new Date(),[hour,minute]=state.feedTime.split(':').map(Number);
 const today=now.toLocaleDateString('en-CA');
 if(now.getHours()===hour&&now.getMinutes()>=minute&&state.lastAutoFeedDate!==today){
   performScheduledFeed(today);
 }
}
function performScheduledFeed(day){
 state.lastAutoFeedDate=day;state.food=pct(state.food+25);
 localStorage.setItem('aquarium-world-save-v2',JSON.stringify(state));render();
 if(!Capacitor.isNativePlatform()&&'Notification'in window&&Notification.permission==='granted'){
   try{new Notification('Aquarium World',{body:'Đã đến giờ cho cá ăn. Thức ăn đã được bổ sung trong bể.'})}catch{}
 }
 toast('Đã tự động bổ sung thức ăn theo lịch! 🍤');
}
function catchUpScheduledFeed(){
 if(!state.autoFeed||state.lastAutoFeedDate===new Date().toLocaleDateString('en-CA'))return;
 const now=new Date(),[h,m]=state.feedTime.split(':').map(Number);
 if(now.getHours()*60+now.getMinutes()>=h*60+m)performScheduledFeed(now.toLocaleDateString('en-CA'));
}
function renderStudioPalette(){
 const ownedPlants=state.plants.map((id)=>({type:'plant',id,item:getCatalogItem(id)}));
 const ownedDecor=state.decor.map((id)=>({type:'decor',id,item:getCatalogItem(id)}));
 const unique=[...new Map([...ownedPlants,...ownedDecor].map(x=>[`${x.type}:${x.id}`,x])).values()];
 $('studioPalette').innerHTML=unique.length?unique.map(x=>`<button class="studio-add" data-studio-add="${x.type}:${x.id}">${x.item?.emoji||'＋'} ${x.item?.name||x.id} <small>＋ Thêm</small></button>`).join(''):'<span class="studio-empty">Mua cây hoặc vật phẩm trong cửa hàng để thêm vào bể tại đây.</span>';
 $('studioPalette').querySelectorAll('[data-studio-add]').forEach(btn=>btn.onclick=()=>{
   persistStudioLayout();
   const [type,id]=btn.dataset.studioAdd.split(':');
   if(type==='plant')state.plants.push(id);else state.decor.push(id);
   save();renderStudioPalette();toast('Đã thêm vật phẩm. Kéo vật phẩm mới trong bể để bố trí!');
 });
}
function persistStudioLayout(){
 state.layout=aquarium.getStudioLayout();
 localStorage.setItem('aquarium-world-save-v2',JSON.stringify(state));
}
function enterStudio(){
 $('studioPanel').hidden=false;
 aquarium.setStudioMode(true);
 renderStudioPalette();
 $('studioSelection').textContent='Chạm vào vật phẩm trong bể để chọn và kéo di chuyển.';
 toast('Đã vào chế độ thiết kế tự do 🛠');
}
function exitStudio(){
 persistStudioLayout();
 aquarium.setStudioMode(false);
 $('studioPanel').hidden=true;
 render();
 toast('Đã lưu bố cục thủy cung!');
}
$('studioLaunchBtn').onclick=enterStudio;
$('studioExit').onclick=exitStudio;
$('studioSave').onclick=()=>{persistStudioLayout();toast('Đã lưu bố cục thiết kế!')};
$('studioRotateLeft').onclick=()=>{if(aquarium.rotateSelected(-Math.PI/12))persistStudioLayout();else toast('Hãy chọn một vật phẩm trước.')};
$('studioRotateRight').onclick=()=>{if(aquarium.rotateSelected(Math.PI/12))persistStudioLayout();else toast('Hãy chọn một vật phẩm trước.')};
$('studioSmaller').onclick=()=>{if(aquarium.scaleSelected(.9))persistStudioLayout();else toast('Hãy chọn một vật phẩm trước.')};
$('studioLarger').onclick=()=>{if(aquarium.scaleSelected(1.1))persistStudioLayout();else toast('Hãy chọn một vật phẩm trước.')};
$('studioDelete').onclick=()=>{
 persistStudioLayout();
 const key=aquarium.removeSelected();
 if(!key){toast('Hãy chọn vật phẩm cần xóa.');return}
 const parts=key.split(':');const [type,id,indexText]=parts;const index=Number(indexText);
 if(type==='plant')state.plants.splice(index,1);
 else if(type==='decor')state.decor.splice(index,1);
 else if(type==='fish'||type==='invert')state.fish.splice(index,1);
 delete state.layout[key];
 save();renderStudioPalette();toast('Đã xóa vật phẩm khỏi bể.');
};
setInterval(()=>{
 if(!$('studioPanel').hidden){
   const key=aquarium.getSelectedStudioKey();
   $('studioSelection').textContent=key?`Đang chọn: ${key.replaceAll(':',' · ')}`:'Chưa chọn vật phẩm – chạm vào vật phẩm trong bể';
 }
},250);
$('feedBtn').onclick=()=>{if(state.food>=100){toast('Cá đã no rồi!');return}state.food=pct(state.food+28);state.quests.feed=1;addXp(10);save();toast('Cá ăn ngon lành! +10 XP 🐟')};
$('waterBtn').onclick=()=>{if(!spend(20))return;state.water=pct(state.water+35);state.quests.water=1;addXp(10);save();toast('Đã thay nước sạch! -20 xu')};
$('cleanBtn').onclick=()=>{if(!spend(15))return;state.clean=pct(state.clean+35);addXp(8);save();toast('Bể cá đã sạch bong! -15 xu')};
$('claimBtn').onclick=()=>{if(state.quests.feed&&state.quests.water&&!state.claimed){state.coins+=30;state.claimed=true;addXp(15);save();toast('Hoàn thành nhiệm vụ! +30 xu 🎁')}};
$('viewReset').onclick=()=>aquarium.resetView();
$('viewZoomIn').onclick=()=>aquarium.zoom(-.8);
$('viewZoomOut').onclick=()=>aquarium.zoom(.8);
$('photoBtn').onclick=takePhoto;$('photoSceneBtn').onclick=takePhoto;$('takePhotoBtn').onclick=takePhoto;
$('settingsPhotoBtn').onclick=takePhoto;
$('settingsBtn').onclick=()=>{$('themeSelect').value=state.theme;$('qualitySelect').value=state.quality||'high';$('autoFeedToggle').checked=state.autoFeed;$('feedTime').value=state.feedTime;$('settingsModal').hidden=false};
$('closeSettings').onclick=()=>{$('settingsModal').hidden=true};
$('settingsModal').addEventListener('click',e=>{if(e.target===$('settingsModal'))$('settingsModal').hidden=true});
$('themeSelect').onchange=e=>{applyTheme(e.target.value);localStorage.setItem('aquarium-world-save-v2',JSON.stringify(state))};
$('qualitySelect').onchange=e=>{state.quality=e.target.value;aquarium.setQuality(state.quality);localStorage.setItem('aquarium-world-save-v2',JSON.stringify(state));toast('Đã đổi chất lượng đồ họa: '+e.target.value.toUpperCase())};
$('autoFeedToggle').checked=state.autoFeed;$('feedTime').value=state.feedTime;
$('saveScheduleBtn').onclick=saveSchedule;
document.querySelectorAll('[data-shop-tab]').forEach(b=>b.onclick=()=>{activeShop=b.dataset.shopTab;renderShop()});
$('soundBtn').onclick=()=>toast('Âm thanh môi trường sẽ được bổ sung ở bản kế tiếp.');
$('resetBtn').onclick=()=>{if(confirm('Bạn muốn xóa tiến trình và bắt đầu lại từ đầu?')){aquarium.setStudioMode(false);$('studioPanel').hidden=true;state={...structuredClone(defaults),createdAt:Date.now()};save();toast('Đã tạo một thủy cung mới!')}};
$('exportBtn').onclick=()=>{const blob=new Blob([JSON.stringify({app:'Aquarium World',version:'2.3.0',savedAt:new Date().toISOString(),state},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Aquarium-World-save.json';a.click();URL.revokeObjectURL(a.href);toast('Đã xuất bản sao lưu tiến trình!')};
$('importBtn').onclick=()=>$('importFile').click();
$('importFile').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{const obj=JSON.parse(await file.text());const s=obj.state||obj;if(!Array.isArray(s.fish)||typeof s.coins!=='number')throw Error('invalid');state={...defaults,...s,quests:{...defaults.quests,...s.quests},plants:s.plants||[],decor:s.decor||[],bornAt:s.bornAt||{},photos:s.photos||[],layout:s.layout||{}};save();applyTheme(state.theme);toast('Đã nhập tiến trình thành công!')}catch{toast('File sao lưu không hợp lệ.')}e.target.value=''};
$('exportPhotosBtn').onclick=()=>{if(!state.photos.length){toast('Album chưa có ảnh.');return}state.photos.forEach((p,i)=>setTimeout(()=>downloadData(p.data,`Aquarium-World-album-${i+1}.jpg`),i*350));toast('Đang xuất ảnh trong album...')};
document.querySelectorAll('[data-shop-tab]').forEach(b=>b.onclick=()=>{activeShop=b.dataset.shopTab;renderShop()});
applyTheme(state.theme);
render();
catchUpScheduledFeed();
configureNativeReminder();
scheduleTimer=setInterval(()=>{maybeScheduledFeed();},15000);
// The game ages while closed too: age is calculated from wall-clock timestamps, not play sessions.
setInterval(()=>{
 const now=Date.now();
 state.food=Math.max(0,state.food-.18);
 state.water=Math.max(0,state.water-.06);
 state.clean=Math.max(0,state.clean-.08);
 localStorage.setItem('aquarium-world-save-v2',JSON.stringify(state));
 aquarium.setSpecies(state.fish,state.fish.map(id=>Math.max(0,(Date.now()-(state.bornAt[id]||state.createdAt))/86400000)),state.layout);
 aquarium.setGrowth(ageDays());
},60000);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&!$('studioPanel').hidden)persistStudioLayout();if(!document.hidden){catchUpScheduledFeed();aquarium.setSpecies(state.fish,state.fish.map(id=>Math.max(0,(Date.now()-(state.bornAt[id]||state.createdAt))/86400000)),state.layout);aquarium.setGrowth(ageDays())}});
if('serviceWorker'in navigator&&location.protocol!=='file:'){
 window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}
