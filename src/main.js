(function () {
  const G=window.SopaGame;
  const V=window.SopaVisuals;
  const M=window.SopaReactionMotif;
  const P=window.SopaPersistence;
  const A=window.SopaAtlas;
  const editorMode=window.location.hash.toLowerCase().startsWith('#editor');
  const persisted=editorMode?null:P?.load?.();
  let state=G.restoreGame?.(persisted?.campaign,editorMode)||G.createGame(editorMode);
  let atlasState=A?.createState?.(persisted?.discoveries,editorMode);
  let homeOpen=true;
  let drag=null;
  let pendingChoice=null;
  let menuOpen=false;
  let lastToastEventId=null;
  let rainGeneration=0;
  let rainTimer=null;
  let eventTickTimer=null;
  let reactionBusy=false;
  let contextRecipeId=null;
  let contextRecipePhase=-1;
  let menuView='campaign';
  let atlasTab='structures';
  let atlasSelectedKey=null;
  let discoveryQueue=[];
  let activeDiscovery=null;
  let saveTimer=null;
  window.SopaToastQueue=window.SopaToastQueue||[];

  function esc(value){
    return String(value).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  function saveNow(){
    if(editorMode||!P||!A||!atlasState) return null;
    return P.save({campaign:G.serializeGame(state),discoveries:A.serialize(atlasState)});
  }

  function scheduleSave(){
    if(editorMode) return;
    if(saveTimer) clearTimeout(saveTimer);
    saveTimer=setTimeout(()=>{saveTimer=null;saveNow();},80);
  }

  function presentNextDiscovery(){
    if(activeDiscovery||!discoveryQueue.length) return;
    activeDiscovery=discoveryQueue.shift();
  }

  function discover(keys,primaryKey){
    if(editorMode||!A||!atlasState) return [];
    const fresh=A.discover(atlasState,keys);
    if(!fresh.length) return fresh;
    discoveryQueue.push({
      keys:fresh,
      primaryKey:fresh.includes(primaryKey)?primaryKey:fresh[0]
    });
    presentNextDiscovery();
    scheduleSave();
    return fresh;
  }

  function discoverStructure(resource){
    return discover([A.structureKey(resource)],A.structureKey(resource));
  }

  function discoverProcess(icon){
    const fresh=discover([A.processKey(icon)],A.processKey(icon));
    if(fresh.length&&state.lastEvent) lastToastEventId=state.lastEvent.id;
    return fresh;
  }

  function dismissDiscovery(){
    activeDiscovery=null;
    presentNextDiscovery();
  }

  function emitEventToast(){
    const event=state.lastEvent;
    if(!event||event.id===lastToastEventId) return;
    lastToastEventId=event.id;
    if(window.SopaToast&&window.SopaToast.showEvent) window.SopaToast.showEvent(event);
    else window.SopaToastQueue.push(event);
  }

  function ringFor(resource){
    const colors=[...new Set(G.possibleRecipes(state,resource).map(r=>r.color))];
    if(!colors.length) return 'rgba(184,214,216,.38)';
    if(colors.length===1) return colors[0];
    const slice=100/colors.length;
    return 'conic-gradient('+colors.map((c,i)=>c+' '+(i*slice)+'% '+((i+1)*slice)+'%').join(',')+')';
  }

  function bubbleStyle(b){
    const visual=V.spec(b.resource);
    const diameter=Math.max(64,Math.max(visual.width,visual.height)+22);
    return '--x:'+b.x+'%;--y:'+b.y+'%;--visual-w:'+Math.max(56,visual.width)+'px;--visual-h:'+Math.max(56,visual.height)+'px;--bubble-d:'+diameter+'px;--drift:'+b.drift+'ms;--delay:'+b.delay+'ms;--ring:'+ringFor(b.resource)+';--visual-accent:'+visual.accent+';';
  }

  const BASE_PAIR={
    Adenina:{partner:'Uracila',bonds:2,label:'A–U'},
    Uracila:{partner:'Adenina',bonds:2,label:'A–U'},
    Guanina:{partner:'Citosina',bonds:3,label:'G–C'},
    Citosina:{partner:'Guanina',bonds:3,label:'G–C'}
  };

  function pairingInfo(b){
    if(!state.selectedBubbleId||state.selectedBubbleId===b.id) return null;
    const selected=state.soup.find(item=>item.id===state.selectedBubbleId);
    if(!selected||!BASE_PAIR[selected.resource]) return null;
    const rule=BASE_PAIR[selected.resource];
    if(b.resource!==rule.partner) return null;
    const dx=selected.x-b.x;
    const dy=selected.y-b.y;
    if(Math.sqrt(dx*dx+dy*dy)>30) return null;
    return rule;
  }

  function isCandidate(b){
    if(!state.selectedBubbleId||state.selectedBubbleId===b.id) return false;
    return G.availableCombos(state,state.selectedBubbleId,b.id).length>0;
  }

  function renderBubble(b){
    const selected=state.selectedBubbleId===b.id;
    const candidate=isCandidate(b);
    const photolysisEligible=G.photolysisActive(state)&&G.canDecompose(b.resource);
    const pairing=pairingInfo(b);
    const visual=V.spec(b.resource);
    const quantity=G.bubbleCount(b);
    return '<button class="organic-bubble molecule-object kind-'+visual.kind+
      (b.isNew?' born':'')+
      (selected?' selected':'')+
      (candidate?' candidate':'')+
      (pairing?' canonical-pair':'')+
      (photolysisEligible?' photolysis-eligible':'')+
      '" data-bubble-id="'+b.id+'" data-resource="'+esc(b.resource)+'" data-count="'+quantity+'" style="'+bubbleStyle(b)+'" aria-label="'+esc(b.resource)+' · '+quantity+' unidade(s) · '+esc(visual.family)+'">'+
      '<span class="molecule-object-art">'+V.render(b.resource,'field')+'</span>'+
      (quantity>1?'<span class="resource-count" aria-label="'+quantity+' unidades">×'+quantity+'</span>':'')+
      (pairing?'<span class="hydrogen-bond-hint" aria-hidden="true">'+(pairing.bonds===2?'··':'···')+'<small>'+pairing.label+'</small></span>':'')+
      '<strong class="resource-label">'+esc(b.resource)+'</strong>'+
      '</button>';
  }

  function conditionLabel(icon){
    return {
      '⚡':'Descarga elétrica',
      '☀':'UV',
      '♨':'Hidrotermal',
      '◐':'Úmido-seco',
      '❄':'Gelo eutético'
    }[icon]||icon;
  }

  function orderedConditions(conditions){
    const order=['☀','⚡','♨','◐','❄'];
    return [...(conditions||[])].sort((a,b)=>order.indexOf(a)-order.indexOf(b));
  }

  function conditionMarkup(conditions){
    if(!conditions||!conditions.length) return '';
    return '<div class="recipe-condition-inline">'+
      orderedConditions(conditions).map(icon=>'<span>'+icon+' '+esc(conditionLabel(icon))+'</span>').join('<em>ou</em>')+
    '</div>';
  }

  function visibleResourceCounts(){
    const out={};
    for(const bubble of state.soup){
      out[bubble.resource]=(out[bubble.resource]||0)+G.bubbleCount(bubble);
    }
    document.querySelectorAll('#falling-layer .molecular-faller[data-value]').forEach(node=>{
      if(node.dataset.captured==='1'||node.dataset.finished==='1') return;
      const resource=node.dataset.value;
      if(resource) out[resource]=(out[resource]||0)+1;
    });
    return out;
  }

  function currentContextualRecipe(){
    if(contextRecipePhase!==state.phaseIndex){
      contextRecipePhase=state.phaseIndex;
      contextRecipeId=null;
    }
    const recipe=G.contextualRecipe(state,visibleResourceCounts(),contextRecipeId);
    contextRecipeId=recipe?.id||null;
    return recipe;
  }

  function contextualRecipeView(){
    const target=G.phaseRecipe(state);
    const recipe=currentContextualRecipe()||target;
    return {
      recipe,
      target,
      contextual:!!recipe&&!!target&&recipe.id!==target.id,
      label:recipe?.label||G.objective(state).formula,
      conditions:recipe?.events||[]
    };
  }

  function objectiveMarkup(objective){
    const view=contextualRecipeView();
    return '<section class="objective-card'+(view.contextual?' contextual-guidance':'')+'" id="objectiveCard">'+
      '<strong>'+esc(objective.title)+'</strong>'+
      '<small class="objective-recipe-kicker" id="objectiveRecipeKicker">'+(view.contextual?'PRÓXIMA RECEITA POSSÍVEL':'RECEITA DA FASE')+'</small>'+
      '<span class="objective-formula" id="objectiveFormula" data-recipe-id="'+esc(view.recipe?.id||'')+'">'+esc(view.label)+'</span>'+
      '<div id="objectiveConditions">'+conditionMarkup(view.conditions)+'</div>'+
    '</section>';
  }

  function refreshContextualObjective(){
    if(homeOpen||reactionBusy) return;
    const formula=document.getElementById('objectiveFormula');
    const kicker=document.getElementById('objectiveRecipeKicker');
    const conditions=document.getElementById('objectiveConditions');
    const card=document.getElementById('objectiveCard');
    if(!formula||!kicker||!conditions||!card) return;

    const view=contextualRecipeView();
    const nextId=view.recipe?.id||'';
    const changed=formula.dataset.recipeId!==nextId;
    formula.dataset.recipeId=nextId;
    formula.textContent=view.label;
    kicker.textContent=view.contextual?'PRÓXIMA RECEITA POSSÍVEL':'RECEITA DA FASE';
    conditions.innerHTML=conditionMarkup(view.conditions);
    card.classList.toggle('contextual-guidance',view.contextual);

    if(changed){
      formula.classList.remove('contextual-recipe-shift');
      void formula.offsetWidth;
      formula.classList.add('contextual-recipe-shift');
    }
  }

  function progressMarkup(objective){
    const max=Math.max(1,objective.progress.max);
    const pct=Math.min(100,(objective.progress.value/max)*100);
    return '<div class="stage-progress"><span>PROGRESSO</span><div class="progress-track"><div style="width:'+pct+'%"></div></div><strong>'+esc(objective.progress.label)+'</strong></div>';
  }

  function partnerName(recipe,resource){
    return recipe.a===resource?recipe.b:recipe.a;
  }

  function renderEventStatus(){
    const active=state.activeEvent;
    if(!active) return '';
    if(active.consumable){
      return '<div class="active-event-badge '+active.className+'"><span><i>'+active.icon+'</i></span><div><strong>'+esc(active.name)+'</strong><small id="activeEventCountdown">pronto para 1 reação</small></div></div>';
    }
    const remaining=Math.max(0,active.expiresAt-Date.now());
    const seconds=Math.ceil(remaining/1000);
    return '<div class="active-event-badge '+active.className+'"><span><i>'+active.icon+'</i></span><div><strong>'+esc(active.name)+'</strong><small id="activeEventCountdown">'+seconds+' s restantes</small></div></div>';
  }

  function renderContext(){
    if(G.photolysisActive(state)){
      const eligible=state.soup.filter(b=>G.canDecompose(b.resource));
      return '<section class="info-panel panel photolysis-context">'+
        '<div class="info-tile photolysis-info"><span>EVENTO</span><strong>☀</strong><small>Fotólise</small></div>'+
        '<div class="info-copy"><strong>Escolha uma bolha com contorno vermelho</strong><p>O próximo clique decompõe a molécula nos dois precursores da receita que a formou.</p><small>'+eligible.length+' alvo(s) elegível(is)</small></div>'+
      '</section>';
    }
    const context=G.selectedContext(state);
    if(!context){
      if(!compartmentActive()){
        return '<section class="info-panel panel">'+
          '<div class="info-tile idle"><span>AMBIENTE</span><strong>+</strong><small>selecione matéria</small></div>'+
          '<div class="info-copy"><strong>Química dispersa</strong><p>Arraste qualquer partícula diretamente. Ao aproximá-la de um parceiro compatível, o alvo acende; solte sobre ele para reagir. O clique continua disponível como alternativa.</p></div>'+
        '</section>';
      }
      return '<section class="info-panel panel">'+
        '<div class="info-tile idle"><span>SOPA</span><strong>+</strong><small>capture matéria</small></div>'+
        '<div class="info-copy"><strong>Capture matéria do fluxo</strong><p>Todos os elementos flutuantes podem ser arrastados. Leve matéria diretamente a um ingrediente compatível para reagir, arraste para uma área livre para apenas capturar ou arraste uma bolha para fora para devolvê-la ao fluxo. O clique permanece como alternativa.</p></div>'+
      '</section>';
    }

    const b=context.bubble;
    const available=context.available.length
      ? context.available.map(r=>'<div class="reaction-line available"><span>'+esc(partnerName(r,b.resource))+'</span><strong>'+esc(r.label)+'</strong></div>').join('')
      : '<div class="context-empty">Nenhuma reação disponível agora.</div>';

    const blocked=context.blocked.length
      ? '<div class="blocked-title">Aguardando condição ambiental</div>'+
        context.blocked.slice(0,4).map(r=>'<div class="reaction-line blocked"><span>'+esc(partnerName(r,b.resource))+'</span><strong>'+esc(r.label)+'</strong></div>').join('')
      : '';

    const visual=V.spec(b.resource);
    const pairRule=BASE_PAIR[b.resource];
    const pairNote=pairRule
      ? '<p class="pairing-note"><strong>Pareamento canônico:</strong> '+esc(pairRule.label)+' · '+pairRule.bonds+' ligações de hidrogênio no modelo didático.</p>'
      : '';
    return '<section class="info-panel panel molecular-info-panel">'+
      '<div class="info-tile selected-info molecular-detail" style="--tile:'+visual.accent+';--detail-accent:'+visual.accent+'">'+
        '<span>'+V.scienceBadge(b.resource)+'</span>'+
        '<div class="detail-structure">'+V.render(b.resource,'detail')+'</div>'+
        '<strong>'+esc(b.resource)+(G.bubbleCount(b)>1?' ×'+G.bubbleCount(b):'')+'</strong>'+
        '<small>'+esc(visual.family)+' · '+esc(visual.formula)+'</small>'+
      '</div>'+
      '<div class="info-copy"><div class="info-context-title">Pode reagir agora com</div>'+available+blocked+pairNote+
        (context.available.length?'<p class="drag-reaction-hint">Qualquer ingrediente pode ser arrastado diretamente. Leve-o até um parceiro destacado para completar a receita.</p>':'')+
        '<div class="context-actions"><button id="clearSelection" class="context-action secondary">Limpar seleção</button></div>'+
      '</div>'+
    '</section>';
  }

  function phaseStateLabel(status){
    return {
      current:'Fase atual',
      completed:'Concluída',
      available:'Disponível',
      locked:'Bloqueada'
    }[status]||status;
  }

  function renderCampaignTrail(){
    let previousChapter='';
    return G.PHASES.map((p,index)=>{
      const rawStatus=G.phaseStatus(state,index);
      const status=state.editorMode&&rawStatus==='locked'?'available':rawStatus;
      const clickable=state.editorMode||status!=='locked';
      const period=G.PERIODS[p.period];
      const chapter=p.chapter!==previousChapter
        ? '<div class="trail-chapter"><span></span><strong>'+esc(p.chapter)+'</strong><em>'+String(index+1).padStart(2,'0')+'</em></div>'
        : '';
      previousChapter=p.chapter;
      return chapter+
        '<button type="button" class="trail-node '+status+(state.editorMode?' editor-clickable':'')+'" data-home-phase="'+index+'" aria-label="'+esc(state.editorMode?'Testar fase '+(index+1)+': '+p.title:'Abrir fase '+(index+1)+': '+p.title)+'" '+(clickable?'':'disabled')+'>'+
          '<span class="trail-dot" aria-hidden="true"></span>'+
          '<span class="trail-node-copy"><small>FASE '+(index+1)+' · '+esc(period.name)+'</small><span class="trail-product">'+V.render(p.target,'trail')+'<strong>'+esc(p.title)+'</strong></span><em>'+esc(p.formula)+'</em></span>'+
          '<span class="trail-state">'+esc(state.editorMode?'Testar':phaseStateLabel(status))+'</span>'+
        '</button>';
    }).join('');
  }

  function renderHome(){
    const app=document.getElementById('app');
    const current=G.phase(state);
    app.innerHTML=
      '<main class="campaign-home">'+
        '<header class="campaign-home-head"><div><p class="eyebrow">Sopa Primordial</p><h1>Trilha da vida</h1><p>A matéria se acumula enquanto você transforma átomos em sistemas cada vez mais complexos.</p></div>'+
        '<span class="campaign-mode-chip">'+(state.editorMode?'Modo editor':'Campanha')+'</span></header>'+
        '<section class="campaign-home-current"><small>CONTINUAR</small><strong>'+esc(current.title)+'</strong><span>'+esc(current.objective)+' · '+esc(G.phaseProgress(state).label)+'</span>'+
        '<button type="button" id="continueCampaign">Entrar na fase</button></section>'+
        '<section class="campaign-trail-home" aria-label="Trilha de fases">'+
          '<div class="trail-line" aria-hidden="true"></div>'+
          renderCampaignTrail()+
        '</section>'+
        (state.editorMode?'<p class="editor-note">#editor ativo · todas as fases podem ser abertas diretamente.</p>':'')+
      '</main>';
    bindHome();
  }

  function openPhase(index){
    if(!Number.isInteger(index)||index<0||index>=G.PHASES.length) return false;
    if(!state.editorMode&&G.phaseStatus(state,index)==='locked') return false;
    if(index!==state.phaseIndex&&!G.jumpToPhase(state,index)) return false;
    homeOpen=false;
    pendingChoice=null;
    menuOpen=false;
    lastToastEventId=null;
    M?.cancel?.();
    scheduleSave();
    render();
    restartRain();
    return true;
  }

  function bindHome(){
    const continueBtn=document.getElementById('continueCampaign');
    if(continueBtn) continueBtn.onclick=()=>{
      homeOpen=false;
      render();
      restartRain();
    };

    document.querySelectorAll('[data-home-phase]').forEach(el=>{
      el.onclick=()=>{ openPhase(Number(el.dataset.homePhase)); };
    });
  }

  function renderPhaseMenu(){
    return G.PHASES.map((p,index)=>{
      const rawStatus=G.phaseStatus(state,index);
      const status=state.editorMode&&rawStatus==='locked'?'available':rawStatus;
      const unlocked=state.editorMode||status!=='locked';
      return '<button class="phase-list-item '+status+(state.editorMode?' editor-clickable':'')+'" data-phase="'+index+'" aria-label="'+esc(state.editorMode?'Testar fase '+(index+1)+': '+p.title:'Abrir fase '+(index+1)+': '+p.title)+'" '+(unlocked?'':'disabled')+'>'+
        '<span>'+(index+1)+'</span><div><strong>'+esc(p.title)+'</strong><small>'+esc(p.chapter)+'</small></div>'+
        '<em>'+esc(state.editorMode?'TESTAR':phaseStateLabel(status).toUpperCase())+'</em>'+
      '</button>';
    }).join('');
  }

  function renderRecipeCatalog(){
    return G.COMBOS.map(recipe=>{
      const visual=V.spec(recipe.out);
      const catalysts=recipe.events&&recipe.events.length
        ? '<small>'+orderedConditions(recipe.events).map(icon=>icon+' '+esc(conditionLabel(icon))).join(' ou ')+'</small>'
        : '';
      return '<div class="recipe-catalog-row" style="--recipe-color:'+recipe.color+'">'+
        '<span class="recipe-visual">'+V.render(recipe.out,'catalog')+'</span>'+
        '<span class="recipe-copy"><strong>'+esc(recipe.label)+'</strong><small>'+esc(visual.family)+' · '+esc(visual.formula)+'</small>'+catalysts+'</span>'+
      '</div>';
    }).join('');
  }

  function atlasCategoryLabel(category){
    return {
      structures:'Moléculas e estruturas',
      reactions:'Reações',
      processes:'Ambientes e processos'
    }[category]||category;
  }

  function renderAtlasList(){
    if(!A||!atlasState) return '<div class="atlas-empty">Atlas indisponível.</div>';
    const counts=A.counts(atlasState,editorMode);
    const items=A.entries(atlasTab).filter(entry=>A.isKnown(atlasState,entry.key,editorMode));
    return '<div class="atlas-category-tabs" role="tablist" aria-label="Categorias do Atlas">'+
      ['structures','reactions','processes'].map(category=>
        '<button type="button" class="atlas-category-tab'+(atlasTab===category?' active':'')+'" data-atlas-tab="'+category+'">'+
          '<strong>'+esc(atlasCategoryLabel(category))+'</strong>'+
          '<small>'+counts[category].known+'/'+counts[category].total+'</small>'+
        '</button>'
      ).join('')+
    '</div>'+
    (items.length
      ? '<div class="atlas-grid">'+items.map(entry=>
          '<button type="button" class="atlas-card'+(atlasState.unread.has(entry.key)?' unread':'')+'" data-atlas-entry="'+esc(entry.key)+'">'+
            '<span class="atlas-card-image"><img src="'+esc(entry.image)+'" alt="" loading="lazy"></span>'+
            '<span class="atlas-card-copy"><small>'+esc(atlasCategoryLabel(entry.category))+(atlasState.unread.has(entry.key)?' · NOVA':'')+'</small><strong>'+esc(entry.title)+'</strong><span>'+esc(entry.paragraphs[0])+'</span></span>'+
          '</button>'
        ).join('')+'</div>'
      : '<div class="atlas-empty">Nenhuma descoberta nesta categoria ainda.</div>');
  }

  function renderAtlasDetail(){
    const entry=A?.entry?.(atlasSelectedKey);
    if(!entry||!A.isKnown(atlasState,entry.key,editorMode)){
      atlasSelectedKey=null;
      return renderAtlasList();
    }
    return '<article class="atlas-detail">'+
      '<button type="button" class="atlas-back" id="atlasBack">← Voltar ao Atlas</button>'+
      '<div class="atlas-hero"><img src="'+esc(entry.image)+'" alt="'+esc(entry.title)+'"></div>'+
      '<small class="atlas-detail-category">'+esc(atlasCategoryLabel(entry.category))+'</small>'+
      '<h3>'+esc(entry.title)+'</h3>'+
      entry.paragraphs.map(paragraph=>'<p>'+esc(paragraph)+'</p>').join('')+
      '<a class="atlas-wikipedia" href="'+esc(entry.wikipedia)+'" target="_blank" rel="noopener noreferrer">Ler mais na Wikipédia ↗</a>'+
    '</article>';
  }

  function renderAtlasMenu(){
    const counts=A?.counts?.(atlasState,editorMode);
    const unread=counts?.unread||0;
    return '<p class="menu-intro">O Atlas registra apenas aquilo que você encontrou durante a campanha. Cada descoberta reúne uma imagem científica, contexto curto e um caminho para aprofundamento.</p>'+
      (editorMode?'<p class="atlas-editor-note">#editor · catálogo completo visível sem alterar a campanha persistida.</p>':'')+
      '<section class="menu-section atlas-section">'+
        '<div class="atlas-summary"><strong>Atlas de Descobertas</strong><span>'+((counts?.structures.known||0)+(counts?.reactions.known||0)+(counts?.processes.known||0))+' registradas'+(unread?' · '+unread+' novas':'')+'</span></div>'+
        (atlasSelectedKey?renderAtlasDetail():renderAtlasList())+
      '</section>';
  }

  function renderCampaignMenu(){
    const p=G.phase(state);
    return '<p class="menu-intro">A campanha possui 44 descobertas. Cada fase libera uma receita própria; produtos anteriores continuam disponíveis como precursores. A química começa dispersa, anfifílicos formam uma vesícula cedo e as etapas seguintes passam a ocorrer em microambientes compartimentalizados até a replicação de RNA.</p>'+
      '<section class="menu-section"><div class="phase-list">'+renderPhaseMenu()+'</div></section>'+
      '<section class="menu-actions"><button id="openTrail" class="menu-action">Trilha de fases</button><button id="restartPhase" class="menu-action">Reiniciar '+esc(p.title)+'</button><button id="restartCampaign" class="menu-action danger">Reiniciar campanha</button></section>'+
      '<section class="menu-section"><strong>Receitas disponíveis</strong><div class="recipe-catalog">'+renderRecipeCatalog()+'</div></section>'+
      '<section class="menu-section"><strong>Registro da sopa</strong><div class="history-list">'+state.log.slice(0,20).map(line=>'<p>'+esc(line)+'</p>').join('')+'</div></section>';
  }

  function renderMenu(){
    if(!menuOpen) return '';
    const unread=A?.counts?.(atlasState,editorMode)?.unread||0;
    return '<div class="modal-backdrop"><div class="menu-card">'+
      '<div class="menu-head"><div><p class="eyebrow">Sopa Primordial</p><h2>'+(menuView==='atlas'?'Atlas de Descobertas':'Campanha')+'</h2></div><button id="closeMenu" class="menu-close">Voltar</button></div>'+
      '<div class="menu-primary-tabs">'+
        '<button type="button" id="menuCampaignTab" class="'+(menuView==='campaign'?'active':'')+'">Campanha</button>'+
        '<button type="button" id="menuAtlasTab" class="'+(menuView==='atlas'?'active':'')+'">Atlas'+(unread?'<span>'+unread+'</span>':'')+'</button>'+
      '</div>'+
      (menuView==='atlas'?renderAtlasMenu():renderCampaignMenu())+
    '</div></div>';
  }

  function renderDiscoveryModal(){
    if(!activeDiscovery||!A) return '';
    const entry=A.entry(activeDiscovery.primaryKey);
    if(!entry) return '';
    const related=activeDiscovery.keys
      .filter(key=>key!==activeDiscovery.primaryKey)
      .map(key=>A.entry(key)?.title)
      .filter(Boolean);
    return '<div class="discovery-modal" role="presentation"><section class="discovery-card" role="dialog" aria-modal="true" aria-labelledby="discoveryTitle">'+
      '<div class="discovery-image"><img src="'+esc(entry.image)+'" alt="'+esc(entry.title)+'"></div>'+
      '<small>NOVA DESCOBERTA</small>'+
      '<h2 id="discoveryTitle">'+esc(entry.title)+'</h2>'+
      '<p>'+esc(entry.paragraphs[0])+'</p>'+
      (related.length?'<div class="discovery-related">Também registrado: '+related.map(esc).join(' · ')+'</div>':'')+
      '<div class="discovery-actions"><button type="button" id="discoveryContinue" class="secondary">Continuar</button><button type="button" id="discoveryOpenAtlas">Ver no Atlas</button></div>'+
    '</section></div>';
  }

  function renderChoice(){
    if(!pendingChoice) return '';
    return '<div class="choice-backdrop"><div class="choice-card"><p class="eyebrow">Duas possibilidades</p><h2>Escolha o resultado</h2><div class="choice-options">'+
      pendingChoice.recipes.map(r=>'<button class="choice-option" data-recipe-choice="'+r.id+'" style="--choice:'+r.color+'"><strong>'+esc(r.label)+'</strong></button>').join('')+
      '</div><button class="ghost" id="cancelChoice">Cancelar</button></div></div>';
  }

  function renderPhaseCompletion(){
    if(!state.stageComplete) return '';
    if(state.winner){
      return '<div class="phase-complete-panel final"><small>CAMPANHA CONCLUÍDA</small><strong>SISTEMA<br>AUTORREPLICANTE</strong><span>RNA replicante e compartimento foram integrados.</span></div>';
    }
    if(G.phase(state).id==='vesicle'){
      return '<button class="phase-next membrane-born" id="nextPhase"><small>COMPARTIMENTO FORMADO</small><strong>PRÓXIMA<br>FASE</strong></button>';
    }
    return '<button class="phase-next" id="nextPhase"><small>OBJETIVO CONCLUÍDO</small><strong>PRÓXIMA<br>FASE</strong></button>';
  }

  function compartmentActive(){
    return G.hasCompartment(state);
  }

  function render(){
    if(homeOpen){
      document.getElementById('falling-layer')?.replaceChildren();
      renderHome();
      return;
    }
    G.expireEvent(state);
    const app=document.getElementById('app');
    const p=G.phase(state);
    const period=G.period(state);
    const objective=G.objective(state);

    app.innerHTML=
      '<div class="app single-app">'+
        '<header class="topbar"><div class="phase-card"><small>FASE '+(state.phaseIndex+1)+' DE '+G.PHASES.length+' · '+esc(period.name)+'</small><strong>'+esc(p.title)+'</strong><span>Fluxo: '+[...new Set(G.wanderingResources(state))].map(esc).join(' · ')+'</span></div><button class="menu-btn" id="openMenu">Menu'+((A?.counts?.(atlasState,editorMode)?.unread||0)?'<span class="menu-unread-badge">'+A.counts(atlasState,editorMode).unread+'</span>':'')+'</button></header>'+
        objectiveMarkup(objective)+
        progressMarkup(objective)+
        renderEventStatus()+
        '<section class="arena-shell '+(compartmentActive()?'compartment-stage':'open-stage')+'"><div class="'+(compartmentActive()?'primordial-pond single-pond':'prebiotic-field')+'" id="soupPond">'+
          (compartmentActive()?'<div class="water-caustic caustic-a"></div><div class="water-caustic caustic-b"></div>':'')+
          state.soup.map(renderBubble).join('')+

          renderPhaseCompletion()+
        '</div></section>'+
        renderContext()+
      '</div>'+
      renderMenu()+renderChoice()+renderDiscoveryModal();

    bind();
    emitEventToast();
    state.soup.forEach(b=>{b.isNew=false;});
    setTimeout(()=>ensurePhotolysisFaller(rainGeneration),0);
  }

  function edgePoint(edge){
    const w=window.innerWidth;
    const h=window.innerHeight;
    const pad=88;
    if(edge===0) return {x:Math.random()*w,y:-pad};
    if(edge===1) return {x:w+pad,y:Math.random()*h};
    if(edge===2) return {x:Math.random()*w,y:h+pad};
    return {x:-pad,y:Math.random()*h};
  }

  function createTrajectory(){
    const startEdge=Math.floor(Math.random()*4);
    const options=[0,1,2,3].filter(edge=>edge!==startEdge);
    const endEdge=options[Math.floor(Math.random()*options.length)];
    return {start:edgePoint(startEdge),end:edgePoint(endEdge)};
  }

  function absorbMatter(node,resource){
    if(reactionBusy||node.dataset.captured==='1') return;
    const field=document.getElementById('soupPond');
    if(!field) return;

    const from=node.getBoundingClientRect();
    const to=field.getBoundingClientRect();
    const rawX=((from.left+from.width/2-to.left)/to.width)*100;
    const rawY=((from.top+from.height/2-to.top)/to.height)*100;
    const fieldX=Math.max(8,Math.min(92,rawX));
    const fieldY=Math.max(8,Math.min(92,rawY));

    node.dataset.captured='1';

    if(!compartmentActive()){
      const captured=G.captureMatter(state,resource,fieldX,fieldY);
      node.remove();
      if(captured){
        discoverStructure(resource);
        scheduleSave();
        void handleBubbleTap(captured.id);
      }else render();
      return;
    }

    const targetX=to.left+to.width*(fieldX/100);
    const targetY=to.top+to.height*(fieldY/100);

    node.style.animation='none';
    node.style.position='fixed';
    node.style.left=from.left+'px';
    node.style.top=from.top+'px';
    node.style.width=from.width+'px';
    node.style.height=from.height+'px';
    node.style.transform='none';
    node.style.transition='left .68s cubic-bezier(.2,.82,.2,1), top .68s cubic-bezier(.2,.82,.2,1), transform .68s cubic-bezier(.2,.82,.2,1), opacity .62s ease, filter .62s ease';
    node.style.pointerEvents='none';

    requestAnimationFrame(()=>{
      node.classList.add('being-absorbed');
      node.style.left=(targetX-from.width/2)+'px';
      node.style.top=(targetY-from.height/2)+'px';
      node.style.transform='scale(.08) rotate(210deg)';
      node.style.opacity='.15';
      node.style.filter='brightness(1.9)';
    });

    setTimeout(()=>{
      const captured=G.captureMatter(state,resource,fieldX,fieldY);
      node.remove();
      if(captured){
        discoverStructure(resource);
        scheduleSave();
      }
      render();
    },690);
  }

  function triggerEventObject(node,icon){
    if(reactionBusy||node.dataset.captured==='1') return;
    node.dataset.captured='1';
    G.activateEvent(state,icon);
    discoverProcess(icon);
    node.style.pointerEvents='none';
    node.classList.add('event-triggered');
    setTimeout(()=>node.remove(),420);
    render();
  }

  function resumeIncomingAtom(node){
    const rect=node.getBoundingClientRect();
    const endX=Number(node.dataset.endX);
    const endY=Number(node.dataset.endY);
    node.style.animation='none';
    node.style.position='absolute';
    node.style.left=rect.left+'px';
    node.style.top=rect.top+'px';
    node.style.transform='none';
    node.style.opacity='1';
    node.style.pointerEvents='auto';
    node.style.setProperty('--start-x',rect.left+'px');
    node.style.setProperty('--start-y',rect.top+'px');
    node.style.setProperty('--end-x',endX+'px');
    node.style.setProperty('--end-y',endY+'px');
    void node.offsetWidth;
    node.style.animation='traverseMatter 7s linear forwards';
  }

  function recipesForResourcePair(sourceResource,targetResource){
    return G.possibleRecipes(state,sourceResource).filter(recipe=>
      (recipe.a===sourceResource&&recipe.b===targetResource)||
      (recipe.b===sourceResource&&recipe.a===targetResource)
    );
  }

  function floatingReactionDropTarget(resource,clientX,clientY){
    let best=null;
    let bestDistance=Infinity;
    document.querySelectorAll('.organic-bubble.floating-candidate').forEach(candidate=>{
      const rect=candidate.getBoundingClientRect();
      const pad=20;
      const within=clientX>=rect.left-pad&&clientX<=rect.right+pad&&clientY>=rect.top-pad&&clientY<=rect.bottom+pad;
      if(!within) return;
      const distance=Math.hypot(clientX-(rect.left+rect.width/2),clientY-(rect.top+rect.height/2));
      if(distance<bestDistance){
        best=candidate;
        bestDistance=distance;
      }
    });
    return best;
  }

  function markFloatingRecipeTargets(resource){
    document.querySelectorAll('.organic-bubble').forEach(candidate=>{
      const recipes=recipesForResourcePair(resource,candidate.dataset.resource);
      candidate.classList.toggle('candidate',recipes.length>0);
      candidate.classList.toggle('floating-candidate',recipes.length>0);
    });
  }

  function clearFloatingRecipeTargets(){
    document.querySelectorAll('.organic-bubble.floating-candidate').forEach(candidate=>{
      candidate.classList.remove('floating-candidate','candidate','drag-target');
    });
  }

  function armRecipeForPair(sourceResource,targetEl,currentRecipeId){
    if(!targetEl) return null;
    const recipes=recipesForResourcePair(sourceResource,targetEl.dataset.resource);
    if(!recipes.length) return null;
    const objective=G.phaseRecipe(state);
    const recipe=recipes.find(item=>item.id===objective?.id)||(recipes.length===1?recipes[0]:null);
    if(recipe&&recipe.id!==currentRecipeId) M?.arm?.(recipe);
    return recipe?.id||null;
  }

  function captureDraggedMatter(node,resource,clientX,clientY){
    if(reactionBusy) return;
    const pond=document.getElementById('soupPond');
    if(!pond) return;
    const rect=pond.getBoundingClientRect();
    const pondX=Math.max(10,Math.min(90,((clientX-rect.left)/rect.width)*100));
    const pondY=Math.max(10,Math.min(90,((clientY-rect.top)/rect.height)*100));

    node.style.pointerEvents='none';
    node.style.transition='transform .24s ease,opacity .24s ease,filter .24s ease';
    node.style.transform='scale(.12)';
    node.style.opacity='.15';
    node.style.filter='brightness(1.9)';

    setTimeout(()=>{
      const captured=G.captureMatter(state,resource,pondX,pondY);
      node.remove();
      if(captured){
        discoverStructure(resource);
        scheduleSave();
      }
      render();
    },240);
  }

  function enableIncomingAtomDrag(node,resource){
    let gesture=null;

    node.addEventListener('pointerdown',event=>{
      if(event.button!==undefined&&event.button!==0) return;
      if(reactionBusy||state.stageComplete) return;
      event.preventDefault();
      gesture={
        pointerId:event.pointerId,
        startX:event.clientX,
        startY:event.clientY,
        moved:false,
        targetId:null,
        armedRecipeId:null
      };
      node.setPointerCapture&&node.setPointerCapture(event.pointerId);
    });

    node.addEventListener('pointermove',event=>{
      if(!gesture||event.pointerId!==gesture.pointerId) return;
      const dx=event.clientX-gesture.startX;
      const dy=event.clientY-gesture.startY;
      if(Math.abs(dx)+Math.abs(dy)<8&&!gesture.moved) return;

      if(!gesture.moved){
        gesture.moved=true;
        markFloatingRecipeTargets(resource);
        const preferred=preferredRecipeForResource(resource);
        if(preferred){
          M?.arm?.(preferred);
          gesture.armedRecipeId=preferred.id;
        }
        const rect=node.getBoundingClientRect();
        node.style.animation='none';
        node.style.position='fixed';
        node.style.left=rect.left+'px';
        node.style.top=rect.top+'px';
        node.style.transform='none';
        node.style.zIndex='90';
        node.classList.add('incoming-dragging');
      }

      node.style.left=(event.clientX-node.offsetWidth/2)+'px';
      node.style.top=(event.clientY-node.offsetHeight/2)+'px';
      const pond=document.getElementById('soupPond');
      const pondRect=pond&&pond.getBoundingClientRect();
      const over=pondRect&&event.clientX>=pondRect.left&&event.clientX<=pondRect.right&&event.clientY>=pondRect.top&&event.clientY<=pondRect.bottom;
      pond&&pond.classList.toggle('capture-target',!!over);
      document.querySelectorAll('.organic-bubble.drag-target').forEach(candidate=>candidate.classList.remove('drag-target'));
      const reactionTarget=over?floatingReactionDropTarget(resource,event.clientX,event.clientY):null;
      if(reactionTarget){
        reactionTarget.classList.add('drag-target');
        gesture.targetId=reactionTarget.dataset.bubbleId;
        gesture.armedRecipeId=armRecipeForPair(resource,reactionTarget,gesture.armedRecipeId);
      }else{
        gesture.targetId=null;
      }
    });

    const finish=async event=>{
      if(!gesture||event.pointerId!==gesture.pointerId) return;
      const moved=gesture.moved;
      const trackedTargetId=gesture.targetId;
      gesture=null;
      node.classList.remove('incoming-dragging');
      document.getElementById('soupPond')?.classList.remove('capture-target');
      clearFloatingRecipeTargets();

      if(!moved) return;

      node.dataset.suppressClick='1';
      const pond=document.getElementById('soupPond');
      const rect=pond&&pond.getBoundingClientRect();
      const inside=rect&&event.clientX>=rect.left&&event.clientX<=rect.right&&event.clientY>=rect.top&&event.clientY<=rect.bottom;

      if(inside&&trackedTargetId){
        const x=Math.max(8,Math.min(92,((event.clientX-rect.left)/rect.width)*100));
        const y=Math.max(8,Math.min(92,((event.clientY-rect.top)/rect.height)*100));
        const captured=G.captureMatter(state,resource,x,y);
        if(captured){
          discoverStructure(resource);
          scheduleSave();
          const recipes=G.availableCombos(state,captured.id,trackedTargetId);
          node.remove();
          if(recipes.length===1){
            await performReaction(captured.id,trackedTargetId,recipes[0].id);
            return;
          }
          if(recipes.length>1){
            pendingChoice={sourceId:captured.id,targetId:trackedTargetId,recipes};
            render();
            return;
          }
        }
      }

      M?.cancel?.();
      if(inside){
        if(compartmentActive()){
          captureDraggedMatter(node,resource,event.clientX,event.clientY);
        }else{
          const field=document.getElementById('soupPond');
          const fieldRect=field.getBoundingClientRect();
          const x=Math.max(8,Math.min(92,((event.clientX-fieldRect.left)/fieldRect.width)*100));
          const y=Math.max(8,Math.min(92,((event.clientY-fieldRect.top)/fieldRect.height)*100));
          const captured=G.captureMatter(state,resource,x,y);
          node.remove();
          if(captured){
            discoverStructure(resource);
            scheduleSave();
            void handleBubbleTap(captured.id);
          }else render();
        }
      }else{
        resumeIncomingAtom(node);
        setTimeout(()=>{node.dataset.suppressClick='';},0);
      }
    };

    node.addEventListener('pointerup',finish);
    node.addEventListener('pointercancel',finish);
  }

  function enableFloatingEventDrag(node,activate){
    let gesture=null;

    node.addEventListener('pointerdown',event=>{
      if(event.button!==undefined&&event.button!==0) return;
      if(reactionBusy||state.stageComplete||node.dataset.captured==='1') return;
      event.preventDefault();
      gesture={
        pointerId:event.pointerId,
        startX:event.clientX,
        startY:event.clientY,
        moved:false
      };
      node.setPointerCapture&&node.setPointerCapture(event.pointerId);
    });

    node.addEventListener('pointermove',event=>{
      if(!gesture||event.pointerId!==gesture.pointerId) return;
      const dx=event.clientX-gesture.startX;
      const dy=event.clientY-gesture.startY;
      if(Math.abs(dx)+Math.abs(dy)<8&&!gesture.moved) return;

      if(!gesture.moved){
        gesture.moved=true;
        const rect=node.getBoundingClientRect();
        node.style.animation='none';
        node.style.position='fixed';
        node.style.left=rect.left+'px';
        node.style.top=rect.top+'px';
        node.style.transform='none';
        node.style.zIndex='92';
        node.classList.add('incoming-dragging');
      }

      node.style.left=(event.clientX-node.offsetWidth/2)+'px';
      node.style.top=(event.clientY-node.offsetHeight/2)+'px';
      const pond=document.getElementById('soupPond');
      const pondRect=pond&&pond.getBoundingClientRect();
      const over=pondRect&&event.clientX>=pondRect.left&&event.clientX<=pondRect.right&&event.clientY>=pondRect.top&&event.clientY<=pondRect.bottom;
      pond&&pond.classList.toggle('capture-target',!!over);
      node.classList.toggle('event-drop-ready',!!over);
    });

    const finish=event=>{
      if(!gesture||event.pointerId!==gesture.pointerId) return;
      const moved=gesture.moved;
      gesture=null;
      node.classList.remove('incoming-dragging','event-drop-ready');
      document.getElementById('soupPond')?.classList.remove('capture-target');
      if(!moved) return;

      node.dataset.suppressClick='1';
      const pond=document.getElementById('soupPond');
      const rect=pond&&pond.getBoundingClientRect();
      const inside=rect&&event.clientX>=rect.left&&event.clientX<=rect.right&&event.clientY>=rect.top&&event.clientY<=rect.bottom;
      if(inside){
        activate();
        return;
      }

      resumeIncomingAtom(node);
      setTimeout(()=>{node.dataset.suppressClick='';},0);
    };

    node.addEventListener('pointerup',finish);
    node.addEventListener('pointercancel',finish);
  }

  function createReleasedMatter(resource,clientX,clientY){
    const layer=document.getElementById('falling-layer');
    if(!layer) return;

    const node=document.createElement('button');
    const edges=[0,1,2,3];
    const end=edgePoint(edges[Math.floor(Math.random()*edges.length)]);
    const duration=11+Math.random()*6;

    const visual=V.spec(resource);
    node.className='falling-object molecular-faller released-molecule kind-'+visual.kind;
    node.dataset.kind='released';
    node.dataset.value=resource;
    node.dataset.endX=String(end.x);
    node.dataset.endY=String(end.y);
    const fallerDiameter=Math.max(64,Math.max(visual.width,visual.height)+22);
    node.style.setProperty('--start-x',(clientX-fallerDiameter/2)+'px');
    node.style.setProperty('--start-y',(clientY-fallerDiameter/2)+'px');
    node.style.setProperty('--end-x',end.x+'px');
    node.style.setProperty('--end-y',end.y+'px');
    node.style.setProperty('--fall-duration',duration+'s');
    node.style.setProperty('--travel-rotate',(Math.random()>.5?1:-1)*(15+Math.random()*45)+'deg');
    node.style.setProperty('--faller-w',Math.max(56,visual.width)+'px');
    node.style.setProperty('--faller-h',Math.max(56,visual.height)+'px');
    node.style.setProperty('--faller-d',fallerDiameter+'px');
    node.style.setProperty('--visual-accent',visual.accent);
    node.innerHTML=V.render(resource,'field')+'<strong class="faller-label">'+esc(resource)+'</strong>';
    node.setAttribute('aria-label','Recapturar '+resource+' · '+visual.family);

    node.onclick=()=>{
      if(node.dataset.suppressClick==='1') return;
      absorbMatter(node,resource);
    };
    enableIncomingAtomDrag(node,resource);
    node.addEventListener('animationend',()=>node.remove(),{once:true});
    layer.appendChild(node);
  }

  function ensurePhotolysisFaller(token){
    if(token!==rainGeneration||homeOpen||state.stageComplete||G.photolysisActive(state)) return;
    const layer=document.getElementById('falling-layer');
    if(!layer||layer.querySelector('[data-photolysis-singleton="1"]')) return;

    const event=G.EVENTS['☀F'];
    const node=document.createElement('button');
    const path=createTrajectory();
    const duration=13+Math.random()*5;

    node.className='falling-object falling-event '+event.className;
    node.dataset.kind='event';
    node.dataset.value='☀F';
    node.dataset.photolysisSingleton='1';
    node.dataset.endX=String(path.end.x);
    node.dataset.endY=String(path.end.y);
    node.style.setProperty('--start-x',path.start.x+'px');
    node.style.setProperty('--start-y',path.start.y+'px');
    node.style.setProperty('--end-x',path.end.x+'px');
    node.style.setProperty('--end-y',path.end.y+'px');
    node.style.setProperty('--fall-duration',duration+'s');
    node.style.setProperty('--travel-rotate',(Math.random()>.5?1:-1)*(20+Math.random()*45)+'deg');
    node.innerHTML='<span>'+event.icon+'</span><small>'+esc(event.name)+'</small>';
    node.setAttribute('aria-label','Ativar evento '+event.name);

    const recycle=delay=>{
      if(node.dataset.finished==='1') return;
      node.dataset.finished='1';
      node.remove();
      setTimeout(()=>{
        if(token===rainGeneration) ensurePhotolysisFaller(token);
      },delay);
    };

    const activatePhotolysis=()=>{
      if(node.dataset.captured==='1') return;
      node.dataset.captured='1';
      G.activateEvent(state,'☀F');
      discoverProcess('☀F');
      node.style.pointerEvents='none';
      node.classList.add('event-triggered');
      setTimeout(()=>recycle(180),420);
      render();
    };
    node.onclick=activatePhotolysis;
    enableFloatingEventDrag(node,activatePhotolysis);

    node.addEventListener('animationend',()=>recycle(220),{once:true});
    layer.appendChild(node);
  }

  function createFaller(){
    if(state.stageComplete||menuOpen) return;
    const layer=document.getElementById('falling-layer');
    if(!layer) return;

    const spec=G.nextFaller(state);
    const node=document.createElement('button');
    const path=createTrajectory();
    const duration=10+Math.random()*7;
    node.style.setProperty('--start-x',path.start.x+'px');
    node.style.setProperty('--start-y',path.start.y+'px');
    node.style.setProperty('--end-x',path.end.x+'px');
    node.style.setProperty('--end-y',path.end.y+'px');
    node.dataset.endX=String(path.end.x);
    node.dataset.endY=String(path.end.y);
    node.style.setProperty('--fall-duration',duration+'s');
    node.style.setProperty('--travel-rotate',(Math.random()>.5?1:-1)*(20+Math.random()*55)+'deg');

    if(spec.kind==='event'){
      const event=G.EVENTS[spec.value];
      node.className='falling-object falling-event '+event.className;
      node.dataset.kind='event';
      node.dataset.value=spec.value;
      node.innerHTML='<span>'+event.icon+'</span><small>'+esc(event.name)+'</small>';
      node.setAttribute('aria-label','Ativar evento '+event.name);
      const activateEvent=()=>triggerEventObject(node,spec.value);
      node.onclick=activateEvent;
      enableFloatingEventDrag(node,activateEvent);
    }else{
      const visual=V.spec(spec.value);
      node.className='falling-object molecular-faller atom-faller kind-'+visual.kind;
      node.dataset.kind='atom';
      node.dataset.value=spec.value;
      const fallerDiameter=Math.max(64,Math.max(visual.width,visual.height)+22);
      node.style.setProperty('--faller-w',Math.max(56,visual.width)+'px');
      node.style.setProperty('--faller-h',Math.max(56,visual.height)+'px');
      node.style.setProperty('--faller-d',fallerDiameter+'px');
      node.style.setProperty('--visual-accent',visual.accent);
      node.innerHTML=V.render(spec.value,'field')+'<strong class="faller-label">'+esc(spec.value)+'</strong>';
      node.setAttribute('aria-label','Capturar '+spec.value+' · '+visual.family);
      node.onclick=()=>{
        if(node.dataset.suppressClick==='1') return;
        absorbMatter(node,spec.value);
      };
      enableIncomingAtomDrag(node,spec.value);
    }

    node.addEventListener('animationend',()=>node.remove(),{once:true});
    layer.appendChild(node);
  }

  function scheduleRain(token){
    if(token!==rainGeneration) return;
    const delay=850+Math.random()*900;
    rainTimer=setTimeout(()=>{
      if(token!==rainGeneration) return;
      createFaller();
      scheduleRain(token);
    },delay);
  }

  function restartRain(){
    rainGeneration+=1;
    if(rainTimer) clearTimeout(rainTimer);
    document.getElementById('falling-layer')?.replaceChildren();
    const token=rainGeneration;
    setTimeout(()=>{
      if(token===rainGeneration){
        createFaller();
        ensurePhotolysisFaller(token);
      }
    },300);
    scheduleRain(token);
  }

  function tickEvent(){
    if(G.expireEvent(state)){
      render();
      return;
    }
    const active=state.activeEvent;
    const countdown=document.getElementById('activeEventCountdown');
    if(active&&countdown&&!active.consumable){
      countdown.textContent=Math.max(0,Math.ceil((active.expiresAt-Date.now())/1000))+' s restantes';
    }
  }

  function recipesForSource(sourceId){
    const unique=new Map();
    for(const bubble of state.soup){
      for(const recipe of G.availableCombos(state,sourceId,bubble.id)) unique.set(recipe.id,recipe);
    }
    return [...unique.values()];
  }

  function preferredRecipeForSource(sourceId){
    const recipes=recipesForSource(sourceId);
    if(!recipes.length) return null;
    const objectiveRecipe=G.phaseRecipe(state);
    if(objectiveRecipe){
      const target=recipes.find(recipe=>recipe.id===objectiveRecipe.id);
      if(target) return target;
    }
    return recipes.length===1?recipes[0]:null;
  }

  function preferredRecipeForResource(resource){
    const recipes=G.possibleRecipes(state,resource);
    if(!recipes.length) return null;
    const objective=G.phaseRecipe(state);
    return recipes.find(recipe=>recipe.id===objective?.id)||(recipes.length===1?recipes[0]:null);
  }

  function reactantSnapshot(bubble){
    return bubble?{id:bubble.id,resource:bubble.resource,x:bubble.x,y:bubble.y}:null;
  }

  async function performReaction(sourceId,targetId,recipeId){
    if(reactionBusy||state.stageComplete) return false;
    const choices=G.availableCombos(state,sourceId,targetId);
    const recipe=choices.find(item=>item.id===recipeId)||choices[0];
    if(!recipe){
      M?.cancel?.();
      return false;
    }

    const source=state.soup.find(bubble=>bubble.id===sourceId);
    const target=state.soup.find(bubble=>bubble.id===targetId);
    if(!source||!target){
      M?.cancel?.();
      return false;
    }

    const reactants=[reactantSnapshot(source),reactantSnapshot(target)];
    reactionBusy=true;
    state.selectedBubbleId=null;
    pendingChoice=null;
    document.querySelector('.choice-backdrop')?.remove();

    const result=G.combine(state,sourceId,targetId,recipe.id);
    if(!result.ok){
      reactionBusy=false;
      M?.cancel?.();
      render();
      return false;
    }

    const product={
      id:result.born.id,
      resource:result.born.resource,
      x:result.born.x,
      y:result.born.y,
      count:G.bubbleCount(result.born)
    };

    try{
      if(M?.resolve){
        await M.resolve({recipe,reactants,product,final:state.stageComplete});
        result.born.isNew=false;
      }
    }finally{
      reactionBusy=false;
      discover(
        [A.structureKey(result.born.resource),A.reactionKey(recipe.id)],
        A.structureKey(result.born.resource)
      );
      scheduleSave();
      render();
    }
    return true;
  }

  async function handleBubbleTap(bubbleId){
    if(reactionBusy||state.stageComplete) return;
    const clicked=state.soup.find(bubble=>bubble.id===bubbleId);
    if(!clicked) return;

    const previous=state.selectedBubbleId;
    if(previous){
      const recipes=G.availableCombos(state,previous,bubbleId);
      if(recipes.length===1){
        await performReaction(previous,bubbleId,recipes[0].id);
        return;
      }
      if(recipes.length>1){
        pendingChoice={sourceId:previous,targetId:bubbleId,recipes};
        render();
        return;
      }
    }

    state.selectedBubbleId=previous===bubbleId?null:bubbleId;
    if(state.selectedBubbleId) M?.arm?.(preferredRecipeForSource(bubbleId));
    else M?.cancel?.();
    render();
  }

  function reactionDropTarget(sourceId,clientX,clientY){
    const direct=document.elementFromPoint(clientX,clientY)?.closest?.('.organic-bubble');
    if(direct&&direct.dataset.bubbleId!==sourceId&&G.availableCombos(state,sourceId,direct.dataset.bubbleId).length){
      return direct;
    }

    let best=null;
    let bestDistance=Infinity;
    document.querySelectorAll('.organic-bubble.candidate').forEach(candidate=>{
      if(candidate.dataset.bubbleId===sourceId) return;
      const rect=candidate.getBoundingClientRect();
      const pad=18;
      const within=clientX>=rect.left-pad&&clientX<=rect.right+pad&&clientY>=rect.top-pad&&clientY<=rect.bottom+pad;
      if(!within) return;
      const cx=rect.left+rect.width/2;
      const cy=rect.top+rect.height/2;
      const distance=Math.hypot(clientX-cx,clientY-cy);
      if(distance<bestDistance){
        best=candidate;
        bestDistance=distance;
      }
    });
    return best;
  }

  function updateDragReactionTarget(sourceId,clientX,clientY){
    const target=reactionDropTarget(sourceId,clientX,clientY);
    document.querySelectorAll('.organic-bubble.drag-target').forEach(node=>node.classList.remove('drag-target'));
    if(target) target.classList.add('drag-target');
    return target?.dataset.bubbleId||null;
  }

  function startDrag(event,el){
    if(event.button!==undefined&&event.button!==0) return;
    if(reactionBusy||state.stageComplete) return;
    event.preventDefault();
    const id=el.dataset.bubbleId;
    const preferred=preferredRecipeForSource(id);
    if(preferred) M?.arm?.(preferred);
    else M?.cancel?.();

    if(G.photolysisActive(state)){
      if(G.canDecompose(el.dataset.resource)){
        const decomposed=G.decomposeBubble(state,id);
        if(decomposed?.ok) scheduleSave();
        render();
      }
      return;
    }
    drag={
      id,
      el,
      previousSelected:state.selectedBubbleId,
      selectedSource:state.selectedBubbleId===id,
      startX:event.clientX,
      startY:event.clientY,
      moved:false,
      targetId:null,
      armedRecipeId:preferred?.id||null,
      pointerId:event.pointerId
    };
    el.setPointerCapture&&el.setPointerCapture(event.pointerId);
    el.classList.add('dragging','selected');
    if(recipesForSource(id).length) el.classList.add('drag-armed');

    document.querySelectorAll('.organic-bubble').forEach(other=>{
      if(other.dataset.bubbleId===id) return;
      if(G.availableCombos(state,id,other.dataset.bubbleId).length) other.classList.add('candidate');
    });
  }

  function moveDrag(event){
    if(!drag||event.pointerId!==drag.pointerId) return;
    const dx=event.clientX-drag.startX;
    const dy=event.clientY-drag.startY;
    if(Math.abs(dx)+Math.abs(dy)>7) drag.moved=true;
    drag.el.style.transform='translate('+dx+'px,'+dy+'px) scale(1.08)';
    if(drag.moved){
      drag.targetId=updateDragReactionTarget(drag.id,event.clientX,event.clientY);
      if(drag.targetId){
        const recipes=G.availableCombos(state,drag.id,drag.targetId);
        const objective=G.phaseRecipe(state);
        const recipe=recipes.find(item=>item.id===objective?.id)||(recipes.length===1?recipes[0]:null);
        if(recipe&&recipe.id!==drag.armedRecipeId){
          M?.arm?.(recipe);
          drag.armedRecipeId=recipe.id;
        }
      }
    }
  }

  async function finishDrag(event){
    if(!drag||event.pointerId!==drag.pointerId) return;
    const sourceId=drag.id;
    const moved=drag.moved;
    const previousSelected=drag.previousSelected;
    const trackedTargetId=drag.targetId;
    drag.el.classList.remove('dragging','drag-armed');
    drag.el.style.transform='';
    drag.el.style.pointerEvents='none';
    const target=document.elementFromPoint(event.clientX,event.clientY);
    drag.el.style.pointerEvents='';
    drag=null;
    document.querySelectorAll('.candidate').forEach(el=>el.classList.remove('candidate','drag-target'));

    if(!moved){
      state.selectedBubbleId=previousSelected;
      await handleBubbleTap(sourceId);
      return;
    }

    const bubbleTargetId=trackedTargetId||
      (target&&target.closest('.organic-bubble')?.dataset.bubbleId)||
      reactionDropTarget(sourceId,event.clientX,event.clientY)?.dataset.bubbleId||
      null;
    if(bubbleTargetId&&bubbleTargetId!==sourceId){
      const targetId=bubbleTargetId;
      const recipes=G.availableCombos(state,sourceId,targetId);
      if(recipes.length===1){
        await performReaction(sourceId,targetId,recipes[0].id);
        return;
      }
      if(recipes.length>1){
        pendingChoice={sourceId,targetId,recipes};
        render();
        return;
      }
    }

    M?.cancel?.();
    const pond=document.getElementById('soupPond');
    const pondRect=pond&&pond.getBoundingClientRect();
    const inside=pondRect&&event.clientX>=pondRect.left&&event.clientX<=pondRect.right&&event.clientY>=pondRect.top&&event.clientY<=pondRect.bottom;

    if(inside){
      const x=((event.clientX-pondRect.left)/pondRect.width)*100;
      const y=((event.clientY-pondRect.top)/pondRect.height)*100;
      G.moveBubble(state,sourceId,x,y);
    }else{
      const released=G.releaseBubble(state,sourceId);
      if(released) createReleasedMatter(released.resource,event.clientX,event.clientY);
    }
    scheduleSave();
    render();
  }

  function bind(){
    const openMenu=document.getElementById('openMenu');
    if(openMenu) openMenu.onclick=()=>{menuOpen=true;render();};
    const next=document.getElementById('nextPhase');
    if(next) next.onclick=()=>{
      if(G.nextPhase(state)){
        pendingChoice=null;
        menuOpen=false;
        lastToastEventId=null;
        scheduleSave();
        render();
        restartRain();
      }
    };

    const close=document.getElementById('closeMenu');
    if(close) close.onclick=()=>{
      menuOpen=false;
      atlasSelectedKey=null;
      presentNextDiscovery();
      render();
    };

    const campaignTab=document.getElementById('menuCampaignTab');
    if(campaignTab) campaignTab.onclick=()=>{
      menuView='campaign';
      atlasSelectedKey=null;
      render();
    };

    const atlasMenuTab=document.getElementById('menuAtlasTab');
    if(atlasMenuTab) atlasMenuTab.onclick=()=>{
      menuView='atlas';
      atlasSelectedKey=null;
      render();
    };

    document.querySelectorAll('[data-atlas-tab]').forEach(el=>{
      el.onclick=()=>{
        atlasTab=el.dataset.atlasTab;
        atlasSelectedKey=null;
        render();
      };
    });

    document.querySelectorAll('[data-atlas-entry]').forEach(el=>{
      el.onclick=()=>{
        const key=el.dataset.atlasEntry;
        atlasSelectedKey=key;
        if(A?.markRead?.(atlasState,key)) scheduleSave();
        render();
      };
    });

    const atlasBack=document.getElementById('atlasBack');
    if(atlasBack) atlasBack.onclick=()=>{atlasSelectedKey=null;render();};

    const openTrail=document.getElementById('openTrail');
    if(openTrail) openTrail.onclick=()=>{
      homeOpen=true;
      menuOpen=false;
      rainGeneration+=1;
      if(rainTimer) clearTimeout(rainTimer);
      document.getElementById('falling-layer')?.replaceChildren();
      render();
    };

    const restartPhase=document.getElementById('restartPhase');
    if(restartPhase) restartPhase.onclick=()=>{
      G.restartPhase(state);
      menuOpen=false;pendingChoice=null;lastToastEventId=null;
      scheduleSave();
      render();restartRain();
    };

    const restartCampaign=document.getElementById('restartCampaign');
    if(restartCampaign) restartCampaign.onclick=()=>{
      if(!editorMode&&!window.confirm('Reiniciar a campanha? O progresso salvo e todas as descobertas do Atlas serão apagados.')) return;
      P?.clear?.();
      state=G.createGame(editorMode);
      atlasState=A?.createState?.(null,editorMode);
      discoveryQueue=[];
      activeDiscovery=null;
      contextRecipeId=null;
      contextRecipePhase=-1;
      homeOpen=true;
      menuOpen=false;
      menuView='campaign';
      atlasSelectedKey=null;
      pendingChoice=null;
      lastToastEventId=null;
      rainGeneration+=1;
      if(rainTimer) clearTimeout(rainTimer);
      document.getElementById('falling-layer')?.replaceChildren();
      saveNow();
      render();
    };

    document.querySelectorAll('[data-phase]').forEach(el=>{
      el.onclick=()=>{ openPhase(Number(el.dataset.phase)); };
    });

    const field=document.getElementById('soupPond');
    if(field&&!compartmentActive()){
      field.addEventListener('pointerdown',event=>{
        if(reactionBusy) return;
        if(event.target.closest('.organic-bubble')) return;
        if(!state.selectedBubbleId) return;
        const released=G.releaseBubble(state,state.selectedBubbleId);
        M?.cancel?.();
        if(released){
          createReleasedMatter(released.resource,event.clientX,event.clientY);
          scheduleSave();
        }
        render();
      });
    }

    document.querySelectorAll('.organic-bubble').forEach(el=>{
      el.addEventListener('pointerdown',e=>startDrag(e,el));
    });

    window.onpointermove=moveDrag;
    window.onpointerup=finishDrag;
    window.onpointercancel=finishDrag;

    const clear=document.getElementById('clearSelection');
    if(clear) clear.onclick=()=>{state.selectedBubbleId=null;M?.cancel?.();render();};

    document.querySelectorAll('[data-recipe-choice]').forEach(el=>{
      el.onclick=()=>{
        if(!pendingChoice) return;
        const choice=pendingChoice;
        pendingChoice=null;
        void performReaction(choice.sourceId,choice.targetId,el.dataset.recipeChoice);
      };
    });

    const cancel=document.getElementById('cancelChoice');
    if(cancel) cancel.onclick=()=>{pendingChoice=null;M?.cancel?.();render();};

    const discoveryContinue=document.getElementById('discoveryContinue');
    if(discoveryContinue) discoveryContinue.onclick=()=>{
      dismissDiscovery();
      render();
    };

    const discoveryOpenAtlas=document.getElementById('discoveryOpenAtlas');
    if(discoveryOpenAtlas) discoveryOpenAtlas.onclick=()=>{
      const key=activeDiscovery?.primaryKey||null;
      if(key&&A?.markRead?.(atlasState,key)) scheduleSave();
      activeDiscovery=null;
      menuOpen=true;
      menuView='atlas';
      atlasTab=A?.entry?.(key)?.category||'structures';
      atlasSelectedKey=key;
      render();
    };
  }

  eventTickTimer=setInterval(tickEvent,250);
  const fallingLayer=document.getElementById('falling-layer');
  if(fallingLayer&&window.MutationObserver){
    const observer=new MutationObserver(()=>refreshContextualObjective());
    observer.observe(fallingLayer,{childList:true});
  }
  window.addEventListener('beforeunload',()=>{if(!editorMode) saveNow();});
  render();
  if(!homeOpen) restartRain();
})();