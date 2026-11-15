import sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
OUT=sys.argv[1]
Y="#FFC20E"; K="#1D1D1B"; W="#FFFFFF"
fonts={"black":TTFont("/usr/share/fonts/opentype/inter/InterDisplay-Black.otf"),
       "bold":TTFont("/usr/share/fonts/opentype/inter/Inter-Bold.otf")}
def text(s,x,y,size,weight="black",track=0,fill=K):
    f=fonts[weight]; gs=f.getGlyphSet(); cmap=f.getBestCmap(); upm=f["head"].unitsPerEm
    sc=size/upm; pen=SVGPathPen(gs); cx=x
    for ch in s:
        g=cmap[ord(ch)]; tp=TransformPen(pen,(sc,0,0,-sc,cx,y)); gs[g].draw(tp)
        cx+=gs[g].width*sc+track
    return f'<path fill="{fill}" d="{pen.getCommands()}"/>', cx-track-x
def stripes(x0,y0,w,h,step=24,col=K):
    out=[]; i=-h
    while i<w+h:
        out.append(f'M{x0+i} {y0+h} L{x0+i+h} {y0} H{x0+i+h+step/2} L{x0+i+step/2} {y0+h} Z'); i+=step
    return f'<path fill="{col}" d="{" ".join(out)}"/>'
def svg(w,h,body,defs=""):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}"><defs>{defs}</defs>{body}</svg>'

# --- A: Hex Helmet (emblem): charcoal bolt-head hexagon, yellow hard hat with H
import math
hexpts=" ".join(f"{128+112*math.cos(math.radians(a)):.1f} {128+112*math.sin(math.radians(a)):.1f}" for a in range(30,390,60))
hexagon=f'<path fill="{K}" d="M{hexpts.split()[0]} {hexpts.split()[1]} L{" ".join(hexpts.split()[2:])} Z" stroke="{K}" stroke-width="16" stroke-linejoin="round"/>'
dome="M54 158 A74 74 0 0 1 202 158 Z"
ridge="M116 84 H140 V158 H116 Z"   # cut ridge
hat=f'<path fill="{Y}" fill-rule="evenodd" d="{dome} M120 86 H136 V150 H120 Z"/><path fill="{Y}" d="M38 162 H218 Q222 162 222 166 V176 Q222 186 212 186 H44 Q34 186 34 176 V166 Q34 162 38 162 Z"/>'
H_A,_=text("H",0,0,1)  # placeholder
A_sym=hexagon+hat
# --- B: Hazard Shield
shield="M128 20 L220 45 V116 C220 178 182 218 128 240 C74 218 36 178 36 116 V45 Z"
Hb="M82 64 H110 V104 H146 V64 H174 V162 H146 V128 H110 V162 H82 Z"
B_defs=f'<clipPath id="sh"><path d="{shield}"/></clipPath>'
B_sym=(f'<path fill="{K}" d="{shield}"/>'
       f'<g clip-path="url(#sh)"><rect x="0" y="178" width="256" height="80" fill="{Y}"/>{stripes(0,178,256,80,40)}</g>'
       f'<path fill="{Y}" d="{Hb}"/>')
# --- C: Hazard-tape H tile
C_defs=f'<clipPath id="bar"><rect x="100" y="112" width="56" height="32"/></clipPath>'
C_sym=(f'<rect x="8" y="8" width="240" height="240" rx="44" fill="{Y}"/>'
       f'<path fill="{K}" d="M58 52 H100 V204 H58 Z M156 52 H198 V204 H156 Z M100 104 H156 V152 H100 Z"/>'
       f'<g clip-path="url(#bar)">{stripes(100,104,56,48,28,Y)}</g>')
syms={"a":(A_sym,""),"b":(B_sym,B_defs),"c":(C_sym,C_defs)}
for k,(b,d) in syms.items():
    open(f"{OUT}/{k}-symbol.svg","w").write(svg(256,256,b,d))
# lockup text block
t1,w1=text("HEZSY SAFETY",290,128,92,"black",2)
t2,w2=text("SUPPLIERS",293,200,44,"bold",9)
bx=293+w2+22; bw=290+w1-bx
band=(f'<defs><clipPath id="tape"><rect x="{bx}" y="168" width="{bw}" height="32"/></clipPath></defs>'
      f'<rect x="{bx}" y="168" width="{bw}" height="32" fill="{Y}"/><g clip-path="url(#tape)">{stripes(bx,168,bw,32,26)}</g>')
for k,(b,d) in syms.items():
    W_=int(290+w1+20)
    open(f"{OUT}/{k}-lockup.svg","w").write(svg(W_,256,f'<g>{b}</g>{t1}{band}{t2}',d))
    # reversed lockup on charcoal
    t1w,_=text("HEZSY SAFETY",290,128,92,"black",2,W); t2w,_=text("SUPPLIERS",293,200,44,"bold",9,W)
    rb=b.replace(f'<path fill="{K}" d="{shield}"/>',f'<path fill="#333331" d="{shield}"/>') if k!="a" else b.replace(f'fill="{K}" d="M{hexpts.split()[0]}',f'fill="#333331" d="M{hexpts.split()[0]}').replace(f'stroke="{K}"','stroke="#333331"')
    open(f"{OUT}/{k}-lockup-dark.svg","w").write(svg(W_,256,f'<rect width="{W_}" height="256" fill="{K}"/><g>{rb}</g>{t1w}{band}{t2w}',d))
print(w1,w2)
