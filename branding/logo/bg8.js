const {chromium}=require('playwright');const fs=require('fs');(async()=>{const d=process.argv[2];const b=await chromium.launch();const p=await b.newPage({viewport:{width:2000,height:1250}});
fs.writeFileSync(d+'/_b.html',`<body style="margin:0;width:2000px;height:1250px;position:relative;overflow:hidden;background:linear-gradient(180deg,#F1EEE8,#DCD8D1)">
<div style="position:absolute;right:0;top:0;bottom:0;width:180px;background:repeating-linear-gradient(90deg,#8a6a4a 0 18px,#a07c58 18px 32px)"></div>
<div style="position:absolute;left:0;right:0;bottom:0;height:230px;background:linear-gradient(#F6F4F0,#E6E2DB);box-shadow:0 -3px 14px rgba(0,0,0,.08)"></div>
<div style="position:absolute;left:0;top:0;right:0;height:380px;background:radial-gradient(ellipse at 45% 0,rgba(255,250,235,.75),transparent 70%)"></div>
<img src="logo-tagline.svg" style="position:absolute;left:510px;top:330px;width:980px;filter:drop-shadow(10px 14px 10px rgba(0,0,0,.25))"></body>`);
await p.goto('file://'+d+'/_b.html');await p.waitForLoadState('load');await p.screenshot({path:d+'/2-background.png'});fs.unlinkSync(d+'/_b.html');await b.close();})();
