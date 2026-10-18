// BrumaBall - servidor (sirve el juego + relé de salas por WebSocket). Solo usa Node.js, sin dependencias.
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto'),os=require('os');
const PORT=+process.env.PORT||3000,GUID='258EAFA5-E914-47DA-95CA-C5AB0DC85B11',rooms=new Map();
const FILES={'/':['index.html','text/html; charset=utf-8'],'/index.html':['index.html','text/html; charset=utf-8'],'/style.css':['style.css','text/css; charset=utf-8'],'/game.js':['game.js','application/javascript; charset=utf-8']};
const server=http.createServer((req,res)=>{
  const p=new URL(req.url,'http://x').pathname;
  if(p==='/health'){res.writeHead(200);return res.end('ok')}
  const f=FILES[p];
  if(!f){res.writeHead(404);return res.end('No encontrado')}
  fs.readFile(path.join(__dirname,f[0]),(e,d)=>{
    if(e){res.writeHead(500);return res.end('Falta '+f[0])}
    res.writeHead(200,{'Content-Type':f[1],'Cache-Control':'no-cache'});res.end(d)})
});
server.on('upgrade',(req,sock)=>{
  const key=req.headers['sec-websocket-key'];
  if(new URL(req.url,'http://x').pathname!=='/ws'||!key){sock.destroy();return}
  sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+crypto.createHash('sha1').update(key+GUID).digest('base64')+'\r\n\r\n');
  sock.setNoDelay(true);
  const c={sock,id:crypto.randomBytes(4).toString('hex'),room:null,p:{},buf:Buffer.alloc(0),t0:0,n:0};
  sock.on('data',d=>{c.buf=Buffer.concat([c.buf,d]);if(c.buf.length>70000){sock.destroy();return}parse(c)});
  sock.on('close',()=>leave(c));sock.on('error',()=>sock.destroy());
});
function send(c,o){if(c.sock.destroyed)return;const b=Buffer.from(JSON.stringify(o));let h;
  if(b.length<126)h=Buffer.from([0x81,b.length]);else{h=Buffer.alloc(4);h[0]=0x81;h[1]=126;h.writeUInt16BE(b.length,2)}
  c.sock.write(Buffer.concat([h,b]))}
function parse(c){for(;;){const b=c.buf;if(b.length<2)return;const op=b[0]&15;let len=b[1]&127,off=2;
  if(!(b[1]&128)){c.sock.destroy();return}
  if(len===126){if(b.length<4)return;len=b.readUInt16BE(2);off=4}else if(len===127){c.sock.destroy();return}
  if(b.length<off+4+len)return;
  const m=b.slice(off,off+4),d=Buffer.from(b.slice(off+4,off+4+len));for(let i=0;i<len;i++)d[i]^=m[i&3];c.buf=b.slice(off+4+len);
  if(op===8){c.sock.end();return}
  if(op===9&&len<126)c.sock.write(Buffer.concat([Buffer.from([0x8a,len]),d]));
  if(op===1)handle(c,d.toString('utf8'))}}
function others(c,o){const r=rooms.get(c.room);if(r)for(const x of r.values())if(x!==c)send(x,o)}
function handle(c,t){
  const now=Date.now();if(now-c.t0>1000){c.t0=now;c.n=0}if(++c.n>150){c.sock.destroy();return}
  let m;try{m=JSON.parse(t)}catch(e){return}if(!m||typeof m!=='object')return;
  if(m.t==='join'&&!c.room){
    if(!/^bb-[a-z0-9]{5}$/.test(m.room)){c.sock.end();return}
    const r=rooms.get(m.room)||new Map();
    if(r.size>=8){send(c,{t:'full'});c.sock.end();return}
    rooms.set(m.room,r);r.set(c.id,c);c.room=m.room;
    send(c,{t:'hello',id:c.id});send(c,{t:'snap',peers:[...r.values()].map(x=>({id:x.id,p:x.p}))});
    others(c,{t:'upd',id:c.id,p:c.p});
    console.log('['+new Date().toLocaleTimeString()+'] sala '+m.room.slice(3).toUpperCase()+': '+r.size+' conectado(s)')
  }else if(m.t==='pres'&&c.room&&m.p&&typeof m.p==='object'){
    const old=JSON.stringify(c.p);
    for(const k of Object.keys(m.p).slice(0,40)){if(!/^[a-z]{1,3}$/.test(k))continue;if(m.p[k]===null)delete c.p[k];else c.p[k]=m.p[k]}
    if(JSON.stringify(c.p).length>4096){c.p=JSON.parse(old);return}
    others(c,{t:'upd',id:c.id,p:c.p})}}
function leave(c){const r=rooms.get(c.room);if(!r)return;r.delete(c.id);if(!r.size)rooms.delete(c.room);else others(c,{t:'left',id:c.id})}
// ping cada 25 s para que proxies (Render) no cierren conexiones inactivas
setInterval(()=>{for(const r of rooms.values())for(const c of r.values())if(!c.sock.destroyed)c.sock.write(Buffer.from([0x89,0]))},25000).unref();
server.listen(PORT,'0.0.0.0',()=>{
  console.log('\n  BrumaBall - servidor en marcha (puerto '+PORT+')\n');
  console.log('  En este ordenador:        http://localhost:'+PORT);
  for(const l of Object.values(os.networkInterfaces()))for(const i of l)if(i.family==='IPv4'&&!i.internal)console.log('  Misma WiFi (amigos):      http://'+i.address+':'+PORT);
  console.log('')});
