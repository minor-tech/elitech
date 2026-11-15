import sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
OUT=sys.argv[1]; S=sys.argv[2]
BK="#141414"; OR="#FF5A0A"; WH="#FFFFFF"; GR="#5F6368"
FONTS={"stencil":f"{S}/fonts2/fontsource-saira-stencil-one-5.3.0/package/files/saira-stencil-one-latin-400-normal.woff",
       "russo":f"{S}/fonts2/fontsource-russo-one-5.3.0/package/files/russo-one-latin-400-normal.woff",
       "shoulders":f"{S}/fonts2/fontsource-big-shoulders-display-5.3.0/package/files/big-shoulders-display-latin-900-normal.woff",
       "mont":f"{S}/fonts/package/files/montserrat-latin-700-normal.woff"}
F={k:TTFont(v) for k,v in FONTS.items()}
def g(ch,f): t=F[f]; return t.getGlyphSet()[t.getBestCmap()[ord(ch)]], t["head"].unitsPerEm
def W(s,size,f,tr=0): return sum(g(c,f)[0].width*size/g(c,f)[1] for c in s)+tr*(len(s)-1)
def text(s,x,y,size,f,tr=0,fill=BK):
    pen=SVGPathPen(None); cx=x
    for c in s:
        gl,u=g(c,f); sc=size/u; gl.draw(TransformPen(pen,(sc,0,0,-sc,cx,y))); cx+=gl.width*sc+tr
    return f'<path fill="{fill}" d="{pen.getCommands()}"/>'
def cap(f,size): gl,u=g("H",f); bp=BoundsPen(None); gl.draw(bp); return bp.bounds[3]*size/u
def svg(w,h,body,bg=None):
    b=f'<rect width="{w:.0f}" height="{h:.0f}" fill="{bg}"/>' if bg else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" width="{w:.0f}" height="{h:.0f}">{b}{body}</svg>'
def hat(col):
    lines="".join(f'<path fill="{col}" d="M{x0+h/2} {y-h/2} H96 V{y+h/2} H{x0+h/2} A{h/2} {h/2} 0 0 1 {x0+h/2} {y-h/2} Z"/>' for x0,y,h in ((6,100,11),(-14,124,13),(12,148,10)))
    cuts=('<path fill="none" stroke="black" stroke-width="9" stroke-linecap="round" d="M140 82 C156 100 164 128 165 156"/>'
          '<path fill="none" stroke="black" stroke-width="5" d="M40 162 H270"/>')
    return (f'<mask id="hc" maskUnits="userSpaceOnUse" x="-40" y="40" width="340" height="180"><rect x="-40" y="40" width="340" height="180" fill="white"/>{cuts}</mask>'
            f'<g mask="url(#hc)">{lines}<path fill="{col}" d="M70 160 C66 110 102 78 146 76 C190 76 212 104 216 146 C222 150 226 156 228 160 Z"/>'
            f'<path fill="{col}" d="M54 164 H214 C232 164 246 166 256 171 Q260 175 255 178 C244 180 230 180 214 180 H60 Q50 180 50 172 Q50 164 54 164 Z"/></g>')
TR={"stencil":6,"russo":6,"shoulders":10}
def logo(font,dark=False,mono=False,tag=True):
    fg=WH if dark else BK; A=BK if mono else OR; A2=(WH if dark else BK) if mono else OR
    NW=900; tr=TR[font]; size=NW/ (W("HEZSEY",1,font)+ (5*tr)/1e9)  # approx then fix tracking
    size=(NW-5*tr)/W("HEZSEY",1,font); ch=cap(font,size)
    P=50; x=P+30; s=0.64*NW/210
    hat_cx=x+NW*0.47; tx=hat_cx-157*s; top_hat=P; ty=top_hat-76*s
    base=ty+180*s+14+ch
    body=f'<g transform="translate({tx:.1f} {ty:.1f}) scale({s:.3f})">{hat(A)}</g>'
    body+=text("HEZSEY",x,base,size,font,tr,fg)
    ss=NW*0.046; sub="SAFETY SUPPLIERS"; sw=W(sub,ss,"mont",ss*0.28)
    sy=base+ss*1.9; sx=x+(NW-sw)/2
    body+=text(sub,sx,sy,ss,"mont",ss*0.28,A2)
    ln=(NW-sw)/2-ss*0.8
    body+=(f'<rect x="{x}" y="{sy-ss*0.42}" width="{ln}" height="{ss*0.14}" fill="{fg}"/>'
           f'<rect x="{x+NW-ln}" y="{sy-ss*0.42}" width="{ln}" height="{ss*0.14}" fill="{fg}"/>')
    h=sy+P
    if tag:
        ts=ss*0.6; t="SAFETY GEAR DELIVERED"; tw=W(t,ts,"mont",ts*0.45)
        body+=text(t,x+(NW-tw)/2,sy+ts*2.4,ts,"mont",ts*0.45,"#9AA0A6" if dark else GR); h=sy+ts*2.4+P
    left=min(tx-14*s,x)-P; Wd=x+NW+P-left
    return svg(Wd,h,f'<g transform="translate({-left:.1f} 0)">{body}</g>',BK if dark else None)
for f in ("stencil","russo","shoulders"):
    open(f"{OUT}/{f}.svg","w").write(logo(f)); open(f"{OUT}/{f}-dark.svg","w").write(logo(f,True))
