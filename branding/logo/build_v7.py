import sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
OUT=sys.argv[1]; FD=sys.argv[2]; NAME="HEZSEY"
BK="#141414"; OR="#FF5A0A"; WH="#FFFFFF"; GR="#4A4F55"
DEFS=('<linearGradient id="og" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF9A2E"/><stop offset=".55" stop-color="#FF6A12"/><stop offset="1" stop-color="#EE4A08"/></linearGradient>'
      '<linearGradient id="rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9440A"/><stop offset="1" stop-color="#B53604"/></linearGradient>'
      '<filter id="pencil" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" result="n"/>'
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="2.2"/></filter>')
F={w:TTFont(f"{FD}/montserrat-latin-{w}-normal.woff") for w in (600,700,800)}
def text(s,x,y,size,w=800,track=0,fill=BK,extra=""):
    f=F[w]; gs=f.getGlyphSet(); cm=f.getBestCmap(); sc=size/f["head"].unitsPerEm; pen=SVGPathPen(gs); cx=x
    for ch in s:
        g=cm[ord(ch)]; gs[g].draw(TransformPen(pen,(sc,0,0,-sc,cx,y))); cx+=gs[g].width*sc+track
    return f'<path fill="{fill}" {extra} d="{pen.getCommands()}"/>', cx-track-x
def W(s,size,w=800,track=0):
    f=F[w]; gs=f.getGlyphSet(); cm=f.getBestCmap(); sc=size/f["head"].unitsPerEm
    return sum(gs[cm[ord(c)]].width*sc for c in s)+track*(len(s)-1)
def C(s,cx,y,size,w,track,fill,extra=""): return text(s,cx-W(s,size,w,track)/2,y,size,w,track,fill,extra)[0]
def svg(w,h,body,bg=None):
    b=f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}"><defs>{DEFS}</defs>{b}{body}</svg>'

# ---- hard hat geometry (side view, facing right) ----
SHELL="M70 160 C66 110 102 78 146 76 C190 76 212 104 216 146 C222 150 226 156 228 160 Z"
RIDGE="M136 77 C156 94 168 124 170 160 H146 C145 128 136 100 118 81 Q126 77 136 77 Z"
RIDGE2=""
SHINE="M86 132 C90 106 106 92 124 86 C110 100 100 116 96 136 Z"
BRIM="M56 157 H214 C234 157 248 160 258 166 Q262 171 256 174 C244 176 230 176 214 176 H62 Q52 176 52 168 Q52 157 56 157 Z"
LINES=[(-84,102,13),(-100,126,16),(-72,150,12)]   # (x start, y centre, height) — all end hidden under the shell
def line_paths(): return [f"M{x0} {y-h*0.18} Q{x0-3} {y} {x0} {y+h*0.18} L100 {y+h/2} V{y-h/2} Z" for x0,y,h in LINES]

def hat_color(): return (f'<path fill="url(#og)" d="{SHELL}"/><path fill="#FFB466" d="{RIDGE}"/>'
                         f'<path fill="#fff" opacity=".35" d="{SHINE}"/><path fill="url(#rim)" d="{BRIM}"/>')
def hat_flat(): return (f'<path fill="{OR}" d="{SHELL}"/><path fill="#FF8A3D" d="{RIDGE}"/><path fill="#C93A06" d="{BRIM}"/>')
def lines_fill(col): return "".join(f'<path fill="{col}" d="{d}"/>' for d in line_paths())
def lines_mask(): return '<path fill="black" d="M-160 88 H-10 V164 H-160 Z"/>'

def badge(mode="final",dark=False):
    S=640; c=S/2; fg=WH if dark else BK; tf="translate(146 34) scale(1.3)"
    if mode=="sketch":
        st='fill="none" stroke="#2b2b2b" stroke-width="2.4" stroke-linejoin="round" filter="url(#pencil)"'
        guides=(f'<g stroke="#9fb4c8" stroke-width="1" stroke-dasharray="6 6" fill="none">'
                f'<line x1="{c}" y1="10" x2="{c}" y2="{S-10}"/><line x1="10" y1="{c}" x2="{S-10}" y2="{c}"/>'
                f'<circle cx="{c}" cy="{c}" r="{c-50}"/><line x1="40" y1="300" x2="600" y2="300"/><line x1="40" y1="412" x2="600" y2="412"/></g>')
        hat="".join(f'<path {st} d="{d}"/>' for d in (SHELL,RIDGE,BRIM)+tuple(line_paths()))
        ring=f'<circle cx="{c}" cy="{c}" r="{c-28}" {st}/><circle cx="{c}" cy="{c}" r="{c-42}" {st}/>'
        nm=C(NAME,c,404,100,800,8,"none",'stroke="#2b2b2b" stroke-width="2" filter="url(#pencil)"')
        sp=C("SAFETY SUPPLIERS",c,460,30,700,5,"none",'stroke="#2b2b2b" stroke-width="1.4" filter="url(#pencil)"')
        tg=C("SAFETY GEAR DELIVERED",c,516,19,600,4,"none",'stroke="#2b2b2b" stroke-width="1" filter="url(#pencil)"')
        notes=(text("speed = delivery",30,120,18,600,1,"#C0392B")[0]+text("hat = construction",430,215,18,600,1,"#C0392B")[0])
        return svg(S,S,guides+ring+f'<g transform="{tf}">{hat}</g>'+nm+sp+tg+notes,"#FBF8F1")
    hat=hat_flat() if mode=="flat" else hat_color()
    mask=(f'<mask id="rm"><rect width="{S}" height="{S}" fill="white"/><g transform="{tf}">{lines_mask()}</g></mask>')
    ring=(f'<g mask="url(#rm)"><circle cx="{c}" cy="{c}" r="{c-28}" fill="none" stroke="{OR}" stroke-width="16"/>'
          f'<circle cx="{c}" cy="{c}" r="{c-46}" fill="none" stroke="{fg}" stroke-width="3"/></g>')
    nm=C(NAME,c,404,100,800,8,fg)
    sp=C("SAFETY SUPPLIERS",c,460,30,700,5,OR)
    tw=W("SAFETY GEAR DELIVERED",19,600,4)
    tg=(C("SAFETY GEAR DELIVERED",c,516,19,600,4,fg)+f'<rect x="{c-tw/2-30}" y="509" width="16" height="3" fill="{OR}"/>'
        f'<rect x="{c+tw/2+14}" y="509" width="16" height="3" fill="{OR}"/>')
    return svg(S,S,mask+ring+f'<g transform="{tf}">{lines_fill(OR)}{hat}</g>'+nm+sp+tg,BK if dark else None)

def icon_badge(dark=False):
    S=256; c=128; tf="translate(2 14) scale(.86)"
    mask=f'<mask id="rm"><rect width="{S}" height="{S}" fill="white"/><g transform="{tf}">{lines_mask()}</g></mask>'
    ring=f'<circle cx="{c}" cy="{c}" r="114" fill="none" stroke="{OR}" stroke-width="12" mask="url(#rm)"/>'
    return svg(S,S,mask+ring+f'<g transform="{tf}">{lines_fill(OR)}{hat_color()}</g>',BK if dark else None)
def horizontal(dark=False):
    fg=WH if dark else BK
    nm,wn=text(NAME,400,140,112,800,6,fg); tr=(wn-W("SAFETY SUPPLIERS",34,700,0))/15
    sp,_=text("SAFETY SUPPLIERS",402,200,34,700,tr,OR)
    tg,_=text("SAFETY GEAR DELIVERED",402,240,19,600,(wn-W("SAFETY GEAR DELIVERED",19,600,0))/20,"#B9BEC4" if dark else GR)
    return svg(int(400+wn+30),270,f'<g transform="translate(108 30) scale(1.0)">{lines_fill(OR)}{hat_color()}</g>'+nm+sp+tg,BK if dark else None)

open(f"{OUT}/step1-sketch.svg","w").write(badge("sketch"))
open(f"{OUT}/step2-colour.svg","w").write(badge("flat"))
for d in (False,True):
    s="-dark" if d else ""
    open(f"{OUT}/badge{s}.svg","w").write(badge("final",d))
    open(f"{OUT}/icon-badge{s}.svg","w").write(icon_badge(d))
    open(f"{OUT}/horizontal{s}.svg","w").write(horizontal(d))

# ---------- four document samples ----------
import os
FO=os.path.join(os.path.dirname(OUT),"final"); os.makedirs(FO,exist_ok=True)
def no_border():
    S=640; c=S/2
    body=(f'<g transform="translate(146 0) scale(1.3)">{lines_fill(OR)}{hat_color()}</g>'
          +C(NAME,c,350,100,800,8,BK)+C("SAFETY SUPPLIERS",c,406,30,700,5,OR))
    tw=W("SAFETY GEAR DELIVERED",19,600,4)
    body+=(C("SAFETY GEAR DELIVERED",c,460,19,600,4,BK)+f'<rect x="{c-tw/2-40}" y="453" width="24" height="3" fill="{OR}"/>'
           f'<rect x="{c+tw/2+16}" y="453" width="24" height="3" fill="{OR}"/>')
    return svg(S,500,body)
def simple():
    S=640; c=S/2; tf="translate(146 34) scale(1.3)"
    mask=f'<mask id="rm"><rect width="{S}" height="{S}" fill="white"/><g transform="{tf}">{lines_mask()}</g></mask>'
    ring=f'<circle cx="{c}" cy="{c}" r="{c-28}" fill="none" stroke="{OR}" stroke-width="16" mask="url(#rm)"/>'
    hat=f'<path fill="{OR}" d="{SHELL}"/><path fill="{BK}" d="{BRIM}"/>'
    return svg(S,S,mask+ring+f'<g transform="{tf}">{lines_fill(OR)}{hat}</g>'+C(NAME,c,420,104,800,8,BK)+C("SAFETY SUPPLIERS",c,478,30,700,5,OR))
open(f"{FO}/1-no-border.svg","w").write(no_border())
open(f"{FO}/3-simple.svg","w").write(simple())
open(f"{FO}/4-with-border.svg","w").write(badge("final"))
