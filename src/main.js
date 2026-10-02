(function () {
  const G=window.SopaGame;
  let state=G.createGame();
  let drag=null;
  let pendingChoice=null;
  let menuOpen=false;
  let lastToastEventId=null;
  window.SopaToastQueue=window.SopaToastQueue||[];

  function esc(value){
    return String(value).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  function emitTurnToast(){
    const event=state.lastEvent;
    if(!event||event.id===lastToastEventId) return;
    lastToastEventId=event.id;
    if(window.SopaToast&&window.SopaToast.showEvent) window.SopaToast.showEvent(event);
    else window.SopaToastQueue.push(event);
  }

  function ringFor(resource){
    const colors=[...new Set(G.possibleRecipes(resource,state.environment[0]).map(r=>r.color))];
    if(!colors.length) return 'rgba(184,214,216,.38)';
    if(colors.length===1) return colors[0];
    const slice=100/colors.length;
    return 'conic-gradient('+colors.map((c,i)=>c+' '+(i*slice)+'% '+((i+1)*slice)+'%').join(',')+')';
  }

  function bubbleStyle(b){
    return '--x:'+b.x+'%;--y:'+b.y+'%;--size:'+b.size+'px;--drift:'+b.drift+'ms;--delay:'+b.delay+'ms;--ring:'+ringFor(b.resource)+';';
  }

  function isCandidate(b){
    if(!state.selectedBubbleId||state.selectedBubbleId===b.id||b.mystery) return false;
    return G.availableCombos(state,state.selectedBubbleId,b.id).length>0;
  }

  function renderBubble(b){
    const selected=state.selectedBubbleId===b.id;
    const candidate=isCandidate(b);
    return '<button class="organic-bubble'+
      (b.mystery?' mystery':'')+
      (b.isNew?' born':'')+
      (selected?' selected':'')+
      (candidate?' candidate':'')+
      '" data-bubble-id="'+b.id+'" data-resource="'+esc(b.resource)+'" data-mystery="'+(b.mystery?'1':'0')+'" style="'+bubbleStyle(b)+'" aria-label="'+(b.mystery?'Elemento desconhecido':esc(b.resource))+'">'+
      '<span class="bubble-shine"></span><strong>'+esc(b.resource)+'</strong>'+
      (b.mystery?'<small>arriscar</small>':'')+
      '</button>';
  }

  function renderEnvironment(){
    return state.environment.slice(0,4).map((icon,i)=>{
      const info=G.ENV_INFO[icon];
      return '<div class="mini-env '+info.className+(i===0?' current':'')+'" title="'+esc(info.name+': '+info.benefit)+'">'+
        '<span>'+icon+'</span><small>'+(i===0?info.name:'+'+i)+'</small></div>';
    }).join('');
  }

  function progressMarkup(objective){
    const max=Math.max(1,objective.progress.max);
    const pct=Math.min(100,(objective.progress.value/max)*100);
    return '<div class="stage-progress"><span>PROGRESSO</span><div class="progress-track"><div style="width:'+pct+'%"></div></div><strong>'+esc(objective.progress.label)+'</strong></div>';
  }

  function partnerName(recipe,resource){
    return recipe.a===resource?recipe.b:recipe.a;
  }

  function renderContext(){
    const context=G.selectedContext(state);
    if(!context){
      return '<section class="info-panel panel">'+
        '<div class="info-tile idle"><span>SOPA</span><strong>?</strong><small>selecione matéria</small></div>'+
        '<div class="info-copy"><strong>Toque em uma bolha</strong><p>Uma bolha selecionada ganha contorno verde. Parceiros que podem reagir agora também ficam verdes. Arraste uma sobre a outra para combinar.</p></div>'+
      '</section>';
    }

    const b=context.bubble;
    const available=context.available.length
      ? context.available.map(r=>'<div class="reaction-line available"><span>'+esc(partnerName(r,b.resource))+'</span><strong>'+esc(r.label)+'</strong></div>').join('')
      : '<div class="context-empty">Nenhuma reação disponível neste ambiente.</div>';

    const blocked=context.blocked.length
      ? '<div class="blocked-title">Em outro ambiente</div>'+
        context.blocked.slice(0,4).map(r=>'<div class="reaction-line blocked"><span>'+esc(partnerName(r,b.resource))+'</span><strong>'+esc(r.label)+'</strong></div>').join('')
      : '';

    return '<section class="info-panel panel">'+
      '<div class="info-tile selected-info" style="--tile:'+ringFor(b.resource)+'"><span>SELECIONADO</span><strong>'+esc(b.resource)+'</strong><small>matéria na sopa</small></div>'+
      '<div class="info-copy"><div class="info-context-title">Pode reagir agora com</div>'+available+blocked+
        '<div class="context-actions">'+
          '<button id="contextPerturb" class="context-action perturb" '+(state.perturbed?'disabled':'')+'>Perturbar ambiente</button>'+
          '<button id="clearSelection" class="context-action secondary">Limpar seleção</button>'+
        '</div>'+
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
      '<p class="menu-intro">Cada fase monta uma sopa controlada com toda a matéria necessária para a receita principal, mais elementos extras para experimentação.</p>'+
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
    const app=document.getElementById('app');
    const p=G.phase(state);
    const objective=G.objective(state);
    const current=state.environment[0];
    const info=G.ENV_INFO[current];

    app.innerHTML=
      '<div class="app single-app">'+
        '<header class="topbar"><div class="phase-card"><small>FASE '+(state.phaseIndex+1)+' DE '+G.PHASES.length+' · TURNO '+state.phaseTurn+'</small><strong>'+esc(p.title)+'</strong><span>'+esc(p.chapter)+'</span></div><button class="menu-btn" id="openMenu">Menu</button></header>'+
        '<section class="objective-card"><strong>'+esc(objective.title)+'</strong><span class="objective-formula">'+esc(objective.formula)+'</span><small>'+esc(objective.hint)+'</small></section>'+
        progressMarkup(objective)+
        '<section class="environment-strip"><div class="event-now"><small>AMBIENTE</small><strong>'+current+' '+esc(info.name)+'</strong></div><div class="mini-env-track">'+renderEnvironment()+'</div></section>'+
        '<section class="arena-shell"><div class="primordial-pond single-pond" id="soupPond">'+
          '<div class="water-caustic caustic-a"></div><div class="water-caustic caustic-b"></div>'+
          state.soup.map(renderBubble).join('')+
          '<div class="pond-caption"><strong>SOPA PRIMORDIAL</strong><span>'+state.soup.length+' bolhas presentes</span></div>'+
          renderPhaseCompletion()+
        '</div></section>'+
        renderContext()+
        '<button class="end-turn-main" id="endTurn" '+(state.stageComplete?'disabled':'')+'>ENCERRAR TURNO</button>'+
      '</div>'+
      renderMenu()+renderChoice();

    bind();
    emitTurnToast();
    state.soup.forEach(b=>{b.isNew=false;});
  }

  function clearHighlights(){
    document.querySelectorAll('.candidate').forEach(el=>{
      if(el.dataset.bubbleId!==state.selectedBubbleId) el.classList.remove('candidate');
    });
  }

  function startDrag(event,el){
    if(event.button!==undefined&&event.button!==0) return;
    if(el.dataset.mystery==='1'||state.stageComplete) return;
    const id=el.dataset.bubbleId;
    if(state.selectedBubbleId!==id) G.selectBubble(state,id);
    drag={id,el,startX:event.clientX,startY:event.clientY,moved:false,pointerId:event.pointerId};
    el.setPointerCapture&&el.setPointerCapture(event.pointerId);
    el.classList.add('dragging','selected');
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
    drag.el.classList.remove('dragging');
    drag.el.style.transform='';
    drag.el.style.pointerEvents='none';
    const target=document.elementFromPoint(event.clientX,event.clientY);
    drag.el.style.pointerEvents='';
    drag=null;
    clearHighlights();

    if(!moved){
      render();
      return;
    }

    const bubbleTarget=target&&target.closest('.organic-bubble');
    if(bubbleTarget&&bubbleTarget.dataset.bubbleId!==sourceId&&bubbleTarget.dataset.mystery!=='1'){
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
    document.getElementById('endTurn').onclick=()=>{G.endTurn(state);pendingChoice=null;render();};

    const next=document.getElementById('nextPhase');
    if(next) next.onclick=()=>{G.nextPhase(state);lastToastEventId=null;render();};

    const close=document.getElementById('closeMenu');
    if(close) close.onclick=()=>{menuOpen=false;render();};

    const restartPhase=document.getElementById('restartPhase');
    if(restartPhase) restartPhase.onclick=()=>{G.restartPhase(state);menuOpen=false;pendingChoice=null;lastToastEventId=null;render();};

    const restartCampaign=document.getElementById('restartCampaign');
    if(restartCampaign) restartCampaign.onclick=()=>{state=G.createGame();menuOpen=false;pendingChoice=null;lastToastEventId=null;render();};

    document.querySelectorAll('[data-phase]').forEach(el=>{
      el.onclick=()=>{
        if(G.jumpToPhase(state,Number(el.dataset.phase))){
          menuOpen=false;pendingChoice=null;lastToastEventId=null;render();
        }
      };
    });

    document.querySelectorAll('.organic-bubble').forEach(el=>{
      if(el.dataset.mystery==='1'){
        el.onclick=()=>{G.revealMystery(state,el.dataset.bubbleId);render();};
      }else{
        el.addEventListener('pointerdown',e=>startDrag(e,el));
      }
    });

    window.onpointermove=moveDrag;
    window.onpointerup=finishDrag;
    window.onpointercancel=finishDrag;

    const perturb=document.getElementById('contextPerturb');
    if(perturb) perturb.onclick=()=>{G.perturbSelected(state);render();};

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

  render();
})();