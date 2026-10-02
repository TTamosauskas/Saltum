(function () {
  const ATOMS = ['H','C','O','N','P'];

  const EVENTS = {
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
      objective:'Forme H₂', formula:'H + H → H₂',
      hint:'Capture dois átomos H que atravessam a tela e combine-os.',
      target:'H₂', spawnEvents:[]
    },
    {
      id:'water', title:'Água', chapter:'Atmosfera primitiva', period:'atmosphere',
      objective:'Forme água', formula:'H + H → H₂ · H₂ + O → H₂O',
      hint:'Capture H e O. Construa primeiro H₂ e depois combine com O.',
      target:'H₂O', spawnEvents:[]
    },
    {
      id:'co', title:'Carbono reativo', chapter:'Atmosfera primitiva', period:'atmosphere',
      objective:'Forme CO', formula:'C + O → CO',
      hint:'Capture C e O e combine-os dentro da sopa.',
      target:'CO', spawnEvents:[]
    },
    {
      id:'amino', title:'Primeiros aminoácidos', chapter:'Atmosfera primitiva', period:'atmosphere',
      objective:'Produza aminoácidos', formula:'N + H₂O → Aminoácidos',
      hint:'Construa H₂O com H e O. Capture ☀ ou ⚡ quando aparecer para abrir a janela da reação.',
      target:'Aminoácidos', spawnEvents:['☀','⚡']
    },
    {
      id:'fatty', title:'Lipídios prebióticos', chapter:'Atmosfera primitiva', period:'atmosphere',
      objective:'Produza ácidos graxos', formula:'CO + H₂ → Ácidos graxos',
      hint:'Construa CO e H₂. Capture ♨ para ativar a química hidrotermal.',
      target:'Ácidos graxos', spawnEvents:['♨']
    },
    {
      id:'nt', title:'Nucleotídeos', chapter:'Atmosfera + minerais', period:'mineral',
      objective:'Produza nucleotídeos', formula:'P + H₂O → Nucleotídeos',
      hint:'Construa H₂O, capture P e ative ☀ ou ◐.',
      target:'Nucleotídeos', spawnEvents:['☀','◐']
    },
    {
      id:'peptide', title:'Catálise peptídica', chapter:'Atmosfera + minerais', period:'mineral',
      objective:'Forme um peptídeo', formula:'2 Aminoácidos → Peptídeo',
      hint:'Produza dois aminoácidos a partir de H, O e N; depois capture ◐ e combine-os.',
      target:'Peptídeo', spawnEvents:['☀','⚡','◐']
    },
    {
      id:'vesicle', title:'Primeira vesícula', chapter:'Atmosfera + minerais', period:'mineral',
      objective:'Forme uma vesícula', formula:'2 Ácidos graxos → Vesícula',
      hint:'Produza dois ácidos graxos a partir de H, C e O. ♨ ativa cada síntese lipídica.',
      target:'Vesícula', spawnEvents:['♨']
    },
    {
      id:'qt45', title:'RNA catalítico', chapter:'Atmosfera + minerais', period:'mineral',
      objective:'Monte QT45', formula:'2 Nucleotídeos → QT45',
      hint:'Produza dois nucleotídeos com H, O e P. ◐ habilita a montagem estratégica de QT45.',
      target:'QT45', spawnEvents:['☀','◐']
    },
    {
      id:'integration', title:'Integração prebiótica', chapter:'Atmosfera + minerais', period:'mineral',
      objective:'Alcance vida emergente', formula:'Peptídeo + Vesícula → Protobionte · + QT45',
      hint:'Todos os átomos fundamentais podem cair. Reconstrua os três sistemas e integre-os.',
      target:'Vida emergente', spawnEvents:['☀','⚡','♨','◐']
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

  function setPhase(state,index,announce){
    const p=PHASES[index];
    state.phaseIndex=index;
    state.phaseTurn=1;
    state.soup=[];
    state.selectedBubbleId=null;
    state.stageComplete=false;
    state.activeEvent=null;
    state.lastBornId=null;
    if(announce!==false) state.log.unshift('Fase '+(index+1)+': '+p.title+'. A sopa começa vazia.');
    checkPhaseComplete(state);
  }

  function createGame(){
    const state={
      phaseIndex:0,
      unlockedPhase:0,
      phaseTurn:1,
      totalTurn:1,
      soup:[],
      selectedBubbleId:null,
      stageComplete:false,
      winner:false,
      activeEvent:null,
      lastBornId:null,
      lastEvent:null,
      log:['A sopa primordial desperta vazia. Aguarde a queda dos primeiros átomos.']
    };
    setPhase(state,0,false);
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
    if(!recipe.events||!recipe.events.length) return true;
    const icon=activeEventIcon(state);
    return !!icon&&recipe.events.includes(icon);
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
    const blocked=allRecipesFor(bubble.resource).filter(r=>!available.some(a=>a.id===r.id));
    return {bubble,available,blocked};
  }

  function captureAtom(state,resource,x,y){
    if(state.stageComplete||!ATOMS.includes(resource)) return null;
    const bubble=makeBubble(resource,true,x,y);
    state.soup.push(bubble);
    state.lastBornId=bubble.id;
    state.log.unshift(resource+' foi capturado para dentro da sopa.');
    return bubble;
  }

  function activateEvent(state,icon){
    if(state.stageComplete||!EVENTS[icon]) return null;
    const spec=EVENTS[icon];
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
    const event={
      id:nextEventId++,
      icon,
      title:icon+' '+spec.name,
      subtitle:'Evento capturado · efeito temporário',
      benefited,
      harmed:[],
      effects:[spec.description],
      quiet:false
    };
    state.lastEvent=event;
    state.log.unshift(icon+' '+spec.name+' foi ativado por '+Math.round(spec.duration/1000)+' s.');
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

  function countResource(state,resource){
    return state.soup.filter(b=>b.resource===resource).length;
  }

  function phaseProgress(state){
    const p=phase(state);
    const complete=countResource(state,p.target)>0;
    return {value:complete?1:0,max:1,label:complete?'1/1':'0/1'};
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
    if(countResource(state,p.target)>0){
      state.stageComplete=true;
      state.unlockedPhase=Math.max(state.unlockedPhase,Math.min(PHASES.length-1,state.phaseIndex+1));
      state.activeEvent=null;
      state.selectedBubbleId=null;
      state.log.unshift('Objetivo concluído: '+p.objective+'.');
      if(state.phaseIndex===PHASES.length-1) state.winner=true;
      return true;
    }
    return false;
  }

  function nextPhase(state){
    if(!state.stageComplete||state.phaseIndex>=PHASES.length-1) return false;
    setPhase(state,state.phaseIndex+1,true);
    return true;
  }

  function restartPhase(state){
    setPhase(state,state.phaseIndex,true);
    return true;
  }

  function jumpToPhase(state,index){
    if(index<0||index>state.unlockedPhase||index>=PHASES.length) return false;
    setPhase(state,index,true);
    return true;
  }

  window.SopaGame={
    ATOMS,EVENTS,PERIODS,COMBOS,PHASES,
    createGame,phase,period,objective,phaseProgress,
    captureAtom,activateEvent,nextFaller,expireEvent,activeEventIcon,
    selectBubble,selectedContext,possibleRecipes,availableCombos,combine,
    nextPhase,restartPhase,jumpToPhase,countResource
  };
})();