import sys, math
src=open(sys.argv[3]).read(); exec(src[:src.index("for d in (False,True):")])
from fontTools.pens.boundsPen import BoundsPen
MB=TTFont(f"{S}/fonts/package/files/montserrat-latin-800-normal.woff")
def glyph_path(c,size,font=MONT):
    gs=font.getGlyphSet(); g=gs[font.getBestCmap()[ord(c)]]; u=font["head"].unitsPerEm; sc=size/u
    pen=SVGPathPen(None); g.draw(TransformPen(pen,(sc,0,0,-sc,0,0))); return pen.getCommands(), g.width*sc
def arc_text(s,cx,cy,r,size,tr,fill,top=True,font=MONT):
    gl=[glyph_path(c,size,font) for c in s]; L=sum(w for _,w in gl)+tr*(len(s)-1); out=""; x=0
    for d,w in gl:
        if top: a=-math.pi/2-(L/2)/r+(x+w/2)/r; rot=math.degrees(a)+90
        else:   a= math.pi/2+(L/2)/r-(x+w/2)/r; rot=math.degrees(a)-90
        px_,py_=cx+r*math.cos(a),cy+r*math.sin(a)
        out+=f'<path fill="{fill}" transform="translate({px_:.1f} {py_:.1f}) rotate({rot:.2f}) translate({-w/2:.1f} 0)" d="{d}"/>'
        x+=w+tr
    return out
def capof(size,font=MONT):
    gs=font.getGlyphSet(); bp=BoundsPen(None); gs[font.getBestCmap()[ord("H")]].draw(bp); return bp.bounds[3]*size/font["head"].unitsPerEm
SUB="SAFETY SUPPLIERS"

# 1 primary = v10 logo
def v1(dark=False): return logo(dark)
# 2 horizontal
def v2(dark=False):
    fg=WH if dark else BK; P=50; sc=0.62; cw=NW*sc; ch=C*sc
    s=ch*1.35/104; hx=P+14*s; hy=P-76*s        # hat (incl. lines) height ~ name block
    hatw=(262+14)*s; dvx=P+hatw+40
    nx=dvx+44; ny=P+6
    body=f'<g transform="translate({hx:.1f} {hy:.1f}) scale({s:.3f})">{hat(OR)}</g>'
    body+=f'<rect x="{dvx:.1f}" y="{P:.1f}" width="5" height="{ch*1.55:.1f}" fill="{OR}"/>'
    body+=word(nx,ny,fg,sc)
    ss=ch*0.36; tr=(cw-mW(SUB,ss,0))/15; body+=mtext(SUB,nx,ny+ch+ss*1.5,ss,tr,OR)
    return svg(nx+cw+P, P+ch*1.55+P, body, BK if dark else None)
# 3 round seal
def v3(dark=False):
    fg=WH if dark else BK; Sz=800; c=Sz/2; R1=380
    body=(f'<circle cx="{c}" cy="{c}" r="{R1}" fill="{BK if dark else WH}" stroke="{OR}" stroke-width="22"/>'
          f'<circle cx="{c}" cy="{c}" r="{R1-120}" fill="none" stroke="{fg}" stroke-width="4"/>')
    ts=50; capc=capof(ts,MB); rt=R1-35-capc
    body+=arc_text(SUB,c,c,rt,ts,ts*0.32,fg,True,MB)
    body+=arc_text("SAFETY GEAR DELIVERED",c,c,rt+capc,ts*0.78,ts*0.28,fg,False,MB)
    for ang in (180,0):
        x=c+(rt+capc/2)*math.cos(math.radians(ang)); body+=f'<circle cx="{x:.1f}" cy="{c+0:.1f}" r="11" fill="{OR}"/>'
    sc=0.29; cw=NW*sc; ch=C*sc; s=cw*0.50/212
    blk=104*s+18+ch; hy=c-blk/2-76*s; body+=f'<g transform="translate({c-156*s+14*s:.1f} {hy:.1f}) scale({s:.3f})">{hat(OR)}</g>'
    body+=word(c-cw/2,hy+180*s+18,fg,sc)
    return svg(Sz,Sz,body)
# 4 app icon
def v4(dark=True):
    Sz=1024; w=190; sc=2.6; hw=w*sc; s=hw*1.2/212; total=(180-76)*s+30+C*sc; top=(Sz-total)/2
    hx=Sz/2-156*s+10*s; hy=top-76*s; ny=top+(180-76)*s+30
    return svg(Sz,Sz,f'<rect width="{Sz}" height="{Sz}" rx="220" fill="{BK}"/><g transform="translate({hx:.1f} {hy:.1f}) scale({s:.3f})">{hat(OR)}</g><path fill="{WH}" transform="translate({Sz/2-hw/2:.1f} {ny:.1f}) scale({sc})" d="{" ".join(H(w))}"/>')
# 5 label plate
def v5(dark=False):
    sc=0.55; cw=NW*sc; ch=C*sc; Hh=ch*2.25; P=ch*0.62
    ow=Hh*1.25; s=Hh*0.36/104
    body=f'<rect x="0" y="0" width="{ow+P*0.8+cw+P*0.9:.1f}" height="{Hh:.1f}" rx="{Hh*0.12:.1f}" fill="{BK}"/>'
    body+=f'<path fill="{OR}" d="M{Hh*0.12:.1f} 0 H{ow:.1f} L{ow-Hh*0.18:.1f} {Hh:.1f} H{Hh*0.12:.1f} A{Hh*0.12:.1f} {Hh*0.12:.1f} 0 0 1 0 {Hh-Hh*0.12:.1f} V{Hh*0.12:.1f} A{Hh*0.12:.1f} {Hh*0.12:.1f} 0 0 1 {Hh*0.12:.1f} 0 Z"/>'
    body+=f'<g transform="translate({(ow-Hh*0.09)/2-124*s:.1f} {Hh/2-128*s:.1f}) scale({s:.3f})">{hat(BK,"hc5")}</g>'
    nx=ow+P*0.8; body+=word(nx,Hh/2-ch*0.78,WH,sc)
    ss=ch*0.34; tr=(cw-mW(SUB,ss,0))/15; body+=mtext(SUB,nx,Hh/2+ch*0.22+ss*1.25,ss,tr,OR)
    return svg(ow+P*0.8+cw+P*0.9, Hh, body)
V={"1-primary":v1,"2-horizontal":v2,"3-round-seal":v3,"4-app-icon":v4,"5-label-plate":v5}
for k,f in V.items():
    open(f"{OUT}/{k}.svg","w").write(f())
    if k in ("1-primary","2-horizontal","3-round-seal"): open(f"{OUT}/{k}-dark.svg","w").write(f(True))
