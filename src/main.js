(function () {
  const G=window.SopaGame;
  let state=G.createGame();
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
    return '--x:'+b.x+'%;--y:'+b.y+'%;--size:'+b.size+'px;--drift:'+b.drift+'ms;--delay:'+b.delay+'ms;--ring:'+ringFor(b.resource)+';';
  }

  function isCandidate(b){
    if(!state.selectedBubbleId||state.selectedBubbleId===b.id) return false;
    return G.availableCombos(state,state.selectedBubbleId,b.id).length>0;
  }

  function renderBubble(b){
    const selected=state.selectedBubbleId===b.id;
    const candidate=isCandidate(b);
    return '<button class="organic-bubble'+
      (b.isNew?' born':'')+
      (selected?' selected':'')+
      (candidate?' candidate':'')+
      '" data-bubble-id="'+b.id+'" data-resource="'+esc(b.resource)+'" style="'+bubbleStyle(b)+'" aria-label="'+esc(b.resource)+'">'+
      '<span class="bubble-shine"></span><strong>'+esc(b.resource)+'</strong>'+
      '</button>';
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
    const remaining=Math.max(0,active.expiresAt-Date.now());
    const seconds=Math.ceil(remaining/1000);
    return '<div class="active-event-badge '+active.className+'"><span>'+active.icon+'</span><div><strong>'+esc(active.name)+'</strong><small id="activeEventCountdown">'+seconds+' s restantes</small></div></div>';
  }

  function renderContext(){
    const context=G.selectedContext(state);
    if(!context){
      return '<section class="info-panel panel">'+
        '<div class="info-tile idle"><span>SOPA</span><strong>+</strong><small>capture matéria</small></div>'+
        '<div class="info-copy"><strong>Capture os átomos que caem</strong><p>Clique em um átomo no alto da tela para trazê-lo à sopa. Depois clique em ingredientes compatíveis em sequência ou arraste um sobre o outro.</p></div>'+
      '</section>';
    }

    const b=context.bubble;
    const available=context.available.length
      ? context.available.map(r=>'<div class="reaction-line available"><span>'+esc(partnerName(r,b.resource))+'</span><strong>'+esc(r.label)+'</strong></div>').join('')
      : '<div class="context-empty">Nenhuma reação disponível agora.</div>';

    const blocked=context.blocked.length
      ? '<div class="blocked-title">Aguardando evento</div>'+
        context.blocked.slice(0,4).map(r=>'<div class="reaction-line blocked"><span>'+esc(partnerName(r,b.resource))+'</span><strong>'+esc(r.label)+'</strong></div>').join('')
      : '';

    return '<section class="info-panel panel">'+
      '<div class="info-tile selected-info" style="--tile:'+ringFor(b.resource)+'"><span>SELECIONADO</span><strong>'+esc(b.resource)+'</strong><small>matéria na sopa</small></div>'+
      '<div class="info-copy"><div class="info-context-title">Pode reagir agora com</div>'+available+blocked+
        '<div class="context-actions"><button id="clearSelection" class="context-action secondary">Limpar seleção</button></div>'+
      '</div>'+
    '</section>';
  }

  function renderPhaseMenu(){
    return G.PHASES.map((p,index)=>{
      const unlocked=index<=state.unlockedPhase;
      const current=index===state.phaseIndex;
      return '<button class="phase-list-item '+(current?'current ':'')+(unlocked?'':'locked')+'" data-phase="'+index+'" '+(unlocked?'':'disabled')+'>'+
        '<span>'+(index+1)+'</span><div><strong>'+esc(p.title)+'</strong><small>'+esc(p.chapter)+'</small></div>'+
        '<em>'+(current?'ATUAL':(unlocked?'ABERTA':'BLOQUEADA'))+'</em>'+
      '</button>';
    }).join('');
  }

  function renderMenu(){
    if(!menuOpen) return '';
    const p=G.phase(state);
    return '<div class="modal-backdrop"><div class="menu-card">'+
      '<div class="menu-head"><div><p class="eyebrow">Campanha singleplayer</p><h2>Fases</h2></div><button id="closeMenu" class="menu-close">Voltar</button></div>'+
      '<p class="menu-intro">Cada fase começa com a sopa vazia. Somente átomos apropriados àquela etapa caem do topo; eventos aparecem como losangos luminosos.</p>'+
      '<section class="menu-section"><div class="phase-list">'+renderPhaseMenu()+'</div></section>'+
      '<section class="menu-actions"><button id="restartPhase" class="menu-action">Reiniciar '+esc(p.title)+'</button><button id="restartCampaign" class="menu-action danger">Reiniciar campanha</button></section>'+
      '<section class="menu-section"><strong>Registro da sopa</strong><div class="history-list">'+state.log.slice(0,20).map(line=>'<p>'+esc(line)+'</p>').join('')+'</div></section>'+
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
      return '<div class="phase-complete-panel final"><small>CAMPANHA CONCLUÍDA</small><strong>VIDA<br>EMERGENTE</strong><span>A integração prebiótica foi alcançada.</span></div>';
    }
    return '<button class="phase-next" id="nextPhase"><small>OBJETIVO CONCLUÍDO</small><strong>PRÓXIMA<br>FASE</strong></button>';
  }

  function render(){
    G.expireEvent(state);
    const app=document.getElementById('app');
    const p=G.phase(state);
    const objective=G.objective(state);

    app.innerHTML=
      '<div class="app single-app">'+
        '<header class="topbar"><div class="phase-card"><small>FASE '+(state.phaseIndex+1)+' DE '+G.PHASES.length+'</small><strong>'+esc(p.title)+'</strong><span>'+esc(p.chapter)+'</span></div><button class="menu-btn" id="openMenu">Menu</button></header>'+
        '<section class="objective-card"><strong>'+esc(objective.title)+'</strong><span class="objective-formula">'+esc(objective.formula)+'</span><small>'+esc(objective.hint)+'</small></section>'+
        progressMarkup(objective)+
        renderEventStatus()+
        '<section class="arena-shell"><div class="primordial-pond single-pond" id="soupPond">'+
          '<div class="water-caustic caustic-a"></div><div class="water-caustic caustic-b"></div>'+
          state.soup.map(renderBubble).join('')+
          '<div class="pond-caption"><strong>SOPA PRIMORDIAL</strong><span>'+state.soup.length+' bolhas capturadas</span></div>'+
          renderPhaseCompletion()+
        '</div></section>'+
        renderContext()+
      '</div>'+
      renderMenu()+renderChoice();

    bind();
    emitEventToast();
    state.soup.forEach(b=>{b.isNew=false;});
  }

  function createFaller(){
    if(state.stageComplete||menuOpen) return;
    const layer=document.getElementById('falling-layer');
    if(!layer) return;

    const spec=G.nextFaller(state);
    const node=document.createElement('button');
    const x=6+Math.random()*88;
    const duration=9+Math.random()*5;
    node.style.setProperty('--fall-x',x+'vw');
    node.style.setProperty('--fall-duration',duration+'s');

    if(spec.kind==='event'){
      const event=G.EVENTS[spec.value];
      node.className='falling-object falling-event '+event.className;
      node.dataset.kind='event';
      node.dataset.value=spec.value;
      node.innerHTML='<span>'+event.icon+'</span><small>'+esc(event.name)+'</small>';
      node.setAttribute('aria-label','Evento '+event.name);
    }else{
      node.className='falling-object falling-atom atom-'+spec.value.toLowerCase();
      node.dataset.kind='atom';
      node.dataset.value=spec.value;
      node.innerHTML='<strong>'+esc(spec.value)+'</strong>';
      node.setAttribute('aria-label','Capturar '+spec.value);
    }

    node.onclick=function(){
      if(node.dataset.kind==='atom'){
        G.captureAtom(state,node.dataset.value);
      }else{
        G.activateEvent(state,node.dataset.value);
      }
      node.classList.add('captured');
      setTimeout(()=>node.remove(),180);
      render();
    };

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
      if(token===rainGeneration) createFaller();
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
    if(active&&countdown){
      countdown.textContent=Math.max(0,Math.ceil((active.expiresAt-Date.now())/1000))+' s restantes';
    }
  }

  function startDrag(event,el){
    if(event.button!==undefined&&event.button!==0) return;
    if(state.stageComplete) return;
    const id=el.dataset.bubbleId;
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
      }else if(recipes.length>1){
        pendingChoice={sourceId,targetId:bubbleTarget.dataset.bubbleId,recipes};
      }
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
        restartRain();
        render();
      }
    };

    const close=document.getElementById('closeMenu');
    if(close) close.onclick=()=>{menuOpen=false;render();};

    const restartPhase=document.getElementById('restartPhase');
    if(restartPhase) restartPhase.onclick=()=>{
      G.restartPhase(state);
      menuOpen=false;pendingChoice=null;lastToastEventId=null;
      restartRain();render();
    };

    const restartCampaign=document.getElementById('restartCampaign');
    if(restartCampaign) restartCampaign.onclick=()=>{
      state=G.createGame();
      menuOpen=false;pendingChoice=null;lastToastEventId=null;
      restartRain();render();
    };

    document.querySelectorAll('[data-phase]').forEach(el=>{
      el.onclick=()=>{
        if(G.jumpToPhase(state,Number(el.dataset.phase))){
          menuOpen=false;pendingChoice=null;lastToastEventId=null;
          restartRain();render();
        }
      };
    });

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
  restartRain();
})();