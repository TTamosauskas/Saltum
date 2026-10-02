(function () {
  const G = window.SopaGame;
  let state = G.createGame();
  let drag = null;
  let pendingChoice = null;
  let lastToastEventId = null;
  window.SopaToastQueue = window.SopaToastQueue || [];

  function emitTurnToast() {
    const event = state.lastEvent;
    if(!event || event.id===lastToastEventId) return;
    lastToastEventId=event.id;
    if(window.SopaToast && window.SopaToast.showEvent) window.SopaToast.showEvent(event);
    else window.SopaToastQueue.push(event);
  }

  function esc(value) {
    return String(value).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  function track(label,value,max,note) {
    const pct=Math.min(100,(value/max)*100);
    return '<div class="track"><div class="track-row"><span>'+label+'</span><small>'+note+'</small></div><div class="track-bar"><i style="width:'+pct+'%"></i></div></div>';
  }

  function ringFor(resource) {
    const colors=[...new Set(G.possibleRecipes(resource,state.environment[0]).map(r=>r.color))];
    if(!colors.length) return 'rgba(157,190,193,.38)';
    if(colors.length===1) return colors[0];
    const slice=100/colors.length;
    return 'conic-gradient('+colors.map((c,i)=>c+' '+(i*slice)+'% '+((i+1)*slice)+'%').join(',')+')';
  }

  function bubbleStyle(b) {
    return '--x:'+b.x+'%;--y:'+b.y+'%;--size:'+b.size+'px;--drift:'+b.drift+'ms;--delay:'+b.delay+'ms;--ring:'+ringFor(b.resource)+';';
  }

  function renderBubble(b,kind) {
    const selected=kind==='hand' && state.players[state.activePlayer].selectedBubbleId===b.id;
    return '<button class="organic-bubble '+kind+'-bubble'+(b.mystery?' mystery':'')+(b.isNew?' born':'')+(selected?' selected':'')+'" '+
      'data-bubble-id="'+b.id+'" data-resource="'+esc(b.resource)+'" data-kind="'+kind+'" style="'+bubbleStyle(b)+'" aria-label="'+(b.mystery?'Elemento desconhecido':esc(b.resource))+'">'+
      '<span class="bubble-shine"></span><strong>'+esc(b.resource)+'</strong>'+
      (b.mystery?'<small>arriscar</small>':'')+
      '</button>';
  }

  function renderEnvironment() {
    return state.environment.map((icon,i)=>{
      const info=G.ENV_INFO[icon];
      return '<div class="env-token '+info.className+(i===0?' current':'')+'" title="'+esc(info.name+': '+info.benefit)+'"><span>'+icon+'</span><small>'+(i===0?'agora':'+'+i)+'</small></div>';
    }).join('');
  }

  function renderProjects(player) {
    return '<div class="project-dock">'+
      '<div class="drop-project project-peptide" data-project="peptide"><span>Peptídeos</span><strong>'+player.peptide+'/3</strong><small>solte aminoácidos</small></div>'+
      '<div class="drop-project project-membrane" data-project="membrane"><span>Protocélula</span><strong>'+player.membrane+'/2</strong><small>solte ácidos graxos</small></div>'+
      '<div class="drop-project project-rna'+(state.environment[0]==='◐'?' enabled':'')+'" data-project="rna"><span>QT45</span><strong>'+(player.rnaModules*9)+'/45 nt</strong><small>'+(state.environment[0]==='◐'?'solte nucleotídeos':'aguarde ◐')+'</small></div>'+
    '</div>';
  }

  function renderChoice() {
    if(!pendingChoice) return '';
    return '<div class="choice-backdrop"><div class="choice-card"><p class="eyebrow">Uma combinação, dois caminhos</p><h2>Escolha o resultado</h2><div class="choice-options">'+
      pendingChoice.recipes.map(r=>'<button class="choice-option" data-recipe-choice="'+r.id+'" style="--choice:'+r.color+'"><strong>'+esc(r.label)+'</strong><small>'+((r.special==='metabolism')?'Avança a rota metabólica':'Cria uma nova bolha')+'</small></button>').join('')+
      '</div><button class="ghost" id="cancelChoice">Cancelar</button></div></div>';
  }

  function render() {
    const app=document.getElementById('app');
    const active=state.players[state.activePlayer];
    const current=state.environment[0];
    const info=G.ENV_INFO[current];

    app.innerHTML=
      '<div class="app-shell organic-shell">'+
        '<header class="hero organic-hero"><div><p class="eyebrow">Ecossistema prebiótico</p><h1>Sopa Primordial</h1><p class="subtitle">Colete bolhas, combine matéria por arraste e dispute o ritmo do ambiente.</p></div><button class="ghost" id="newGame">Nova partida</button></header>'+
        '<section class="environment-ribbon panel"><div class="environment-copy"><span>Rodada '+state.round+'</span><strong>'+current+' '+info.name+'</strong><small>'+info.benefit+'</small></div><div class="environment-track">'+renderEnvironment()+'</div></section>'+

        '<section class="organic-table">'+
          '<div class="pond-column">'+
            '<div class="pond-title"><div><p class="eyebrow">Oferta compartilhada</p><h2>A Sopa Primordial</h2></div><span>'+(active.collected?'Coleta usada':'Escolha uma bolha')+'</span></div>'+
            '<div class="primordial-pond" id="soupPond">'+
              '<div class="water-caustic caustic-a"></div><div class="water-caustic caustic-b"></div>'+
              state.soup.map(b=>renderBubble(b,'soup')).join('')+
            '</div>'+
          '</div>'+

          '<aside class="player-side">'+
            '<div class="turn-card panel"><p class="eyebrow">Vez de</p><h2>'+esc(active.name)+'</h2><span>Rota dominante: '+G.leadingRoute(active)+'</span></div>'+
            '<div class="hand-pond-wrap">'+
              '<div class="pond-title compact"><div><p class="eyebrow">Sua matéria</p><h2>Poça da mão</h2></div><span>'+active.hand.length+' bolhas</span></div>'+
              '<div class="hand-pond" id="handPond">'+active.hand.map(b=>renderBubble(b,'hand')).join('')+'</div>'+
            '</div>'+
            '<div class="perturb-panel panel"><div><strong>Perturbar ambiente</strong><small>Selecione uma bolha da mão e sacrifique-a para remover o próximo ícone.</small></div>'+
              '<button id="perturbButton" class="perturb-button" '+((!active.selectedBubbleId||active.perturbed)?'disabled':'')+'>'+(active.perturbed?'Perturbação usada':'Perturbar')+'</button></div>'+
            renderProjects(active)+
            '<button class="primary end-turn" id="endTurn">Encerrar turno</button>'+
          '</aside>'+
        '</section>'+

        '<section class="progress-grid organic-progress">'+state.players.map((p,i)=>
          '<article class="panel player-progress '+(i===state.activePlayer?'active-player':'')+'"><div class="section-heading compact"><h2>'+esc(p.name)+'</h2><span>'+G.leadingRoute(p)+'</span></div>'+
          track('QT45',p.rnaModules,5,(p.rnaModules*9)+'/45 nt')+
          track('Protocélula',p.membrane,2,p.membrane+'/2')+
          track('Metabolismo',p.metabolism,2,p.metabolism+'/2')+
          track('Peptídeos',p.peptide,3,p.peptide+'/3')+
          '</article>').join('')+'</section>'+

        '<section class="panel legend-panel"><div><p class="eyebrow">Leitura química</p><h2>Bordas iguais indicam ingredientes compatíveis</h2></div><p>Ao arrastar uma bolha, os parceiros possíveis brilham na cor da reação. Eventos ambientais podem liberar ou bloquear combinações.</p></section>'+

        '<section class="panel log-panel"><div class="section-heading compact"><h2>Histórico</h2><span>'+state.log.length+' eventos</span></div><div class="log">'+state.log.slice(0,8).map(line=>'<p>'+esc(line)+'</p>').join('')+'</div></section>'+
      '</div>'+
      renderChoice()+
      (state.winner!==null?'<div class="victory"><div class="victory-card"><p class="eyebrow">Vida emergente</p><h2>'+esc(state.players[state.winner].name)+' integrou um sistema viável.</h2><p>QT45 completa, protocélula formada e metabolismo sustentado.</p><button class="primary" id="restart">Jogar novamente</button></div></div>':'');

    bind();
    emitTurnToast();
    state.soup.forEach(b=>{ b.isNew=false; });
    state.players.forEach(p=>p.hand.forEach(b=>{ b.isNew=false; }));
  }

  function highlightPartners(sourceId) {
    const player=state.players[state.activePlayer];
    const source=player.hand.find(b=>b.id===sourceId);
    if(!source) return;
    document.querySelectorAll('.hand-bubble').forEach(el=>{
      if(el.dataset.bubbleId===sourceId) return;
      const combos=G.availableCombos(state,sourceId,el.dataset.bubbleId);
      if(combos.length) {
        el.classList.add('compatible-target');
        el.style.setProperty('--match-color',combos[0].color);
      }
    });
    const resource=source.resource;
    document.querySelectorAll('.drop-project').forEach(el=>{
      const type=el.dataset.project;
      const valid=(type==='peptide'&&resource==='Aminoácidos')||(type==='membrane'&&resource==='Ácidos graxos')||(type==='rna'&&resource==='Nucleotídeos'&&state.environment[0]==='◐');
      if(valid) el.classList.add('compatible-target');
    });
  }

  function clearHighlights() {
    document.querySelectorAll('.compatible-target').forEach(el=>el.classList.remove('compatible-target'));
  }

  function startDrag(event,el) {
    if(event.button!==undefined && event.button!==0) return;
    const id=el.dataset.bubbleId;
    drag={id:id,el:el,startX:event.clientX,startY:event.clientY,moved:false,pointerId:event.pointerId};
    el.setPointerCapture && el.setPointerCapture(event.pointerId);
    el.classList.add('dragging');
    highlightPartners(id);
  }

  function moveDrag(event) {
    if(!drag || event.pointerId!==drag.pointerId) return;
    const dx=event.clientX-drag.startX, dy=event.clientY-drag.startY;
    if(Math.abs(dx)+Math.abs(dy)>6) drag.moved=true;
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
      G.selectHandBubble(state,sourceId);
      render();
      return;
    }

    const bubbleTarget=target && target.closest('.hand-bubble');
    if(bubbleTarget && bubbleTarget.dataset.bubbleId!==sourceId) {
      const recipes=G.availableCombos(state,sourceId,bubbleTarget.dataset.bubbleId);
      if(recipes.length===1) {
        G.combine(state,sourceId,bubbleTarget.dataset.bubbleId,recipes[0].id);
        render();
      } else if(recipes.length>1) {
        pendingChoice={sourceId:sourceId,targetId:bubbleTarget.dataset.bubbleId,recipes:recipes};
        render();
      } else {
        render();
      }
      return;
    }

    const project=target && target.closest('.drop-project');
    if(project) G.deposit(state,sourceId,project.dataset.project);
    render();
  }

  function bind() {
    document.getElementById('newGame').onclick=()=>{state=G.createGame();pendingChoice=null;render();};
    document.getElementById('endTurn').onclick=()=>{G.endTurn(state);pendingChoice=null;render();};

    const perturb=document.getElementById('perturbButton');
    perturb.onclick=()=>{G.perturbSelected(state);render();};

    const restart=document.getElementById('restart');
    if(restart) restart.onclick=()=>{state=G.createGame();pendingChoice=null;render();};

    document.querySelectorAll('.soup-bubble').forEach(el=>{
      el.onclick=()=>{G.collect(state,el.dataset.bubbleId);render();};
    });

    document.querySelectorAll('.hand-bubble').forEach(el=>{
      el.addEventListener('pointerdown',e=>startDrag(e,el));
    });
    window.onpointermove=moveDrag;
    window.onpointerup=finishDrag;
    window.onpointercancel=finishDrag;

    document.querySelectorAll('[data-recipe-choice]').forEach(el=>{
      el.onclick=()=>{
        if(pendingChoice) G.combine(state,pendingChoice.sourceId,pendingChoice.targetId,el.dataset.recipeChoice);
        pendingChoice=null;
        render();
      };
    });
    const cancel=document.getElementById('cancelChoice');
    if(cancel) cancel.onclick=()=>{pendingChoice=null;render();};
  }

  render();
})();