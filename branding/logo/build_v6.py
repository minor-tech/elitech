import sys
sys.path.insert(0,"/tmp/claude-0/-home-user-elitech/f6d02753-f744-5816-b829-e7f41f35ea0b/scratchpad")
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
OUT=sys.argv[1]; FD=sys.argv[2]
BK="#141414"; OR="#FF5A0A"; WH="#FFFFFF"; GR="#4A4F55"
DEFS=('<linearGradient id="og" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF9124"/><stop offset="1" stop-color="#F24A0A"/></linearGradient>'
      '<linearGradient id="rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E5480B"/><stop offset="1" stop-color="#C93A06"/></linearGradient>'
      '<linearGradient id="ln" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FF9124" stop-opacity=".55"/><stop offset="1" stop-color="#FF5A0A"/></linearGradient>')
F={w:TTFont(f"{FD}/montserrat-latin-{w}-normal.woff") for w in (600,700,800)}
def text(s,x,y,size,w=800,track=0,fill=BK):
    f=F[w]; gs=f.getGlyphSet(); cm=f.getBestCmap(); sc=size/f["head"].unitsPerEm; pen=SVGPathPen(gs); cx=x
    for ch in s:
        g=cm[ord(ch)]; gs[g].draw(TransformPen(pen,(sc,0,0,-sc,cx,y))); cx+=gs[g].width*sc+track
    return f'<path fill="{fill}" d="{pen.getCommands()}"/>', cx-track-x
def W(s,size,w=800,track=0):
    f=F[w]; gs=f.getGlyphSet(); cm=f.getBestCmap(); sc=size/f["head"].unitsPerEm
    return sum(gs[cm[ord(c)]].width*sc for c in s)+track*(len(s)-1)
def C(s,cx,y,size,w,track,fill): return text(s,cx-W(s,size,w,track)/2,y,size,w,track,fill)[0]
def svg(w,h,body,bg=None):
    b=f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}"><defs>{DEFS}</defs>{b}{body}</svg>'

# hard hat, side view facing right, in a 256 box (x 58..246, y 82..176)
HAT=('<path fill="url(#og)" d="M68 162 C66 110 102 82 148 82 C194 82 216 116 216 160 Z"/>'
     '<path fill="#FFB061" opacity=".9" d="M136 84 C150 104 156 130 156 160 H140 C140 132 134 106 124 86 Q130 84 136 84 Z"/>'
     '<path fill="#FFFFFF" opacity=".35" d="M88 128 C92 104 110 92 128 88 C112 100 100 116 96 132 Z"/>'
     '<path fill="url(#rim)" d="M60 156 H216 L244 162 Q250 170 242 174 H66 Q58 174 58 166 Z"/>')
def lines(bg,segs=((-104,100,14),(-118,127,17),(-100,154,14))):
    # tapered speed lines: thin tail on the left, thick near the hat
    out=""
    for x0,y,h in segs:
        d=f"M{x0} {y} L56 {y-h/2} Q60 {y-h/2} 60 {y} Q60 {y+h/2} 56 {y+h/2} Z"
        out+=(f'<path d="{d}" fill="black" stroke="black" stroke-width="12" stroke-linejoin="round"/>' if bg=="MASK"
              else f'<path d="{d}" fill="url(#ln)"/>')
    return out
def icon(bg,segs=None): return (lines(bg,segs) if segs else lines(bg))+HAT

def tagline(t,cx,y,size,fill,span):
    tw=W(t,size,600,4); ln=(span-tw)/2-16
    return (C(t,cx,y,size,600,4,fill)+f'<rect x="{cx-span/2}" y="{y-size*0.42}" width="{ln}" height="3" fill="{OR}"/>'
            f'<rect x="{cx+tw/2+16}" y="{y-size*0.42}" width="{ln}" height="3" fill="{OR}"/>')

def badge(dark):
    bg=BK if dark else WH; fg=WH if dark else BK; S=640; c=S/2
    tf="translate(150 22) scale(1.32)"
    ring=(f'<mask id="rm"><rect width="{S}" height="{S}" fill="white"/><g transform="{tf}">{lines("MASK")}</g></mask>'
          f'<circle cx="{c}" cy="{c}" r="{c-28}" fill="none" stroke="{OR}" stroke-width="16" mask="url(#rm)"/>')
    ic=f'<g transform="{tf}">{icon(bg)}</g>'
    hz=C("HEZSY",c,396,112,800,10,fg)
    sp=C("SAFETY SUPPLIERS",c,456,32,700,5,OR)
    tg=tagline("SAFETY GEAR DELIVERED",c,518,20,fg,440)
    return svg(S,S,ring+ic+hz+sp+tg,bg if dark else None)
def icon_badge(dark):
    bg=BK if dark else WH; S=256; c=128
    tf="translate(-6 10) scale(.92)"; sg=((8,100,14),(-4,127,17),(10,154,14))
    ring=(f'<mask id="rm"><rect width="{S}" height="{S}" fill="white"/><g transform="{tf}">{lines("MASK",sg)}</g></mask>'
          f'<circle cx="{c}" cy="{c}" r="112" fill="none" stroke="{OR}" stroke-width="12" mask="url(#rm)"/>')
    ic=f'<g transform="{tf}">{icon(bg,sg)}</g>'
    return svg(S,S,ring+ic,bg if dark else None)
def horizontal(dark):
    bg=BK if dark else WH; fg=WH if dark else BK
    hz,wh=text("HEZSY",300,140,120,800,8,fg); tr=(wh-W("SAFETY SUPPLIERS",36,700,0))/15
    sp,_=text("SAFETY SUPPLIERS",302,204,36,700,tr,OR)
    tg,_=text("SAFETY GEAR DELIVERED",302,244,20,600,(wh-W("SAFETY GEAR DELIVERED",20,600,0))/20,GR if not dark else "#B9BEC4")
    return svg(int(300+wh+30),270,f'<g transform="translate(34 30)">{icon(bg)}</g>'+hz+sp+tg,bg if dark else None)
for dark in (False,True):
    s="-dark" if dark else ""
    open(f"{OUT}/badge{s}.svg","w").write(badge(dark))
    open(f"{OUT}/icon-badge{s}.svg","w").write(icon_badge(dark))
    open(f"{OUT}/horizontal{s}.svg","w").write(horizontal(dark))
# names expected by mockup/grid scripts
import shutil, os
if os.environ.get("NOCOPY"): sys.exit()
for a,b in [("badge","delivered-stacked"),("icon-badge","delivered-symbol"),("horizontal","delivered-horizontal")]:
    shutil.copy(f"{OUT}/{a}.svg",f"{OUT}/{b}.svg"); shutil.copy(f"{OUT}/{a}-dark.svg",f"{OUT}/{b}-dark.svg")
