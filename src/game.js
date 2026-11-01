/* KOTA SHIFT — standalone browser prototype.
 * Pixel sprites are pre-existing generated v6b art from the owner's source bundle.
 * No AI image generation, recolouring, smoothing, rotation or fractional sprite frames.
 * World tile 64x32; character sheet 64x112, pivot 32x100; 6 columns, 4 direction rows / anim.
 */
(() => {
'use strict';
const W=1120,H=700, COLS=17, ROWS=13, TILE_W=64,TILE_H=32,OX=530,OY=116;
const canvas=document.getElementById('game'), ctx=canvas.getContext('2d',{alpha:false});
ctx.imageSmoothingEnabled=false;
const $=id=>document.getElementById(id);
const imagePaths={
 ichsan:'chars/ichsan_v6b_sheet.png',nadia:'chars/nadia_v6b_sheet.png',raka:'chars/raka_v6b_sheet.png',tati:'chars/bu_warteg_v6b_sheet.png',noor:'chars/noor_v6b_sheet.png',bima:'chars/bima_v6b_sheet.png',ellen:'chars/ellen_v6b_sheet.png',
 office:'tiles/floor_gallery_a.png',office2:'tiles/floor_gallery_b.png',stone:'tiles/tile_stone_a.png',stone2:'tiles/tile_stone_b.png',wood:'tiles/wood_walnut_a.png',wood2:'tiles/wood_walnut_b.png',baize:'tiles/carpet_baize_a.png',night:'tiles/floor_night_a.png',grass:'tiles/grass_a.png',
 desk:'props/desk_single_se.png',desk2:'props/desk_double_se.png',chair:'props/office_chair_se.png',chair2:'props/office_chair_sw.png',dispenser:'props/water_dispenser_se.png',cabinet:'props/filing_cabinet_se.png',monitor:'props/prop_monitor_se.png',counter:'props/coffee_counter_se_f0.png',table:'props/coffee_table_sw.png',sofa:'props/sofa_2_se.png',sofa3:'props/sofa_3_se.png',plant:'props/plant_tall.png',snake:'props/plant_snake.png',bush:'props/plant_bush.png',rug:'props/rug_lounge_se.png',copier:'props/copier_se.png',pingpong:'props/pingpong_table_se.png',armchair:'props/armchair_lounge_se.png',machine:'props/prop_coffee_machine_se_f0.png',tree:'veg/pohon_asam_S.png',tree2:'veg/pohon_glodokan_tiang.png'};
const IMG={};let loaded=0;
Object.keys(imagePaths).forEach(k=>{const im=new Image();im.src='./assets/'+imagePaths[k];im.onload=()=>{loaded++};im.onerror=()=>console.error('Cannot load v6b asset',imagePaths[k]);IMG[k]=im});
const fmt=n=>'Rp'+Math.floor(n).toLocaleString('id-ID');
const bounded=(v,a,b)=>Math.max(a,Math.min(b,v));
const dayNames=['SENIN','SELASA','RABU','KAMIS','JUMAT','SABTU','MINGGU'];
const defaults=()=>({version:1,name:'Ichsan',skin:'ichsan',c:8.5,r:7.5,dir:'se',money:65000,day:1,minute:8*60+45,hunger:80,energy:76,hygiene:79,bladder:22,mood:79,skill:0,bag:[],work:null,lastPay:0,searchTime:-10000,chatCount:0});
let state=defaults();
try{const saved=JSON.parse(localStorage.getItem('kota-shift-save')||'null');if(saved&&saved.version===1&&Number.isFinite(saved.c))state={...defaults(),...saved};}catch{}
let now=performance.now(),runAnim=0,toastTimer=0,activePanel='',hasStarted=false;
const keys=new Set();
const furniture=[
 {id:'plant0',asset:'plant',c:1.7,r:1.7,block:.55},
 {id:'cabinet',asset:'cabinet',c:5.9,r:1.4,block:.7},
 {id:'desk2',asset:'desk2',c:3.0,r:2.9,block:1},
 {id:'desk',asset:'desk',c:4.6,r:4.7,block:1.0},
 {id:'chair',asset:'chair',c:5.2,r:5.3,block:.35},
 {id:'water',asset:'dispenser',c:6.6,r:2.9,block:.5},
 {id:'plant1',asset:'snake',c:8.0,r:1.3,block:.35},
 {id:'counter',asset:'counter',c:13.0,r:2.7,block:1.0},
 {id:'machine',asset:'machine',c:13.1,r:2.8,offsetY:-59,block:0},
 {id:'wt-table',asset:'table',c:14.5,r:5.0,block:.7},
 {id:'wt-chair',asset:'chair2',c:15.5,r:5.3,block:.35},
 {id:'wt-bush',asset:'bush',c:16.0,r:1.2,block:.4},
 {id:'rug',asset:'rug',c:3.1,r:10.4,block:0,offsetY:8},
 {id:'sofa',asset:'sofa3',c:3.1,r:10.8,block:.8},
 {id:'armchair',asset:'armchair',c:4.8,r:11.0,block:.65},
 {id:'roomplant',asset:'plant',c:1.2,r:10.2,block:.45},
 {id:'sofa-table',asset:'table',c:3.8,r:12.2,block:.5},
 {id:'loak-table',asset:'table',c:13.2,r:10.8,block:.65},
 {id:'copier',asset:'copier',c:12.1,r:11.9,block:.45},
 {id:'plant2',asset:'bush',c:10.1,r:10.8,block:.5},
 {id:'tree0',asset:'tree',c:.5,r:.3,block:.5},
 {id:'tree1',asset:'tree2',c:16.0,r:.5,block:.5},
];
const npcs=[
 {id:'raka',asset:'raka',name:'Raka',c:6.7,r:5.2,dir:'nw',talk:['Absen dulu sebelum jam sembilan, ya.','Kopi dulu nggak? Tapi jangan telat meeting.','Ternyata hidup bukan cuma deadline.']},
 {id:'tati',asset:'tati',name:'Bu Tati',c:14.5,r:3.0,dir:'sw',talk:['Makan dulu, Nak. Jangan kerja terus!','Nasi hangat baru matang.','Kalau dompet tipis, belajar masak sendiri.']},
 {id:'ellen',asset:'ellen',name:'Ellen',c:9.6,r:7.4,dir:'se',talk:['Kota ini kecil, tapi urusannya banyak.','Kamu sudah ketemu Bu Tati?','Aku suka sore yang nggak buru-buru.']},
 {id:'bima',asset:'bima',name:'Bima',c:14.8,r:10.0,dir:'sw',talk:['Barang bekas juga punya cerita.','Cari barang dekat meja itu, siapa tahu dapat rezeki.','Cuma jual barang loak, bukan barang kantor ya.']},
];
const actions=[
 {id:'work',label:'Absen / Kerja',c:4.6,r:5.6,radius:2.1,kind:'work'},
 {id:'eat',label:'Beli makanan',c:13.4,r:4.0,radius:2.2,kind:'warung'},
 {id:'rest',label:'Pakai fasilitas kos',c:3.1,r:11.6,radius:2.1,kind:'home'},
 {id:'search',label:'Cari barang loak',c:13.2,r:11.5,radius:2.1,kind:'loak'},
 {id:'water',label:'Minum air',c:6.6,r:3.2,radius:1.45,kind:'water'},
 ...npcs.map(n=>({id:n.id,label:'Ngobrol · '+n.name,c:n.c,r:n.r,radius:1.35,kind:'talk'}))
];
const tileAt=(c,r)=>{
 if(c>=1&&c<=7&&r>=1&&r<=6)return (c+r)%2?'office':'office2';
 if(c>=10&&r>=1&&r<=6)return (c+r)%2?'wood':'wood2';
 if(c>=1&&c<=7&&r>=9)return (c+r)%2?'wood':'wood2';
 if(c>=10&&r>=9)return 'night';
 return (c+r)%2?'stone':'stone2';
};
const toXY=(c,r)=>({x:Math.round(OX+(c-r)*32),y:Math.round(OY+(c+r)*16)});
const img=(key,x,y,w,h)=>{const im=IMG[key];if(im&&im.complete&&im.naturalWidth)ctx.drawImage(im,Math.round(x),Math.round(y),w||im.width,h||im.height)};
const drawChar=(key,c,r,dir='se',walk=false,phase=0)=>{
 const im=IMG[key];if(!im||!im.complete||!im.naturalWidth)return;
 const offset={se:0,sw:1,ne:2,nw:3}[dir]??0;const frame=walk?Math.floor(phase*7)%6:Math.floor(phase*2)%4;
 const row=(walk?0:4)+offset,xy=toXY(c,r);
 ctx.drawImage(im,frame*64,row*112,64,112,xy.x-32,xy.y-100,64,112);
};
const drawWorld=()=>{
 ctx.fillStyle='#243543';ctx.fillRect(0,0,W,H);
 // Only background atmosphere/UI uses vector shapes. All world art is original generated v6b PNG.
 ctx.fillStyle='#2a4050';ctx.fillRect(0,568,W,132);
 // Depth ordering: floor before every world object, interactive props & people together.
 for(let s=0;s<COLS+ROWS;s++)for(let c=0;c<COLS;c++){
  const r=s-c;if(r<0||r>=ROWS)continue;const p=toXY(c,r);
  img(tileAt(c,r),p.x-32,p.y-16);
 }
 const drawing=[];
 for(const f of furniture)drawing.push({depth:f.c+f.r,kind:'prop',it:f});
 for(const n of npcs)drawing.push({depth:n.c+n.r+.1,kind:'npc',it:n});
 drawing.push({depth:state.c+state.r+.12,kind:'player'});
 drawing.sort((a,b)=>a.depth-b.depth);
 for(const o of drawing){if(o.kind==='prop'){
  const p=toXY(o.it.c,o.it.r),f=o.it,im=IMG[f.asset];if(!im||!im.naturalWidth)continue;
  img(f.asset,p.x-Math.round(im.width/2),p.y-im.height+8+(f.offsetY||0));
 }else if(o.kind==='npc'){
   const n=o.it;drawChar(n.asset,n.c,n.r,n.dir,false,runAnim+n.c*.2);
 }else drawChar(state.skin,state.c,state.r,state.dir,hasStarted,runAnim);
 }
 // Small in-world hover marker is a UI indicator, not sprite art.
 const nearby=nearest();if(nearby){const pos=toXY(nearby.c,nearby.r);ctx.strokeStyle='#a5dbc7';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(pos.x,pos.y-16);ctx.lineTo(pos.x+17,pos.y-8);ctx.lineTo(pos.x,pos.y);ctx.lineTo(pos.x-17,pos.y-8);ctx.closePath();ctx.stroke()}
};
function nearest(){let best=null,dist=Infinity;for(const a of actions){const d=Math.hypot(state.c-a.c,state.r-a.r);if(d<a.radius&&d<dist){best=a;dist=d}}return best}
function zone(){const c=state.c,r=state.r;return c<8&&r<7?'KANTOR':c>=10&&r<7?'WARUNG':c<8&&r>=9?'KOSAN':c>=10&&r>=9?'LOAK':'KOMPLEKS'}
function objective(){if(state.work)return ['Sedang bekerja · jam pulang 17.00','Kembali ke meja untuk pulang dan ambil gaji.'];if(state.minute%1440>=17*60)return ['Shift selesai · pulang ke kos','Istirahat atau cari barang untuk tambahan uang.'];if(state.minute%1440>=7*60&&state.minute%1440<17*60)return ['Absen di kantor sebelum 09.00','Datangi meja kerja, lalu tekan E.'];return ['Hidup di kota kecil','Cari uang, kelola kebutuhan, dan kenalan dengan warga.']}
function renderUI(){let minutes=Math.floor(state.minute)%1440;const hh=String(Math.floor(minutes/60)).padStart(2,'0'),mm=String(minutes%60).padStart(2,'0');$('clock').textContent=`${hh}:${mm}`;$('dayName').textContent=`${dayNames[(state.day-1)%7]}, HARI ${String(state.day).padStart(2,'0')}`;$('wallet').textContent=fmt(state.money);$('zoneName').textContent=zone();$('playerName').textContent=state.name.toUpperCase();$('playerRole').textContent=`WARGA BARU · LV ${String(1+state.skill).padStart(2,'0')}`;$('bagCount').textContent=state.bag.length;const [a,b]=objective();$('objectiveText').textContent=a;$('objectiveSub').textContent=b;
 const near=nearest();$('nearby').style.display=near?'flex':'none';$('nearbyLabel').textContent=near?.label||'';$('actionLabel').textContent=near?near.label.toUpperCase():'AKSI';$('btnAction').disabled=!near;
 const pr=$('avatarPreview');pr.style.backgroundImage=`url(./assets/${imagePaths[state.skin]})`;pr.style.backgroundSize='384px 4928px';pr.style.backgroundPosition='-8px -2px';}
const say=(msg)=>{const el=$('toast');el.textContent=msg;el.style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.style.display='none',3700)};
function save(){try{localStorage.setItem('kota-shift-save',JSON.stringify(state))}catch{}}
function move(delta){const v=(1.70+(state.energy<15?-.55:0))*delta;
 let x=0,y=0;if(keys.has('w')||keys.has('arrowup')||keys.has('up'))y-=1;if(keys.has('s')||keys.has('arrowdown')||keys.has('down'))y+=1;if(keys.has('a')||keys.has('arrowleft')||keys.has('left'))x-=1;if(keys.has('d')||keys.has('arrowright')||keys.has('right'))x+=1;
 if(!x&&!y){hasStarted=false;return;}hasStarted=true;const norm=Math.hypot(x,y);x/=norm;y/=norm;
 // Convert screen-space input (in normalized iso units) into world-grid axes.
 const dc=(x+y)*v*.70, dr=(y-x)*v*.70;
 state.dir=(Math.abs(x)>.25 ?(x>0?'se':'sw'):(y<0?'ne':'se'));
 const free=(c,r)=>{if(c<.2||r<.2||c>COLS-.8||r>ROWS-.8)return false;
   for(const f of furniture){if(f.block&&Math.hypot(c-f.c,r-f.r)<f.block+.23)return false}
   for(const n of npcs){if(Math.hypot(c-n.c,r-n.r)<.5)return false}
   return true};
 if(free(state.c+dc,state.r+dr)){state.c+=dc;state.r+=dr}else{if(free(state.c+dc,state.r))state.c+=dc;if(free(state.c,state.r+dr))state.r+=dr}
}
function advanceMinutes(m){const oldDay=Math.floor(state.minute/1440);const oldTime=state.minute;state.minute+=m;const newDay=Math.floor(state.minute/1440);state.day=1+newDay;
 state.hunger=bounded(state.hunger-m*.022,0,100);state.energy=bounded(state.energy-m*(state.work?.active?.035:.013),0,100);state.hygiene=bounded(state.hygiene-m*.012,0,100);state.bladder=bounded(state.bladder+m*.047,0,100);
 if(state.hunger<15||state.energy<15||state.bladder>85)state.mood=bounded(state.mood-m*.030,0,100);
 if(state.work?.active){const start=state.work.start;const dayBase=Math.floor(start/1440)*1440;const overlap=Math.max(0,Math.min(state.minute,dayBase+17*60)-Math.max(oldTime,start,dayBase+9*60));state.work.minutes+=overlap}
 if(newDay>oldDay&&state.work){checkOut(true)}
}
function checkOut(auto=false){const w=state.work;if(!w)return;const time=Math.floor(w.start%1440);const late=Math.max(0,time-9*60);const salary=Math.max(0,Math.round((Math.min(480,w.minutes)/480)*((90000+state.skill*6500)-Math.ceil(late/15)*4000)/1000)*1000);state.money+=salary;state.lastPay=salary;state.work=null;say((auto?'Shift berakhir! ':'Pulang kerja! ')+'Gaji diterima '+fmt(salary)+(late>0?' (potongan telat).':'.'));save()}
function interact(){if(activePanel)return;const a=nearest();if(!a){say('Dekati objek atau NPC dulu untuk berinteraksi.');return}
 switch(a.kind){case'work':{let hour=state.minute%1440;if(state.work){checkOut();break}if(hour<7*60||hour>=17*60){say('Jam absen kantor 07.00–17.00.');break}state.work={start:state.minute,minutes:0,active:true};say(hour>9*60?'Absen terlambat. Gaji akan dipotong.':'Absen berhasil! Shift dimulai.');break}
 case'warung':openPanel('warung');break;
 case'home':openPanel('home');break;
 case'loak':openPanel('loak');break;
 case'water':state.energy=bounded(state.energy+5,0,100);state.bladder=bounded(state.bladder+14,0,100);say('Minum air putih. Energi +5, kandung kemih +14.');break;
 case'talk':{const n=npcs.find(n=>n.id===a.id);say(n.name+': '+n.talk[state.chatCount%n.talk.length]);state.chatCount++;state.mood=bounded(state.mood+2,0,100);break;}}
 save();renderUI()}
const items={nasi:{name:'Nasi kuning',icon:'🍚',price:15000,hunger:45,energy:3},kopi:{name:'Kopi tubruk',icon:'☕',price:8000,hunger:0,energy:19},mie:{name:'Mi rebus',icon:'🍜',price:12000,hunger:32,energy:2},botol:{name:'Botol antik',icon:'🏺',value:8000},radio:{name:'Radio rusak',icon:'📻',value:12000},koran:{name:'Koran lama',icon:'📰',value:5000}};
const itemIcon=k=>items[k]?.icon||'◈';
function buy(k){const it=items[k];if(!it)return;if(state.bag.length>=8){say('Tas penuh (8 slot).');return}if(state.money<it.price){say('Uangmu kurang.');return}state.money-=it.price;state.bag.push(k);say('Membeli '+it.name+' seharga '+fmt(it.price));save();openPanel('warung')}
function eat(index){const k=state.bag[index],it=items[k];if(!it||!Number.isFinite(it.price))return;state.hunger=bounded(state.hunger+(it.hunger||0),0,100);state.energy=bounded(state.energy+(it.energy||0),0,100);state.bladder=bounded(state.bladder+(k==='kopi'?16:2),0,100);state.bag.splice(index,1);say('Menikmati '+it.name+'.');save();openPanel('bag')}
function searchLoak(){if(state.minute-state.searchTime<60){say('Tempat ini sudah dicari. Coba lagi sejam lagi.');return}if(state.bag.length>=8){say('Tas penuh.');return}const arr=['botol','radio','koran'];const k=arr[Math.floor(Math.random()*arr.length)];state.bag.push(k);state.searchTime=state.minute;advanceMinutes(15);say('Menemukan '+items[k].name+'! Bisa dijual di lapak.');save();openPanel('loak')}
function sell(){let take=0;state.bag=state.bag.filter(k=>{if(items[k]?.value){take+=items[k].value;return false}return true});if(take){state.money+=take;say('Barang loak terjual: '+fmt(take))}else say('Tidak ada barang loak di tas.');save();openPanel('loak')}
function rest(mode){if(mode==='sleep'){advanceMinutes(240);state.energy=bounded(state.energy+70,0,100);state.mood=bounded(state.mood+10,0,100);say('Tidur nyenyak 4 jam. Energi pulih.')}else{advanceMinutes(25);state.hygiene=100;state.bladder=0;say('Mandi dan ke toilet. Bersih kembali!')}save();openPanel('home')}
function course(){if(state.money<20000){say('Saldo kurang untuk kursus.');return}state.money-=20000;advanceMinutes(60);state.skill+=1;state.mood=bounded(state.mood+5,0,100);say('Kursus selesai. Skill naik! Gaji shift berikutnya lebih tinggi.');save();openPanel('phone')}
function jump(){advanceMinutes(60);say('Demo: waktu maju 1 jam.');save();openPanel('status')}
function setSkin(s){if(!['ichsan','nadia','noor','bima'].includes(s))return;state.skin=s;state.name={ichsan:'Ichsan',nadia:'Nadia',noor:'Noor',bima:'Bima'}[s];save();openPanel('help')}
function bar(key,label,invert=false){const n=Math.floor(state[key]);const v=invert?100-n:n;return `<div class="stat-row"><span>${label}</span><span class="bar ${v<30?'warn':''}"><div style="width:${v}%"></div></span><span>${n}%</span></div>`}
function makePanel(type){switch(type){
 case'status':return{title:'Status Warga',kicker:'KONDISI KARAKTER',body:`<div class="section-label">KEBUTUHAN HARIAN</div>${bar('hunger','Kenyang')}${bar('energy','Energi')}${bar('hygiene','Kebersihan')}${bar('bladder','Ingin pipis',true)}${bar('mood','Mood')}<div class="small-card"><div class="panel-flex"><div><span class="tiny">KEUANGAN</span><div class="big-num">${fmt(state.money)}</div></div><div><span class="tiny">SKILL KERJA</span><div class="big-num">LV ${state.skill+1}</div></div></div></div><button class="panel-btn secondary" data-act="jump">Demo: percepat waktu +1 jam</button><p class="mobile-hint">Status tersimpan di browser perangkat ini. Gaji dasar shift penuh Rp90.000, dipotong jika terlambat.</p>`};
 case'bag':return{title:'Tas',kicker:`INVENTORY · ${state.bag.length}/8 SLOT`,body:`<p class="panel-desc">Tas punya kapasitas terbatas, seperti game farming klasik. Ketuk makanan untuk dikonsumsi.</p><div class="bag-grid">${Array.from({length:8},(_,i)=>{const k=state.bag[i],it=items[k];return k?`<button class="bag-cell" data-act="eat" data-index="${i}" ${!it?.price?'disabled':''}><span>${itemIcon(k)}</span><small>${it?.name}</small></button>`:`<div class="bag-cell empty"><span style="opacity:.25">＋</span><small>EMPTY</small></div>`}).join('')}</div><p class="mobile-hint">Barang bekas dijual lewat Bima di lapak loak. Makanan dibeli di Warung Bu Tati.</p>`};
 case'phone':return{title:'HP',kicker:'ONLINE & KURSUS',body:`<div class="small-card"><div class="section-label">BERANDA</div><strong>Belajar di sela-sela kerja.</strong><p>Belajar 1 jam, meningkatkan skill kerja dan menambah potensi gaji Rp6.500 per shift.</p></div><div class="small-card"><div class="panel-flex"><div><strong>Kursus Digital Dasar</strong><p>Durasi 1 jam · +1 level skill</p><span class="money">Rp20.000</span></div><span style="font-size:28px">▤</span></div><button class="panel-btn" data-act="course" ${state.money<20000?'disabled':''}>IKUTI KURSUS</button></div><p class="mobile-hint">HP hanya untuk aktivitas digital. Inventory tetap berada di tas, bukan di HP.</p>`};
 case'warung':return{title:'Warung Bu Tati',kicker:'BELANJA MAKANAN',body:`<p class="panel-desc">“Makan dulu, Nak. Baru cari uang lagi.”</p><div class="panel-list">${['nasi','mie','kopi'].map(k=>{const i=items[k];return `<div class="small-card panel-flex"><div style="font-size:27px">${i.icon}</div><div class="flex-grow"><strong>${i.name}</strong><span class="tiny">${i.hunger?'Kenyang +'+i.hunger:'Energi +'+i.energy}</span><div class="money">${fmt(i.price)}</div></div><button class="panel-btn" data-act="buy" data-item="${k}" ${state.bag.length>=8||state.money<i.price?'disabled':''}>BELI</button></div>`}).join('')}</div><p class="mobile-hint">Makanan masuk ke tas. Buka TAS untuk makan.</p>`};
 case'home':return{title:'Kosan',kicker:'RUANG ISTIRAHAT',body:`<p class="panel-desc">Pulang sebentar dari hiruk-pikuk kota. Kamar ini masih sederhana, tapi cukup untuk istirahat.</p><div class="small-card"><strong>🛋 Istirahat · 4 jam</strong><p>Energi +70 dan Mood +10.</p><button class="panel-btn" data-act="rest" data-mode="sleep">TIDUR SEBENTAR</button></div><div class="small-card"><strong>🚿 Mandi + Toilet · 25 menit</strong><p>Kebersihan kembali 100% dan kandung kemih kosong.</p><button class="panel-btn secondary" data-act="rest" data-mode="wash">MANDI & KE WC</button></div>`};
 case'loak':return{title:'Lapak Loak',kicker:'CARI & JUAL BARANG',body:`<p class="panel-desc">Bima menerima barang bekas yang kamu temukan. Setiap lokasi bisa dicari kembali setelah 60 menit waktu game.</p><div class="small-card"><strong>🔎 Cari barang</strong><p>Memerlukan 15 menit dan 1 slot kosong dalam tas.</p><button class="panel-btn" data-act="search" ${state.bag.length>=8||state.minute-state.searchTime<60?'disabled':''}>CARI BARANG</button></div><div class="small-card"><strong>Jual barang temuan</strong><p>Barang terjual langsung, uang masuk dompet.</p><button class="panel-btn secondary" data-act="sell">JUAL SEMUA BARANG LOAK</button></div>`};
 case'help':return{title:'Selamat Datang di Kota Shift',kicker:'PROTOTYPE · v0.1',body:`<p class="panel-desc">Game sandbox kehidupan kota Indonesia. Jalan-jalan, kerja shift, makan di warung, cari barang loak, dan pulang ke kosan.</p><div class="section-label">PILIH KARAKTER</div><div class="avatar-picker">${['ichsan','nadia','noor','bima'].map(k=>`<button class="avatar-option ${state.skin===k?'selected':''}" data-act="skin" data-skin="${k}"><img src="./assets/${imagePaths[k]}" alt="${k}" style="width:64px;height:112px;object-fit:none;object-position:0 0"><label>${{ichsan:'Ichsan',nadia:'Nadia',noor:'Noor',bima:'Bima'}[k]}</label></button>`).join('')}</div><div class="small-card"><strong>Kontrol</strong><p>W A S D / tombol panah = jalan · E = interaksi · I = Tas · P = HP · C = Status.</p><p>Di HP, gunakan D-pad layar dan tombol E di bawah.</p></div><button class="panel-btn" data-act="close">MULAI MAIN</button><p class="mobile-hint">Ini game baru dengan aset v6b dari sumber yang kamu upload; multiplayer dan akun belum diaktifkan dalam prototype.</p>`};
 default:return{title:'Kota Shift',kicker:'GAME',body:'-'}}
}
function openPanel(name){activePanel=name;const p=makePanel(name);$('panelKicker').textContent=p.kicker;$('panelTitle').textContent=p.title;$('panelBody').innerHTML=p.body;$('overlay').classList.remove('hidden');$('overlay').setAttribute('aria-hidden','false');document.body.classList.add('noscroll');document.querySelectorAll('.hud-button').forEach(b=>b.classList.toggle('active',b.id==='btn'+name.charAt(0).toUpperCase()+name.slice(1)));renderUI()}
function closePanel(){activePanel='';$('overlay').classList.add('hidden');$('overlay').setAttribute('aria-hidden','true');document.body.classList.remove('noscroll');document.querySelectorAll('.hud-button').forEach(b=>b.classList.remove('active'))}
$('panelBody').addEventListener('click',ev=>{const b=ev.target.closest('[data-act]');if(!b||b.disabled)return;switch(b.dataset.act){case'buy':buy(b.dataset.item);break;case'eat':eat(Number(b.dataset.index));break;case'search':searchLoak();break;case'sell':sell();break;case'rest':rest(b.dataset.mode);break;case'course':course();break;case'jump':jump();break;case'skin':setSkin(b.dataset.skin);break;case'close':closePanel();break;}});
$('btnClose').addEventListener('click',closePanel);$('overlay').addEventListener('click',e=>{if(e.target===$('overlay'))closePanel()});
$('btnAction').addEventListener('click',interact);$('btnBag').addEventListener('click',()=>activePanel==='bag'?closePanel():openPanel('bag'));$('btnPhone').addEventListener('click',()=>activePanel==='phone'?closePanel():openPanel('phone'));$('btnStatus').addEventListener('click',()=>activePanel==='status'?closePanel():openPanel('status'));$('btnHelp').addEventListener('click',()=>openPanel('help'));
const stopKeys=new Set(['arrowup','arrowdown','arrowleft','arrowright',' ','w','a','s','d']);
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(stopKeys.has(k))e.preventDefault();if(activePanel){if(k==='escape')closePanel();return}if(k==='e'){interact();return}if(k==='i'){openPanel('bag');return}if(k==='p'){openPanel('phone');return}if(k==='c'){openPanel('status');return}if(k==='h'){openPanel('help');return}keys.add(k)});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>keys.clear());
document.querySelectorAll('[data-move]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(b.dataset.move);b.setPointerCapture(e.pointerId)});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>keys.delete(b.dataset.move))});
let seconds=0,uiElapsed=0,saveElapsed=0;
function loop(time){const dt=bounded((time-now)/1000,0,.06);now=time;runAnim+=dt; if(!activePanel){move(dt);seconds+=dt;if(seconds>=1){const steps=Math.floor(seconds);seconds-=steps;advanceMinutes(steps*3)}}
 drawWorld();uiElapsed+=dt;saveElapsed+=dt;if(uiElapsed>.13){renderUI();uiElapsed=0}if(saveElapsed>5){save();saveElapsed=0}requestAnimationFrame(loop)}
renderUI();requestAnimationFrame(loop);
window.KotaShiftTest={getState:()=>JSON.parse(JSON.stringify(state)),teleport:(c,r)=>{state.c=c;state.r=r;renderUI()},setTime:minutes=>{state.minute=minutes;state.day=1+Math.floor(minutes/1440);renderUI()},interact,openPanel,closePanel,advanceMinutes,save,reset:()=>{state=defaults();save();renderUI()}};
try{if(!sessionStorage.getItem('kota-shift-welcomed')){sessionStorage.setItem('kota-shift-welcomed','1');openPanel('help')}}catch{openPanel('help')}
})();
