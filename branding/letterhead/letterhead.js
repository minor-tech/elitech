const fs=require('fs');
const {Document,Packer,Paragraph,TextRun,ImageRun,Header,Footer,Table,TableRow,TableCell,WidthType,AlignmentType,BorderStyle,TabStopType,ShadingType,VerticalAlign}=require('docx');
const D=process.argv[2]; const logo=fs.readFileSync(D+'/logo-horizontal.png');
const OR="FF5A0A", BK="141414", GR="5F6368", F="Arial";
const W=9638; // A4 minus 2 cm margins
const none={style:BorderStyle.NONE,size:0,color:"FFFFFF"};
const noB={top:none,bottom:none,left:none,right:none};
const t=(text,o={})=>new TextRun({text,font:F,size:o.size||22,bold:o.bold,color:o.color||BK,italics:o.italics,underline:o.underline});
const p=(runs,o={})=>new Paragraph({children:Array.isArray(runs)?runs:[runs],alignment:o.align,spacing:{before:o.before||0,after:o.after??160,line:o.line||276}});
const contact=(s)=>new Paragraph({alignment:AlignmentType.RIGHT,spacing:{after:20},children:[t(s,{size:16,color:GR})]});
const header=new Header({children:[
  new Table({width:{size:W,type:WidthType.DXA},columnWidths:[5400,4238],borders:{...noB,insideHorizontal:none,insideVertical:none},rows:[new TableRow({children:[
    new TableCell({width:{size:5400,type:WidthType.DXA},borders:noB,verticalAlign:VerticalAlign.CENTER,children:[new Paragraph({children:[new ImageRun({type:"png",data:logo,transformation:{width:240,height:70}})]})]}),
    new TableCell({width:{size:4238,type:WidthType.DXA},borders:noB,verticalAlign:VerticalAlign.CENTER,children:[
      contact("P.O. Box [number], Nairobi, Kenya"),contact("Tel: +254 [phone number]"),contact("Email: [email address]"),contact("Web: hezsysafety.co.ke")]})]})]}),
  new Paragraph({spacing:{before:80,after:0},border:{bottom:{style:BorderStyle.SINGLE,size:18,color:OR,space:1}},children:[]})]});
const footer=new Footer({children:[
  new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:40},border:{top:{style:BorderStyle.SINGLE,size:8,color:OR,space:6}},children:[t("Safety Nets  •  Helmets  •  Overalls  •  Reflective Vests  •  Safety Boots  •  PPE Kits",{size:16,color:OR,bold:true})]}),
  new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:0},children:[t("HEZSEY Safety Suppliers  |  Safety Gear Delivered  |  KRA PIN: [PIN]",{size:15,color:GR})]})]});
const body=[
  new Paragraph({spacing:{after:160},tabStops:[{type:TabStopType.RIGHT,position:W}],children:[t("Our Ref: HSS/[year]/[number]",{size:20}),t("\tDate: [day month year]",{size:20})]}),
  p([t("[Recipient name]")],{after:0}),p([t("[Title]")],{after:0}),p([t("[Company name]")],{after:0}),p([t("P.O. Box [number], [Town]")],{after:240}),
  p([t("Dear [Sir/Madam],")],{after:200}),
  p([t("RE: [SUBJECT OF THE LETTER]",{bold:true,underline:{}})],{after:200}),
  p([t("[Opening paragraph: state the purpose of the letter in one or two sentences.]")]),
  p([t("[Main paragraph: give the details, such as the items supplied, quantities, prices, delivery dates or terms.]")]),
  p([t("[Closing paragraph: state the next step or action needed, and how to reach us.]")]),
  p([t("Thank you for choosing HEZSEY Safety Suppliers.")],{after:360}),
  p([t("Yours faithfully,")],{after:720}),
  p([t("______________________________")],{after:40}),
  p([t("[Full name]",{bold:true})],{after:0}),
  p([t("[Position], HEZSEY Safety Suppliers",{color:GR})],{after:0}),
];
const doc=new Document({creator:"HEZSEY Safety Suppliers",title:"HEZSEY Safety Suppliers Letterhead",
  styles:{default:{document:{run:{font:F,size:22}}}},
  sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:2268,bottom:1700,left:1134,right:1134,header:567,footer:567}}},headers:{default:header},footers:{default:footer},children:body}]});
Packer.toBuffer(doc).then(b=>fs.writeFileSync(D+'/HEZSEY-Letterhead.docx',b));
