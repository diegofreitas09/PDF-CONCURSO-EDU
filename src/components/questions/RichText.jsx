import React from"react";
import katex from"katex";
import"katex/dist/katex.min.css";

function Formula({value,display=false}){let html="";try{html=katex.renderToString(value,{throwOnError:false,displayMode:display,strict:"ignore",trust:false})}catch{html=value}return <span className={display?"question-formula-display":"question-formula-inline"} dangerouslySetInnerHTML={{__html:html}}/>}

export default function RichText({text="",className=""}){
 const value=String(text||"");
 if(!value)return null;
 const parts=[];let cursor=0;const re=/\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;let m;
 while((m=re.exec(value))){if(m.index>cursor)parts.push(<React.Fragment key={`t-${cursor}`}>{value.slice(cursor,m.index)}</React.Fragment>);const display=Boolean(m[1]);parts.push(<Formula key={`f-${m.index}`} value={m[1]||m[2]||""} display={display}/>);cursor=re.lastIndex}
 if(cursor<value.length)parts.push(<React.Fragment key={`t-${cursor}`}>{value.slice(cursor)}</React.Fragment>);
 return <span className={className}>{parts}</span>;
}
