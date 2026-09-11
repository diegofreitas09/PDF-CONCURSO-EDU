#!/usr/bin/env python3
"""Extrai recortes visuais de questões a partir de PDFs em duas colunas.

Uso:
  pip install pymupdf
  python tools/extract_question_crops.py prova.pdf --pages 94-101 --out public/question-media/uece/fisica/dinamica

O script localiza marcadores do tipo `23)` na camada de texto, separa as colunas,
renderiza cada questão a 300 DPI e grava um manifest JSON com página e bbox.
Questões com fórmulas, vetores, desenhos ou gráficos preservam a aparência original
porque o recorte é renderizado diretamente do PDF, sem depender do OCR.
"""
from __future__ import annotations
import argparse, json, re
from pathlib import Path
import fitz

QUESTION_RE=re.compile(r"^(\d{1,3})\)$")

def parse_pages(spec:str,total:int):
    if not spec:return list(range(total))
    pages=[]
    for part in spec.split(","):
        part=part.strip()
        if "-" in part:
            a,b=part.split("-",1);pages.extend(range(max(1,int(a))-1,min(total,int(b))))
        else:
            p=int(part)-1
            if 0<=p<total:pages.append(p)
    return sorted(set(pages))

def starts_for_page(page):
    width=page.rect.width;mid=width/2
    starts=[]
    for w in page.get_text("words"):
        x0,y0,x1,y1,text,*_=w
        m=QUESTION_RE.match(text.strip())
        if not m:continue
        qn=int(m.group(1));col=0 if x0<mid else 1
        starts.append({"question":qn,"x":x0,"y":y0,"col":col})
    starts.sort(key=lambda r:(r["col"],r["y"]))
    return starts

def crop_for(page,start,next_start=None,margin=10):
    width,height=page.rect.width,page.rect.height;mid=width/2
    if start["col"]==0:
        x0=35;x1=mid-8
    else:
        x0=mid+3;x1=width-28
    y0=max(65,start["y"]-margin)
    y1=(next_start["y"]-6 if next_start else height-55)
    y1=max(y0+45,min(height-40,y1))
    return fitz.Rect(x0,y0,x1,y1)

def visual_score(page,rect):
    score=0;details=[]
    for img in page.get_images(full=True):
        xref=img[0]
        try:
            for r in page.get_image_rects(xref):
                inter=r & rect
                if inter.get_area()>250:
                    score+=3;details.append("image");break
        except Exception:pass
    try:
        drawings=page.get_drawings()
        n=sum(1 for d in drawings if (fitz.Rect(d["rect"]) & rect).get_area()>20)
        if n>=3:score+=2;details.append(f"vectors:{n}")
    except Exception:pass
    txt=page.get_text("text",clip=rect)
    if any(ch in txt for ch in ["√","ω","θ","²","³","∑","∆","→","⃗"]):
        score+=1;details.append("math-symbols")
    return score,details

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("pdf")
    ap.add_argument("--pages",default="")
    ap.add_argument("--out",required=True)
    ap.add_argument("--dpi",type=int,default=300)
    ap.add_argument("--all",action="store_true",help="gera também questões puramente textuais")
    args=ap.parse_args()
    out=Path(args.out);out.mkdir(parents=True,exist_ok=True)
    doc=fitz.open(args.pdf);manifest=[]
    for pno in parse_pages(args.pages,len(doc)):
        page=doc[pno];starts=starts_for_page(page)
        by_col={0:[],1:[]}
        for s in starts:by_col[s["col"]].append(s)
        for col,items in by_col.items():
            for i,s in enumerate(items):
                nxt=items[i+1] if i+1<len(items) else None
                rect=crop_for(page,s,nxt)
                score,features=visual_score(page,rect)
                if not args.all and score==0:continue
                name=f"p{pno+1:04d}-q{s['question']:03d}.png"
                pix=page.get_pixmap(dpi=args.dpi,clip=rect,alpha=False)
                pix.save(out/name)
                manifest.append({"question":s["question"],"page":pno+1,"file":name,"dpi":args.dpi,"bbox":[round(v,2) for v in rect],"visualScore":score,"features":features})
    (out/"manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding="utf-8")
    print(f"{len(manifest)} recorte(s) gerados em {out}")

if __name__=="__main__":main()
