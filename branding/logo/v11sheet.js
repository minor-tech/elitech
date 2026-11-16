const {chromium}=require('playwright');const fs=require('fs');(async()=>{const d=process.argv[2];
const card=(n,inner,bg='#fff')=>`<div style="background:${bg};border-radius:14px;padding:26px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;box-shadow:0 2px 10px rgba(0,0,0,.08)">${inner}<div style="font:700 17px Arial;color:${bg=='#fff'?'#141414':'#fff'}">${n}</div></div>`;
fs.writeFileSync(d+'/_s.html',`<body style="margin:0;padding:28px;background:#E9E7E2;width:1540px"><div style="font:800 30px Arial;margin-bottom:20px;color:#141414">HEZSEY Safety Suppliers — 5 logo versions</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
${card('1 · Primary (stacked)','<img src="1-primary.svg" style="width:560px">')}
${card('1 · Primary on dark','<img src="1-primary-dark.svg" style="width:560px">','#141414')}
${card('2 · Horizontal','<img src="2-horizontal.svg" style="width:640px"><img src="2-horizontal-dark.svg" style="width:640px">')}
${card('3 · Round seal','<div style="display:flex;gap:24px"><img src="3-round-seal.svg" style="width:300px"><img src="3-round-seal-dark.svg" style="width:300px;background:#141414;border-radius:12px"></div>')}
${card('4 · App icon','<div style="display:flex;gap:24px;align-items:end"><img src="4-app-icon.svg" style="width:260px"><img src="4-app-icon.svg" style="width:96px"><img src="4-app-icon.svg" style="width:48px"></div>')}
${card('5 · Label plate','<img src="5-label-plate.svg" style="width:640px"><img src="5-label-plate.svg" style="width:300px">')}
</div></body>`);
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:900}});await p.goto('file://'+d+'/_s.html');await p.waitForLoadState('load');
await p.screenshot({path:d+'/five-logo-versions.png',fullPage:true});fs.unlinkSync(d+'/_s.html');await b.close();})();
