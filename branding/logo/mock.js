const {chromium}=require('playwright');const fs=require('fs');(async()=>{const d=process.argv[2];
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:1000},deviceScaleFactor:1});
for(const k of process.argv[3].split(',')){
const h=`<html><body style="margin:0;width:1600px;height:1000px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:6px;background:#fff;font-family:sans-serif">
<!-- wall -->
<div style="position:relative;overflow:hidden;background:linear-gradient(180deg,#eceae6,#d9d6d0)">
 <div style="position:absolute;right:0;top:0;bottom:0;width:90px;background:repeating-linear-gradient(90deg,#8a6a4a 0 10px,#a07c58 10px 18px)"></div>
 <div style="position:absolute;left:0;right:0;bottom:0;height:110px;background:linear-gradient(#f4f2ee,#e6e3dd);box-shadow:0 -2px 8px rgba(0,0,0,.08)"></div>
 <img src="${k}-stacked.svg" style="position:absolute;left:220px;top:40px;height:320px;filter:drop-shadow(6px 8px 6px rgba(0,0,0,.28))">
 <div style="position:absolute;left:0;top:0;right:0;height:140px;background:radial-gradient(ellipse at 50% 0,rgba(255,250,235,.7),transparent 70%)"></div>
</div>
<!-- cards -->
<div style="position:relative;overflow:hidden;background:linear-gradient(135deg,#cfd6de,#eef1f4)">
 <div style="position:absolute;left:60px;top:50px;width:420px;height:240px;background:#0D2B4E;border-radius:10px;transform:rotate(-8deg);box-shadow:14px 18px 30px rgba(0,0,0,.35);display:flex;align-items:flex-start;justify-content:flex-start;padding:46px 0 0 34px;box-sizing:border-box"><img src="${k}-horizontal-dark.svg" style="height:80px"></div>
 <div style="position:absolute;left:350px;top:230px;width:420px;height:240px;background:#fff;border-radius:10px;transform:rotate(6deg);box-shadow:14px 18px 30px rgba(0,0,0,.28);padding:30px;box-sizing:border-box">
  <img src="${k}-symbol.svg" style="height:70px"><div style="margin-top:22px;font:700 20px Montserrat,sans-serif;color:#0D2B4E">Your Name</div>
  <div style="font:13px sans-serif;color:#5B6573;line-height:1.7">Sales Manager<br>+254 7XX XXX XXX · hezsysafety.co.ke</div>
  <div style="position:absolute;left:0;right:0;bottom:0;height:10px;border-radius:0 0 10px 10px;background:linear-gradient(90deg,#FDB515,#F15A24)"></div></div>
</div>
<!-- hard hat -->
<div style="position:relative;overflow:hidden;background:radial-gradient(circle at 50% 40%,#3a4a5e,#16202c)">
 <svg viewBox="0 0 400 300" style="position:absolute;left:150px;top:60px;width:500px">
  <defs><radialGradient id="hh" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#e9ecef"/><stop offset="1" stop-color="#b8bec6"/></radialGradient></defs>
  <ellipse cx="200" cy="262" rx="190" ry="22" fill="rgba(0,0,0,.35)"/>
  <path d="M60 220 Q60 60 200 50 Q340 60 340 220 Z" fill="url(#hh)"/>
  <path d="M190 52 Q200 48 210 52 L214 220 H186 Z" fill="#dfe3e8"/>
  <path d="M20 222 Q200 205 380 222 Q385 246 360 248 Q200 236 40 248 Q15 246 20 222Z" fill="#cfd4da"/>
 </svg>
 <img src="${k}-symbol.svg" style="position:absolute;left:340px;top:175px;width:120px;transform:perspective(400px) rotateY(-6deg)">
</div>
<!-- box -->
<div style="position:relative;overflow:hidden;background:linear-gradient(160deg,#f3efe8,#ddd5c8)">
 <div style="position:absolute;left:170px;top:90px;width:460px;height:300px;background:linear-gradient(135deg,#c89b66,#b4834f);box-shadow:20px 24px 40px rgba(0,0,0,.3);border-radius:4px">
  <div style="position:absolute;left:205px;top:0;width:50px;height:100%;background:rgba(240,225,200,.35)"></div>
  <div style="position:absolute;left:60px;top:70px;width:340px;height:160px;background:#fff;border-radius:6px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 4px rgba(0,0,0,.15)"><img src="${k}-horizontal.svg" style="height:80px"></div>
 </div>
</div></body></html>`;
fs.writeFileSync(d+'/_m.html',h);await p.goto('file://'+d+'/_m.html');await p.screenshot({path:`${d}/${k}-mockups.png`});}
fs.unlinkSync(d+'/_m.html');await b.close();})();
