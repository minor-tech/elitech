import sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
OUT=sys.argv[1]; FD=sys.argv[2]; NAME="HEZSEY"
BK="#141414"; OR="#FF5A0A"; WH="#FFFFFF"
F={w:TTFont(f"{FD}/montserrat-latin-{w}-normal.woff") for w in (600,700,800)}
def gl(ch,w): f=F[w]; return f.getGlyphSet()[f.getBestCmap()[ord(ch)]], f["head"].unitsPerEm
def text(s,x,y,size,w=800,track=0,fill=BK):
    f=F[w]; gs=f.getGlyphSet(); pen=SVGPathPen(gs); cx=x
    for ch in s:
        g,u=gl(ch,w); sc=size/u; g.draw(TransformPen(pen,(sc,0,0,-sc,cx,y))); cx+=g.width*sc+track
    return f'<path fill="{fill}" d="{pen.getCommands()}"/>'
def W(s,size,w=800,track=0): return sum(gl(c,w)[0].width*size/gl(c,w)[1] for c in s)+track*(len(s)-1)
def ink(ch,size,w=800):
    g,u=gl(ch,w); bp=BoundsPen(None); g.draw(bp); sc=size/u; x0,y0,x1,y1=bp.bounds; return x0*sc,x1*sc,y1*sc
def svg(w,h,body,bg=None):
    b=f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" width="{w:.0f}" height="{h:.0f}">{b}{body}</svg>'

# clean flat hard hat in unit box (x 52..262, y 76..176); cut lines use the background colour
def hat(col,cut,lines=True):
    out=""
    if lines:
        for x0,y,h in ((10,100,11),(-8,124,13),(16,148,10)):
            out+=f'<path fill="{col}" d="M{x0+h/2} {y-h/2} H96 V{y+h/2} H{x0+h/2} A{h/2} {h/2} 0 0 1 {x0+h/2} {y-h/2} Z"/>'
    cuts=('<path fill="none" stroke="black" stroke-width="9" stroke-linecap="round" d="M140 82 C156 100 164 128 165 156"/>'
          '<path fill="none" stroke="black" stroke-width="5" d="M40 162 H270"/>')
    out=(f'<mask id="hc" maskUnits="userSpaceOnUse" x="-40" y="40" width="340" height="180"><rect x="-40" y="40" width="340" height="180" fill="white"/>{cuts}</mask>'
         f'<g mask="url(#hc)">{out}'
         f'<path fill="{col}" d="M70 160 C66 110 102 78 146 76 C190 76 212 104 216 146 C222 150 226 156 228 160 Z"/>'
         f'<path fill="{col}" d="M54 164 H214 C232 164 246 166 256 171 Q260 175 255 178 C244 180 230 180 214 180 H60 Q50 180 50 172 Q50 164 54 164 Z"/></g>')
    return out

def logo(dark=False, tag=False, mono=False):
    fg=WH if dark else BK; bg=BK if dark else WH; A=BK if mono else OR
    size=200; tr=6; wn=W(NAME,size,800,tr); hx0,hx1,cap=ink("H",size)
    pad=40; x=pad+60; base=pad+250
    # hat over the H: scale so hat (210 units wide) ~ 1.55x H width, sitting just above cap top
    hw=hx1-hx0; s=hw*1.55/210; hcx=x+hx0+hw*0.58
    tx=hcx-157*s; ty=base-cap-10-180*s
    body=f'<g transform="translate({tx:.1f} {ty:.1f}) scale({s:.3f})">{hat(A,bg)}</g>'
    body+=text(NAME,x,base,size,800,tr,fg)
    ss=60; sw=W("SAFETY SUPPLIERS",ss,700,0); st=(wn-sw)/15
    body+=text("SAFETY SUPPLIERS",x+3,base+88,ss,700,st,A)
    h=base+88+pad
    if tag:
        ts=26; tw=W("SAFETY GEAR DELIVERED",ts,600,0); tt=(wn-tw)/20
        body+=text("SAFETY GEAR DELIVERED",x+3,base+140,ts,600,tt,"#9AA0A6" if dark else "#5F6368"); h=base+140+pad
    top=ty+76*s-pad
    left=min(tx+(-8)*s, x)-pad
    return svg(x+wn+pad-left, h-top, f'<g transform="translate({-left:.1f} {-top:.1f})">{body}</g>', bg if dark else None)

def icon(dark=False):
    fg=WH if dark else BK; bg=BK if dark else WH; S=512
    size=330; hx0,hx1,cap=ink("H",size); hw=hx1-hx0; s=hw*1.5/210
    tot=cap+12+104*s; base=(S+tot)/2
    x=(S-hw)/2-hx0+14; hcx=x+hx0+hw*0.58; tx=hcx-157*s; ty=base-cap-12-180*s
    return svg(S,S,f'<g transform="translate({tx:.1f} {ty:.1f}) scale({s:.3f})">{hat(OR,bg)}</g>'+text("H",x,base,size,800,0,fg),bg if dark else None)

for d in (False,True):
    sfx="-dark" if d else ""
    open(f"{OUT}/logo{sfx}.svg","w").write(logo(d))
    open(f"{OUT}/logo-tagline{sfx}.svg","w").write(logo(d,True))
    open(f"{OUT}/icon{sfx}.svg","w").write(icon(d))

import re
open(f"{OUT}/logo-mono.svg","w").write(logo(mono=True))
src=logo(tag=True); m=re.search(r'viewBox="0 0 (\d+) (\d+)"',src); w,h=int(m.group(1)),int(m.group(2)); inner=src[src.index('>')+1:src.rindex('</svg>')]
P=50; open(f"{OUT}/logo-border.svg","w").write(svg(w+2*P,h+2*P,f'<rect x="10" y="10" width="{w+2*P-20}" height="{h+2*P-20}" rx="28" fill="#fff" stroke="{OR}" stroke-width="8"/><g transform="translate({P} {P})">{inner}</g>'))
