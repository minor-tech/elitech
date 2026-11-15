import sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
OUT=sys.argv[1]; FD=sys.argv[2]
BK="#141414"; OR="#FF5A0A"; WH="#FFFFFF"; GR="#5F6368"
GRAD='<linearGradient id="og" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF8A1F"/><stop offset="1" stop-color="#F2470A"/></linearGradient>'
F={w:TTFont(f"{FD}/montserrat-latin-{w}-normal.woff") for w in (600,700,800,900)}
def text(s,x,y,size,w=800,track=0,fill=BK):
    f=F[w]; gs=f.getGlyphSet(); cm=f.getBestCmap(); sc=size/f["head"].unitsPerEm; pen=SVGPathPen(gs); cx=x
    for ch in s:
        g=cm[ord(ch)]; gs[g].draw(TransformPen(pen,(sc,0,0,-sc,cx,y))); cx+=gs[g].width*sc+track
    return f'<path fill="{fill}" d="{pen.getCommands()}"/>', cx-track-x
def W(s,size,w=800,track=0):
    f=F[w]; gs=f.getGlyphSet(); cm=f.getBestCmap(); sc=size/f["head"].unitsPerEm
    return sum(gs[cm[ord(c)]].width*sc for c in s)+track*(len(s)-1)
CAP=F[800]["OS/2"].sCapHeight/F[800]["head"].unitsPerEm
def svg(w,h,body,bg=None):
    b=f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}"><defs>{GRAD}</defs>{b}{body}</svg>'
def centered(s,cx,y,size,w,track,fill):
    return text(s,cx-W(s,size,w,track)/2,y,size,w,track,fill)[0]
def tagline(t,cx,y,size,fill,span):
    tw=W(t,size,600,4); ln=(span-tw)/2-18
    return (centered(t,cx,y,size,600,4,fill)+f'<rect x="{cx-span/2}" y="{y-size*0.36}" width="{ln}" height="3" fill="{fill}"/>'
            f'<rect x="{cx+tw/2+18}" y="{y-size*0.36}" width="{ln}" height="3" fill="{fill}"/>')

# ---------- 1. CONE-A: the A in SAFETY is a traffic cone (word-image, like the O in BOX)
def cone(x,base,h,stripe=WH,body="url(#og)"):
    # cone fits cap height h; base plate a little wider and dips below baseline
    w=h*0.86; cx=x+w/2; top=base-h; tw=h*0.12
    plate=f'<rect x="{x-h*0.06}" y="{base-h*0.10}" width="{w+h*0.12}" height="{h*0.14}" rx="{h*0.03}" fill="{body}"/>'
    def at(t): return (w/2-tw/2)*t+tw/2   # half-width at fraction t from top
    y1=top+h*0.30; y2=top+h*0.44; y3=top+h*0.62; y4=top+h*0.76
    pts=f'M{cx-tw/2} {top} H{cx+tw/2} L{cx+w*0.46} {base-h*0.10} H{cx-w*0.46} Z'
    s=lambda a,b: f'M{cx-at((a-top)/h)-1} {a} H{cx+at((a-top)/h)+1} L{cx+at((b-top)/h)+1} {b} H{cx-at((b-top)/h)-1} Z'
    return f'<path fill="{body}" d="{pts}"/>{plate}<path fill="{stripe}" d="{s(y1,y2)} {s(y3,y4)}"/>', w
def safety_word(x,base,size,fg,stripe):
    h=CAP*size; out=[]; s,ws=text("S",x,base,size,800,0,fg); out.append(s); cx=x+ws+size*0.04
    c,wc=cone(cx,base,h,stripe); out.append(c); cx+=wc+size*0.04
    r,wr=text("FETY",cx,base,size,800,0,fg); out.append(r)
    return "".join(out), cx+wr-x
def cone_stacked(dark):
    fg=WH if dark else BK; Wd=1000
    hz=centered("HEZSY",Wd/2,250,190,800,14,fg)
    sw=W("S",150)+CAP*150*0.86+W("FETY",150)+150*0.08
    sf,_=safety_word(Wd/2-sw/2,440,150,OR,BK if dark else WH)
    sup=centered("SUPPLIERS",Wd/2,530,48,700,26,fg)
    tg=tagline("CONSTRUCTION & SAFETY GEAR",Wd/2,610,26,"#B9BEC4" if dark else GR,620)
    return svg(Wd,680,hz+sf+sup+tg,BK if dark else None)
def cone_horizontal(dark):
    fg=WH if dark else BK
    hz,wh=text("HEZSY",20,150,120,800,6,fg); sf,wsf=safety_word(20+wh+40,150,120,OR,BK if dark else WH)
    tot=wh+40+wsf; sup=centered("SUPPLIERS",20+tot/2,222,38,700,30,fg)
    return svg(int(tot+40),256,hz+sf+sup,BK if dark else None)
def cone_symbol(dark):
    c,_=cone(128-200*0.86/2,232,200,BK if dark else WH); return svg(256,256,c,BK if dark else None)

# ---------- 2. VEST ON A HANGER: "we supply the gear" (object story, like Steam & Press)
def vest(fg,stripe):
    hanger=(f'<path d="M128 74 V62 A15 15 0 1 1 143 47" fill="none" stroke="{fg}" stroke-width="9" stroke-linecap="round"/>'
            f'<path d="M128 74 L44 112 H212 Z" fill="none" stroke="{fg}" stroke-width="9" stroke-linejoin="round"/>')
    body=("M80 100 H103 L128 152 L153 100 H176 Q180 132 202 146 V226 Q202 236 192 236 H64 Q54 236 54 226 V146 Q76 132 80 100 Z")
    return (hanger+f'<path fill="url(#og)" d="{body}"/>'
            f'<path fill="{stripe}" d="M54 176 H202 V190 H54 Z M54 204 H202 V218 H54 Z"/>'
            f'<path fill="{fg}" opacity=".9" d="M126 152 H130 V236 H126 Z"/>')
def vest_stacked(dark):
    fg=WH if dark else BK; Wd=1000
    ic=f'<g transform="translate({Wd/2-150} 10) scale(1.17)">{vest(fg,"#E8F21C" if False else ("#D9DEE3" if dark else "#D9DEE3"))}</g>'
    hz=centered("HEZSY",Wd/2,450,150,800,12,fg)
    sup=centered("SAFETY SUPPLIERS",Wd/2,525,46,700,9,OR)
    tg=tagline("WE GEAR YOU UP",Wd/2,600,26,"#B9BEC4" if dark else GR,560)
    return svg(Wd,660,ic+hz+sup+tg,BK if dark else None)
def vest_horizontal(dark):
    fg=WH if dark else BK
    hz,wh=text("HEZSY",290,140,120,800,8,fg); s2w=W("SAFETY SUPPLIERS",36,700,0); tr=(wh-s2w)/15
    sp,_=text("SAFETY SUPPLIERS",292,206,36,700,tr,OR)
    return svg(int(290+wh+30),256,f'<g>{vest(fg,"#D9DEE3")}</g>'+hz+sp,BK if dark else None)
def vest_symbol(dark): return svg(256,256,vest(WH if dark else BK,"#D9DEE3"),BK if dark else None)

# ---------- 3. SAFETY DELIVERED: hard hat with speed lines in a ring badge (like Third Thread)
def fasthat(col,lines):
    hat=(f'<path fill="{col}" d="M92 160 Q92 92 152 88 Q206 92 210 152 L238 158 Q242 170 230 170 H92 Z"/>'
         f'<path fill="none" stroke="{WH}" stroke-width="7" stroke-linecap="round" d="M150 96 Q160 120 160 160"/>')
    sp=(f'<path fill="{lines}" d="M14 108 H86 L82 120 H22 Z M2 132 H82 L80 144 H10 Z M22 156 H80 V168 H30 Z"/>')
    return sp+hat
def badge(dark):
    fg=WH if dark else BK; S=640; c=S/2
    ring=f'<circle cx="{c}" cy="{c}" r="{c-14}" fill="none" stroke="{OR}" stroke-width="14"/>'
    icon=f'<g transform="translate({c-128*1.25-10} 70) scale(1.25)">{fasthat("url(#og)",OR)}</g>'
    hz=centered("HEZSY",c,390,104,800,12,fg)
    sp=centered("SAFETY SUPPLIERS",c,450,34,700,6,OR)
    tg=tagline("SAFETY GEAR DELIVERED",c,512,20,fg,360)
    return svg(S,S,ring+icon+hz+sp+tg,BK if dark else None)
def hat_horizontal(dark):
    fg=WH if dark else BK
    hz,wh=text("HEZSY",290,140,120,800,8,fg); s2w=W("SAFETY SUPPLIERS",36,700,0); tr=(wh-s2w)/15
    sp,_=text("SAFETY SUPPLIERS",292,206,36,700,tr,OR)
    return svg(int(290+wh+30),256,f'<g transform="translate(0 10)">{fasthat("url(#og)",OR)}</g>'+hz+sp,BK if dark else None)

sets={"1-cone":(cone_symbol,cone_stacked,cone_horizontal),
      "2-vest":(vest_symbol,vest_stacked,vest_horizontal),
      "3-delivered":(badge,badge,hat_horizontal)}
for k,(sy,st,ho) in sets.items():
    for dark in (False,True):
        sfx="-dark" if dark else ""
        open(f"{OUT}/{k}-symbol{sfx}.svg","w").write(sy(dark))
        open(f"{OUT}/{k}-stacked{sfx}.svg","w").write(st(dark))
        open(f"{OUT}/{k}-horizontal{sfx}.svg","w").write(ho(dark))
