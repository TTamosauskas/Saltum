(function () {
  const G = window.SopaGame;
  let state = G.createGame();
  let drag = null;
  let pendingChoice = null;
  let menuOpen = false;
  let lastToastEventId = null;
  window.SopaToastQueue = window.SopaToastQueue || [];

  function esc(value) {
    return String(value).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  function emitTurnToast() {
    const event=state.lastEvent;
    if(!event || event.id===lastToastEventId) return;
    lastToastEventId=event.id;
    if(window.SopaToast && window.SopaToast.showEvent) window.SopaToast.showEvent(event);
    else window.SopaToastQueue.push(event);
  }

  function routeColor(resource) {
    if(resource==='Aminoácidos') return '#ffad79';
    if(resource==='Ácidos graxos') return '#f1d069';
    if(resource==='Nucleotídeos') return '#b895ff';
    if(resource==='CO') return '#ff9c70';
    if(resource==='H₂O') return '#69e0df';
    if(resource==='H₂') return '#62d6ff';
    return 'rgba(184,214,216,.42)';
  }

  function bubbleStyle(b) {
    return '--x:'+b.x+'%;--y:'+b.y+'%;--size:'+b.size+'px;--drift:'+b.drift+'ms;--delay:'+b.delay+'ms;--ring:'+routeColor(b.resource)+';';
  }

  function selectedCandidate(b) {
    const player=state.players[state.activePlayer];
    const selected=player.selectedBubbleId;
    if(!selected || selected===b.id) return false;
    return G.availableCombos(state,selected,b.id).length>0;
  }

  function renderBubble(b,kind) {
    const player=state.players[state.activePlayer];
    const selected=kind==='hand' && player.selectedBubbleId===b.id;
    const candidate=kind==='hand' && selectedCandidate(b);
    return '<button class="organic-bubble '+kind+'-bubble'+
      (b.mystery?' mystery':'')+(b.isNew?' born':'')+
      (selected?' selected':'')+(candidate?' candidate':'')+'" '+
      'data-bubble-id="'+b.id+'" data-resource="'+esc(b.resource)+'" data-kind="'+kind+'" '+
      'style="'+bubbleStyle(b)+'" aria-label="'+(b.mystery?'Elemento desconhecido':esc(b.resource))+'">'+
      '<span class="bubble-shine"></span><strong>'+esc(b.resource)+'</strong>'+
      (b.mystery?'<small>?</small>':'')+
      '</button>';
  }

  function renderEnvironmentCompact() {
    return state.environment.slice(0,4).map((icon,i)=>{
      const info=G.ENV_INFO[icon];
      return '<div class="mini-env '+info.className+(i===0?' current':'')+'" title="'+esc(info.name+': '+info.benefit)+'">'+
        '<span>'+icon+'</span><small>'+(i===0?info.name:'+'+i)+'</small></div>';
    }).join('');
  }

  function objectiveProgress(objective) {
    const value=objective.progress.value;
    const max=Math.max(1,objective.progress.max);
    const pct=Math.min(100,(value/max)*100);
    return '<div class="stage-progress"><span>PROGRESSO</span><div class="progress-track"><div style="width:'+pct+'%"></div></div><strong>'+esc(objective.progress.label)+'</strong></div>';
  }

  function partnerName(recipe,resource) {
    return recipe.a===resource ? recipe.b : recipe.a;
  }

  function renderContext() {
    const context=G.selectedContext(state);
    const player=state.players[state.activePlayer];
    if(!context) {
      return '<section class="info-panel panel"><div class="info-tile idle"><span>MATÉRIA</span><strong>?</strong><small>Selecione uma bolha</small></div>'+
        '<div class="info-copy"><strong>Explore sua poça</strong><p>Toque em uma bolha para destacar apenas os parceiros que podem reagir com ela agora. Você também pode arrastá-la diretamente.</p></div></section>';
    }

    const b=context.bubble;
    const available=context.available.length
      ? context.available.map(r=>'<div class="reaction-line available"><span>'+esc(partnerName(r,b.resource))+'</span><strong>'+esc(r.label)+'</strong></div>').join('')
      : '<div class="context-empty">Nenhuma reação disponível neste ambiente.</div>';
    const blocked=context.blocked.length
      ? '<div class="blocked-title">Outras possibilidades</div>'+context.blocked.slice(0,3).map(r=>'<div class="reaction-line blocked"><span>'+esc(partnerName(r,b.resource))+'</span><strong>'+esc(r.label)+'</strong></div>').join('')
      : '';

    const depositActions=context.deposits.map(d=>
      '<button class="context-action project-action" data-project="'+d.id+'" '+(d.enabled===false?'disabled':'')+'>'+esc(d.label)+'</button>'
    ).join('');

    return '<section class="info-panel panel"><div class="info-tile selected-info" style="--tile:'+routeColor(b.resource)+'">'+
      '<span>SELECIONADO</span><strong>'+esc(b.resource)+'</strong><small>matéria da sua poça</small></div>'+
      '<div class="info-copy"><div class="info-context-title">Pode reagir agora com</div>'+available+blocked+
      '<div class="context-actions">'+depositActions+
      '<button id="contextPerturb" class="context-action perturb" '+(player.perturbed?'disabled':'')+'>Perturbar ambiente</button>'+
      '<button id="clearSelection" class="context-action secondary">Limpar seleção</button></div></div></section>';
  }

  function renderRoutesMenu() {
    const player=state.players[state.activePlayer];
    const discovered=G.routeDiscovery(player);
    const keys=['peptide','membrane','metabolism','rna'];
    return keys.map(key=>{
      const route=G.ROUTES[key];
      const open=discovered[key];
      if(!open) {
        return '<div class="route-card locked"><span>Possibilidade latente</span><strong>?</strong><small>Surge quando a química correspondente aparece na sua poça.</small></div>';
      }
      const progress=G.routeProgress(player,key);
      const pct=Math.min(100,(progress.value/progress.max)*100);
      const focused=player.focus===key;
      return '<div class="route-card '+(focused?'focused':'')+'" style="--route:'+route.color+'">'+
        '<span>'+esc(route.short)+'</span><strong>'+esc(route.name)+'</strong>'+
        '<div class="route-meter"><i style="width:'+pct+'%"></i></div><small>'+esc(progress.label)+'</small>'+
        '<button data-focus="'+key+'">'+(focused?'Foco atual':'Acompanhar esta rota')+'</button></div>';
    }).join('');
  }

  function renderPlayersMenu() {
    return state.players.map((p,i)=>{
      return '<div class="player-menu-row '+(i===state.activePlayer?'active':'')+'"><div><span>'+esc(p.name)+'</span><strong>'+esc(G.leadingRoute(p))+'</strong></div>'+
        '<small>QT45 '+(p.rnaModules*9)+'/45 · Membrana '+p.membrane+'/2 · Metabolismo '+p.metabolism+'/2 · Peptídeos '+p.peptide+'/3</small></div>';
    }).join('');
  }

  function renderMenu() {
    if(!menuOpen) return '';
    const player=state.players[state.activePlayer];
    return '<div class="modal-backdrop"><div class="menu-card">'+
      '<div class="menu-head"><div><p class="eyebrow">Sopa Primordial</p><h2>Evolução e registro</h2></div><button id="closeMenu" class="menu-close">Voltar</button></div>'+
      '<section class="menu-section"><div class="menu-section-title"><strong>Rotas emergentes</strong><button data-focus="auto" class="'+(player.focus==='auto'?'active':'')+'">Seguir oportunidade</button></div><div class="route-grid">'+renderRoutesMenu()+'</div></section>'+
      '<section class="menu-section"><strong>Jogadores</strong><div class="players-menu">'+renderPlayersMenu()+'</div></section>'+
      '<section class="menu-section"><strong>Registro da sopa</strong><div class="history-list">'+state.log.slice(0,18).map(line=>'<p>'+esc(line)+'</p>').join('')+'</div></section>'+
    '</div></div>';
  }

  function renderChoice() {
    if(!pendingChoice) return '';
    return '<div class="choice-backdrop"><div class="choice-card"><p class="eyebrow">Duas possibilidades</p><h2>Escolha o resultado</h2><div class="choice-options">'+
      pendingChoice.recipes.map(r=>'<button class="choice-option" data-recipe-choice="'+r.id+'" style="--choice:'+r.color+'"><strong>'+esc(r.label)+'</strong><small>'+((r.special==='metabolism')?'Avança a rota metabólica':'Cria uma nova bolha')+'</small></button>').join('')+
      '</div><button class="ghost" id="cancelChoice">Cancelar</button></div></div>';
  }

  function render() {
    const app=document.getElementById('app');
    const player=state.players[state.activePlayer];
    const objective=G.getObjective(state);
    const current=state.environment[0];
    const info=G.ENV_INFO[current];

    app.innerHTML=
      '<div class="app compact-app">'+
        '<header class="topbar"><div class="phase-card"><small>'+esc(player.name)+' · RODADA '+state.round+'</small><strong>'+esc(objective.kicker)+'</strong><span>'+current+' '+esc(info.name)+'</span></div><button class="menu-btn" id="openMenu">Menu</button></header>'+

        '<section class="objective-card"><strong>'+esc(objective.title)+'</strong><span class="objective-formula">'+esc(objective.formula)+'</span><small>'+esc(objective.hint)+'</small></section>'+
        objectiveProgress(objective)+

        '<section class="environment-strip"><div class="event-now"><small>AMBIENTE</small><strong>'+current+' '+esc(info.name)+'</strong></div><div class="mini-env-track">'+renderEnvironmentCompact()+'</div></section>'+

        '<section class="arena-shell"><div class="primordial-pond simplified-pond" id="soupPond">'+
          '<div class="water-caustic caustic-a"></div><div class="water-caustic caustic-b"></div>'+
          state.soup.map(b=>renderBubble(b,'soup')).join('')+
          '<div class="pond-caption"><strong>SOPA PRIMORDIAL</strong><span>'+(player.collected?'coleta usada':'toque para coletar')+'</span></div>'+
        '</div></section>'+

        '<section class="hand-section"><div class="hand-heading"><div><small>SUA MATÉRIA</small><strong>Poça da mão</strong></div><span>'+player.hand.length+' bolhas</span></div>'+
          '<div class="hand-pond compact-hand" id="handPond">'+player.hand.map(b=>renderBubble(b,'hand')).join('')+'</div></section>'+

        renderContext()+
        '<button class="end-turn-main" id="endTurn">ENCERRAR TURNO</button>'+
      '</div>'+
      renderMenu()+renderChoice()+
      (state.winner!==null?'<div class="victory"><div class="victory-card"><p class="eyebrow">Vida emergente</p><h2>'+esc(state.players[state.winner].name)+' integrou um sistema viável.</h2><p>QT45 completa, protocélula formada e metabolismo sustentado.</p><button class="primary" id="restart">Jogar novamente</button></div></div>':'');

    bind();
    emitTurnToast();
    state.soup.forEach(b=>{b.isNew=false;});
    state.players.forEach(p=>p.hand.forEach(b=>{b.isNew=false;}));
  }

  function highlightPartners(sourceId) {
    document.querySelectorAll('.hand-bubble').forEach(el=>{
      if(el.dataset.bubbleId===sourceId) return;
      if(G.availableCombos(state,sourceId,el.dataset.bubbleId).length) el.classList.add('candidate');
    });
    const context=G.selectedContext(state);
    if(context && context.bubble.id===sourceId) {
      document.querySelectorAll('.project-action:not(:disabled)').forEach(el=>el.classList.add('candidate-action'));
    }
  }

  function clearHighlights() {
    document.querySelectorAll('.candidate-action').forEach(el=>el.classList.remove('candidate-action'));
  }

  function startDrag(event,el) {
    if(event.button!==undefined && event.button!==0) return;
    const id=el.dataset.bubbleId;
    if(state.players[state.activePlayer].selectedBubbleId!==id) G.selectHandBubble(state,id);
    drag={id:id,el:el,startX:event.clientX,startY:event.clientY,moved:false,pointerId:event.pointerId};
    el.setPointerCapture && el.setPointerCapture(event.pointerId);
    el.classList.add('dragging','selected');
    highlightPartners(id);
  }

  function moveDrag(event) {
    if(!drag || event.pointerId!==drag.pointerId) return;
    const dx=event.clientX-drag.startX, dy=event.clientY-drag.startY;
    if(Math.abs(dx)+Math.abs(dy)>7) drag.moved=true;
    drag.el.style.transform='translate('+dx+'px,'+dy+'px) scale(1.08)';
  }

  function finishDrag(event) {
    if(!drag || event.pointerId!==drag.pointerId) return;
    const sourceId=drag.id;
    const wasMoved=drag.moved;
    drag.el.classList.remove('dragging');
    drag.el.style.transform='';
    drag.el.style.pointerEvents='none';
    const target=document.elementFromPoint(event.clientX,event.clientY);
    drag.el.style.pointerEvents='';
    clearHighlights();
    drag=null;

    if(!wasMoved) {
      render();
      return;
    }

    const bubbleTarget=target && target.closest('.hand-bubble');
    if(bubbleTarget && bubbleTarget.dataset.bubbleId!==sourceId) {
      const recipes=G.availableCombos(state,sourceId,bubbleTarget.dataset.bubbleId);
      if(recipes.length===1) G.combine(state,sourceId,bubbleTarget.dataset.bubbleId,recipes[0].id);
      else if(recipes.length>1) pendingChoice={sourceId:sourceId,targetId:bubbleTarget.dataset.bubbleId,recipes:recipes};
      render();
      return;
    }

    const project=target && target.closest('[data-project]');
    if(project && !project.disabled) G.deposit(state,sourceId,project.dataset.project);
    render();
  }

  function bind() {
    document.getElementById('openMenu').onclick=()=>{menuOpen=true;render();};
    document.getElementById('endTurn').onclick=()=>{G.endTurn(state);pendingChoice=null;menuOpen=false;render();};

    const closeMenu=document.getElementById('closeMenu');
    if(closeMenu) closeMenu.onclick=()=>{menuOpen=false;render();};

    document.querySelectorAll('[data-focus]').forEach(el=>{
      el.onclick=()=>{G.setFocus(state,el.dataset.focus);menuOpen=false;render();};
    });

    document.querySelectorAll('.soup-bubble').forEach(el=>{
      el.onclick=()=>{G.collect(state,el.dataset.bubbleId);render();};
    });

    document.querySelectorAll('.hand-bubble').forEach(el=>{
      el.addEventListener('pointerdown',e=>startDrag(e,el));
    });
    window.onpointermove=moveDrag;
    window.onpointerup=finishDrag;
    window.onpointercancel=finishDrag;

    const perturb=document.getElementById('contextPerturb');
    if(perturb) perturb.onclick=()=>{G.perturbSelected(state);render();};

    const clear=document.getElementById('clearSelection');
    if(clear) clear.onclick=()=>{state.players[state.activePlayer].selectedBubbleId=null;render();};

    document.querySelectorAll('.project-action').forEach(el=>{
      el.onclick=()=>{
        const selected=state.players[state.activePlayer].selectedBubbleId;
        if(selected) G.deposit(state,selected,el.dataset.project);
        render();
      };
    });

    document.querySelectorAll('[data-recipe-choice]').forEach(el=>{
      el.onclick=()=>{
        if(pendingChoice) G.combine(state,pendingChoice.sourceId,pendingChoice.targetId,el.dataset.recipeChoice);
        pendingChoice=null;
        render();
      };
    });

    const cancel=document.getElementById('cancelChoice');
    if(cancel) cancel.onclick=()=>{pendingChoice=null;render();};

    const restart=document.getElementById('restart');
    if(restart) restart.onclick=()=>{state=G.createGame();pendingChoice=null;menuOpen=false;lastToastEventId=null;render();};
  }

  render();
})();