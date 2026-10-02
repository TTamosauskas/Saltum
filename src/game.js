(function () {
  const KNOWN_RESOURCES = ['H','H','H','C','C','O','O','N','N','P','H₂','CO','H₂O','Aminoácidos','Ácidos graxos','Nucleotídeos'];
  const UNKNOWN_POOL = ['H','C','O','N','P','H₂','CO','H₂O','Aminoácidos','Ácidos graxos','Nucleotídeos'];

  const ENV_INFO = {
    '☀': { name:'UV', className:'env-uv', benefit:'Favorece aminoácidos e nucleotídeos' },
    '⚡': { name:'Descarga elétrica', className:'env-lightning', benefit:'Favorece aminoácidos' },
    '♨': { name:'Hidrotermal', className:'env-thermal', benefit:'Favorece ácidos graxos' },
    '◐': { name:'Úmido-seco', className:'env-wetdry', benefit:'Favorece nucleotídeos, peptídeos e RNA' },
    '○': { name:'Calmaria', className:'env-calm', benefit:'Estabilidade e preparação' }
  };

  const COMBOS = [
    { id:'h2', a:'H', b:'H', out:'H₂', color:'#62d6ff', label:'H + H → H₂' },
    { id:'water', a:'H₂', b:'O', out:'H₂O', color:'#69e0df', label:'H₂ + O → H₂O' },
    { id:'co', a:'C', b:'O', out:'CO', color:'#ff9c70', label:'C + O → CO' },
    { id:'amino', a:'N', b:'H₂O', out:'Aminoácidos', environments:['☀','⚡'], color:'#ffad79', label:'N + H₂O → Aminoácidos' },
    { id:'fatty', a:'CO', b:'H₂', out:'Ácidos graxos', environments:['♨'], color:'#f1d069', label:'CO + H₂ → Ácidos graxos' },
    { id:'nt', a:'P', b:'H₂O', out:'Nucleotídeos', environments:['☀','◐'], color:'#b895ff', label:'P + H₂O → Nucleotídeos' },
    { id:'peptide', a:'Aminoácidos', b:'Aminoácidos', out:'Peptídeo', environments:['◐'], color:'#ff8f72', label:'Aminoácidos + Aminoácidos → Peptídeo' },
    { id:'vesicle', a:'Ácidos graxos', b:'Ácidos graxos', out:'Vesícula', color:'#e7d875', label:'Ácidos graxos + Ácidos graxos → Vesícula' },
    { id:'qt45', a:'Nucleotídeos', b:'Nucleotídeos', out:'QT45', environments:['◐'], color:'#b895ff', label:'Nucleotídeos + Nucleotídeos → QT45' },
    { id:'protobiont', a:'Peptídeo', b:'Vesícula', out:'Protobionte', color:'#75d8b9', label:'Peptídeo + Vesícula → Protobionte' },
    { id:'life', a:'Protobionte', b:'QT45', out:'Vida emergente', color:'#ffffff', label:'Protobionte + QT45 → Vida emergente' }
  ];

  const ENV_RULES = {
    '☀': {
      benefited:['amino','nt'],
      harmed:['fatty','qt45'],
      auto:['amino','nt'],
      regress:[
        {resource:'Ácidos graxos',to:'CO',label:'Ácidos graxos expostos perderam estabilidade e recuaram para CO'}
      ]
    },
    '⚡': {
      benefited:['amino'],
      harmed:['nt','qt45'],
      auto:['amino'],
      regress:[
        {resource:'Nucleotídeos',to:'P',label:'Nucleotídeos expostos foram desestabilizados e recuaram para P'}
      ]
    },
    '♨': {
      benefited:['fatty'],
      harmed:['nt','qt45'],
      auto:['fatty'],
      regress:[
        {resource:'Nucleotídeos',to:'P',label:'O calor hidrotermal desestabilizou nucleotídeos expostos e deixou P disponível'}
      ]
    },
    '◐': {
      benefited:['nt','peptide','qt45'],
      harmed:[],
      auto:['nt'],
      regress:[]
    },
    '○': {
      benefited:['vesicle','protobiont','life'],
      harmed:[],
      auto:[],
      regress:[]
    }
  };

  const PHASES = [
    {
      id:'h2', title:'Hidrogênio molecular', chapter:'Química básica',
      objective:'Forme H₂', formula:'H + H → H₂', hint:'Combine as duas bolhas H.',
      target:'H₂', targetCount:1, recipes:['h2'],
      soup:['H','H','O','C','N','?'],
      environment:['○','☀','⚡','○','♨','◐']
    },
    {
      id:'water', title:'Água', chapter:'Química básica',
      objective:'Forme água', formula:'H₂ + O → H₂O', hint:'H₂ e O já estão disponíveis na sopa.',
      target:'H₂O', targetCount:1, recipes:['water'],
      soup:['H₂','O','H','C','N','?'],
      environment:['○','☀','◐','⚡','♨','○']
    },
    {
      id:'co', title:'Carbono reativo', chapter:'Química básica',
      objective:'Forme CO', formula:'C + O → CO', hint:'Combine carbono e oxigênio.',
      target:'CO', targetCount:1, recipes:['co'],
      soup:['C','O','H','N','P','?'],
      environment:['○','☀','⚡','○','♨','◐']
    },
    {
      id:'amino', title:'Primeiros aminoácidos', chapter:'Orgânicos',
      objective:'Produza aminoácidos', formula:'N + H₂O → Aminoácidos', hint:'A reação precisa de ☀ UV ou ⚡ descarga elétrica.',
      target:'Aminoácidos', targetCount:1, recipes:['amino'],
      soup:['N','H₂O','C','P','H','?'],
      environment:['○','⚡','☀','○','◐','♨']
    },
    {
      id:'fatty', title:'Lipídios prebióticos', chapter:'Compartimentalização',
      objective:'Produza ácidos graxos', formula:'CO + H₂ → Ácidos graxos', hint:'A reação precisa de ♨ ambiente hidrotermal.',
      target:'Ácidos graxos', targetCount:1, recipes:['fatty'],
      soup:['CO','H₂','C','O','P','?'],
      environment:['○','♨','☀','○','⚡','◐']
    },
    {
      id:'nt', title:'Nucleotídeos', chapter:'Informação',
      objective:'Produza nucleotídeos', formula:'P + H₂O → Nucleotídeos', hint:'A reação precisa de ☀ UV ou ◐ úmido-seco.',
      target:'Nucleotídeos', targetCount:1, recipes:['nt'],
      soup:['P','H₂O','N','C','H','?'],
      environment:['○','◐','☀','○','⚡','♨']
    },
    {
      id:'peptide', title:'Catálise peptídica', chapter:'Polímeros',
      objective:'Forme um peptídeo', formula:'Aminoácidos + Aminoácidos → Peptídeo', hint:'◐ úmido-seco favorece a condensação no protótipo.',
      target:'Peptídeo', targetCount:1, recipes:['peptide'],
      soup:['Aminoácidos','Aminoácidos','N','H₂O','C','?'],
      environment:['○','◐','⚡','○','☀','♨']
    },
    {
      id:'vesicle', title:'Primeira vesícula', chapter:'Compartimentalização',
      objective:'Forme uma vesícula', formula:'Ácidos graxos + Ácidos graxos → Vesícula', hint:'Combine duas bolhas lipídicas.',
      target:'Vesícula', targetCount:1, recipes:['vesicle'],
      soup:['Ácidos graxos','Ácidos graxos','CO','H₂','N','?'],
      environment:['○','♨','○','◐','☀','⚡']
    },
    {
      id:'qt45', title:'RNA catalítico', chapter:'Informação',
      objective:'Monte QT45', formula:'Nucleotídeos + Nucleotídeos → QT45', hint:'Representação estratégica: ◐ úmido-seco permite a montagem desta fase.',
      target:'QT45', targetCount:1, recipes:['qt45'],
      soup:['Nucleotídeos','Nucleotídeos','P','H₂O','N','?'],
      environment:['○','◐','☀','○','⚡','♨']
    },
    {
      id:'integration', title:'Integração prebiótica', chapter:'Vida emergente',
      objective:'Integre os sistemas', formula:'Peptídeo + Vesícula → Protobionte → + QT45', hint:'Duas combinações concluem a integração.',
      target:'Vida emergente', targetCount:1, recipes:['protobiont','life'],
      soup:['Peptídeo','Vesícula','QT45','C','N','?'],
      environment:['○','◐','○','☀','♨','⚡']
    }
  ];

  const SIZE = {
    H:54, C:62, O:60, N:58, P:64, 'H₂':68, CO:72, 'H₂O':72,
    'Aminoácidos':88, 'Ácidos graxos':92, 'Nucleotídeos':88,
    'Peptídeo':94, 'Vesícula':100, 'QT45':96, 'Protobionte':104,
    'Vida emergente':112, '?':78
  };

  let nextId=1;
  let nextEventId=1;
  function id(){ return 'b'+nextId++; }
  function rand(min,max){ return Math.round(min+Math.random()*(max-min)); }
  function sample(list){ return list[Math.floor(Math.random()*list.length)]; }
  function recipeById(recipeId){ return COMBOS.find(r=>r.id===recipeId)||null; }
  function phase(state){ return PHASES[state.phaseIndex]; }

  function makeBubble(resource,isNew,x,y){
    return {
      id:id(),
      resource,
      size:SIZE[resource]||72,
      x:x===undefined?rand(12,88):x,
      y:y===undefined?rand(14,82):y,
      drift:rand(3400,6200),
      delay:rand(-1600,0),
      isNew:isNew!==false,
      mystery:resource==='?'
    };
  }

  function buildSoup(resources,isNew){
    return resources.map((resource,index)=>{
      const angle=(Math.PI*2*index/resources.length)+(Math.random()*.32);
      const radius=index===resources.length-1?28:24+Math.random()*9;
      const x=50+Math.cos(angle)*radius;
      const y=49+Math.sin(angle)*radius*.82;
      return makeBubble(resource,!!isNew,x,y);
    });
  }

  function setPhase(state,index,announce){
    const p=PHASES[index];
    state.phaseIndex=index;
    state.phaseTurn=1;
    state.soup=buildSoup(p.soup,announce!==false);
    state.environment=p.environment.slice();
    state.selectedBubbleId=null;
    state.perturbed=false;
    state.stageComplete=false;
    state.lastBornId=null;
    if(announce!==false) state.log.unshift('Fase '+(index+1)+': '+p.title+'.');
    triggerTurnEvent(state);
    checkPhaseComplete(state);
  }

  function createGame(){
    const state={
      phaseIndex:0,
      unlockedPhase:0,
      phaseTurn:1,
      totalTurn:1,
      soup:[],
      environment:[],
      selectedBubbleId:null,
      perturbed:false,
      stageComplete:false,
      winner:false,
      lastBornId:null,
      lastEvent:null,
      log:['A sopa primordial desperta.']
    };
    setPhase(state,0,false);
    return state;
  }

  function countResource(state,resource){
    return state.soup.filter(b=>b.resource===resource).length;
  }

  function findSoupPair(state,recipe){
    const first=state.soup.findIndex(b=>!b.mystery&&b.resource===recipe.a);
    if(first<0) return null;
    const second=state.soup.findIndex((b,i)=>i!==first&&!b.mystery&&b.resource===recipe.b);
    if(second<0) return null;
    return [first,second];
  }

  function isRecipeEnabled(recipe,currentEnvironment){
    if(!recipe.environments) return true;
    return recipe.environments.includes(currentEnvironment);
  }

  function possibleRecipes(resource,currentEnvironment){
    return COMBOS.filter(recipe=>
      (recipe.a===resource||recipe.b===resource) &&
      isRecipeEnabled(recipe,currentEnvironment)
    );
  }

  function allRecipesFor(resource){
    return COMBOS.filter(recipe=>recipe.a===resource||recipe.b===resource);
  }

  function availableCombos(state,sourceId,targetId){
    const a=state.soup.find(b=>b.id===sourceId);
    const b=state.soup.find(b=>b.id===targetId);
    if(!a||!b||a.mystery||b.mystery) return [];
    return COMBOS.filter(recipe=>{
      const pair=(recipe.a===a.resource&&recipe.b===b.resource)||(recipe.a===b.resource&&recipe.b===a.resource);
      return pair&&isRecipeEnabled(recipe,state.environment[0]);
    });
  }

  function selectedContext(state){
    const bubble=state.soup.find(b=>b.id===state.selectedBubbleId);
    if(!bubble||bubble.mystery) return null;
    const available=possibleRecipes(bubble.resource,state.environment[0]);
    const blocked=allRecipesFor(bubble.resource).filter(r=>!available.some(a=>a.id===r.id));
    return {bubble,available,blocked};
  }

  function selectBubble(state,bubbleId){
    const bubble=state.soup.find(b=>b.id===bubbleId);
    if(!bubble||bubble.mystery) return false;
    state.selectedBubbleId=state.selectedBubbleId===bubbleId?null:bubbleId;
    return true;
  }

  function revealMystery(state,bubbleId){
    const index=state.soup.findIndex(b=>b.id===bubbleId&&b.mystery);
    if(index<0||state.stageComplete) return false;
    const previous=state.soup[index];
    const resource=sample(UNKNOWN_POOL);
    state.soup[index]=makeBubble(resource,true,previous.x,previous.y);
    state.lastBornId=state.soup[index].id;
    state.log.unshift('? revelou '+resource+'.');
    checkPhaseComplete(state);
    return true;
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
    state.soup=state.soup.filter(item=>item.id!==sourceId&&item.id!==targetId);
    const born=makeBubble(recipe.out,true,x,y);
    state.soup.push(born);
    state.selectedBubbleId=null;
    state.lastBornId=born.id;
    state.log.unshift(recipe.label+'.');
    checkPhaseComplete(state);
    return {ok:true,recipe};
  }

  function perturbSelected(state){
    if(state.perturbed||!state.selectedBubbleId||state.environment.length<2||state.stageComplete) return false;
    const index=state.soup.findIndex(b=>b.id===state.selectedBubbleId);
    if(index<0) return false;
    const discarded=state.soup.splice(index,1)[0];
    const removed=state.environment.splice(1,1)[0];
    const refill=phase(state).environment[(state.phaseTurn+state.environment.length)%phase(state).environment.length]||'○';
    state.environment.push(refill);
    state.selectedBubbleId=null;
    state.perturbed=true;
    state.log.unshift('Perturbação: '+discarded.resource+' foi sacrificado e '+removed+' saiu do futuro ambiental.');
    return true;
  }

  function executeFavoredSoupReaction(state,recipeId){
    const recipe=recipeById(recipeId);
    const p=phase(state);
    if(!recipe||!recipe.out||p.recipes.includes(recipeId)) return null;
    const pair=findSoupPair(state,recipe);
    if(!pair) return null;

    const a=state.soup[pair[0]], b=state.soup[pair[1]];
    const x=(a.x+b.x)/2, y=(a.y+b.y)/2;
    const ids=[a.id,b.id];
    state.soup=state.soup.filter(item=>!ids.includes(item.id));
    const born=makeBubble(recipe.out,true,x,y);
    state.soup.push(born);
    state.lastBornId=born.id;
    return recipe.label;
  }

  function executeRegression(state,rule){
    const index=state.soup.findIndex(b=>!b.mystery&&b.resource===rule.resource);
    if(index<0) return null;
    const previous=state.soup[index];
    state.soup[index]=makeBubble(rule.to,true,previous.x,previous.y);
    state.lastBornId=state.soup[index].id;
    return rule.label;
  }

  function triggerTurnEvent(state){
    const icon=state.environment[0];
    const info=ENV_INFO[icon];
    const rules=ENV_RULES[icon];
    const effects=[];

    rules.auto.forEach(recipeId=>{
      const effect=executeFavoredSoupReaction(state,recipeId);
      if(effect) effects.push('Favorecida: '+effect);
    });
    rules.regress.forEach(rule=>{
      const effect=executeRegression(state,rule);
      if(effect) effects.push('Prejudicada: '+effect);
    });

    state.lastEvent={
      id:nextEventId++,
      icon,
      title:icon+' '+info.name,
      subtitle:'Turno '+state.phaseTurn+' · Fase '+(state.phaseIndex+1),
      benefited:rules.benefited.map(id=>recipeById(id)?.label||id),
      harmed:rules.harmed.map(id=>recipeById(id)?.label||id),
      effects,
      quiet:effects.length===0
    };

    state.log.unshift(
      'Turno '+state.phaseTurn+' — '+icon+' '+info.name+
      (effects.length?' — '+effects.join(' | '):' — sem reação ambiental automática.')
    );
  }

  function phaseProgress(state){
    const p=phase(state);
    if(p.id==='integration'){
      const life=countResource(state,'Vida emergente')>0;
      const proto=countResource(state,'Protobionte')>0;
      return {value:life?2:(proto?1:0),max:2,label:(life?2:(proto?1:0))+'/2'};
    }
    const value=Math.min(p.targetCount,countResource(state,p.target));
    return {value,max:p.targetCount,label:value+'/'+p.targetCount};
  }

  function objective(state){
    const p=phase(state);
    if(p.id==='integration'&&countResource(state,'Protobionte')>0&&!state.stageComplete){
      return {
        chapter:p.chapter,
        title:'Integre QT45 ao protobionte',
        formula:'Protobionte + QT45 → Vida emergente',
        hint:'A última combinação conclui a campanha.',
        progress:phaseProgress(state)
      };
    }
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
      state.unlockedPhase=Math.max(state.unlockedPhase,Math.min(PHASES.length-1,state.phaseIndex+1));
      state.log.unshift('Objetivo concluído: '+p.objective+'.');
      if(state.phaseIndex===PHASES.length-1) state.winner=true;
      return true;
    }
    return false;
  }

  function endTurn(state){
    if(state.stageComplete) return false;
    state.totalTurn+=1;
    state.phaseTurn+=1;
    state.perturbed=false;
    state.selectedBubbleId=null;
    state.environment.shift();
    const p=phase(state);
    const refill=p.environment[(state.phaseTurn+state.environment.length-1)%p.environment.length]||'○';
    state.environment.push(refill);
    triggerTurnEvent(state);
    checkPhaseComplete(state);
    return true;
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
    ENV_INFO,ENV_RULES,COMBOS,PHASES,
    createGame,phase,objective,phaseProgress,
    selectBubble,revealMystery,selectedContext,possibleRecipes,availableCombos,
    combine,perturbSelected,endTurn,nextPhase,restartPhase,jumpToPhase,
    countResource
  };
})();