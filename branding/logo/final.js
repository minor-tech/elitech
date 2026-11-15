const {chromium}=require('playwright');const fs=require('fs');(async()=>{const d=process.argv[2];const b=await chromium.launch();const p=await b.newPage({deviceScaleFactor:1});
async function load(h){fs.writeFileSync(d+'/_t.html',h);await p.goto('file://'+d+'/_t.html');await p.waitForLoadState('load');}
async function shot(svg,out,w,h){await p.setViewportSize({width:w,height:h});
 await load(`<html><body style="margin:0;background:transparent"><img src="file://${d}/${svg}" style="display:block;width:${w}px;height:${h}px"></body></html>`);
 await p.waitForTimeout(300);await p.screenshot({path:`${d}/${out}`,omitBackground:true});}
await shot('1-no-border.svg','1-no-border.png',2000,1563);
await shot('3-simple.svg','3-simple.png',2000,2000);
await shot('4-with-border.svg','4-with-border.png',2000,2000);
await p.setViewportSize({width:2000,height:1250});
await load(`<html><body style="margin:0;width:2000px;height:1250px;position:relative;overflow:hidden;background:linear-gradient(180deg,#F1EEE8,#DCD8D1)">
<div style="position:absolute;right:0;top:0;bottom:0;width:180px;background:repeating-linear-gradient(90deg,#8a6a4a 0 18px,#a07c58 18px 32px)"></div>
<div style="position:absolute;left:0;right:0;bottom:0;height:230px;background:linear-gradient(#F6F4F0,#E6E2DB);box-shadow:0 -3px 14px rgba(0,0,0,.08)"></div>
<div style="position:absolute;left:0;top:0;right:0;height:380px;background:radial-gradient(ellipse at 45% 0,rgba(255,250,235,.75),transparent 70%)"></div>
<img src="file://${d}/4-with-border.svg" style="position:absolute;left:545px;top:80px;width:730px;height:730px;filter:drop-shadow(14px 18px 14px rgba(0,0,0,.28))"></body></html>`);
await p.waitForTimeout(300);await p.screenshot({path:`${d}/2-background.png`});fs.unlinkSync(d+'/_t.html');await b.close();})();
