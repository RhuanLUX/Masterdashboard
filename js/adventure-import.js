/* Local document ingestion: retain the original, typed safe blocks, provenance and revisions. */
(() => {
  'use strict';
  const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const host=()=>window.RPGMasterHost;
  const scripts=new Map();
  function script(src){if(!scripts.has(src))scripts.set(src,new Promise((resolve,reject)=>{const el=document.createElement('script');el.src=src;el.onload=resolve;el.onerror=()=>{scripts.delete(src);reject(Error('Biblioteca local não encontrada: '+src))};document.head.append(el)}));return scripts.get(src)}
  const dataURL=blob=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(blob)});
  const digest=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
  function identify(blocks){const seen=new Map();for(const b of blocks){let hash=2166136261;for(const c of JSON.stringify([b.type,b.text,b.rows,b.page]))hash=Math.imul(hash^c.charCodeAt(0),16777619);const key=(hash>>>0).toString(36),n=seen.get(key)||0;seen.set(key,n+1);b.id='block-'+key+'-'+n}}
  function outline(blocks){return blocks.flatMap((b,i)=>/^Heading [1-6]$/.test(b.style)?[{label:b.text,level:Number(b.style.slice(-1)),blockIndex:i,blockId:b.id}]:[])}
  function inferredHeading(text){if(/^(ATO|CAP[ÍI]TULO|PARTE)\s+([IVXLCDM\d]+)\b/i.test(text)&&text.length<140)return 1;if(/^(Cena|Encontro|Local)\s+[\dIVX]+\b/i.test(text)&&text.length<140)return 2;return 0}
  function runsOf(node){const runs=[];function visit(n,bold=false,italic=false){if(n.nodeType===3){runs.push({text:n.textContent,bold,italic});return}if(n.nodeType!==1)return;if(n.tagName==='BR'){runs.push({text:'\n',bold,italic});return}if(['SCRIPT','STYLE','IMG'].includes(n.tagName))return;for(const child of n.childNodes)visit(child,bold||['B','STRONG'].includes(n.tagName),italic||['I','EM'].includes(n.tagName))}visit(node);return runs}
  async function docx(file,progress){
    await script('vendor/import/mammoth.browser.min.js');progress('Lendo parágrafos, tabelas e imagens do DOCX…');
    const result=await mammoth.convertToHtml({arrayBuffer:await file.arrayBuffer()},{includeDefaultStyleMap:true,styleMap:["p[style-name='Title'] => h1:fresh","p[style-name='Título'] => h1:fresh","p[style-name='Título 1'] => h1:fresh","p[style-name='Título 2'] => h2:fresh","p[style-name='Título 3'] => h3:fresh"],convertImage:mammoth.images.imgElement(async image=>{if(!/^image\/(png|jpeg|gif|webp)$/.test(image.contentType))return {src:'',alt:'Imagem em formato não suportado; consulte o original.'};return {src:'data:'+image.contentType+';base64,'+await image.read('base64')}})});
    const doc=new DOMParser().parseFromString(result.value,'text/html'),blocks=[];
    function images(node){for(const img of node.querySelectorAll('img'))if(/^data:image\/(png|jpeg|gif|webp);base64,/.test(img.src))blocks.push({type:'image',src:img.src,alt:img.alt||'Ilustração do documento',style:'Image'})}
    function walk(node){for(const el of node.children){if(['SCRIPT','STYLE'].includes(el.tagName))continue;if(el.tagName==='TABLE'){blocks.push({type:'table',style:'Table',rows:[...el.querySelectorAll('tr')].map(tr=>[...tr.children].map(td=>td.textContent))});images(el)}else if(/^(P|H[1-6]|LI|BLOCKQUOTE)$/.test(el.tagName)){
      const runs=runsOf(el),text=runs.map(r=>r.text).join('');if(text.trim())blocks.push({type:'paragraph',text,runs,style:/^H/.test(el.tagName)?'Heading '+el.tagName[1]:inferredHeading(text)?'Heading '+inferredHeading(text):'Normal',list:el.tagName==='LI'});images(el);
    }else walk(el)}}walk(doc.body);
    return {source:file.name,blocks,headings:[],warnings:result.messages.map(m=>m.message),format:'docx'};
  }
  let pdfLibrary;
  async function pdf(file,progress,signal){
    pdfLibrary||=await import('../vendor/import/pdf/pdf.mjs');pdfLibrary.GlobalWorkerOptions.workerSrc=new URL('vendor/import/pdf/pdf.worker.mjs',document.baseURI).href;
    const base=new URL('../vendor/import/pdf/',new URL('js/adventure-import.js',document.baseURI)).href;
    const task=pdfLibrary.getDocument({data:new Uint8Array(await file.arrayBuffer()),cMapUrl:base+'cmaps/',cMapPacked:true,standardFontDataUrl:base+'standard_fonts/',wasmUrl:base+'wasm/',isEvalSupported:false});
    task.onPassword=()=>{task.destroy()};const documentPDF=await task.promise,blocks=[],warnings=[];let worker,ocrPages=0;
    try{
      if(documentPDF.numPages>160)throw Error('Divida documentos com mais de 160 páginas em volumes antes de importar.');
      for(let number=1;number<=documentPDF.numPages;number++){
        if(signal.aborted)throw Error('Importação cancelada.');progress(`PDF · página ${number} de ${documentPDF.numPages}`);
        const page=await documentPDF.getPage(number),content=await page.getTextContent(),textItems=content.items.filter(x=>typeof x.str==='string'&&x.str.trim());
        const viewport=page.getViewport({scale:1}),scale=Math.min(2,1800/Math.max(viewport.width,viewport.height)),view=page.getViewport({scale}),canvas=document.createElement('canvas');canvas.width=Math.ceil(view.width);canvas.height=Math.ceil(view.height);await page.render({canvasContext:canvas.getContext('2d'),viewport:view}).promise;
        let lines=[];
        if(textItems.map(x=>x.str).join('').trim().length>=20){
          let line=null;for(const item of textItems){const y=item.transform[5];if(!line||Math.abs(line.y-y)>Math.max(3,(item.height||10)*.35)){line={y,text:'',size:item.height||10};lines.push(line)}line.text+=(line.text&&!line.text.endsWith(' ')?' ':'')+item.str;if(item.hasEOL)line=null}
          lines=lines.map(l=>l.text);
        }else{
          progress(`Reconhecendo texto da página ${number} (OCR local)…`);
          if(!worker){await script('vendor/import/ocr/tesseract.min.js');worker=await Tesseract.createWorker('por+eng',1,{workerPath:new URL('vendor/import/ocr/worker.min.js',document.baseURI).href,corePath:new URL('vendor/import/ocr/core/',document.baseURI).href,langPath:new URL('vendor/import/ocr/lang/',document.baseURI).href,workerBlobURL:false,logger:m=>{if(m.status==='recognizing text')progress(`OCR · página ${number}: ${Math.round(m.progress*100)}%`)}});signal.addEventListener('abort',()=>worker?.terminate(),{once:true})}
          const result=await worker.recognize(canvas);lines=result.data.text.split(/\r?\n/);ocrPages++;warnings.push(`Página ${number}: texto obtido por OCR, confiança ${Math.round(result.data.confidence)}%. Confira a imagem original.`);
        }
        blocks.push({type:'page',page:number,src:canvas.toDataURL('image/jpeg',.82),text:'Página '+number,style:'Page'});
        for(const text of lines.filter(x=>x.trim())){const heading=inferredHeading(text);blocks.push({type:'paragraph',text,style:heading?'Heading '+heading:'Normal',page:number,runs:[{text,bold:false,italic:false}]})}
        canvas.width=canvas.height=1;page.cleanup();
      }
      warnings.unshift('PDF: a ordem de leitura, tabelas e colunas devem ser conferidas na prévia. Cada página original está preservada junto do texto.');
      return {source:file.name,blocks,headings:[],warnings,format:'pdf',pages:documentPDF.numPages,ocrPages};
    }finally{await worker?.terminate();await task.destroy()}
  }
  async function parse(file,progress=()=>{},signal=new AbortController().signal){
    if(!file.size||file.size>50*1024*1024)throw Error('Selecione um arquivo de até 50 MB.');const ext=file.name.split('.').pop().toLowerCase();let content;
    if(ext==='docx')content=await docx(file,progress);
    else if(ext==='pdf')content=await pdf(file,progress,signal);
    else if(['txt','md'].includes(ext)){content={format:ext,source:file.name,warnings:[],blocks:(await file.text()).split(/\r?\n/).filter(t=>t.trim()).map(text=>({type:'paragraph',text,style:/^#{1,6}\s/.test(text)?'Heading '+text.match(/^#+/)[0].length:inferredHeading(text)?'Heading '+inferredHeading(text):'Normal',runs:[{text,bold:false,italic:false}]}))}}
    else throw Error('Use DOCX, PDF, TXT ou Markdown.');
    if(signal.aborted)throw Error('Importação cancelada.');if(!content.blocks.some(b=>b.text?.trim()||b.type==='image'))throw Error('Nenhum conteúdo legível encontrado.');
    identify(content.blocks);content.headings=outline(content.blocks);
    const bytes=await file.arrayBuffer(),original={name:file.name,type:file.type||'application/octet-stream',size:file.size,sha256:await digest(bytes),data:await dataURL(file)};
    const entities=[...(window.FANGORN_ROSTER?.characters||[]).map(c=>({id:c.id,name:c.displayName,aliases:c.id==='calion'?['Calion']:c.id==='nando'?['Nando']:[]})),...(window.RPG_MASTER_CAMPAIGN_CODEX?.visualEntries||[]),...(window.RPG_MASTER_CAMPAIGN_CODEX?.creatures||[])];const all=content.blocks.map(b=>b.text||'').join('\n').toLowerCase();
    content.links=entities.filter(e=>[e.name,...(e.aliases||[])].some(n=>n?.length>3&&all.includes(n.toLowerCase()))).map(e=>({id:e.id,name:e.name}));
    return {content,original,title:content.headings[0]?.label||file.name.replace(/\.[^.]+$/,''),hash:original.sha256};
  }
  function blockMarkup(b){if(b.type==='image')return `<figure><img loading="lazy" src="${E(b.src)}" alt="${E(b.alt)}"></figure>`;if(b.type==='page')return `<details class="original-page"><summary>Ver página ${b.page} do PDF original</summary><img loading="lazy" src="${E(b.src)}" alt="Página ${b.page}"></details>`;if(b.type==='table')return `<div class="table-scroll"><table class="story-table">${b.rows.map(r=>`<tr>${r.map(c=>`<td>${E(c)}</td>`).join('')}</tr>`).join('')}</table></div>`;const tag=/^Heading [1-6]$/.test(b.style)?'h'+b.style.slice(-1):'p';return `<${tag}>${(b.runs||[{text:b.text}]).map(r=>`${r.bold?'<strong>':''}${r.italic?'<em>':''}${E(r.text)}${r.italic?'</em>':''}${r.bold?'</strong>':''}`).join('')}</${tag}>`}
  async function start(file){
    if(!file)return;const controller=new AbortController(),busy=RPGUI.dialog('Preparando aventura',`<p data-import-progress>Lendo o arquivo local…</p><progress></progress><p class="source-note">Você poderá conferir o conteúdo antes de adicioná-lo à campanha.</p>`);busy.addEventListener('close',()=>controller.abort(),{once:true});
    try{const result=await parse(file,text=>{busy.querySelector('[data-import-progress]').textContent=text},controller.signal);if(controller.signal.aborted)return;busy.close();preview(result)}catch(e){busy.close();if(e.message!=='Importação cancelada.')RPGUI.alert('A aventura não foi alterada. '+e.message)}
  }
  function preview(result){
    const s=host().getState(),{content,original}=result,targets=s.v2.adventures.filter(a=>a.original&&!a.protected),same=targets.find(a=>a.originHash===result.hash),d=RPGUI.dialog('Conferir e publicar aventura',`<div class="import-workspace"><aside><label class="sheet-field"><span>Título da aventura</span><input data-import-title value="${E(result.title)}" maxlength="250"></label><label class="sheet-field"><span>Destino</span><select data-import-target><option value="">Nova aventura</option>${targets.map(a=>`<option value="${E(a.id)}" ${same?.id===a.id?'selected':''}>Nova versão de ${E(a.title)}</option>`).join('')}</select></label><p>${content.blocks.length} blocos · ${content.headings.length} seções · ${content.blocks.filter(b=>b.type==='image').length} imagens</p><details ${content.warnings.length?'open':''}><summary>Conferência (${content.warnings.length})</summary>${content.warnings.map(w=>`<p class="source-note">${E(w)}</p>`).join('')||'<p>Conversão concluída. Confira a organização e as tabelas.</p>'}</details><h3>Índice da aventura</h3><p class="source-note">Ajuste a hierarquia pelo seletor ao lado de cada parágrafo.</p><div data-import-outline>${content.headings.map(h=>`<p>${E(h.label)}</p>`).join('')||'Nenhum título marcado.'}</div><h3>Referências encontradas</h3><p>${content.links.map(x=>E(x.name)).join(', ')||'Nenhuma entidade do catálogo reconhecida.'}</p><button class="metal-btn" data-publish>Publicar e abrir</button></aside><div class="import-preview"><div class="parchment-page">${content.blocks.map((b,i)=>`<section data-preview-block="${i}">${b.type==='paragraph'?`<label class="import-heading-control">Organização <select data-heading="${i}">${['Normal','Heading 1','Heading 2','Heading 3'].map((style,j)=>`<option value="${style}" ${b.style===style?'selected':''}>${['Texto','Ato / capítulo','Cena / seção','Subseção'][j]}</option>`).join('')}</select></label>`:''}<div class="story-block">${blockMarkup(b)}</div></section>`).join('')}</div></div></div>`,{wide:true});
    d.querySelector('[data-import-target]').closest('label').after(d.querySelector('[data-publish]'));
    d.querySelectorAll('[data-heading]').forEach(n=>n.onchange=()=>{const b=content.blocks[+n.dataset.heading];b.style=n.value;content.headings=outline(content.blocks);n.closest('section').querySelector('.story-block').innerHTML=blockMarkup(b);d.querySelector('[data-import-outline]').innerHTML=content.headings.map(h=>`<p>${E(h.label)}</p>`).join('')});
    d.querySelector('[data-publish]').onclick=async()=>{
      const button=d.querySelector('[data-publish]'),title=d.querySelector('[data-import-title]').value.trim(),target=d.querySelector('[data-import-target]').value;if(!title){d.querySelector('input').focus();return}button.disabled=true;
      try{
        const draft=structuredClone(s);let a=draft.v2.adventures.find(a=>a.id===target);
        if(a){a.revisions??=[];a.revisions.unshift({version:a.version||1,title:a.title,content:a.content,original:a.original,originHash:a.originHash,at:Date.now()});
          const reading=draft.v2.adventureState[a.id],oldIndex=Number(String(reading?.lastSection||'').replace(/\D/g,''))||0,oldBlock=a.content.blocks[oldIndex];
          const next=content.blocks.findIndex(b=>b.id===oldBlock?.id);if(reading){reading.lastSection=next>=0?'v2b'+next:0;reading.favorites=(reading.favorites||[]).map(f=>{const idx=Number(String(f).replace(/\D/g,'')),b=a.content.blocks[idx],at=content.blocks.findIndex(n=>n.id===b?.id);return at>=0?'v2b'+at:null}).filter(Boolean)}
          Object.assign(a,{title,content,original,source:original.name,originHash:result.hash,version:(a.version||1)+1,updatedAt:Date.now()});
        }else{a={id:'import-'+crypto.randomUUID(),number:'+',title,category:'Importada',source:original.name,status:'Planejada',description:'Documento integral importado; original e versões preservados.',content,original,originHash:result.hash,version:1,revisions:[],theme:'normal'};draft.v2.adventures.push(a);draft.v2.adventureState[a.id]={notes:'',favorites:[],favorite:false,lastSection:0,lastOpened:null}}
        await host().commitState(draft);d.close();host().openAdventure(a.id);
      }catch(e){button.disabled=false;RPGUI.alert('Não foi possível concluir a gravação: '+e.message)}
    };
  }
  function download(original){const a=document.createElement('a');a.href=original.data;a.download=original.name;a.click()}
  function versions(a){const d=RPGUI.dialog('Fontes e versões · '+a.title,`<p>Versão atual: ${a.version||1}. As notas do mestre ficam separadas do documento.</p><button class="metal-btn" data-original>Baixar original atual</button>${(a.revisions||[]).map((r,i)=>`<article class="sheet-entry"><h3>Versão ${r.version} · ${E(r.title)}</h3><p>${new Date(r.at).toLocaleString('pt-BR')}</p><button class="metal-btn" data-version-original="${i}">Baixar fonte</button><button class="metal-btn" data-version-read="${i}">Consultar versão</button></article>`).join('')}`);d.querySelector('[data-original]').onclick=()=>download(a.original);d.querySelectorAll('[data-version-original]').forEach(n=>n.onclick=()=>download(a.revisions[+n.dataset.versionOriginal].original));d.querySelectorAll('[data-version-read]').forEach(n=>n.onclick=()=>{const r=a.revisions[+n.dataset.versionRead];RPGUI.dialog('Versão '+r.version,`<div class="parchment-page">${r.content.blocks.map(b=>`<div class="story-block">${blockMarkup(b)}</div>`).join('')}</div>`,{wide:true})})}
  function bind(){document.querySelectorAll('[data-adventure-versions]').forEach(n=>n.onclick=()=>versions(host().getState().v2.adventures.find(a=>a.id===n.dataset.adventureVersions)))}
  window.RPGImport={parse,start,blockMarkup,bind,preview};
})();
