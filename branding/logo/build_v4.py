import sys, math
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
OUT=sys.argv[1]; FD=sys.argv[2]
NAVY="#0D2B4E"; OR="#F47B20"; GREY="#5B6573"; WHITE="#FFFFFF"
GRAD='<linearGradient id="og" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FDB515"/><stop offset="1" stop-color="#F15A24"/></linearGradient>'
F={w:TTFont(f"{FD}/montserrat-latin-{w}-normal.woff") for w in (600,700,800,900)}
def text(s,x,y,size,w=800,track=0,fill=NAVY,extra=""):
    f=F[w]; gs=f.getGlyphSet(); cm=f.getBestCmap(); sc=size/f["head"].unitsPerEm
    pen=SVGPathPen(gs); cx=x
    for ch in s:
        g=cm[ord(ch)]; gs[g].draw(TransformPen(pen,(sc,0,0,-sc,cx,y))); cx+=gs[g].width*sc+track
    return f'<path fill="{fill}" {extra} d="{pen.getCommands()}"/>', cx-track-x
def width(s,size,w=800,track=0):
    f=F[w]; gs=f.getGlyphSet(); cm=f.getBestCmap(); sc=size/f["head"].unitsPerEm
    return sum(gs[cm[ord(c)]].width*sc for c in s)+track*(len(s)-1)
def ink(ch,size,w=800):
    f=F[w]; gs=f.getGlyphSet(); bp=BoundsPen(gs); gs[f.getBestCmap()[ord(ch)]].draw(bp); sc=size/f["head"].unitsPerEm
    x0,y0,x1,y1=bp.bounds; return x0*sc,x1*sc,y1*sc
def svg(w,h,body,bg=None):
    b=f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}"><defs>{GRAD}</defs>{b}{body}</svg>'
ACC="url(#og)"

# 1. HELMET H — the H's crossbar is a hard hat (letter + object in one shape)
def helmetH(main,acc):
    return (f'<rect x="34" y="34" width="44" height="188" rx="6" fill="{main}"/>'
            f'<rect x="178" y="34" width="44" height="188" rx="6" fill="{main}"/>'
            f'<path fill="{acc}" d="M84 136 A44 44 0 0 1 172 136 Z M34 138 H222 V150 Q222 162 210 162 H46 Q34 162 34 150 Z"/>'
            f'<path fill="{main}" d="M121 94 H135 V136 H121 Z"/>')
# 2. GUARDIAN SHIELD — shield with H, safety-net swooshes catching the base
SH="M128 16 L222 44 V112 C222 176 184 218 128 242 C72 218 34 176 34 112 V44 Z"
def shield(main,acc,hole):
    return (f'<defs><clipPath id="sc"><path d="{SH}"/></clipPath></defs>'
            f'<path fill="{main}" d="{SH}"/>'
            f'<path fill="{hole}" d="M84 58 H110 V100 H146 V58 H172 V164 H146 V122 H110 V164 H84 Z"/>'
            f'<g clip-path="url(#sc)"><path fill="{acc}" d="M20 196 Q128 150 240 176 V196 Q128 172 20 220 Z"/>'
            f'<path fill="{acc}" opacity=".75" d="M20 230 Q128 186 240 210 V224 Q128 204 20 246 Z"/></g>')
# 3. HS RING — interlocked H + S inside an open ring (monogram)
def hsring(main,acc,bg):
    size=150; hx0,hx1,cap=ink("H",size); sx0,sx1,_=ink("S",size)
    wh=hx1-hx0; ws=sx1-sx0; ov=wh*0.16; tot=wh+ws-ov; left=128-tot/2; base=128+cap/2
    H,_=text("H",left-hx0,base,size,800,0,main)
    S,_=text("S",left+wh-ov-sx0,base,size,800,0,acc,f'stroke="{bg}" stroke-width="10" paint-order="stroke" stroke-linejoin="round"')
    r=112; a0,a1=math.radians(-40),math.radians(-80)   # gap at top-right
    p0=(128+r*math.cos(a0),128+r*math.sin(a0)); p1=(128+r*math.cos(a1),128+r*math.sin(a1))
    ring=f'<path d="M{p0[0]:.1f} {p0[1]:.1f} A{r} {r} 0 1 1 {p1[0]:.1f} {p1[1]:.1f}" fill="none" stroke="{acc}" stroke-width="12" stroke-linecap="round"/>'
    return ring+H+S

C={"1-helmet-h":(lambda d: helmetH(WHITE if d else NAVY,ACC)),
   "2-shield":(lambda d: shield(WHITE if d else NAVY,ACC,NAVY if d else WHITE)),
   "3-hs-ring":(lambda d: hsring(WHITE if d else NAVY,ACC,NAVY if d else WHITE))}

def stacked(sym,dark):
    W=1000; Hh=1000; fg=WHITE if dark else NAVY; sub=OR; tg="#C9D1DB" if dark else GREY
    body=f'<g transform="translate({W/2-170} 70) scale(1.328)">{sym}</g>'
    s1=150; w1=width("HEZSY",s1,800,10); t1,_=text("HEZSY",W/2-w1/2,600,s1,800,10,fg)
    s2=44; w2=width("SAFETY SUPPLIERS",s2,700,0); tr=(w1-w2)/15; t2,_=text("SAFETY SUPPLIERS",W/2-w1/2,690,s2,700,tr,sub)
    s3=30; tag="SAFETY FIRST, ALWAYS"; w3=width(tag,s3,600,6); t3,_=text(tag,W/2-w3/2,790,s3,600,6,tg)
    lines=(f'<rect x="{W/2-w1/2}" y="{776}" width="{(w1-w3)/2-24}" height="3" fill="{tg}"/>'
           f'<rect x="{W/2+w3/2+24}" y="776" width="{(w1-w3)/2-24}" height="3" fill="{tg}"/>')
    return svg(W,860,body+t1+t2+t3+lines,NAVY if dark else None)
def horizontal(sym,dark):
    fg=WHITE if dark else NAVY
    s1=120; w1=width("HEZSY",s1,800,8); t1,_=text("HEZSY",300,148,s1,800,8,fg)
    s2=36; w2=width("SAFETY SUPPLIERS",s2,700,0); tr=(w1-w2)/15; t2,_=text("SAFETY SUPPLIERS",302,212,s2,700,tr,OR)
    W=int(300+w1+30)
    return svg(W,256,f'<g>{sym}</g>'+t1+t2,NAVY if dark else None)
for k,f in C.items():
    open(f"{OUT}/{k}-symbol.svg","w").write(svg(256,256,f(False)))
    open(f"{OUT}/{k}-symbol-dark.svg","w").write(svg(256,256,f(True),NAVY))
    open(f"{OUT}/{k}-stacked.svg","w").write(stacked(f(False),False))
    open(f"{OUT}/{k}-stacked-dark.svg","w").write(stacked(f(True),True))
    open(f"{OUT}/{k}-horizontal.svg","w").write(horizontal(f(False),False))
    open(f"{OUT}/{k}-horizontal-dark.svg","w").write(horizontal(f(True),True))
