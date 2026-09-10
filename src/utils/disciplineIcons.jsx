import React from"react";
import{BookOpenText,Scale,Languages,BarChart3,Brain,Calculator,Atom,FlaskConical,Dna,Globe2,Landmark,Dumbbell,Palette,Accessibility,BookA,MessageSquareText,Sigma,Earth,Microscope,GraduationCap}from"lucide-react";
const norm=(v="")=>String(v).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
export function disciplineIcon(name=""){
 const s=norm(name);
 if(s.includes("portugues"))return Languages;
 if(s.includes("administracao publica"))return Scale;
 if(s.includes("indicador")||s.includes("dados"))return BarChart3;
 if(s.includes("educacao brasileira")||s.includes("pedagog")||s.includes("legislacao educacional"))return GraduationCap;
 if(s.includes("filosofia"))return Brain;
 if(s.includes("matematica")||s.includes("raciocinio logico"))return Calculator;
 if(s.includes("fisica"))return Atom;
 if(s.includes("quimica"))return FlaskConical;
 if(s.includes("biologia"))return Dna;
 if(s.includes("geografia"))return Globe2;
 if(s.includes("historia"))return Landmark;
 if(s.includes("educacao fisica"))return Dumbbell;
 if(s.includes("arte"))return Palette;
 if(s.includes("aee")||s.includes("atendimento educacional especializado"))return Accessibility;
 if(s.includes("ingles")||s.includes("espanhola")||s.includes("espanhol"))return BookA;
 if(s.includes("sociologia"))return MessageSquareText;
 if(s.includes("estatistica"))return Sigma;
 if(s.includes("ciencias"))return Microscope;
 if(s.includes("meio ambiente"))return Earth;
 return BookOpenText;
}
export function DisciplineIcon({name,size=18,...props}){const Icon=disciplineIcon(name);return <Icon size={size} {...props}/>}
