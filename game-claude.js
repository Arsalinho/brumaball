"use strict";
function fail(e){const d=document.getElementById("err");if(!d)return;const m=String(e&&e.message||e);d.style.display="block";d.textContent="No se pudo arrancar BrumaBall\n\n"+m+(/THREE/.test(m)?"\n\nNo cargó la librería 3D (Three.js). Puede ser un bloqueo de red a cdnjs/jsDelivr.":"")+(e&&e.stack?"\n\n"+String(e.stack).split("\n").slice(1,3).join("\n"):"")}addEventListener("error",ev=>fail(ev.error||ev.message));
const T=THREE,$=id=>document.getElementById(id),V3=(x=0,y=0,z=0)=>new T.Vector3(x,y,z),cl=(v,a,b)=>Math.max(a,Math.min(b,v)),lk=(r,dt)=>1-Math.exp(-r*dt),UP=V3(0,1,0),wa=a=>Math.atan2(Math.sin(a),Math.cos(a));
const C={L:500,W:300,GW:56,GH:22,GD:18,R:5,CH:120,GRAV:60,BG:40,MAXN:48,MAXB:88,BU:22,BR:12,BA:68,BAIR:62,HH:1.3,STEP:1/60};
const S={n:1,diff:1,dur:300,train:false,q:'2'};
let SV={};try{SV=JSON.parse(localStorage.getItem('brumaball')||'{}')}catch(e){}
['cb','cr','cf'].forEach(k=>{if(SV[k])$(k).value=SV[k]});if(SV.qual)document.querySelectorAll('#qual button').forEach(b=>b.classList.toggle('on',b.dataset.v===SV.qual));
const val=id=>document.querySelector('#'+id+' .on').dataset.v;
const rd=(()=>{var er;for(const aa of[true,false]){try{return new T.WebGLRenderer({antialias:aa})}catch(e){er=e}}fail("WebGL no disponible: "+(er&&er.message)+" — activa la aceleración por hardware o prueba Chrome/Edge.");throw er})();rd.outputEncoding=T.sRGBEncoding;rd.shadowMap.enabled=true;rd.shadowMap.type=T.PCFSoftShadowMap;document.body.prepend(rd.domElement);
const scene=new T.Scene();scene.background=new T.Color(0x9fb6c9);scene.fog=new T.Fog(0x9fb6c9,260,1500);
const cam=new T.PerspectiveCamera(75,1,.5,4000);
scene.add(new T.HemisphereLight(0xe3eef8,0x56687a,1.25));
const sun=new T.DirectionalLight(0xffffff,1.3);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);const sc=sun.shadow.camera;sc.left=sc.bottom=-70;sc.right=sc.top=70;sc.near=1;sc.far=400;sc.updateProjectionMatrix();scene.add(sun,sun.target);
function applyQ(){const q=val('qual');rd.setPixelRatio(q==='0'?.6:q==='1'?1:Math.min(devicePixelRatio,2));sun.castShadow=q!=='0';rs()}
function rs(){rd.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}
addEventListener('resize',rs);
const M=(c,o={})=>new T.MeshStandardMaterial(Object.assign({color:c,metalness:.4,roughness:.5},o)),N=c=>new T.MeshBasicMaterial({color:c});
const box=(w,h,d,m,x,y,z,p=scene,sh=false)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=sh;o.receiveShadow=true;p.add(o);return o};
/* ---------- Arena ---------- */
const RAMPS=[];
let GN=V3(0,1,0);const BOARDS=[];
function gnd(x,z,y){let h=0;GN.set(0,1,0);for(const r of RAMPS){if(Math.abs(x-r[0])<r[2]/2&&Math.abs(z-r[1])<r[3]/2){const t=((z-r[1])*r[5]+r[3]/2)/r[3],rh=r[4]*t;if(y-rh>-2.5&&rh>h){h=rh;GN.set(0,1,-r[5]*r[4]/r[3]).normalize()}}}return h}
(function build(){
 const cv=document.createElement('canvas');cv.width=600;cv.height=1000;const g=cv.getContext('2d');
 for(let i=0;i<10;i++){g.fillStyle=i%2?'#2f9a64':'#278756';g.fillRect(0,i*100,600,100)}
 g.strokeStyle='#e8fff4';g.lineWidth=5;g.strokeRect(6,6,588,988);g.beginPath();g.moveTo(0,500);g.lineTo(600,500);g.stroke();g.beginPath();g.arc(300,500,90,0,7);g.stroke();g.strokeRect(150,0,300,90);g.strokeRect(150,910,300,90);
 const tx=new T.CanvasTexture(cv);tx.anisotropy=8;tx.encoding=T.sRGBEncoding;
 const fl=new T.Mesh(new T.PlaneGeometry(C.W,C.L),M(0xffffff,{map:tx,roughness:.9,metalness:0}));fl.rotation.x=-Math.PI/2;fl.receiveShadow=true;scene.add(fl);
 const out=new T.Mesh(new T.PlaneGeometry(6000,6000),M(0x71859a,{roughness:1}));out.rotation.x=-Math.PI/2;out.position.y=-.6;scene.add(out);
 const glass=M(0x5d9dff,{transparent:true,opacity:.28,metalness:.8,roughness:.1,side:T.DoubleSide}),W=C.W/2,L=C.L/2,gw=C.GW/2;
 box(1,45,C.L,glass,-W-.5,22.5,0);box(1,45,C.L,glass,W+.5,22.5,0);
 box(.6,.6,C.L,N(0x66ccff),-W,.4,0);box(.6,.6,C.L,N(0x66ccff),W,.4,0);
 [-1,1].forEach(s=>{const ex=(C.W-C.GW)/2;box(ex,45,1,glass,-(gw+ex/2),22.5,s*L);box(ex,45,1,glass,gw+ex/2,22.5,s*L);box(C.GW,45-C.GH,1,glass,0,C.GH+(45-C.GH)/2,s*L);
  const col=s<0?0x2f8cff:0xff8a1f,fm=N(col),gz=s*(L+C.GD/2);
  [-gw,gw].forEach(x=>{box(1.4,C.GH,1.4,fm,x,C.GH/2,s*L);box(1,C.GH,C.GD,new T.MeshBasicMaterial({color:col,wireframe:true}),x,C.GH/2,gz)});
  box(C.GW,1.4,1.4,fm,0,C.GH,s*L);const net=new T.Mesh(new T.BoxGeometry(C.GW,C.GH,C.GD),new T.MeshBasicMaterial({color:col,wireframe:true,transparent:true,opacity:.5}));net.position.set(0,C.GH/2,gz);scene.add(net);
  box(C.GW,C.GH,.4,new T.MeshBasicMaterial({color:col,transparent:true,opacity:.18}),0,C.GH/2,s*(L+C.GD));
  const sb=document.createElement('canvas');sb.width=512;sb.height=170;const b=new T.Mesh(new T.PlaneGeometry(120,40),new T.MeshBasicMaterial({map:new T.CanvasTexture(sb)}));b.position.set(0,78,s*(L+110));b.rotation.y=s<0?0:Math.PI;scene.add(b);BOARDS.push({cv:sb,t:b.material.map})});
 RAMPS.forEach(r=>{const a=Math.atan2(r[4],r[3]),m=box(r[2],.6,Math.hypot(r[3],r[4]),M(0x6a7fa8,{metalness:.3,roughness:.5}),r[0],r[4]/2-.3,r[1],scene,true);m.rotation.x=-r[5]*a;
  const e=box(r[2],.4,.8,N(0x7cf4c8),r[0],r[4]-.2,r[1]+r[5]*r[3]/2);const s=box(r[2]-2,r[4]*.9,.5,M(0x34405f),r[0],r[4]*.45,r[1]+r[5]*r[3]/2)});
 const pal=[0xff3d81,0x39d0ff,0xffd23f,0x7cf4c8];
 for(let k=0;k<70;k++){const a=k/70*Math.PI*2,x=Math.cos(a)*(W+90+Math.random()*60),z=Math.sin(a)*(L+110+Math.random()*60);if(Math.abs(x)<110&&Math.abs(z)>L)continue;const h=20+Math.random()*45;box(24,h,24,M(0x3a4d72,{emissive:pal[k%4],emissiveIntensity:.35}),x,h/2,z)}
 for(let k=0;k<18;k++){const a=k/18*Math.PI*2,r=1500+Math.random()*300,h=180+Math.random()*180,m=new T.Mesh(new T.ConeGeometry(240+Math.random()*120,h,7),M(0x6b8299,{roughness:1}));m.position.set(Math.cos(a)*r,h/2,Math.sin(a)*r);scene.add(m)}
 [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(c=>{const x=c[0]*(W+45),z=c[1]*(L+45);box(4,95,4,M(0x2a3350),x,47,z);box(18,6,18,N(0xfff3c4),x,98,z)});
})();
function board(){BOARDS.forEach(o=>{const g=o.cv.getContext('2d');g.fillStyle='#050912';g.fillRect(0,0,512,170);g.font='bold 100px sans-serif';g.textAlign='center';g.fillStyle='#2f8cff';g.fillText(G.blue,110,125);g.fillStyle='#ff8a1f';g.fillText(G.orange,402,125);g.fillStyle='#fff';g.font='bold 40px sans-serif';g.fillText('VS',256,100);o.t.needsUpdate=true})}
/* ---------- Partículas ---------- */
const NP=700,pg=new T.BufferGeometry(),pP=new Float32Array(NP*3).fill(-9999),pC=new Float32Array(NP*3),pB=new Float32Array(NP*3),pV=new Float32Array(NP*3),pL=new Float32Array(NP),pM=new Float32Array(NP);let pn=0;
pg.setAttribute('position',new T.BufferAttribute(pP,3));pg.setAttribute('color',new T.BufferAttribute(pC,3));
const pts=new T.Points(pg,new T.PointsMaterial({size:1.7,vertexColors:true,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));pts.frustumCulled=false;scene.add(pts);
const tc=new T.Color();
function emit(p,vx,vy,vz,col,life){const i=pn++%NP;tc.set(col);pP[i*3]=p.x;pP[i*3+1]=p.y;pP[i*3+2]=p.z;pV[i*3]=vx;pV[i*3+1]=vy;pV[i*3+2]=vz;pB[i*3]=tc.r;pB[i*3+1]=tc.g;pB[i*3+2]=tc.b;pL[i]=pM[i]=life}
function burst(p,n,col,sp,life=.5){for(let k=0;k<n;k++)emit(p,(Math.random()-.5)*sp,Math.random()*sp*.7,(Math.random()-.5)*sp,col,life*(.6+Math.random()*.7))}
function updP(dt){for(let i=0;i<NP;i++){if(pL[i]<=0)continue;pL[i]-=dt;if(pL[i]<=0){pP[i*3+1]=-9999;continue}pP[i*3]+=pV[i*3]*dt;pP[i*3+1]+=pV[i*3+1]*dt;pP[i*3+2]+=pV[i*3+2]*dt;pV[i*3+1]-=14*dt;const f=pL[i]/pM[i];pC[i*3]=pB[i*3]*f;pC[i*3+1]=pB[i*3+1]*f;pC[i*3+2]=pB[i*3+2]*f}pg.attributes.position.needsUpdate=pg.attributes.color.needsUpdate=true}
/* ---------- Audio ---------- */
let AC,mg,eo,eg,ef,bg;
function audioInit(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();mg=AC.createGain();mg.connect(AC.destination);eo=AC.createOscillator();eo.type='sawtooth';eg=AC.createGain();eg.gain.value=0;ef=AC.createBiquadFilter();ef.frequency.value=500;eo.connect(ef);ef.connect(eg);eg.connect(mg);eo.start();
 const nb=AC.createBuffer(1,AC.sampleRate,AC.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const bn=AC.createBufferSource();bn.buffer=nb;bn.loop=true;const bf=AC.createBiquadFilter();bf.type='bandpass';bf.frequency.value=800;bg=AC.createGain();bg.gain.value=0;bn.connect(bf);bf.connect(bg);bg.connect(mg);bn.start();vol()}catch(e){AC=null}}
function vol(){if(mg)mg.gain.value=$('mute').checked?0:$('vol').value/100}
function tone(f,d,type='square',v=.15,sl=0){if(!AC)return;const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(sl)o.frequency.exponentialRampToValueAtTime(Math.max(20,f+sl),t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(mg);o.start();o.stop(t+d)}
/* ---------- Coche ---------- */
function makeCar(team,body,rim){
 const g=new T.Group(),b=new T.Group();g.add(b);const bm=M(body,{metalness:.65,roughness:.3}),dk=M(0x15181f,{metalness:.8}),gl=M(0x1c2a44,{metalness:1,roughness:.08,transparent:true,opacity:.85}),tm=N(team?0xff8a1f:0x2f8cff),rm=M(rim,{metalness:.9,roughness:.2});
 const a=(w,h,d,m,x,y,z,p=b)=>box(w,h,d,m,x,y,z,p,true);
 a(4,1,8.4,bm,0,0,0);a(3.6,.5,3.2,bm,0,.65,2.6);a(3.2,1,3.6,gl,0,1,-.5);a(3,.2,3,bm,0,1.55,-.5);a(1,.06,5,tm,0,1.7,-.5);a(3.7,.25,1,tm,0,-.5,4.3);
 a(4.2,.5,.6,dk,0,-.35,4.35);a(4.2,.5,.6,dk,0,-.35,-4.35);a(4.4,.15,1.4,dk,0,1.9,-3.9);[-1.5,1.5].forEach(x=>a(.2,1,.3,dk,x,1.3,-3.9));
 [-1.4,1.4].forEach(x=>{box(.9,.4,.2,N(0xfff6cc),x,.25,4.25,b);box(.9,.4,.2,N(0xff2020),x,.25,-4.25,b)});
 const ex=[-.9,.9].map(x=>{const m=new T.Mesh(new T.CylinderGeometry(.3,.4,.8,8),dk);m.rotation.x=Math.PI/2;m.position.set(x,-.1,-4.5);b.add(m);return m});
 const wh=[];[[-2.1,2.7],[2.1,2.7],[-2.1,-2.7],[2.1,-2.7]].forEach((p,i)=>{const pv=new T.Group(),sp=new T.Group();pv.position.set(p[0],-.3,p[1]);const tg=new T.CylinderGeometry(1,1,.8,18);tg.rotateZ(Math.PI/2);const rg=new T.CylinderGeometry(.62,.62,.86,8);rg.rotateZ(Math.PI/2);
  const t=new T.Mesh(tg,dk),r=new T.Mesh(rg,rm);t.castShadow=true;sp.add(t,r);pv.add(sp);b.add(pv);wh.push({pv,sp,front:i<2})});
 return{g,b,bm,rm,wh,ex}}
const cars=[],bq=new T.Quaternion();let P,ball;
class Car{constructor(team,bot,idx,rem){this.team=team;this.bot=bot;this.rem=rem;this.idx=idx;const m=makeCar(team,(bot||rem)?(team?0xcc5a10:0x1c5fc2):$('cb').value,$('cr').value);Object.assign(this,m);
 this.p=V3();this.pp=V3();this.tp=V3();this.tv=V3();this.tq=new T.Quaternion();this.v=V3();this.q=new T.Quaternion();this.pq=new T.Quaternion();this.in={th:0,st:0,bo:false,dr:false,jp:false,pi:0,ya:0,ro:0,up:0};this.av=V3();this.fs=V3();this.at=0;this.name=bot?'Bot '+(team?'naranja':'azul')+' '+(idx+1):'Jugador';this.lean=V3();this.vf=0;this.st=0;this.bw=false;this.bo=false;this.fl=false;this.jc=0;scene.add(this.g);this.reset(true)}
 reset(full){const n=S.n,xs=n===1?[0]:n===2?[-30,30]:[-45,0,45],x=xs[this.idx%xs.length]||0,z=this.team?130:-130;this.yaw=this.team?Math.PI:0;this.p.set(x,C.HH+.05,z);this.pp.copy(this.p);this.v.set(0,0,0);this.q.setFromAxisAngle(UP,this.yaw);this.pq.copy(this.q);this.gr=true;this.jumps=0;this.jt=0;this.av.set(0,0,0);this.flip=0;this.oob=0;this.sk=0;this.rv=0;this.tg=null;if(full){this.boost=100;this.fl=false}}
 safe(){const p=this.p,f=V3(0,0,1).applyQuaternion(this.q);const h=Math.hypot(f.x,f.z);if(h>.3)this.yaw=Math.atan2(f.x,f.z);p.x=cl(p.x,-C.W/2+15,C.W/2-15);p.z=cl(p.z,-C.L/2+15,C.L/2-15);p.y=gnd(p.x,p.z,99)+C.HH+.1;this.v.set(0,0,0);this.q.setFromAxisAngle(UP,this.yaw);this.pp.copy(p);this.pq.copy(this.q);this.jumps=0;this.flip=0;this.av.set(0,0,0);this.oob=0;this.gr=true}}
function kill(o){o.traverse(c=>{if(c.geometry)c.geometry.dispose();if(c.material&&c.material.dispose)c.material.dispose()});scene.remove(o)}
function stepCar(c,dt){
 const i=c.in,v=c.v,p=c.p;c.pp.copy(p);c.pq.copy(c.q);
 const gh=gnd(p.x,p.z,p.y-C.HH),n=GN.clone(),grounded=p.y-C.HH<=gh+.2&&v.dot(n)<=4&&!(c.fl&&i.up>0);
 const bo=!!i.bo&&c.boost>0;c.bo=bo;
 if(bo){c.boost=Math.max(0,c.boost-C.BU*dt);if(!c.bw)v.addScaledVector(V3(0,0,1).applyQuaternion(c.q),5)}else c.boost=Math.min(100,c.boost+C.BR*dt);c.bw=bo;
 if(c.jc>0)c.jc-=dt;
 if(grounded){
  if(!c.gr){const f=V3(0,0,1).applyQuaternion(c.q);if(Math.hypot(f.x,f.z)>.25)c.yaw=Math.atan2(f.x,f.z);const imp=-v.dot(n);if(imp>10){burst(p,10,0xbbccdd,14,.4);if(c===P)tone(90,.2,'sine',.25,-40)}c.jumps=0;c.flip=0;c.av.set(0,0,0)}
  c.gr=true;p.y=Math.max(p.y,gh+C.HH);if(p.y<gh+C.HH+.3)p.y=gh+C.HH;
  const fl=V3(Math.sin(c.yaw),0,Math.cos(c.yaw));fl.addScaledVector(n,-fl.dot(n)).normalize();const lf=V3().crossVectors(n,fl);
  let vf=v.dot(fl),vl=v.dot(lf),a=0;const sp=Math.abs(vf);
  if(i.th>0)a=vf<0?90:vf<C.MAXN?55*(1-vf/C.MAXN)+8:0;else if(i.th<0)a=vf>0?-95:vf>-28?-45:0;else a=-Math.sign(vf)*Math.min(sp/dt,7);
  if(bo)a+=C.BA;vf+=a*dt;vf-=vf*.04*dt;
  if(vf>C.MAXN&&!bo)vf-=(vf-C.MAXN)*1.5*dt;if(bo)vf=Math.min(vf,C.MAXB);
  const drift=!!i.dr&&sp>15;vl*=Math.exp(-(drift?1.1:9)*dt);
  const sr=(2.7-1.7*Math.min(1,sp/C.MAXB))*(drift?1.5:1);c.yaw+=i.st*sr*dt*Math.sign(vf||1)*Math.min(1,sp/6);
  if(Math.abs(vl)>7&&sp>15&&Math.random()<.7)emit(V3(p.x,p.y-1,p.z),(Math.random()-.5)*4,2+Math.random()*3,(Math.random()-.5)*4,0xb9c2cf,.5);
  v.copy(fl).multiplyScalar(vf).addScaledVector(lf,vl);c.lean.set(vf,vl,0);c.vf=vf;
  if(i.jp){v.addScaledVector(n,34);c.gr=false;c.jumps=1;c.jt=0;p.y+=.4;if(c===P)tone(320,.15,'square',.1,200)}
  const m=new T.Matrix4().makeBasis(lf,n,fl);bq.setFromRotationMatrix(m);c.q.slerp(bq,lk(14,dt));
 }else{
  c.gr=false;c.jt+=dt;v.y-=(c.fl?C.GRAV*.05:C.GRAV)*dt;
  if(c.fl){v.y+=i.up*45*dt;v.multiplyScalar(Math.exp(-.35*dt))}
  if(i.jp&&c.jumps<2&&c.jt<1.6&&c.jt>.05){c.jumps=2;const u=V3(0,1,0).applyQuaternion(c.q);v.addScaledVector(u,22);
   if(i.pi||i.ro){const f=V3(0,0,1).applyQuaternion(c.q);f.y=0;f.normalize();const l=V3(f.z,0,-f.x);v.addScaledVector(f,i.pi*14).addScaledVector(l,-i.ro*14);c.flip=.45;c.fs.set(i.pi*13,0,i.ro*13)}if(c===P)tone(420,.15,'square',.1,260)}
  let tx=i.pi*4.6,ty=i.ya*3.6,tz=i.ro*5.2;if(c.flip>0){c.flip-=dt;tx=c.fs.x;tz=c.fs.z}
  c.av.x+=(tx-c.av.x)*lk(10,dt);c.av.y+=(ty-c.av.y)*lk(10,dt);c.av.z+=(tz-c.av.z)*lk(10,dt);
  const e=new T.Quaternion().setFromEuler(new T.Euler(c.av.x*dt,c.av.y*dt,c.av.z*dt));c.q.multiply(e).normalize();
  if(bo)v.addScaledVector(V3(0,0,1).applyQuaternion(c.q),C.BAIR*dt);
  if(!c.fl)v.multiplyScalar(Math.exp(-.02*dt));
  if(bo&&v.length()>C.MAXB)v.setLength(C.MAXB);c.vf=v.dot(V3(0,0,1).applyQuaternion(c.q));
 }
 if(v.length()>150)v.setLength(150);
 p.addScaledVector(v,dt);
 const xl=C.W/2-2.3,inG=Math.abs(p.x)<C.GW/2-2.6&&p.y<C.GH-1.5,zl=inG?C.L/2+C.GD-2:C.L/2-4.5;let hit=0;
 if(p.x>xl){p.x=xl;if(v.x>0){hit=v.x;v.x*=-.3}}if(p.x<-xl){p.x=-xl;if(v.x<0){hit=-v.x;v.x*=-.3}}
 if(p.z>zl){p.z=zl;if(v.z>0){hit=v.z;v.z*=-.3}}if(p.z<-zl){p.z=-zl;if(v.z<0){hit=-v.z;v.z*=-.3}}
 if(p.y>C.CH-2){p.y=C.CH-2;if(v.y>0)v.y*=-.3}
 if(hit>12){burst(p,8,0xffd27a,18,.35);if(c===P)tone(70,.2,'sawtooth',.2,-30)}
 if(inG&&Math.abs(p.x)>C.GW/2-2.6&&Math.abs(p.z)>C.L/2-4.5){p.x=cl(p.x,-(C.GW/2-2.6),C.GW/2-2.6)}
 if(bo){const col=c===P?$('cf').value:c.team?0xff9a3a:0x4aa8ff;for(const x of[-.9,.9]){const w=V3(x,-.1,-4.9).applyQuaternion(c.q).add(p),b=V3(0,0,-1).applyQuaternion(c.q).multiplyScalar(18);emit(w,b.x+(Math.random()-.5)*4,b.y+(Math.random()-.5)*4,b.z+(Math.random()-.5)*4,col,.35)}}
 if(p.y<-12||Math.abs(p.x)>C.W/2+10||Math.abs(p.z)>C.L/2+C.GD+10){c.oob+=dt;if(c.oob>1.2)c.bot?c.reset(false):c.safe()}else c.oob=0;
}
/* ---------- Balón ---------- */
class Ball{constructor(){const g=new T.Group(),m=new T.Mesh(new T.IcosahedronGeometry(C.R,1),M(0xffffff,{roughness:.35,metalness:.1,emissive:0x444444,flatShading:true}));m.castShadow=true;g.add(m);
 const w=new T.Mesh(new T.IcosahedronGeometry(C.R*1.01,1),new T.MeshBasicMaterial({color:0x101828,wireframe:true}));g.add(w);this.mesh=g;scene.add(g);this.p=V3();this.pp=V3();this.v=V3();this.w=V3();this.last=null;this.reset()}
 reset(){this.p.set(0,C.R+8,0);this.pp.copy(this.p);this.v.set(0,0,0);this.last=null}}
function stepBall(b,dt){
 b.pp.copy(b.p);const p=b.p,v=b.v,R=C.R;v.y-=C.BG*dt;v.multiplyScalar(Math.exp(-.06*dt));p.addScaledVector(v,dt);
 const gh=gnd(p.x,p.z,p.y-R),n=GN;
 if(p.y-R<gh){p.y=gh+R;const vn=v.dot(n);if(vn<0){const e=-vn>5?.72:0;v.addScaledVector(n,-(1+e)*vn);if(-vn>14){burst(p,6,0xffffff,10,.3);tone(140+(-vn),.12,'sine',.18)}}v.x*=Math.exp(-.25*dt);v.z*=Math.exp(-.25*dt)}
 if(p.y>C.CH-R){p.y=C.CH-R;if(v.y>0)v.y*=-.6}
 const xl=C.W/2-R;if(Math.abs(p.x)>xl){p.x=Math.sign(p.x)*xl;if(v.x*p.x>0)v.x*=-.8}
 const inM=Math.abs(p.x)<C.GW/2-R+.01&&p.y<C.GH-R+.01,zl=inM?C.L/2+C.GD-R:C.L/2-R;
 if(Math.abs(p.z)>zl){p.z=Math.sign(p.z)*zl;if(v.z*p.z>0)v.z*=-.6}
 if(Math.abs(p.z)>C.L/2-R+.2){const xm=C.GW/2-R;if(Math.abs(p.x)>xm){p.x=Math.sign(p.x)*xm;if(v.x*p.x>0)v.x*=-.5}if(p.y>C.GH-R){p.y=C.GH-R;if(v.y>0)v.y*=-.5}}
 if(v.length()>130)v.setLength(130);
}
function ballCar(b,c){
 const inv=c.q.clone().invert(),l=b.p.clone().sub(c.p).applyQuaternion(inv),cp=V3(cl(l.x,-2.1,2.1),cl(l.y,-1.3,1.3),cl(l.z,-4.3,4.3)),d=l.clone().sub(cp);let dist=d.length();
 if(dist>=C.R)return;let n;if(dist<1e-4){n=V3(0,1,0);dist=0}else n=d.divideScalar(dist);n.applyQuaternion(c.q);
 b.p.addScaledVector(n,C.R-dist+.01);const rel=b.v.clone().sub(c.v),vn=rel.dot(n);
 if(vn<0){const k=-1.62*vn*(c.bo?1.12:1);b.v.addScaledVector(n,k*.72);b.v.addScaledVector(c.v,.12);c.v.addScaledVector(n,-k*.1);b.last=c;b.lt=performance.now();
  if(-vn>18){burst(b.p,14,0xfff0b0,22,.4);tone(110+(-vn)*2,.15,'sawtooth',.25,-60);if(-vn>45)tone(60,.3,'sine',.3,-20)}}
}
/* ---------- IA ---------- */
const DF=[{re:.45,pr:0,no:.5,bd:80,bm:60,ac:.75},{re:.2,pr:.35,no:.2,bd:55,bm:35,ac:.92},{re:.08,pr:.7,no:.05,bd:35,bm:12,ac:1}];
function ai(c,dt){
 const d=DF[S.diff],i=c.in,b=ball,p=c.p,dir=c.team?-1:1,f=V3(0,0,1).applyQuaternion(c.q);
 Object.assign(i,{th:0,st:0,bo:false,jp:false,dr:false,pi:0,ya:0,ro:0,up:0});c.at-=dt;
 if(c.at<=0){c.at=d.re*(.7+Math.random()*.6);const tp=b.p.clone().addScaledVector(b.v,d.pr*Math.min(1,b.p.distanceTo(p)/80));tp.y=0;
  const mates=cars.filter(o=>o.team===c.team&&o.bot).sort((a,z)=>a.p.distanceTo(b.p)-z.p.distanceTo(b.p));const threat=b.p.z*dir<40;
  if(mates[0]===c||threat){const gd=V3(0,0,dir*C.L/2).sub(tp);gd.y=0;gd.normalize();c.tg=tp.clone().addScaledVector(gd,-(C.R+4.5));if(p.z*dir>tp.z*dir+4)c.tg.z-=dir*30;c.atk=true}
  else{c.tg=V3(cl(b.p.x*.5,-60,60),0,-dir*(C.L/2-50));c.atk=false}}
 if(!c.tg)return;
 const to=c.tg.clone().sub(p);to.y=0;const dist=to.length(),ang=wa(Math.atan2(to.x,to.z)-Math.atan2(f.x,f.z)),sp=c.v.length(),bd=b.p.clone().sub(p),bh=Math.hypot(bd.x,bd.z);
 if(c.gr){i.th=d.ac;i.st=cl(ang*2.2+Math.sin(performance.now()/300+c.idx)*d.no*.3,-1,1);i.dr=Math.abs(ang)>1.2&&sp>25;
  const want=c.atk&&dist>d.bd&&Math.abs(ang)<.3&&sp>10;i.bo=want&&c.boost>(c.bw?3:d.bm)||(c.boost>90&&Math.abs(ang)<.2&&dist>50&&S.diff>0);
  if(b.p.y>9&&bh<28&&Math.abs(ang)<.8&&c.jc<=0&&c.atk){i.jp=true;c.jc=2}
  if(sp<4){c.sk+=dt}else c.sk=0;if(c.sk>1.2){c.rv=1;c.sk=0;c.rs=Math.random()<.5?1:-1}
  if(c.rv>0){c.rv-=dt;i.th=-1;i.st=c.rs;i.bo=false}}
 else{if(c.atk&&b.p.y>6&&bh<45){const l=bd.clone().applyQuaternion(c.q.clone().invert()),pe=Math.atan2(l.y,l.z),ye=Math.atan2(l.x,l.z);i.pi=-cl(pe*2.2,-1,1);i.ya=cl(ye*2,-1,1);i.bo=Math.abs(pe)<.35&&c.boost>8&&l.z>0;if(c.jumps<2&&c.jt>.3&&bh<22&&c.jc<=0){i.jp=true;c.jc=2}}
  else{const lf=V3(1,0,0).applyQuaternion(c.q);i.pi=cl(f.y*2,-1,1);i.ro=-cl(lf.y*2,-1,1)}}
}
/* ---------- Entrada ---------- */
const keys={},kp={};const GK=new Set(['KeyW','KeyA','KeyS','KeyD','Space','ShiftLeft','ControlLeft','KeyB','ArrowUp','ArrowDown','KeyQ','KeyE','KeyZ','KeyX','KeyF','KeyR','KeyV','KeyC','KeyT','KeyP','KeyH','Escape']);
addEventListener('keydown',e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)&&G.state==='menu')return;if(GK.has(e.code)&&(G.state!=='menu'))e.preventDefault();if(!e.repeat)kp[e.code]=true;keys[e.code]=true});
addEventListener('keyup',e=>{keys[e.code]=false});addEventListener('blur',()=>{for(const k in keys)keys[k]=false});
function readIn(c){const k=keys,i=c.in;i.th=(k.KeyW?1:0)-(k.KeyS?1:0);i.st=(k.KeyA?1:0)-(k.KeyD?1:0);i.bo=!!k.ShiftLeft;i.dr=!!(k.ControlLeft||k.KeyB);i.jp=!!kp.Space;i.pi=i.th;i.ya=i.st;i.ro=0;i.up=0}
/* ---------- Estado de partido ---------- */
const G={state:'menu',blue:0,orange:0,time:300,ballCam:false,gt:0,ot:false,t:0};
function startGame(train){audioInit();S.n=+val('mode');S.diff=+val('diff');S.dur=+val('dur');S.train=train;
 try{localStorage.setItem('brumaball',JSON.stringify({cb:$('cb').value,cr:$('cr').value,cf:$('cf').value,qual:val('qual')}))}catch(e){}
 cars.forEach(c=>kill(c.g));cars.length=0;
 P=new Car(0,false,0);cars.push(P);for(let k=1;k<S.n;k++)cars.push(new Car(0,true,k));for(let k=0;k<S.n;k++)cars.push(new Car(1,true,k));
 if(!ball)ball=new Ball();G.blue=G.orange=0;G.time=S.dur;G.ot=false;G.ballCam=false;kick();board();cd.set(0,0,1);cp.copy(P.p).add(V3(0,12,-25));ct.copy(P.p);G.state='play';$('menu').style.display='none';document.body.classList.remove('inmenu');$('msg').style.display='none';if(document.activeElement)document.activeElement.blur()}
function kick(){ball.reset();cars.forEach(c=>c.reset(true))}
function setMenu(paused){G.prev=G.state;G.state='menu';document.body.classList.add('inmenu');$('menu').style.display='grid';$('nres').style.display=paused?'block':'none';showP('play');(paused?$('nres'):document.querySelector('.it[data-p=play]')).focus()}
function goal(team,who,rem){G.state='goal';if(!rem){if(team===0)G.blue++;else G.orange++}board();G.gt=NET||!$('nop').checked?3.2:.2;
 who=who||(ball.last?ball.last.name:'');$('msg').style.display='block';$('msg').style.color=team?'#ff8a1f':'#2f8cff';$('msg').innerHTML='¡GOL '+(team?'NARANJA':'AZUL')+'!<div style="font-size:24px;color:#fff">'+who+'</div>';
 for(let k=0;k<160;k++)emit(ball.p,(Math.random()-.5)*60,Math.random()*50,(Math.random()-.5)*60,[0x2f8cff,0xff8a1f,0xffffff,0x7cf4c8][k%4],1.6);tone(220,.5,'sawtooth',.3,440);setTimeout(()=>tone(440,.6,'square',.2,220),250)}
function step(dt){
 cars.forEach(c=>c.rem?0:c.bot?ai(c,dt):readIn(c));

 cars.forEach(c=>c.rem?stepRem(c,dt):stepCar(c,dt));
 for(let a=0;a<cars.length;a++)for(let b=a+1;b<cars.length;b++){const A=cars[a],B=cars[b],d=B.p.clone().sub(A.p),L=d.length();if(L<6.6&&L>1e-3){d.divideScalar(L);const o=(6.6-L)/2;A.p.addScaledVector(d,-o);B.p.addScaledVector(d,o);const vn=A.v.clone().sub(B.v).dot(d);if(vn>0){A.v.addScaledVector(d,-vn*.8);B.v.addScaledVector(d,vn*.8);if(vn>15)burst(A.p.clone().lerp(B.p,.5),8,0xffd27a,16,.3)}}}
 stepBall(ball,dt);cars.forEach(c=>ballCar(ball,c));if(NET&&!NET.host)blend();
 if(G.state==='play'&&(!NET||NET.host)){const z=ball.p.z;if(Math.abs(z)>C.L/2+C.R*.85){const tm=z>0?0:1;goal(tm);if(NET){NET.gn++;NET.gt=tm;NET.gw=ball.last?ball.last.name:''}}
  else if(!S.train&&S.dur>0&&(!NET||cars.length>1)){G.time-=dt;if(G.time<=0){G.time=0;if(G.blue===G.orange)G.ot=true;else endGame()}}}
 if(NET&&!NET.dead){if(++NET.tick%3===0)sendState();if(NET.lost&&performance.now()-NET.lost>4000)netFail('El anfitrión salió de la sala.')}
}
function endGame(){G.state='end';const w=G.blue>G.orange;$('msg').style.display='block';$('msg').style.color=w?'#2f8cff':'#ff8a1f';$('msg').innerHTML=(w?'¡VICTORIA!':'DERROTA')+'<div style="font-size:22px;color:#fff">'+G.blue+' - '+G.orange+' · pulsa P para otra partida</div>'}
/* ---------- Cámara ---------- */
const cd=V3(0,0,1),cp=V3(0,12,-25),ct=V3();let fov=75,rollC=0,fogK=0;
function updCam(dt,al){
 const pos=P.mesh.position,bp=ball.mesh.position,sp=P.v.length();
 if(G.state==='menu'){const a=G.t*.3;cp.set(P.p.x+Math.sin(a)*22,5+Math.sin(a*1.7)*1.8,P.p.z+Math.cos(a)*22);cam.position.copy(cp);cam.lookAt(P.p.x,2,P.p.z);cam.fov=60;cam.updateProjectionMatrix();return}
 const want=V3();
 if(G.ballCam){want.copy(bp).sub(pos);want.y*=.3}else{V3(0,0,1).applyQuaternion(P.q);want.set(0,0,1).applyQuaternion(P.q);want.y*=.3;if(sp>10){const vh=P.v.clone();vh.y=0;if(vh.lengthSq()>1)want.lerp(vh.normalize(),.35)}}
 if(want.lengthSq()<.01)want.copy(cd);want.normalize();cd.lerp(want,lk(G.ballCam?4.5:7,dt)).normalize();
 const bd=bp.distanceTo(pos),dist=(G.ballCam?19+cl(bd*.06,0,16):17)+Math.min(sp,100)*.1+(P.bo?3:0),h=6.5+(G.ballCam?cl(bp.y*.25,0,14):0);
 const ideal=pos.clone().addScaledVector(cd,-dist);ideal.y=pos.y-cd.y*dist+h;
 ideal.x=cl(ideal.x,-C.W/2+3,C.W/2-3);ideal.z=cl(ideal.z,-C.L/2-C.GD-30,C.L/2+C.GD+30);ideal.y=cl(ideal.y,gnd(ideal.x,ideal.z,99)+2.5,C.CH+60);
 cp.lerp(ideal,lk(9,dt));
 const look=G.ballCam?pos.clone().lerp(bp,.45):pos.clone().addScaledVector(cd,10).add(V3(0,2.5,0));ct.lerp(look,lk(12,dt));
 cam.position.copy(cp);if(P.bo&&sp>70){cam.position.x+=Math.sin(G.t*90)*.07;cam.position.y+=Math.cos(G.t*77)*.07}
 cam.lookAt(ct);rollC+=(-(P.in.st||0)*.035*Math.min(sp/60,1)-rollC)*lk(5,dt);if(!isFinite(rollC))rollC=0;cam.rotateZ(rollC);
 const ft=P.bo?95:75+cl(sp/C.MAXB,0,1)*13;fov+=(ft-fov)*lk(4,dt);cam.fov=fov;cam.updateProjectionMatrix();
}
/* ---------- Render / HUD ---------- */
const ARW=$('ar'),tv=V3();
function render(al,dt){if(innerWidth>0&&innerHeight>0&&Math.abs(cam.aspect-innerWidth/innerHeight)>.001)rs();
 cars.forEach(c=>{c.mesh=c.g;c.g.position.lerpVectors(c.pp,c.p,al);c.g.quaternion.copy(c.pq).slerp(c.q,al);
  const ax=(c.vf-(c.lvf||0))/Math.max(dt,.001);c.lvf=c.vf;c.tilt=(c.tilt||0)+(cl(-ax*.0012,-.07,.07)-(c.tilt||0))*lk(6,dt);c.b.rotation.x=c.tilt;const ro=c.gr?cl(-c.in.st*c.vf*.0007,-.07,.07):0;c.b.rotation.z+=(ro-c.b.rotation.z)*lk(8,dt);
  c.st+=((c.in.st||0)*.5-c.st)*lk(10,dt);c.wh.forEach(w=>{w.sp.rotation.x+=c.vf*dt;if(w.front)w.pv.rotation.y=c.st})});
 ball.mesh.position.lerpVectors(ball.pp,ball.p,al);const bs=ball.v.length();ball.mesh.rotation.x+=ball.v.z*dt/C.R;ball.mesh.rotation.z-=ball.v.x*dt/C.R;
 sun.position.set(P.g.position.x+60,P.g.position.y+110,P.g.position.z+40);sun.target.position.copy(P.g.position);
 fogK+=((G.state==='menu'?1:0)-fogK)*lk(2,dt);scene.fog.near=260-210*fogK;scene.fog.far=1500-1000*fogK;updCam(dt,al);
 const sp=P.v.length();$('spd').innerHTML=($('kmh').checked?(sp*3.6).toFixed(0)+'<small> km/h</small>':sp.toFixed(0)+'<small> u/s</small>');
 $('bf').style.width=P.boost+'%';$('bi').textContent='Turbo '+P.boost.toFixed(0)+(P.bo?' · activo':'');$('jp').textContent=P.gr?'Salto: disponible (2)':P.jumps<2?'Salto aéreo: disponible':'Salto: usado';$('cm').textContent='Cámara: '+(G.ballCam?'balón':'normal');
 const m=Math.ceil(G.time/60)-1,s=Math.floor(G.time%60);$('tm').textContent=S.train||S.dur===0?'∞':Math.floor(G.time/60)+':'+String(s).padStart(2,'0');
 $('sb').textContent=G.blue;$('so').textContent=G.orange;$('st').textContent=NET?'Sala '+NET.code+' · '+cars.length+(cars.length===1?' jugador · esperando a alguien…':' jugadores')+(G.ot?' · muerte súbita':''):G.state==='menu'?'':S.train?'Entrenamiento libre · balón '+bs.toFixed(0)+' u/s':(G.ot?'Muerte súbita':'En juego')+' · balón '+bs.toFixed(0)+' u/s';
 $('top').style.display=$('hsc').checked&&G.state!=='menu'?'none':'block';
 tv.copy(ball.mesh.position).project(cam);if(tv.z>1){tv.x*=-1;tv.y*=-1}const off=Math.abs(tv.x)>.9||Math.abs(tv.y)>.85||tv.z>1;
 if(off&&G.state!=='menu'){const x=cl(tv.x,-.9,.9),y=cl(tv.y,-.85,.85);ARW.style.display='block';ARW.style.left=(x*.5+.5)*innerWidth-11+'px';ARW.style.top=(-y*.5+.5)*innerHeight-10+'px';ARW.style.transform='rotate('+Math.atan2(-tv.x,tv.y)*-1+'rad)'}else ARW.style.display='none';
 if(AC&&mg){const run=G.state==='play';eg.gain.setTargetAtTime(run?.05+.05*Math.min(sp/100,1):0,AC.currentTime,.1);eo.frequency.setTargetAtTime(48+sp*1.5+(P.bo?35:0),AC.currentTime,.06);ef.frequency.setTargetAtTime(300+sp*8,AC.currentTime,.1);bg.gain.setTargetAtTime(run&&P.bo?.16:0,AC.currentTime,.04)}
 rd.render(scene,cam);if(G.t>3&&!loop.t&&!rd.info.render.triangles){loop.t=1;fail('WebGL no dibuja nada (0 triángulos). Prueba otro navegador o activa la aceleración por hardware.')}}
/* ---------- Bucle ---------- */
/* ---------- Multijugador (capacidad room: presencia) ---------- */
let NET=null;
const fin=(a,n)=>Array.isArray(a)&&a.length===n&&a.every(Number.isFinite),r2=v=>[v.x,v.y,v.z].map(x=>Math.round(x*100)/100),cleanNick=t=>String(t||'').replace(/[^\p{L}\p{N} _-]/gu,'').slice(0,12)||'Piloto',sleep=ms=>new Promise(r=>setTimeout(r,ms)),bt=V3();
function tag(txt,col){const cv=document.createElement('canvas');cv.width=256;cv.height=64;const g=cv.getContext('2d');g.font='bold 34px sans-serif';g.textAlign='center';g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,8,256,48);g.fillStyle=col;g.fillText(txt,128,46);const sp=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(cv),depthTest:false,transparent:true}));sp.scale.set(12,3,1);sp.position.y=4.8;return sp}
function netFail(m){if(NET)NET.dead=1;const d=$('err');d.style.display='block';d.textContent=m+'\nPulsa F5 para volver al menú.'}
function ovl(){G.ovl=1;document.body.classList.add('inmenu');$('menu').style.display='grid';$('nres').style.display='block';$('nleave').style.display='block';$('nres').focus()}
function resetMatch(){G.blue=G.orange=0;G.time=S.dur;G.ot=false;G.state='play';$('msg').style.display='none';kick();board()}
function sendState(){if(!NET||NET.dead)return;const q=P.q,o={n:NET.nick,t:P.team,i:P.idx,c:$('cb').value,p:r2(P.p),v:r2(P.v),q:[q.x,q.y,q.z,q.w].map(x=>Math.round(x*1e3)/1e3),b:Math.round(P.boost),bo:P.bo?1:0};
 if(NET.host)Object.assign(o,{h:1,bl:r2(ball.p).concat(r2(ball.v)),s:[G.blue,G.orange],tm:Math.round(G.time*10)/10,d:S.dur,gs:G.state,gn:NET.gn,gt:NET.gt,gw:NET.gw,gr:NET.gr});
 NET.room.presence(o).catch(()=>{})}
function stepRem(c,dt){c.pp.copy(c.p);c.pq.copy(c.q);c.tp.addScaledVector(c.tv,dt);c.p.addScaledVector(c.v,dt);c.p.lerp(c.tp,.18);c.v.lerp(c.tv,.25);c.q.slerp(c.tq,.22);c.vf=c.v.dot(bt.set(0,0,1).applyQuaternion(c.q));
 if(c.bo)for(const x of[-.9,.9]){const w=V3(x,-.1,-4.9).applyQuaternion(c.q).add(c.p),b=V3(0,0,-18).applyQuaternion(c.q);emit(w,b.x+(Math.random()-.5)*4,b.y+(Math.random()-.5)*4,b.z+(Math.random()-.5)*4,c.team?0xff9a3a:0x4aa8ff,.3)}}
function blend(){const h=NET.hb;if(!h||(ball.last===P&&performance.now()-(ball.lt||0)<450))return;const age=Math.min((performance.now()-h.at)/1e3,.25);bt.copy(h.p).addScaledVector(h.v,age);if(ball.p.distanceTo(bt)>25){ball.p.copy(bt);ball.v.copy(h.v)}else{ball.p.lerp(bt,.12);ball.v.lerp(h.v,.15)}}
function netPeers(ch){if(!NET||NET.dead)return;let hh=NET.host;
 for(const pe of ch.peers){if(pe.isMe)continue;const r=pe.presence;
  if(r.h===1){hh=true;if(r!==NET.hl){NET.hl=r;NET.hs=r;if(fin(r.bl,6))NET.hb={p:V3(r.bl[0],r.bl[1],r.bl[2]),v:V3(r.bl[3],r.bl[4],r.bl[5]),at:performance.now()}}}
  if(!fin(r.p,3)||!fin(r.v,3)||!fin(r.q,4))continue;
  let c=NET.rem.get(pe.peer);
  if(!c){if(NET.rem.size>=5)continue;c=new Car(r.t===1?1:0,false,(r.i|0)%3,true);c.name=cleanNick(r.n);c.g.add(tag(c.name,c.team?'#ffb36b':'#8cc4ff'));c.tp.set(r.p[0],r.p[1],r.p[2]);c.p.copy(c.tp);c.pp.copy(c.tp);cars.push(c);NET.rem.set(pe.peer,c)}
  c.tp.set(r.p[0],r.p[1],r.p[2]);c.tv.set(r.v[0],r.v[1],r.v[2]);c.tq.set(r.q[0],r.q[1],r.q[2],r.q[3]).normalize();c.boost=+r.b||0;c.bo=r.bo===1;
  if(typeof r.c==='string'&&/^#[0-9a-f]{6}$/i.test(r.c)&&c.col!==r.c){c.col=r.c;c.bm.color.set(r.c)}}
 for(const pe of ch.left){const c=NET.rem.get(pe.peer);if(c){kill(c.g);const k=cars.indexOf(c);if(k>=0)cars.splice(k,1);NET.rem.delete(pe.peer)}}
 NET.lost=hh?0:(NET.lost||performance.now());
 const h=NET.hs;if(!NET.host&&h&&hh){if(!NET.sy){NET.sy=1;NET.gn=h.gn|0;NET.gr=h.gr|0}
  S.dur=h.d|0;G.time=+h.tm||0;if(Array.isArray(h.s)){const b0=h.s[0]|0,o0=h.s[1]|0;if(b0!==G.blue||o0!==G.orange){G.blue=b0;G.orange=o0;board()}}
  if(h.gn>NET.gn){NET.gn=h.gn;goal(h.gt===1?1:0,cleanNick(h.gw),true)}
  if(h.gr!==NET.gr){NET.gr=h.gr;resetMatch()}
  if(h.gs==='end'&&G.state!=='end')endGame()}}
function lanRoom(name){return new Promise((res,rej)=>{
 let ws,me=null,ready=false;const P=new Map(),hs=[],ehs=[];
 const peers=()=>[...P].map(([id,pr])=>({peer:id,isMe:id===me,presence:pr})),fire=(l)=>hs.forEach(h=>h({peers:peers(),joined:[],left:l||[],updated:[]}));
 const api={name,peers,presence:async pr=>{if(me===null||ws.readyState!==1)return;P.set(me,Object.assign({},P.get(me),pr));ws.send(JSON.stringify({t:'pres',p:pr}))},
  onPeers(h,eh){hs.push(h);if(eh)ehs.push(eh);h({peers:peers(),joined:peers(),left:[],updated:[]});return()=>{}},
  leave:async()=>{try{ws.close()}catch(e){}}};
 const to=setTimeout(()=>{if(!ready){try{ws.close()}catch(e){}rej(new Error('El servidor WiFi no responde'))}},6000);
 try{ws=new WebSocket((location.protocol==='https:'?'wss://':'ws://')+location.host+'/ws')}catch(e){clearTimeout(to);return rej(new Error('Abre el juego desde la dirección del servidor WiFi'))}
 ws.onopen=()=>ws.send(JSON.stringify({t:'join',room:name}));
 ws.onmessage=ev=>{let m;try{m=JSON.parse(ev.data)}catch(e){return}
  if(m.t==='hello'){me=m.id;P.set(me,{})}
  else if(m.t==='snap'){m.peers.forEach(x=>P.set(x.id,x.p||{}));if(!ready){ready=true;clearTimeout(to);res(api)}fire()}
  else if(m.t==='upd'&&ready){P.set(m.id,m.p||{});fire()}
  else if(m.t==='left'){const o=P.get(m.id);P.delete(m.id);fire([{peer:m.id,isMe:false,presence:o||{}}])}
  else if(m.t==='full'){clearTimeout(to);const e=new Error('La sala está llena');e.code='limit_reached';rej(e)}};
 ws.onerror=()=>{if(!ready){clearTimeout(to);rej(new Error('No se pudo conectar con el servidor WiFi'))}};
 ws.onclose=()=>{if(ready)ehs.forEach(e=>e({code:'upstream_error',message:'conexión cerrada'}));else{clearTimeout(to);rej(new Error('Conexión cerrada'))}}})}
const netMsg=t=>{$('nst').textContent=t};
async function netStart(code,host){
 if(!host&&code.length<5)return netMsg('Escribe el código de 5 letras.');
 const nick=cleanNick($('nick').value);netMsg('Conectando…');
 try{let cl=window.claude&&window.claude.use?await window.claude.use('room'):null;if(!cl)cl={lan:1,join:lanRoom};
  const room=await cl.join('bb-'+code.toLowerCase());let team=0,idx=0;
  if(!host){await sleep(cl.lan?500:1600);const o=room.peers().filter(p=>!p.isMe&&p.presence&&p.presence.p);
   if(!o.some(p=>p.presence.h===1)){await room.leave();return netMsg('No hay ninguna sala con el código '+code+'.')}
   if(o.length>=6){await room.leave();return netMsg('La sala está llena (6 jugadores).')}
   const c=[0,0];o.forEach(p=>c[p.presence.t===1?1:0]++);team=c[0]<=c[1]?0:1;idx=c[team]}
  startOnline(room,code,host,team,idx,nick)}
 catch(e){netMsg('No se pudo entrar: '+(e.message||e.code)+'. Abre el juego desde la dirección del servidor (la de tu WiFi o la de Render), no desde un archivo suelto.')}}
function startOnline(room,code,host,team,idx,nick){audioInit();S.n=3;S.diff=1;S.train=false;S.dur=host?+val('dur'):0;
 cars.forEach(c=>kill(c.g));cars.length=0;P=new Car(team,false,idx);P.name=nick;cars.push(P);if(!ball)ball=new Ball();
 G.blue=G.orange=0;G.time=S.dur;G.ot=false;G.ballCam=false;G.ovl=0;
 NET={room,code,host,nick,tick:0,gn:0,gt:0,gw:'',gr:0,rem:new Map(),lost:0,dead:0};
 room.onPeers(netPeers,e=>netFail('Se perdió la conexión ('+e.code+').'));
 kick();board();cd.set(0,0,1);cp.copy(P.p).add(V3(0,12,-25));ct.copy(P.p);G.state='play';
 $('menu').style.display='none';document.body.classList.remove('inmenu');document.body.classList.add('online');$('msg').style.display='none';if(document.activeElement)document.activeElement.blur();sendState()}
$('mpc').onclick=()=>netStart(Array.from({length:5},()=>'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[Math.random()*31|0]).join(''),true);
$('mpj').onclick=()=>netStart($('code').value.replace(/[^A-Za-z0-9]/g,'').toUpperCase().slice(0,5),false);
$('nleave').onclick=()=>location.reload();
let acc=0,last=performance.now();const eat=k=>{const v=kp[k];kp[k]=false;return v};
function loop(now){requestAnimationFrame(loop);try{loop2(now)}catch(e){if(!loop.e){loop.e=1;fail(e)}}}
function loop2(now){const dt=Math.max(0,Math.min((now-last)/1000,.1));last=now;G.t+=dt;
 if(eat('Escape')){if(G.ovl)resume();else if(G.state==='play'||G.state==='goal'||G.state==='end'){if(NET)ovl();else setMenu(true)}else if(G.state==='menu'&&$('nres').style.display!=='none')resume()}
 if(eat('KeyH'))$('help').style.display=$('help').style.display==='none'?'block':'none';
 if(G.state!=='menu'){
  if(eat('KeyC'))G.ballCam=!G.ballCam;if(eat('KeyT')&&G.state==='play')P.safe();if(eat('KeyP')){if(!NET)startGame(S.train);else if(NET.host){NET.gr++;resetMatch()}}
  if(G.state==='goal'){G.gt-=dt;if(G.gt<=0){G.state='play';$('msg').style.display='none';kick()}}
  acc+=dt*(G.state==='goal'?.3:1);let n=0;while(acc>=C.STEP&&n<5){step(C.STEP);for(const k in kp)if(k!=='Escape')kp[k]=false;acc-=C.STEP;n++}if(n===5)acc=0;
  if(G.state==='end')for(const c of cars)if(c.bot)c.in.th=0;updP(dt);
 }else updP(dt);
 if(G.state==='menu')for(const k in kp)kp[k]=false;
 render(G.state==='menu'?1:acc/C.STEP,dt)}
function resume(){if(G.ovl)G.ovl=0;else G.state=G.prev||'play';$('menu').style.display='none';document.body.classList.remove('inmenu');if(document.activeElement)document.activeElement.blur();audioInit()}
function showP(k){document.querySelectorAll('.panel').forEach(p=>p.hidden=p.dataset.pn!==k);document.querySelectorAll('.it[data-p]').forEach(b=>b.classList.toggle('on',b.dataset.p===k))}
document.querySelectorAll('.it[data-p]').forEach(b=>{b.onclick=b.onfocus=()=>showP(b.dataset.p)});
document.querySelectorAll('.seg').forEach(g=>g.onclick=e=>{const b=e.target.closest('button');if(!b)return;g.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));if(g.id==='qual')applyQ()});
$('bplay').onclick=()=>startGame(false);$('ntr').onclick=()=>startGame(true);$('nres').onclick=resume;
$('sw').innerHTML=['#2f8cff','#ff5a5f','#ffd23f','#7cf4c8','#c77dff','#f4f4f8','#ff8a1f','#1b1f2a'].map(c=>'<button type="button" aria-label="Color '+c+'" style="background:'+c+'" data-c="'+c+'"></button>').join('');
$('sw').onclick=e=>{const c=e.target.dataset.c;if(c){$('cb').value=c;if(P)P.bm.color.set(c)}};
document.querySelector('[data-pn=ctl]').innerHTML='<h2>Controles</h2>'+$('help').innerHTML;
addEventListener('keydown',e=>{if(G.state!=='menu'||(e.code!=='ArrowDown'&&e.code!=='ArrowUp')||/INPUT|SELECT/.test(e.target.tagName))return;e.preventDefault();const l=[...document.querySelectorAll('.nav .it')].filter(b=>b.offsetParent);if(!l.length)return;const i=l.indexOf(document.activeElement);l[(i+(e.code==='ArrowDown'?1:-1)+l.length)%l.length].focus()});
$('vol').oninput=vol;$('mute').onchange=vol;
$('cb').oninput=e=>{if(P)P.bm.color.set(e.target.value)};$('cr').oninput=e=>{if(P)P.rm.color.set(e.target.value)};
rs();applyQ();
P=new Car(0,false,0);cars.push(P);ball=new Ball();ball.mesh.position.set(0,5,-100);ball.p.set(0,5,-100);ball.pp.copy(ball.p);board();
requestAnimationFrame(loop);
