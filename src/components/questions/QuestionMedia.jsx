import React from "react";

function resolveSrc(src=""){
  if(!src)return"";
  if(/^https?:\/\//i.test(src)||src.startsWith("data:"))return src;
  const clean=String(src).replace(/^\/+/,"");
  return `${import.meta.env.BASE_URL}${clean}`;
}

function ImageMedia({media}){
  const src=resolveSrc(media.src||media.url||"");
  if(!src)return null;
  return <figure className="question-media-card question-media-image">
    <img src={src} alt={media.alt||"Imagem de apoio da questão"} loading="lazy"/>
    {(media.caption||media.credit)&&<figcaption>{media.caption}{media.credit?` · ${media.credit}`:""}</figcaption>}
  </figure>;
}

function BarChart({media}){
  const data=Array.isArray(media.data)?media.data:[];
  const max=Math.max(1,...data.map(item=>Number(item.value)||0));
  return <figure className="question-media-card question-media-chart">
    {media.title&&<div className="question-media-title">{media.title}</div>}
    <div className="question-chart-bars" role="img" aria-label={media.alt||media.title||"Gráfico de barras"}>
      {data.map((item,i)=><div className="question-chart-item" key={`${item.label}-${i}`}>
        <div className="question-chart-value">{item.displayValue??item.value}</div>
        <div className="question-chart-track"><div className="question-chart-fill" style={{height:`${Math.max(5,(Number(item.value)||0)/max*100)}%`}}/></div>
        <div className="question-chart-label">{item.label}</div>
      </div>)}
    </div>
    {media.caption&&<figcaption>{media.caption}</figcaption>}
  </figure>;
}

function TableMedia({media}){
  const headers=Array.isArray(media.headers)?media.headers:[];
  const rows=Array.isArray(media.rows)?media.rows:[];
  return <figure className="question-media-card question-media-table">
    {media.title&&<div className="question-media-title">{media.title}</div>}
    <div className="question-table-wrap"><table><thead><tr>{headers.map((h,i)=><th key={`${h}-${i}`}>{h}</th>)}</tr></thead><tbody>{rows.map((row,ri)=><tr key={ri}>{row.map((cell,ci)=><td key={`${ri}-${ci}`}>{cell}</td>)}</tr>)}</tbody></table></div>
    {media.caption&&<figcaption>{media.caption}</figcaption>}
  </figure>;
}

function StatementsMedia({media}){
  const items=Array.isArray(media.items)?media.items:[];
  return <figure className="question-media-card question-media-statements">
    {media.title&&<div className="question-media-title">{media.title}</div>}
    <div className="question-statement-grid">{items.map((item,i)=><div className="question-statement-row" key={`${item.key||i}`}><strong>{item.key||String(i+1).padStart(2,"0")}</strong><span>{item.text}</span></div>)}</div>
    {media.caption&&<figcaption>{media.caption}</figcaption>}
  </figure>;
}

function FlowMedia({media}){
  const nodes=Array.isArray(media.nodes)?media.nodes:[];
  return <figure className="question-media-card question-media-flow">
    {media.title&&<div className="question-media-title">{media.title}</div>}
    <div className="question-flow-row">{nodes.map((node,i)=><React.Fragment key={`${node}-${i}`}><div className="question-flow-node">{node}</div>{i<nodes.length-1&&<div className="question-flow-arrow" aria-hidden="true">→</div>}</React.Fragment>)}</div>
    {media.caption&&<figcaption>{media.caption}</figcaption>}
  </figure>;
}

export default function QuestionMedia({media}){
  if(!media)return null;
  const items=Array.isArray(media)?media:[media];
  if(!items.length)return null;
  return <div className="question-media-stack">{items.map((item,i)=>{
    if(!item)return null;
    const type=item.type||"image";
    if(type==="image")return <ImageMedia media={item} key={i}/>;
    if(type==="bar-chart")return <BarChart media={item} key={i}/>;
    if(type==="table")return <TableMedia media={item} key={i}/>;
    if(type==="statements"||type==="key")return <StatementsMedia media={item} key={i}/>;
    if(type==="flow")return <FlowMedia media={item} key={i}/>;
    return null;
  })}</div>;
}
