import sys, re
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
OUT=sys.argv[1]; S=sys.argv[2]
BK="#141414"; OR="#FF5A0A"; WH="#FFFFFF"; GR="#5F6368"
MONT=TTFont(f"{S}/fonts/package/files/montserrat-latin-700-normal.woff")
def mg(c): return MONT.getGlyphSet()[MONT.getBestCmap()[ord(c)]]
U=MONT["head"].unitsPerEm
def mW(s,size,tr): return sum(mg(c).width*size/U for c in s)+tr*(len(s)-1)
def mtext(s,x,y,size,tr,fill):
    pen=SVGPathPen(None); cx=x
    for c in s: g=mg(c); sc=size/U; g.draw(TransformPen(pen,(sc,0,0,-sc,cx,y))); cx+=g.width*sc+tr
    return f'<path fill="{fill}" d="{pen.getCommands()}"/>'
def svg(w,h,body,bg=None,extra=""):
    b=f'<rect width="{w:.0f}" height="{h:.0f}" fill="{bg}"/>' if bg else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" width="{w:.0f}" height="{h:.0f}">{b}{body}</svg>'

# ---- custom stencil wordmark (cap height C) ----
C=200; t=28; g=12; dx=t*1.35
def R(x,y,w,h): return f"M{x:.1f} {y:.1f}h{w:.1f}v{h:.1f}h{-w:.1f}Z"
def Q(*p): return "M"+" L".join(f"{a:.1f} {b:.1f}" for a,b in p)+"Z"
def H(w): return [R(0,0,t,C),R(w-t,0,t,C),R(t+g,C/2-t/2,w-2*t-2*g,t)]
def E(w): return [R(0,0,t,C),R(t+g,0,w-t-g,t),R(t+g,C/2-t/2,w*0.82-t-g,t),R(t+g,C-t,w-t-g,t)]
def Z(w): return [R(0,0,w,t),R(0,C-t,w,t),Q((w-dx,t+g),(w,t+g),(dx,C-t-g),(0,C-t-g))]
def Sx(w):
    r=(C/2-t/2)/2; a=t/2+r; b=w-t/2-r
    return {"stroke":[f"M{w} {t/2} H{a} A{r} {r} 0 0 0 {a} {C/2}",
                      f"M{a+g} {C/2} H{b-g}",
                      f"M{b} {C/2} A{r} {r} 0 0 1 {b} {C-t/2} H0"]}
def Y(w):
    yj=C*0.48
    return [Q((0,0),(dx,0),(w/2-g/2,yj),(w/2-g/2-dx,yj)),Q((w,0),(w-dx,0),(w/2+g/2,yj),(w/2+g/2+dx,yj)),R(w/2-t/2,yj+g,t,C-yj-g)]
GLY=[(H,190),(E,170),(Z,190),(Sx,178),(E,170),(Y,206)]; SP=78
NW=sum(w for _,w in GLY)+SP*(len(GLY)-1)
def word(x,y,fill,scale=1.0):
    out=[]; cx=0
    for f,w in GLY:
        r=f(w)
        if isinstance(r,dict):
            out.append(f'<g transform="translate({cx:.1f} 0)">'+"".join(f'<path d="{d}" fill="none" stroke="{fill}" stroke-width="{t}"/>' for d in r["stroke"])+'</g>')
        else:
            out.append(f'<path fill="{fill}" transform="translate({cx:.1f} 0)" d="{" ".join(r)}"/>')
        cx+=w+SP
    return f'<g transform="translate({x:.1f} {y:.1f}) scale({scale})">{"".join(out)}</g>'

# ---- clean hat (masked cut lines) ----
def hat(col,mid="hc"):
    lines="".join(f'<path fill="{col}" d="M{x0+h/2} {y-h/2} H96 V{y+h/2} H{x0+h/2} A{h/2} {h/2} 0 0 1 {x0+h/2} {y-h/2} Z"/>' for x0,y,h in ((6,100,11),(-14,124,13),(12,148,10)))
    cuts=('<path fill="none" stroke="black" stroke-width="9" stroke-linecap="round" d="M140 82 C156 100 164 128 165 156"/>'
          '<path fill="none" stroke="black" stroke-width="5" d="M40 162 H270"/>')
    return (f'<mask id="{mid}" maskUnits="userSpaceOnUse" x="-40" y="40" width="340" height="180"><rect x="-40" y="40" width="340" height="180" fill="white"/>{cuts}</mask>'
            f'<g mask="url(#{mid})">{lines}<path fill="{col}" d="M70 160 C66 110 102 78 146 76 C190 76 212 104 216 146 C222 150 226 156 228 160 Z"/>'
            f'<path fill="{col}" d="M54 164 H214 C232 164 246 166 256 171 Q260 175 255 178 C244 180 230 180 214 180 H60 Q50 180 50 172 Q50 164 54 164 Z"/></g>')

def logo(dark=False,mono=False,tag=True,P=60):
    fg=WH if dark else BK; A=fg if mono else OR
    s=NW*0.27/212; hx=P+NW/2-156*s+14*s; hy=P-76*s
    nameY=hy+180*s+C*0.20
    body=f'<g transform="translate({hx:.1f} {hy:.1f}) scale({s:.3f})">{hat(A)}</g>'+word(P,nameY,fg)
    ss=C*0.28; sub="SAFETY SUPPLIERS"; tr=ss*0.30; sw=mW(sub,ss,tr); sy=nameY+C+ss*1.9
    body+=mtext(sub,P+(NW-sw)/2,sy,ss,tr,A)
    ln=(NW-sw)/2-ss*0.9
    body+=(f'<rect x="{P}" y="{sy-ss*0.42:.1f}" width="{ln:.1f}" height="{ss*0.12:.1f}" fill="{fg}"/>'
           f'<rect x="{P+NW-ln:.1f}" y="{sy-ss*0.42:.1f}" width="{ln:.1f}" height="{ss*0.12:.1f}" fill="{fg}"/>')
    h=sy+P
    if tag:
        ts=ss*0.58; tt="SAFETY GEAR DELIVERED"; tw=mW(tt,ts,ts*0.5)
        body+=mtext(tt,P+(NW-tw)/2,sy+ts*2.5,ts,ts*0.5,"#9AA0A6" if dark else GR); h=sy+ts*2.5+P
    return svg(P*2+NW,h,body,BK if dark else None)

def icon(dark=False):
    fg=WH if dark else BK; Sz=512; w=190; sc=1.45; hw=w*sc
    s=hw*1.25/212; total=(180-76)*s+20+C*sc; top=(Sz-total)/2
    hx=Sz/2-156*s; hy=top-76*s; ny=top+(180-76)*s+20
    d=" ".join(H(w))
    return svg(Sz,Sz,f'<g transform="translate({hx:.1f} {hy:.1f}) scale({s:.3f})">{hat(OR)}</g><path fill="{fg}" transform="translate({Sz/2-hw/2:.1f} {ny:.1f}) scale({sc})" d="{d}"/>',BK if dark else None)

for d in (False,True):
    x="-dark" if d else ""
    open(f"{OUT}/logo{x}.svg","w").write(logo(d))
    open(f"{OUT}/logo-notag{x}.svg","w").write(logo(d,tag=False))
    open(f"{OUT}/icon{x}.svg","w").write(icon(d))
open(f"{OUT}/logo-mono.svg","w").write(logo(mono=True))
src=logo(); m=re.search(r'viewBox="0 0 (\d+) (\d+)"',src); w,h=int(m.group(1)),int(m.group(2)); inner=src[src.index('>')+1:src.rindex('</svg>')]
P=60; open(f"{OUT}/logo-border.svg","w").write(svg(w+2*P,h+2*P,f'<rect x="12" y="12" width="{w+2*P-24}" height="{h+2*P-24}" rx="34" fill="#fff" stroke="{OR}" stroke-width="10"/><g transform="translate({P} {P})">{inner}</g>'))
