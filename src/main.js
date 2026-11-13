import './style.css';
import { createAquarium } from './aquarium3d.js';
const $=id=>document.getElementById(id);
const defaults={coins:250,level:1,xp:0,food:80,water:92,clean:85,fish:['guppy','neon','gold'],quests:{feed:0,water:0},claimed:false};
function load(){try{return JSON.parse(localStorage.getItem('aquarium-world-save-v2')||localStorage.getItem('aquarium-world-save')||'{}')}catch{return {}}}
let state={...defaults,...load()};state.quests={...defaults.quests,...(state.quests||{})};state.fish=Array.isArray(state.fish)?state.fish:defaults.fish;
const catalog=[
{id:'guppy',name:'Cá bảy màu',emoji:'🐠',price:0,desc:'Nhanh nhẹn, dễ nuôi'},
{id:'neon',name:'Cá neon',emoji:'🐟',price:0,desc:'Lấp lánh sắc xanh'},
{id:'gold',name:'Cá vàng',emoji:'🐡',price:0,desc:'Người bạn đáng yêu'},
{id:'angelfish',name:'Cá thần tiên',emoji:'🐠',price:90,desc:'Dáng bơi thanh lịch'},
{id:'clown',name:'Cá hề',emoji:'🐠',price:120,desc:'Sắc cam nổi bật'},
{id:'discus',name:'Cá đĩa',emoji:'🐟',price:160,desc:'Viên ngọc thủy cung'},
{id:'turtle',name:'Rùa nước',emoji:'🐢',price:200,desc:'Bơi chậm và hiền lành'},
{id:'betta',name:'Cá betta',emoji:'🐟',price:240,desc:'Vây dài rực rỡ'}];
const aquarium=createAquarium($('aquarium3d'));
function toast(msg){const el=$('toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2300)}
function save(){localStorage.setItem('aquarium-world-save-v2',JSON.stringify(state));render()}
function addXp(n){state.xp+=n;if(state.xp>=100){state.xp-=100;state.level++;state.coins+=50;toast(`Lên cấp ${state.level}! Bạn nhận thêm 50 xu ✨`)}}
function pct(v){return Math.max(0,Math.min(100,Math.round(v)))}
function render(){
 $('coins').textContent=state.coins;$('level').textContent=state.level;$('fishCount').textContent=state.fish.length;$('collectionCount').textContent=String(new Set(state.fish).size).padStart(2,'0')+' LOÀI';
 [['food',state.food],['water',state.water],['clean',state.clean]].forEach(([k,v])=>{$(k+'Value').textContent=pct(v)+'%';$(k+'Bar').style.width=pct(v)+'%'});
 $('waterLabel').textContent=state.water>55?'Nước tốt':'Cần thay nước';const health=Math.min(state.food,state.water,state.clean);$('tankMood').textContent=health>65?'Hệ sinh thái cân bằng':health>35?'Bể cá cần được chăm sóc':'Cá đang cần bạn giúp đỡ';$('healthPill').textContent=health>65?'TỐT':health>35?'CHÚ Ý':'NGUY CẤP';
 $('feedQuest').style.width=(state.quests.feed?100:0)+'%';$('waterQuest').style.width=(state.quests.water?100:0)+'%';$('feedQuestText').textContent=(state.quests.feed?1:0)+'/1';$('waterQuestText').textContent=(state.quests.water?1:0)+'/1';$('claimBtn').disabled=!(state.quests.feed&&state.quests.water)||state.claimed;
 $('fishList').innerHTML=state.fish.map(id=>{const f=catalog.find(x=>x.id===id)||catalog[0];return `<div class="fish-card"><span class="fish-art">${f.emoji}</span><div><b>${f.name}</b><small>Đang khỏe mạnh · Đã sở hữu</small></div></div>`}).join('');
 $('shopGrid').innerHTML=catalog.filter(f=>f.price>0).map(f=>`<div class="shop-card"><div class="art">${f.emoji}</div><b>${f.name}</b><small>${f.desc}</small><button class="buy-btn" data-buy="${f.id}" ${state.fish.includes(f.id)||state.coins<f.price?'disabled':''}>${state.fish.includes(f.id)?'ĐÃ SỞ HỮU':'🪙 '+f.price+' XU'}</button></div>`).join('');
 document.querySelectorAll('[data-buy]').forEach(b=>b.addEventListener('click',()=>buy(b.dataset.buy)));aquarium.setFishCount(state.fish.length);
}
function spend(n){if(state.coins<n){toast('Bạn chưa đủ xu. Hãy hoàn thành nhiệm vụ!');return false}state.coins-=n;return true}
$('feedBtn').onclick=()=>{if(state.food>=100){toast('Cá đã no rồi!');return}state.food=pct(state.food+28);state.quests.feed=1;addXp(10);save();toast('Cá ăn ngon lành! +10 XP 🐟')};
$('waterBtn').onclick=()=>{if(!spend(20))return;state.water=pct(state.water+35);state.quests.water=1;addXp(10);save();toast('Đã thay nước sạch! -20 xu')};
$('cleanBtn').onclick=()=>{if(!spend(15))return;state.clean=pct(state.clean+35);addXp(8);save();toast('Bể cá đã sạch bong! -15 xu')};
$('claimBtn').onclick=()=>{if(state.quests.feed&&state.quests.water&&!state.claimed){state.coins+=30;state.claimed=true;addXp(15);save();toast('Hoàn thành nhiệm vụ! +30 xu 🎁')}};
function buy(id){const f=catalog.find(x=>x.id===id);if(!f||state.fish.includes(id)||!spend(f.price))return;state.fish.push(id);addXp(20);save();toast(`Chào mừng ${f.name} đến nhà mới!`)}
$('viewReset').onclick=()=>aquarium.resetView();$('viewZoomIn').onclick=()=>aquarium.zoom(-.8);$('viewZoomOut').onclick=()=>aquarium.zoom(.8);
$('soundBtn').onclick=()=>toast('Âm thanh môi trường sẽ được bổ sung ở bản kế tiếp.');
$('resetBtn').onclick=()=>{if(confirm('Bạn muốn xóa tiến trình và bắt đầu lại từ đầu?')){state=structuredClone(defaults);save();toast('Đã tạo một thủy cung mới!')}};
$('exportBtn').onclick=()=>{const blob=new Blob([JSON.stringify({app:'Aquarium World',version:'2.0.0',savedAt:new Date().toISOString(),state},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Aquarium-World-save.json';a.click();URL.revokeObjectURL(a.href);toast('Đã xuất bản sao lưu tiến trình!')};
$('importBtn').onclick=()=>$('importFile').click();$('importFile').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{const obj=JSON.parse(await file.text());const s=obj.state||obj;if(!Array.isArray(s.fish)||typeof s.coins!=='number')throw Error('invalid');state={...defaults,...s,quests:{...defaults.quests,...s.quests}};save();toast('Đã nhập tiến trình thành công!')}catch{toast('File sao lưu không hợp lệ.')}e.target.value=''};
// Gentle offline simulation. Progress is stored on this device; cross-device cloud sync needs a shared backend/account.
setInterval(()=>{state.food=Math.max(0,state.food-.45);state.water=Math.max(0,state.water-.16);state.clean=Math.max(0,state.clean-.2);save()},90000);
render();
if('serviceWorker'in navigator&&location.protocol!=='file:')window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
