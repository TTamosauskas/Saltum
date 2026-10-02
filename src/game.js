(function () {
  const ATOMS = ['H','C','O','N','P'];

  const EVENTS = {
    '☀F': {
      icon:'☀',
      name:'Fotólise',
      className:'event-photolysis',
      duration:0,
      description:'Fotólise ativa: escolha uma molécula composta para desmontá-la em seus precursores.'
    },
    '☀': {
      icon:'☀',
      name:'UV',
      className:'event-uv',
      duration:14000,
      description:'Janela fotoquímica: aminoácidos e nucleotídeos ficam disponíveis.'
    },
    '⚡': {
      icon:'⚡',
      name:'Descarga elétrica',
      className:'event-lightning',
      duration:11000,
      description:'Pulso energético: a síntese de aminoácidos fica disponível.'
    },
    '♨': {
      icon:'♨',
      name:'Hidrotermal',
      className:'event-thermal',
      duration:14000,
      description:'Fluxo hidrotermal: a síntese de ácidos graxos fica disponível.'
    },
    '◐': {
      icon:'◐',
      name:'Úmido-seco',
      className:'event-wetdry',
      duration:14000,
      description:'Concentração cíclica: nucleotídeos, peptídeos e QT45 ficam disponíveis.'
    }
  };

  const PERIODS = {
    atmosphere: {
      id:'atmosphere',
      name:'Atmosfera primitiva',
      atoms:['C','H','H','O','N']
    },
    mineral: {
      id:'mineral',
      name:'Atmosfera + minerais',
      atoms:['C','H','H','O','N','P']
    }
  };

  const COMBOS = [
    { id:'h2', a:'H', b:'H', out:'H₂', color:'#62d6ff', label:'H + H → H₂' },
    { id:'water', a:'H₂', b:'O', out:'H₂O', color:'#69e0df', label:'H₂ + O → H₂O' },
    { id:'co', a:'C', b:'O', out:'CO', color:'#ff9c70', label:'C + O → CO' },
    { id:'amino', a:'N', b:'H₂O', out:'Aminoácidos', events:['☀','⚡'], color:'#ffad79', label:'N + H₂O → Aminoácidos' },
    { id:'fatty', a:'CO', b:'H₂', out:'Ácidos graxos', events:['♨'], color:'#f1d069', label:'CO + H₂ → Ácidos graxos' },
    { id:'nt', a:'P', b:'H₂O', out:'Nucleotídeos', events:['☀','◐'], color:'#b895ff', label:'P + H₂O → Nucleotídeos' },
    { id:'peptide', a:'Aminoácidos', b:'Aminoácidos', out:'Peptídeo', events:['◐'], color:'#ff8f72', label:'Aminoácidos + Aminoácidos → Peptídeo' },
    { id:'vesicle', a:'Ácidos graxos', b:'Ácidos graxos', out:'Vesícula', color:'#e7d875', label:'Ácidos graxos + Ácidos graxos → Vesícula' },
    { id:'qt45', a:'Nucleotídeos', b:'Nucleotídeos', out:'QT45', events:['◐'], color:'#b895ff', label:'Nucleotídeos + Nucleotídeos → QT45' },
    { id:'protobiont', a:'Peptídeo', b:'Vesícula', out:'Protobionte', color:'#75d8b9', label:'Peptídeo + Vesícula → Protobionte' },
    { id:'life', a:'Protobionte', b:'QT45', out:'Vida emergente', color:'#ffffff', label:'Protobionte + QT45 → Vida emergente' }
  ];

  const PHASES = [
    {
      id:'h2', title:'Hidrogênio molecular', chapter:'Atmosfera primitiva', period:'atmosphere',
      objective:'Forme H₂ duas vezes', formula:'H + H → H₂',
      hint:'Capture H do fluxo e repita a união até completar 2 H₂.',
      target:'H₂', targetCount:2, spawnEvents:['☀F']
    },
    {
      id:'water', title:'Água', chapter:'Atmosfera primitiva', period:'atmosphere',
      objective:'Forme água duas vezes', formula:'H + H → H₂ · H₂ + O → H₂O',
      hint:'H₂ acumulado da fase anterior pode ser aproveitado. Complete 2 H₂O.',
      target:'H₂O', targetCount:2, spawnEvents:['☀F']
    },
    {
      id:'co', title:'Carbono reativo', chapter:'Atmosfera primitiva', period:'atmosphere',
      objective:'Forme CO duas vezes', formula:'C + O → CO',
      hint:'Capture C e O do mesmo fluxo atmosférico e complete 2 CO.',
      target:'CO', targetCount:2, spawnEvents:['☀F']
    },
    {
      id:'amino', title:'Primeiros aminoácidos', chapter:'Atmosfera primitiva', period:'atmosphere',
      objective:'Produza aminoácidos três vezes', formula:'N + H₂O → Aminoácidos',
      hint:'Água acumulada pode ser reutilizada como precursor. Capture ☀ ou ⚡ e complete 3 aminoácidos.',
      target:'Aminoácidos', targetCount:3, spawnEvents:['☀F','☀','⚡']
    },
    {
      id:'fatty', title:'Lipídios prebióticos', chapter:'Atmosfera primitiva', period:'atmosphere',
      objective:'Produza ácidos graxos três vezes', formula:'CO + H₂ → Ácidos graxos',
      hint:'Aproveite CO e H₂ já construídos, capture ♨ e complete 3 ácidos graxos.',
      target:'Ácidos graxos', targetCount:3, spawnEvents:['☀F','♨']
    },
    {
      id:'nt', title:'Nucleotídeos', chapter:'Atmosfera + minerais', period:'mineral',
      objective:'Produza nucleotídeos três vezes', formula:'P + H₂O → Nucleotídeos',
      hint:'P entra no fluxo deste período. Combine com H₂O sob ☀ ou ◐ até completar 3 nucleotídeos.',
      target:'Nucleotídeos', targetCount:3, spawnEvents:['☀F','☀','◐']
    },
    {
      id:'peptide', title:'Catálise peptídica', chapter:'Atmosfera + minerais', period:'mineral',
      objective:'Forme quatro peptídeos', formula:'2 Aminoácidos → Peptídeo',
      hint:'Use aminoácidos acumulados e complete 4 peptídeos sob ◐.',
      target:'Peptídeo', targetCount:4, spawnEvents:['☀F','☀','⚡','◐']
    },
    {
      id:'vesicle', title:'Primeira vesícula', chapter:'Atmosfera + minerais', period:'mineral',
      objective:'Forme quatro vesículas', formula:'2 Ácidos graxos → Vesícula',
      hint:'Use ácidos graxos acumulados e complete 4 vesículas.',
      target:'Vesícula', targetCount:4, spawnEvents:['☀F','♨']
    },
    {
      id:'qt45', title:'RNA catalítico', chapter:'Atmosfera + minerais', period:'mineral',
      objective:'Monte quatro QT45', formula:'2 Nucleotídeos → QT45',
      hint:'Use nucleotídeos acumulados e complete 4 QT45 sob ◐.',
      target:'QT45', targetCount:4, spawnEvents:['☀F','☀','◐']
    },
    {
      id:'integration', title:'Integração prebiótica', chapter:'Atmosfera + minerais', period:'mineral',
      objective:'Integre quatro sistemas de vida emergente', formula:'Peptídeo + Vesícula → Protobionte · + QT45',
      hint:'As quatro unidades acumuladas de Peptídeo, Vesícula e QT45 alimentam a integração final.',
      target:'Vida emergente', targetCount:4, spawnEvents:['☀F','☀','⚡','♨','◐']
    }
  ];

  const SIZE = {
    H:54,C:62,O:60,N:58,P:64,'H₂':68,CO:72,'H₂O':72,
    'Aminoácidos':88,'Ácidos graxos':92,'Nucleotídeos':88,
    'Peptídeo':94,'Vesícula':100,'QT45':96,'Protobionte':104,'Vida emergente':112
  };

  let nextId=1;
  let nextEventId=1;

  function id(){ return 'b'+nextId++; }
  function sample(list){ return list[Math.floor(Math.random()*list.length)]; }
  function rand(min,max){ return Math.round(min+Math.random()*(max-min)); }
  function phase(state){ return PHASES[state.phaseIndex]; }
  function period(state){ return PERIODS[phase(state).period]; }
  function recipeById(recipeId){ return COMBOS.find(r=>r.id===recipeId)||null; }

  function makeBubble(resource,isNew,x,y){
    return {
      id:id(),
      resource,
      size:SIZE[resource]||72,
      x:x===undefined?rand(14,86):x,
      y:y===undefined?rand(15,82):y,
      drift:rand(3400,6200),
      delay:rand(-1600,0),
      isNew:isNew!==false
    };
  }

  function cloneSoup(soup){
    return soup.map(b=>({...b,isNew:false}));
  }

  function molecularCarry(soup){
    return soup.filter(b=>!ATOMS.includes(b.resource)).map(b=>({...b,isNew:true}));
  }

  function setPhase(state,index,announce,mode){
    const p=PHASES[index];
    state.phaseIndex=index;
    state.phaseTurn=1;
    state.selectedBubbleId=null;
    state.stageComplete=false;
    state.activeEvent=null;
    state.photolysisActive=false;
    state.lastBornId=null;

    if(mode==='restore' && state.phaseSnapshots[index]){
      state.soup=cloneSoup(state.phaseSnapshots[index]);
    }else if(mode==='advance'){
      state.soup=molecularCarry(state.soup);
      state.phaseSnapshots[index]=cloneSoup(state.soup);
    }else{
      state.soup=[];
      state.phaseSnapshots[index]=[];
    }

    if(announce!==false){
      const carried=state.soup.length;
      state.log.unshift('Fase '+(index+1)+': '+p.title+'. '+carried+' união(ões) molecular(es) seguem acumuladas na sopa.');
    }
    checkPhaseComplete(state);
  }

  function createGame(editorMode){
    const state={
      phaseIndex:0,
      unlockedPhase:editorMode?PHASES.length-1:0,
      completedPhases:[],
      editorMode:!!editorMode,
      phaseTurn:1,
      totalTurn:1,
      soup:[],
      phaseSnapshots:{},
      selectedBubbleId:null,
      stageComplete:false,
      winner:false,
      activeEvent:null,
      photolysisActive:false,
      lastBornId:null,
      lastEvent:null,
      log:['A sopa primordial desperta vazia. Capture matéria do fluxo ao redor.']
    };
    setPhase(state,0,false,'fresh');
    const audit=recipeAudit();
    if(audit.allPhaseTargetsCovered&&audit.missingRecipes.length===0&&audit.aminoCorrect){
      state.log.unshift('Auditoria de receitas: todas as receitas da campanha estão presentes.');
    }
    return state;
  }

  function activeEventIcon(state){
    expireEvent(state);
    return state.activeEvent?state.activeEvent.icon:null;
  }

  function expireEvent(state){
    if(state.activeEvent&&Date.now()>=state.activeEvent.expiresAt){
      state.log.unshift(state.activeEvent.icon+' '+state.activeEvent.name+' terminou.');
      state.activeEvent=null;
      return true;
    }
    return false;
  }

  function isRecipeEnabled(state,recipe){
    return true;
  }

  function possibleRecipes(state,resource){
    return COMBOS.filter(recipe=>
      (recipe.a===resource||recipe.b===resource)&&isRecipeEnabled(state,recipe)
    );
  }

  function allRecipesFor(resource){
    return COMBOS.filter(recipe=>recipe.a===resource||recipe.b===resource);
  }

  function availableCombos(state,sourceId,targetId){
    const a=state.soup.find(b=>b.id===sourceId);
    const b=state.soup.find(b=>b.id===targetId);
    if(!a||!b) return [];
    return COMBOS.filter(recipe=>{
      const pair=(recipe.a===a.resource&&recipe.b===b.resource)||(recipe.a===b.resource&&recipe.b===a.resource);
      return pair&&isRecipeEnabled(state,recipe);
    });
  }

  function selectedContext(state){
    expireEvent(state);
    const bubble=state.soup.find(b=>b.id===state.selectedBubbleId);
    if(!bubble) return null;
    const available=possibleRecipes(state,bubble.resource);
    const blocked=[];
    return {bubble,available,blocked};
  }

  function captureMatter(state,resource,x,y){
    if(state.stageComplete||!SIZE[resource]) return null;
    const bubble=makeBubble(resource,true,x,y);
    state.soup.push(bubble);
    state.lastBornId=bubble.id;
    state.log.unshift(resource+' foi capturado para dentro da sopa.');
    return bubble;
  }

  function captureAtom(state,resource,x,y){
    if(!ATOMS.includes(resource)) return null;
    return captureMatter(state,resource,x,y);
  }

  function moveBubble(state,bubbleId,x,y){
    const bubble=state.soup.find(b=>b.id===bubbleId);
    if(!bubble||state.stageComplete) return false;
    bubble.x=Math.max(8,Math.min(92,x));
    bubble.y=Math.max(8,Math.min(92,y));
    state.selectedBubbleId=bubbleId;
    return true;
  }

  function releaseBubble(state,bubbleId){
    const index=state.soup.findIndex(b=>b.id===bubbleId);
    if(index<0||state.stageComplete) return null;
    const bubble=state.soup.splice(index,1)[0];
    if(state.selectedBubbleId===bubbleId) state.selectedBubbleId=null;
    state.log.unshift(bubble.resource+' foi liberado de volta ao fluxo exterior.');
    return bubble;
  }

  function findPairForRecipe(state,recipe){
    const first=state.soup.findIndex(b=>b.resource===recipe.a);
    if(first<0) return null;
    const second=state.soup.findIndex((b,index)=>index!==first&&b.resource===recipe.b);
    if(second<0) return null;
    return [state.soup[first].id,state.soup[second].id];
  }

  function executeEventCatalysis(state,icon){
    const recipes=COMBOS.filter(r=>Array.isArray(r.events)&&r.events.includes(icon));
    for(const recipe of recipes){
      const pair=findPairForRecipe(state,recipe);
      if(pair){
        const result=combine(state,pair[0],pair[1],recipe.id);
        if(result.ok) return recipe.label;
      }
    }
    return null;
  }

  function decompositionRecipe(resource){
    return COMBOS.find(recipe=>recipe.out===resource)||null;
  }

  function canDecompose(resource){
    return !!decompositionRecipe(resource);
  }

  function photolysisActive(state){
    return !!state.photolysisActive;
  }

  function decomposeBubble(state,bubbleId){
    if(!state.photolysisActive||state.stageComplete) return {ok:false};
    const index=state.soup.findIndex(b=>b.id===bubbleId);
    if(index<0) return {ok:false};
    const bubble=state.soup[index];
    const recipe=decompositionRecipe(bubble.resource);
    if(!recipe) return {ok:false};

    state.soup.splice(index,1);
    const spread=5;
    const first=makeBubble(recipe.a,true,Math.max(8,bubble.x-spread),Math.max(8,bubble.y-2));
    const second=makeBubble(recipe.b,true,Math.min(92,bubble.x+spread),Math.min(92,bubble.y+2));
    state.soup.push(first,second);
    state.photolysisActive=false;
    state.selectedBubbleId=null;
    state.lastBornId=second.id;
    state.log.unshift('Fotólise: '+bubble.resource+' → '+recipe.a+' + '+recipe.b+'.');
    return {ok:true,recipe,parts:[first,second]};
  }

  function activateEvent(state,icon){
    if(state.stageComplete||!EVENTS[icon]) return null;
    const spec=EVENTS[icon];

    if(icon==='☀F'){
      state.activeEvent=null;
      state.photolysisActive=true;
      state.selectedBubbleId=null;
      const eligible=state.soup.filter(b=>canDecompose(b.resource)).map(b=>b.resource);
      const event={
        id:nextEventId++,
        icon:spec.icon,
        title:spec.icon+' '+spec.name,
        subtitle:'Evento especial · decomposição',
        benefited:[],
        harmed:eligible.length?eligible:['Nenhuma molécula composta na sopa'],
        effects:[spec.description],
        quiet:false
      };
      state.lastEvent=event;
      state.log.unshift('☀ Fotólise ativada. '+eligible.length+' bolha(s) elegível(is) para decomposição.');
      return event;
    }
    const now=Date.now();
    state.activeEvent={
      icon,
      name:spec.name,
      className:spec.className,
      startedAt:now,
      expiresAt:now+spec.duration,
      duration:spec.duration
    };
    const benefited=COMBOS.filter(r=>r.events&&r.events.includes(icon)).map(r=>r.label);
    const catalyzed=executeEventCatalysis(state,icon);
    const event={
      id:nextEventId++,
      icon,
      title:icon+' '+spec.name,
      subtitle:'Evento capturado · efeito temporário',
      benefited,
      harmed:[],
      effects:[spec.description].concat(catalyzed?['Catalisada automaticamente: '+catalyzed]:[]),
      quiet:false
    };
    state.lastEvent=event;
    state.log.unshift(icon+' '+spec.name+' foi ativado.'+(catalyzed?' '+catalyzed+' foi catalisada automaticamente.':''));
    return event;
  }

  function nextFaller(state){
    const p=phase(state);
    const hasEvents=p.spawnEvents.length>0;
    const eventProbability=hasEvents?0.22:0;
    if(Math.random()<eventProbability){
      return {kind:'event',value:sample(p.spawnEvents)};
    }
    return {kind:'atom',value:sample(period(state).atoms)};
  }

  function selectBubble(state,bubbleId){
    if(state.stageComplete) return {selected:false,combined:false};
    const clicked=state.soup.find(b=>b.id===bubbleId);
    if(!clicked) return {selected:false,combined:false};

    const previous=state.selectedBubbleId;
    if(previous&&previous!==bubbleId){
      const recipes=availableCombos(state,previous,bubbleId);
      if(recipes.length===1){
        const result=combine(state,previous,bubbleId,recipes[0].id);
        return {selected:false,combined:result.ok,recipe:result.recipe};
      }
      if(recipes.length>1){
        return {selected:true,combined:false,choices:recipes,sourceId:previous,targetId:bubbleId};
      }
    }

    state.selectedBubbleId=previous===bubbleId?null:bubbleId;
    return {selected:!!state.selectedBubbleId,combined:false};
  }

  function combine(state,sourceId,targetId,recipeId){
    if(sourceId===targetId||state.stageComplete) return {ok:false};
    const a=state.soup.find(b=>b.id===sourceId);
    const b=state.soup.find(b=>b.id===targetId);
    if(!a||!b) return {ok:false};

    const choices=availableCombos(state,sourceId,targetId);
    if(!choices.length) return {ok:false};
    const recipe=(recipeId&&choices.find(r=>r.id===recipeId))||choices[0];

    const x=(a.x+b.x)/2;
    const y=(a.y+b.y)/2;
    const ids=[a.id,b.id];
    state.soup=state.soup.filter(item=>!ids.includes(item.id));
    const born=makeBubble(recipe.out,true,x,y);
    state.soup.push(born);
    state.selectedBubbleId=null;
    state.lastBornId=born.id;
    state.log.unshift(recipe.label+'.');
    checkPhaseComplete(state);
    return {ok:true,recipe,born};
  }

  function recipeAudit(){
    const outputs=new Set(COMBOS.map(r=>r.out));
    const phaseTargets=PHASES.map(p=>({
      phase:p.id,
      target:p.target,
      covered:outputs.has(p.target)
    }));

    const requiredIds=['h2','water','co','amino','fatty','nt','peptide','vesicle','qt45','protobiont','life'];
    const ids=new Set(COMBOS.map(r=>r.id));
    const missingRecipes=requiredIds.filter(id=>!ids.has(id));

    const amino=COMBOS.find(r=>r.id==='amino');
    const aminoCorrect=!!amino&&amino.a==='N'&&amino.b==='H₂O'&&amino.out==='Aminoácidos';

    return {
      phaseTargets,
      missingRecipes,
      allPhaseTargetsCovered:phaseTargets.every(item=>item.covered),
      aminoCorrect
    };
  }

  function countResource(state,resource){
    return state.soup.filter(b=>b.resource===resource).length;
  }

  function phaseProgress(state){
    const p=phase(state);
    const value=Math.min(p.targetCount,countResource(state,p.target));
    return {value,max:p.targetCount,label:value+'/'+p.targetCount};
  }

  function objective(state){
    const p=phase(state);
    return {
      chapter:p.chapter,
      title:p.objective,
      formula:p.formula,
      hint:p.hint,
      progress:phaseProgress(state)
    };
  }

  function checkPhaseComplete(state){
    const p=phase(state);
    if(countResource(state,p.target)>=p.targetCount){
      state.stageComplete=true;
      if(!state.completedPhases.includes(state.phaseIndex)) state.completedPhases.push(state.phaseIndex);
      state.unlockedPhase=Math.max(state.unlockedPhase,Math.min(PHASES.length-1,state.phaseIndex+1));
      state.activeEvent=null;
      state.selectedBubbleId=null;
      state.log.unshift('Objetivo concluído: '+p.objective+'. '+p.targetCount+' unidade(s) permanecem como legado molecular.');
      if(state.phaseIndex===PHASES.length-1) state.winner=true;
      return true;
    }
    return false;
  }

  function nextPhase(state){
    if(!state.stageComplete||state.phaseIndex>=PHASES.length-1) return false;
    setPhase(state,state.phaseIndex+1,true,'advance');
    return true;
  }

  function restartPhase(state){
    setPhase(state,state.phaseIndex,true,'restore');
    return true;
  }

  function jumpToPhase(state,index){
    if(index<0||index>=PHASES.length) return false;
    if(!state.editorMode&&index>state.unlockedPhase) return false;
    setPhase(state,index,true,state.phaseSnapshots[index]?'restore':'fresh');
    return true;
  }

  function phaseStatus(state,index){
    if(index===state.phaseIndex) return 'current';
    if(state.completedPhases.includes(index)) return 'completed';
    if(state.editorMode||index<=state.unlockedPhase) return 'available';
    return 'locked';
  }

  window.SopaGame={
    ATOMS,EVENTS,PERIODS,COMBOS,PHASES,
    createGame,phase,period,objective,phaseProgress,phaseStatus,
    captureAtom,captureMatter,moveBubble,releaseBubble,activateEvent,nextFaller,expireEvent,activeEventIcon,
    photolysisActive,canDecompose,decomposeBubble,
    selectBubble,selectedContext,possibleRecipes,availableCombos,combine,
    nextPhase,restartPhase,jumpToPhase,countResource,recipeAudit
  };
})();