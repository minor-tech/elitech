import sys, math
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
OUT=sys.argv[1]
A="#FFB400"; K="#1D1D1B"; W="#FFFFFF"
F={"black":TTFont("/usr/share/fonts/opentype/inter/InterDisplay-Black.otf"),
   "bold":TTFont("/usr/share/fonts/opentype/inter/Inter-Bold.otf")}
def text(s,x,y,size,weight="black",track=0,fill=K):
    f=F[weight]; gs=f.getGlyphSet(); cmap=f.getBestCmap(); sc=size/f["head"].unitsPerEm
    pen=SVGPathPen(gs); cx=x
    for ch in s:
        g=cmap[ord(ch)]; gs[g].draw(TransformPen(pen,(sc,0,0,-sc,cx,y))); cx+=gs[g].width*sc+track
    return f'<path fill="{fill}" d="{pen.getCommands()}"/>', cx-track-x
def adv(ch,size,weight="black"):
    f=F[weight]; return f.getGlyphSet()[f.getBestCmap()[ord(ch)]].width*size/f["head"].unitsPerEm
CAP=F["black"]["OS/2"].sCapHeight/F["black"]["head"].unitsPerEm
def svg(w,h,body,bg=None):
    b=f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">{b}{body}</svg>'

# ---- 1. Safety smile: falling dot caught by a smile-shaped net line
def smile(dot,curve):
    return (f'<circle cx="128" cy="76" r="34" fill="{dot}"/>'
            f'<path d="M44 138 Q128 238 212 138" fill="none" stroke="{curve}" stroke-width="32" stroke-linecap="round"/>')
# ---- 2. Locked H: carabiner outline = H stems, amber gate = crossbar
def carabiner(line,bar):
    # carabiner: charcoal body + spine, amber gate on the right (spine + gate = H stems, bar = crossbar)
    body=("M196 60 A40 40 0 0 0 156 26 H100 A44 44 0 0 0 56 70 V180 A46 46 0 0 0 102 226 H150 A46 46 0 0 0 196 182")
    return (f'<path d="{body}" fill="none" stroke="{line}" stroke-width="28"/>'
            f'<path d="M196 76 V166" stroke="{bar}" stroke-width="22" stroke-linecap="round"/>'
            f'<path d="M56 128 H178" stroke="{line}" stroke-width="28"/>')
# ---- 3. Zip Z: Z whose diagonal is zipper teeth, with a pull tab
def zipZ(x,base,size,col,tab):
    w=adv("Z",size); ch=CAP*size; top=base-ch; bar=ch*0.2; st=ch*0.27
    x0,x1=x+size*0.03,x+w-size*0.05
    out=[f'<path fill="{col}" d="M{x0} {top} H{x1} V{top+bar} H{x0} Z M{x0} {base-bar} H{x1} V{base} H{x0} Z"/>']
    p1=(x1-st*0.5,top+bar); p0=(x0+st*0.5,base-bar)
    dx,dy=p0[0]-p1[0],p0[1]-p1[1]; L=math.hypot(dx,dy); ux,uy=dx/L,dy/L; px,py=-uy,ux
    ang=math.degrees(math.atan2(uy,ux)); n=7; seg=L/n
    for i in range(n):
        t=(i+0.5)/n; cx=p1[0]+dx*t; cy=p1[1]+dy*t; s=1 if i%2 else -1
        ox,oy=cx+px*s*st*0.14,cy+py*s*st*0.14
        out.append(f'<rect x="{-seg*0.42:.2f}" y="{-st*0.36:.2f}" width="{seg*0.84:.2f}" height="{st*0.72:.2f}" rx="{seg*0.15:.2f}" fill="{col}" transform="translate({ox:.2f} {oy:.2f}) rotate({ang:.2f})"/>')
    # slider + pull tab hanging from top-right
    tw=st*0.56; tx=x1-tw/2
    out.append(f'<path fill="{tab}" fill-rule="evenodd" d="M{tx-tw/2} {top+bar-2} H{tx+tw/2} V{top+bar+ch*0.42} A{tw/2} {tw/2} 0 0 1 {tx-tw/2} {top+bar+ch*0.42} Z M{tx-tw*0.18} {top+bar+ch*0.18} H{tx+tw*0.18} V{top+bar+ch*0.38} A{tw*0.18} {tw*0.18} 0 0 1 {tx-tw*0.18} {top+bar+ch*0.38} Z"/>')
    return "".join(out), w

syms={"1-smile":smile(K,A),"2-carabiner":carabiner(K,A)}
dark={"1-smile":smile(W,A),"2-carabiner":carabiner(W,A)}
zsym,_=zipZ(128-adv("Z",230)/2,128+CAP*230/2,230,K,W)
syms["3-zip"]=f'<rect x="8" y="8" width="240" height="240" rx="48" fill="{A}"/>'+zipZ(128-adv("Z",190)/2+4,128+CAP*190/2,190,K,W)[0]
dark["3-zip"]=syms["3-zip"]
for k,b in syms.items(): open(f"{OUT}/{k}-symbol.svg","w").write(svg(256,256,b))

def lock(k,b,fg,bg=None):
    if k=="1-smile":
        t1,w1=text("hezsy",290,150,128,"black",-2,fg)
    else:
        t1,w1=text("HEZSY",290,140,112,"black",2,fg)
    t2,w2=text("SAFETY SUPPLIERS",294,206,34,"bold",0,fg)
    tr=(w1-w2)/15; t2,w2=text("SAFETY SUPPLIERS",294,206,34,"bold",max(tr,2),fg)
    Wd=int(290+max(w1,w2)+24)
    return svg(Wd,256,f'<g>{b}</g>{t1}{t2}',bg)
for k in ["1-smile","2-carabiner"]:
    open(f"{OUT}/{k}-lockup.svg","w").write(lock(k,syms[k],K))
    open(f"{OUT}/{k}-lockup-dark.svg","w").write(lock(k,dark[k],W,K))
# zipped wordmark
def wordmark(fg,tab,bg=None):
    size=150; base=150; x=24
    he,wh=text("HE",x,base,size,"black",3,fg); z,wz=zipZ(x+wh+3,base,size,fg,tab)
    sy,ws=text("SY",x+wh+wz+6,base,size,"black",3,fg)
    tot=wh+wz+ws+6
    t2,w2=text("SAFETY SUPPLIERS",x+4,216,38,"bold",0,fg); tr=(tot-w2-4)/15
    t2,_=text("SAFETY SUPPLIERS",x+4,216,38,"bold",tr,fg)
    return svg(int(tot+48),256,he+z+sy+t2,bg)
open(f"{OUT}/3-zip-lockup.svg","w").write(wordmark(K,A))
open(f"{OUT}/3-zip-lockup-dark.svg","w").write(wordmark(W,A,K))
