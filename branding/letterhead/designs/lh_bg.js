const {chromium}=require('playwright');const fs=require('fs');(async()=>{const d=process.argv[2];
const OR='#FF5A0A',BK='#141414';
const hat=`<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg"><path fill="${BK}" d="M70 160 C66 110 102 78 146 76 C190 76 212 104 216 146 C222 150 226 156 228 160 Z M54 164 H214 C232 164 246 166 256 171 Q260 175 255 178 C244 180 230 180 214 180 H60 Q50 180 50 172 Q50 164 54 164 Z"/></svg>`;
const stripes=(c1,c2)=>`repeating-linear-gradient(135deg,${c1} 0 22px,${c2} 22px 44px)`;
const L=(x,y,h,dark)=>`<img src="${dark?'logo-dark.svg':'logo.svg'}" style="position:absolute;left:${x}px;top:${y}px;height:${h}px">`;
const D={
 '1-classic':`${L(76,34,74)}<div style="position:absolute;left:76px;right:76px;top:150px;height:3px;background:${OR}"></div><div style="position:absolute;left:76px;right:76px;top:1050px;height:1px;background:${OR}"></div>`,
 '2-centered':`<img src="logo.svg" style="position:absolute;left:50%;transform:translateX(-50%);top:26px;height:84px">
   <div style="position:absolute;left:76px;right:76px;top:146px;height:1px;background:${BK}"></div><div style="position:absolute;left:76px;right:76px;top:150px;height:3px;background:${OR}"></div>
   <div style="position:absolute;left:167px;top:400px;width:460px;opacity:.045">${hat}</div>
   <div style="position:absolute;left:76px;right:76px;top:1050px;height:1px;background:${OR}"></div>`,
 '3-dark-band':`<div style="position:absolute;left:0;right:0;top:0;height:128px;background:${BK}"></div><div style="position:absolute;left:0;right:0;top:128px;height:6px;background:${OR}"></div>${L(56,28,72,true)}
   <div style="position:absolute;left:0;right:0;bottom:0;height:58px;background:${BK}"></div><div style="position:absolute;left:0;right:0;bottom:58px;height:4px;background:${OR}"></div>`,
 '4-side-stripe':`<div style="position:absolute;left:0;top:0;bottom:0;width:44px;background:${BK}"></div><div style="position:absolute;left:44px;top:0;bottom:0;width:7px;background:${OR}"></div>
   <img src="logo.svg" style="position:absolute;right:66px;top:34px;height:74px">
   <div style="position:absolute;right:-60px;bottom:40px;width:420px;opacity:.05">${hat}</div>
   <div style="position:absolute;left:100px;right:66px;top:140px;height:1px;background:#C9CDD2"></div>`,
 '5-hazard-corner':`<div style="position:absolute;right:0;top:0;width:250px;height:250px;background:${stripes(OR,BK)};clip-path:polygon(30% 0,100% 0,100% 70%)"></div>
   <div style="position:absolute;left:0;bottom:0;width:170px;height:170px;background:${stripes(OR,BK)};clip-path:polygon(0 35%,0 100%,65% 100%)"></div>
   ${L(60,34,74)}<div style="position:absolute;left:60px;width:440px;top:150px;height:3px;background:${OR}"></div>`};
const b=await chromium.launch();const p=await b.newPage({viewport:{width:794,height:1123},deviceScaleFactor:3});
for(const k of Object.keys(D)){fs.writeFileSync(d+'/_bg.html',`<body style="margin:0;width:794px;height:1123px;position:relative;overflow:hidden;background:transparent">${D[k]}</body>`);
 await p.goto('file://'+d+'/_bg.html');await p.waitForLoadState('load');await p.screenshot({path:`${d}/bg-${k}.png`,omitBackground:true});}
fs.unlinkSync(d+'/_bg.html');await b.close();})();
