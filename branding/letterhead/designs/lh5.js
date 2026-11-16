const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,ImageRun,Header,Footer,AlignmentType,TabStopType,HorizontalPositionRelativeFrom,VerticalPositionRelativeFrom}=require('docx');
const D=process.argv[2]; const F="Arial", BK="141414", GR="5F6368", OR="FF5A0A";
const px=v=>Math.round(v*15);
const contacts=["P.O. Box [number], Nairobi, Kenya","Tel: +254 [phone number]","Email: [email address]","Web: hezsysafety.co.ke"];
const oneLine=contacts.join("   •   ");
const products="Safety Nets  •  Helmets  •  Overalls  •  Reflective Vests  •  Safety Boots  •  PPE Kits";
const company="HEZSEY Safety Suppliers  |  Safety Gear Delivered  |  KRA PIN: [PIN]";
const t=(s,o={})=>new TextRun({text:s,font:F,size:o.size||22,bold:o.bold,color:o.color||BK,underline:o.u});
const P=(runs,o={})=>new Paragraph({alignment:o.align,spacing:{before:o.before||0,after:o.after??160,line:o.line},indent:o.indent,children:[].concat(runs)});
const bg=k=>new ImageRun({type:"png",data:fs.readFileSync(`${D}/bg-${k}.png`),transformation:{width:794,height:1123},
  floating:{horizontalPosition:{relative:HorizontalPositionRelativeFrom.PAGE,offset:0},verticalPosition:{relative:VerticalPositionRelativeFrom.PAGE,offset:0},behindDocument:true,allowOverlap:true,zIndex:0}});
const C={
 "1-classic":{m:{t:178,b:110,l:76,r:76},hd:38,fd:28,head:a=>contacts.map((c,i)=>P(t(c,{size:16,color:GR}),{align:AlignmentType.RIGHT,after:10})),
   foot:()=>[P(t(products,{size:16,color:OR,bold:true}),{align:AlignmentType.CENTER,after:30}),P(t(company,{size:15,color:GR}),{align:AlignmentType.CENTER,after:0})]},
 "2-centered":{m:{t:184,b:110,l:76,r:76},hd:104,fd:28,head:()=>[P(t(oneLine,{size:15,color:GR}),{align:AlignmentType.CENTER,after:0})],
   foot:()=>[P(t(products,{size:16,color:OR,bold:true}),{align:AlignmentType.CENTER,after:30}),P(t(company,{size:15,color:GR}),{align:AlignmentType.CENTER,after:0})]},
 "3-dark-band":{m:{t:170,b:110,l:76,r:56},hd:30,fd:14,head:()=>contacts.map(c=>P(t(c,{size:16,color:"FFFFFF"}),{align:AlignmentType.RIGHT,after:10})),
   foot:()=>[P(t(products,{size:16,color:"FFFFFF",bold:true}),{align:AlignmentType.CENTER,after:20}),P(t(company,{size:14,color:"C9CDD2"}),{align:AlignmentType.CENTER,after:0})]},
 "4-side-stripe":{m:{t:170,b:110,l:100,r:66},hd:26,fd:28,head:()=>contacts.map(c=>P(t(c,{size:16,color:GR}),{after:10})),
   foot:()=>[P(t(products,{size:15,color:OR,bold:true}),{after:30}),P(t(company,{size:14,color:GR}),{after:0})]},
 "5-hazard-corner":{m:{t:184,b:110,l:60,r:76},hd:104,fd:28,head:()=>[P(t(oneLine,{size:14,color:GR}),{after:0})],
   foot:()=>[P(t(products,{size:15,color:OR,bold:true}),{align:AlignmentType.RIGHT,after:30}),P(t(company,{size:14,color:GR}),{align:AlignmentType.RIGHT,after:0})]},
};
const W=k=>px(794-C[k].m.l-C[k].m.r);
const body=k=>[
  new Paragraph({spacing:{after:160},tabStops:[{type:TabStopType.RIGHT,position:W(k)}],children:[t("Our Ref: HSS/[year]/[number]",{size:20}),t("\tDate: [day month year]",{size:20})]}),
  P(t("[Recipient name]"),{after:0}),P(t("[Title]"),{after:0}),P(t("[Company name]"),{after:0}),P(t("P.O. Box [number], [Town]"),{after:240}),
  P(t("Dear [Sir/Madam],"),{after:200}),P(t("RE: [SUBJECT OF THE LETTER]",{bold:true,u:{}}),{after:200}),
  P(t("[Opening paragraph: state the purpose of the letter in one or two sentences.]")),
  P(t("[Main paragraph: give the details, such as the items supplied, quantities, prices, delivery dates or terms.]")),
  P(t("[Closing paragraph: state the next step or action needed, and how to reach us.]")),
  P(t("Thank you for choosing HEZSEY Safety Suppliers."),{after:360}),P(t("Yours faithfully,"),{after:720}),
  P(t("______________________________"),{after:40}),P(t("[Full name]",{bold:true}),{after:0}),P(t("[Position], HEZSEY Safety Suppliers",{color:GR}),{after:0})];
(async()=>{for(const k of Object.keys(C)){const c=C[k];
  const hp=c.head(); hp[0]=new Paragraph({...hp[0].options});
  const header=new Header({children:[new Paragraph({spacing:{after:0},children:[bg(k)]}),...c.head()]});
  const doc=new Document({creator:"HEZSEY Safety Suppliers",title:`HEZSEY Letterhead ${k}`,styles:{default:{document:{run:{font:F,size:22}}}},
    sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:px(c.m.t),bottom:px(c.m.b),left:px(c.m.l),right:px(c.m.r),header:px(c.hd),footer:px(c.fd)}}},
      headers:{default:header},footers:{default:new Footer({children:c.foot()})},children:body(k)}]});
  fs.writeFileSync(`${D}/HEZSEY-Letterhead-${k}.docx`,await Packer.toBuffer(doc));}})();
