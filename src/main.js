(function () {
  const G=window.SopaGame;
  const V=window.SopaVisuals;
  const editorMode=window.location.hash==='#editor';
  let state=G.createGame(editorMode);
  let homeOpen=true;
  let drag=null;
  let pendingChoice=null;
  let menuOpen=false;
  let lastToastEventId=null;
  let rainGeneration=0;
  let rainTimer=null;
  let eventTickTimer=null;
  window.SopaToastQueue=window.SopaToastQueue||[];

  function esc(value){
    return String(value).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
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
    return '<button class="organic-bubble molecule-object kind-'+visual.kind+
      (b.isNew?' born':'')+
      (selected?' selected':'')+
      (candidate?' candidate':'')+
      (pairing?' canonical-pair':'')+
      (photolysisEligible?' photolysis-eligible':'')+
      '" data-bubble-id="'+b.id+'" data-resource="'+esc(b.resource)+'" style="'+bubbleStyle(b)+'" aria-label="'+esc(b.resource)+' · '+esc(visual.family)+'">'+
      '<span class="molecule-object-art">'+V.render(b.resource,'field')+'</span>'+
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

  function conditionMarkup(conditions){
    if(!conditions||!conditions.length){
      return '<div class="recipe-conditions"><span>CONDIÇÕES / CATALISADORES</span><strong>Sem evento obrigatório</strong></div>';
    }
    return '<div class="recipe-conditions"><span>CONDIÇÕES / CATALISADORES</span><div>'+
      conditions.map(icon=>'<b class="condition-chip">'+icon+' '+esc(conditionLabel(icon))+'</b>').join('')+
      '</div></div>';
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
          '<div class="info-copy"><strong>Química dispersa</strong><p>Clique em uma partícula para interromper seu movimento. Clique depois em outra compatível para reagir. Clique no espaço vazio para liberar a seleção e fazê-la voltar ao fluxo.</p></div>'+
        '</section>';
      }
      return '<section class="info-panel panel">'+
        '<div class="info-tile idle"><span>SOPA</span><strong>+</strong><small>capture matéria</small></div>'+
        '<div class="info-copy"><strong>Capture matéria do fluxo</strong><p>Clique para sugá-lo automaticamente ou arraste o átomo diretamente para dentro da sopa. Depois combine ingredientes por dois cliques em sequência ou por arraste. Dentro da sopa, arraste livremente para organizar; arraste para fora para liberar uma bolha ao fluxo.</p></div>'+
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
        '<strong>'+esc(b.resource)+'</strong>'+
        '<small>'+esc(visual.family)+' · '+esc(visual.formula)+'</small>'+
      '</div>'+
      '<div class="info-copy"><div class="info-context-title">Pode reagir agora com</div>'+available+blocked+pairNote+
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
      const status=G.phaseStatus(state,index);
      const clickable=status!=='locked'||state.editorMode;
      const period=G.PERIODS[p.period];
      const chapter=p.chapter!==previousChapter
        ? '<div class="trail-chapter"><span></span><strong>'+esc(p.chapter)+'</strong><em>'+String(index+1).padStart(2,'0')+'</em></div>'
        : '';
      previousChapter=p.chapter;
      return chapter+
        '<button type="button" class="trail-node '+status+'" data-home-phase="'+index+'" '+(clickable?'':'disabled')+'>'+
          '<span class="trail-dot" aria-hidden="true"></span>'+
          '<span class="trail-node-copy"><small>FASE '+(index+1)+' · '+esc(period.name)+'</small><span class="trail-product">'+V.render(p.target,'trail')+'<strong>'+esc(p.title)+'</strong></span><em>'+esc(p.formula)+'</em></span>'+
          '<span class="trail-state">'+esc(state.editorMode&&status==='locked'?'Editor':phaseStateLabel(status))+'</span>'+
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

  function bindHome(){
    const continueBtn=document.getElementById('continueCampaign');
    if(continueBtn) continueBtn.onclick=()=>{
      homeOpen=false;
      render();
      restartRain();
    };

    document.querySelectorAll('[data-home-phase]').forEach(el=>{
      el.onclick=()=>{
        const index=Number(el.dataset.homePhase);
        if(index===state.phaseIndex){
          homeOpen=false;
          pendingChoice=null;
          menuOpen=false;
          render();
          restartRain();
          return;
        }
        if(G.jumpToPhase(state,index)){
          homeOpen=false;
          pendingChoice=null;
          menuOpen=false;
          lastToastEventId=null;
          render();
          restartRain();
        }
      };
    });
  }

  function renderPhaseMenu(){
    return G.PHASES.map((p,index)=>{
      const status=G.phaseStatus(state,index);
      const unlocked=status!=='locked'||state.editorMode;
      const current=status==='current';
      return '<button class="phase-list-item '+status+'" data-phase="'+index+'" '+(unlocked?'':'disabled')+'>'+
        '<span>'+(index+1)+'</span><div><strong>'+esc(p.title)+'</strong><small>'+esc(p.chapter)+'</small></div>'+
        '<em>'+esc(state.editorMode&&status==='locked'?'EDITOR':phaseStateLabel(status).toUpperCase())+'</em>'+
      '</button>';
    }).join('');
  }

  function renderRecipeCatalog(){
    return G.COMBOS.map(recipe=>{
      const condition=recipe.events&&recipe.events.length
        ? 'Condições / catalisadores: '+recipe.events.map(conditionLabel).join(' ou ')
        : 'Condições / catalisadores: sem evento obrigatório';
      const visual=V.spec(recipe.out);
      return '<div class="recipe-catalog-row" style="--recipe-color:'+recipe.color+'">'+
        '<span class="recipe-visual">'+V.render(recipe.out,'catalog')+'</span>'+
        '<span class="recipe-copy"><strong>'+esc(recipe.label)+'</strong><small>'+esc(visual.family)+' · '+esc(visual.formula)+'</small><small>'+esc(condition)+'</small></span>'+
      '</div>';
    }).join('');
  }

  function renderMenu(){
    if(!menuOpen) return '';
    const p=G.phase(state);
    return '<div class="modal-backdrop"><div class="menu-card">'+
      '<div class="menu-head"><div><p class="eyebrow">Campanha singleplayer</p><h2>Fases</h2></div><button id="closeMenu" class="menu-close">Voltar</button></div>'+
      '<p class="menu-intro">A campanha possui 44 descobertas. Cada fase libera uma receita própria; produtos anteriores continuam disponíveis como precursores. A química começa dispersa, ganha compartimento com a vesícula e termina em replicação de RNA.</p>'+
      '<section class="menu-section"><div class="phase-list">'+renderPhaseMenu()+'</div></section>'+
      '<section class="menu-actions"><button id="openTrail" class="menu-action">Trilha de fases</button><button id="restartPhase" class="menu-action">Reiniciar '+esc(p.title)+'</button><button id="restartCampaign" class="menu-action danger">Reiniciar campanha</button></section>'+
      '<section class="menu-section"><strong>Receitas disponíveis</strong><div class="recipe-catalog">'+renderRecipeCatalog()+'</div></section>'+      '<section class="menu-section"><strong>Registro da sopa</strong><div class="history-list">'+state.log.slice(0,20).map(line=>'<p>'+esc(line)+'</p>').join('')+'</div></section>'+
    '</div></div>';
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
        '<header class="topbar"><div class="phase-card"><small>FASE '+(state.phaseIndex+1)+' DE '+G.PHASES.length+' · '+esc(period.name)+'</small><strong>'+esc(p.title)+'</strong><span>Fluxo: '+period.atoms.map(esc).join(' · ')+'</span></div><button class="menu-btn" id="openMenu">Menu</button></header>'+
        '<section class="objective-card"><strong>'+esc(objective.title)+'</strong><span class="objective-formula">'+esc(objective.formula)+'</span>'+conditionMarkup(objective.conditions)+'<small>'+esc(objective.hint)+'</small></section>'+
        progressMarkup(objective)+
        renderEventStatus()+
        '<section class="arena-shell '+(compartmentActive()?'compartment-stage':'open-stage')+'"><div class="'+(compartmentActive()?'primordial-pond single-pond':'prebiotic-field')+'" id="soupPond">'+
          (compartmentActive()?'<div class="water-caustic caustic-a"></div><div class="water-caustic caustic-b"></div>':'')+
          state.soup.map(renderBubble).join('')+

          renderPhaseCompletion()+
        '</div></section>'+
        renderContext()+
      '</div>'+
      renderMenu()+renderChoice();

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
    if(node.dataset.captured==='1') return;
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
      if(captured){
        const selection=G.selectBubble(state,captured.id);
        if(selection.choices){
          pendingChoice={sourceId:selection.sourceId,targetId:selection.targetId,recipes:selection.choices};
        }
      }
      node.remove();
      render();
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
      G.captureMatter(state,resource,fieldX,fieldY);
      node.remove();
      render();
    },690);
  }

  function triggerEventObject(node,icon){
    if(node.dataset.captured==='1') return;
    node.dataset.captured='1';
    G.activateEvent(state,icon);
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

  function captureDraggedMatter(node,resource,clientX,clientY){
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
      G.captureMatter(state,resource,pondX,pondY);
      node.remove();
      render();
    },240);
  }

  function enableIncomingAtomDrag(node,resource){
    let gesture=null;

    node.addEventListener('pointerdown',event=>{
      if(event.button!==undefined&&event.button!==0) return;
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
        node.style.zIndex='90';
        node.classList.add('incoming-dragging');
      }

      node.style.left=(event.clientX-node.offsetWidth/2)+'px';
      node.style.top=(event.clientY-node.offsetHeight/2)+'px';
      const pond=document.getElementById('soupPond');
      const pondRect=pond&&pond.getBoundingClientRect();
      const over=pondRect&&event.clientX>=pondRect.left&&event.clientX<=pondRect.right&&event.clientY>=pondRect.top&&event.clientY<=pondRect.bottom;
      pond&&pond.classList.toggle('capture-target',!!over);
    });

    const finish=event=>{
      if(!gesture||event.pointerId!==gesture.pointerId) return;
      const moved=gesture.moved;
      gesture=null;
      node.classList.remove('incoming-dragging');
      document.getElementById('soupPond')?.classList.remove('capture-target');

      if(!moved) return;

      node.dataset.suppressClick='1';
      const pond=document.getElementById('soupPond');
      const rect=pond&&pond.getBoundingClientRect();
      const inside=rect&&event.clientX>=rect.left&&event.clientX<=rect.right&&event.clientY>=rect.top&&event.clientY<=rect.bottom;

      if(inside){
        if(compartmentActive()){
          captureDraggedMatter(node,resource,event.clientX,event.clientY);
        }else{
          const field=document.getElementById('soupPond');
          const fieldRect=field.getBoundingClientRect();
          const x=Math.max(8,Math.min(92,((event.clientX-fieldRect.left)/fieldRect.width)*100));
          const y=Math.max(8,Math.min(92,((event.clientY-fieldRect.top)/fieldRect.height)*100));
          const captured=G.captureMatter(state,resource,x,y);
          if(captured){
            const selection=G.selectBubble(state,captured.id);
            if(selection.choices){
              pendingChoice={sourceId:selection.sourceId,targetId:selection.targetId,recipes:selection.choices};
            }
          }
          node.remove();
          render();
        }
      }else{
        resumeIncomingAtom(node);
        setTimeout(()=>{node.dataset.suppressClick='';},0);
      }
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

    node.onclick=()=>{
      if(node.dataset.captured==='1') return;
      node.dataset.captured='1';
      G.activateEvent(state,'☀F');
      node.style.pointerEvents='none';
      node.classList.add('event-triggered');
      setTimeout(()=>recycle(180),420);
      render();
    };

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
      node.onclick=()=>triggerEventObject(node,spec.value);
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

  function startDrag(event,el){
    if(event.button!==undefined&&event.button!==0) return;
    if(state.stageComplete) return;
    const id=el.dataset.bubbleId;

    if(G.photolysisActive(state)){
      if(G.canDecompose(el.dataset.resource)){
        G.decomposeBubble(state,id);
        render();
      }
      return;
    }
    drag={
      id,
      el,
      previousSelected:state.selectedBubbleId,
      startX:event.clientX,
      startY:event.clientY,
      moved:false,
      pointerId:event.pointerId
    };
    el.setPointerCapture&&el.setPointerCapture(event.pointerId);
    el.classList.add('dragging','selected');

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
  }

  function finishDrag(event){
    if(!drag||event.pointerId!==drag.pointerId) return;
    const sourceId=drag.id;
    const moved=drag.moved;
    const previousSelected=drag.previousSelected;
    drag.el.classList.remove('dragging');
    drag.el.style.transform='';
    drag.el.style.pointerEvents='none';
    const target=document.elementFromPoint(event.clientX,event.clientY);
    drag.el.style.pointerEvents='';
    drag=null;
    document.querySelectorAll('.candidate').forEach(el=>el.classList.remove('candidate'));

    if(!moved){
      state.selectedBubbleId=previousSelected;
      const result=G.selectBubble(state,sourceId);
      if(result.choices){
        pendingChoice={sourceId:result.sourceId,targetId:result.targetId,recipes:result.choices};
      }
      render();
      return;
    }

    const bubbleTarget=target&&target.closest('.organic-bubble');
    if(bubbleTarget&&bubbleTarget.dataset.bubbleId!==sourceId){
      const recipes=G.availableCombos(state,sourceId,bubbleTarget.dataset.bubbleId);
      if(recipes.length===1){
        G.combine(state,sourceId,bubbleTarget.dataset.bubbleId,recipes[0].id);
        render();
        return;
      }
      if(recipes.length>1){
        pendingChoice={sourceId,targetId:bubbleTarget.dataset.bubbleId,recipes};
        render();
        return;
      }
    }

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
    render();
  }

  function bind(){
    document.getElementById('openMenu').onclick=()=>{menuOpen=true;render();};
    const next=document.getElementById('nextPhase');
    if(next) next.onclick=()=>{
      if(G.nextPhase(state)){
        pendingChoice=null;
        menuOpen=false;
        lastToastEventId=null;
        render();
        restartRain();
      }
    };

    const close=document.getElementById('closeMenu');
    if(close) close.onclick=()=>{menuOpen=false;render();};

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
      render();restartRain();
    };

    const restartCampaign=document.getElementById('restartCampaign');
    if(restartCampaign) restartCampaign.onclick=()=>{
      state=G.createGame(editorMode);
      homeOpen=true;
      menuOpen=false;pendingChoice=null;lastToastEventId=null;
      rainGeneration+=1;
      if(rainTimer) clearTimeout(rainTimer);
      document.getElementById('falling-layer')?.replaceChildren();
      render();
    };

    document.querySelectorAll('[data-phase]').forEach(el=>{
      el.onclick=()=>{
        if(G.jumpToPhase(state,Number(el.dataset.phase))){
          menuOpen=false;pendingChoice=null;lastToastEventId=null;
          render();restartRain();
        }
      };
    });

    const field=document.getElementById('soupPond');
    if(field&&!compartmentActive()){
      field.addEventListener('pointerdown',event=>{
        if(event.target.closest('.organic-bubble')) return;
        if(!state.selectedBubbleId) return;
        const released=G.releaseBubble(state,state.selectedBubbleId);
        if(released) createReleasedMatter(released.resource,event.clientX,event.clientY);
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
    if(clear) clear.onclick=()=>{state.selectedBubbleId=null;render();};

    document.querySelectorAll('[data-recipe-choice]').forEach(el=>{
      el.onclick=()=>{
        if(pendingChoice) G.combine(state,pendingChoice.sourceId,pendingChoice.targetId,el.dataset.recipeChoice);
        pendingChoice=null;render();
      };
    });

    const cancel=document.getElementById('cancelChoice');
    if(cancel) cancel.onclick=()=>{pendingChoice=null;render();};
  }

  eventTickTimer=setInterval(tickEvent,250);
  render();
  if(!homeOpen) restartRain();
})();