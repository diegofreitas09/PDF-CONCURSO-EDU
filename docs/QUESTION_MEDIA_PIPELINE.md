# Pipeline de questões com mídia

Objetivo: preservar a experiência visual da prova original sem depender apenas de OCR textual.

## Estrutura de uma questão

Cada item pode ter:

- `context`: texto introdutório antes da imagem;
- `media`: uma ou mais mídias entre o contexto e o comando;
- `statement`: comando final da questão;
- `options`: alternativas;
- `answer`: gabarito;
- `explanation`: comentário editorial;
- `sourcePage`: página da fonte;
- `sourceCrop`: coordenadas do recorte na página original.

Exemplo:

```js
{
  id:"UECE-FIS-DIN-023",
  discipline:"Física",
  topic:"Dinâmica",
  context:"Considere dois pares de polias...",
  media:[{type:"image",src:"question-media/uece/fisica/dinamica/q023.png",alt:"Questão original com relações entre velocidades angulares"}],
  statement:"Assim, é correto afirmar que",
  options:["...","...","...","..."],
  answer:2,
  sourcePage:96,
  sourceCrop:{x0:310,y0:430,x1:570,y1:750,dpi:300}
}
```

## Extração visual recomendada

1. Localizar início e fim da questão pela camada de texto do PDF.
2. Renderizar somente o retângulo da questão a 300 DPI com PyMuPDF.
3. Remover cabeçalho, rodapé e conteúdo da questão anterior/seguinte.
4. Salvar em PNG/WebP com largura suficiente para leitura em celular e desktop.
5. Rodar OCR especializado em STEM quando houver fórmulas, tabelas ou diagramas.
6. Usar o OCR para indexação e acessibilidade, mas manter o recorte original como fonte visual.
7. Registrar página, coordenadas, fonte e gabarito junto ao item.

## Ferramentas

- PyMuPDF: renderização e recorte de página em alta resolução.
- pdfplumber: inspeção de blocos, tabelas e bounding boxes.
- Mathpix OCR API: fórmulas, matemática, tabelas e documentos STEM; retorna LaTeX/MathML/Markdown e dados de linha.
- Azure Document Intelligence: alternativa para layout, tabelas, fórmulas e OCR de alta resolução.
- KaTeX: renderização das fórmulas normalizadas na plataforma.

## Regra editorial

Para questões visuais, o recorte original é a referência principal. O texto digitado serve para busca, acessibilidade, comentários e geração de simulados. Se a extração textual perder fórmula, gráfico ou símbolo, o item não deve ser publicado apenas em texto: publicar com a imagem original ou manter em revisão.

## Direitos de uso

Antes de publicar recortes de materiais de terceiros, confirmar autorização/licença de uso. Para provas oficiais, guardar a referência da fonte e preferir o PDF oficial da banca quando disponível.
