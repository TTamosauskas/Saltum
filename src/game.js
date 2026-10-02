(function () {
  const KNOWN_RESOURCES = ['H','H','H','H','C','C','O','O','N','N','P','P','H₂','CO','H₂O','Aminoácidos','Ácidos graxos','Nucleotídeos'];
  const UNKNOWN_POOL = ['H','H','C','O','N','P','H₂','CO','H₂O','Aminoácidos','Ácidos graxos','Nucleotídeos'];
  const ENV_BAG = ['☀','☀','☀','⚡','⚡','⚡','♨','♨','◐','◐','◐','○','○','○','○'];

  const ENV_INFO = {
    '☀': { name:'UV', className:'env-uv', benefit:'Favorece aminoácidos e nucleotídeos' },
    '⚡': { name:'Descarga elétrica', className:'env-lightning', benefit:'Favorece aminoácidos e química energética' },
    '♨': { name:'Hidrotermal', className:'env-thermal', benefit:'Favorece lipídios e metabolismo' },
    '◐': { name:'Úmido-seco', className:'env-wetdry', benefit:'Favorece nucleotídeos e polimerização de RNA' },
    '○': { name:'Calmaria', className:'env-calm', benefit:'Janela de preparação e estabilidade' }
  };

  const COMBOS = [
    { id:'h2', a:'H', b:'H', out:'H₂', color:'#62d6ff', label:'H + H → H₂' },
    { id:'co', a:'C', b:'O', out:'CO', color:'#ff9c70', label:'C + O → CO' },
    { id:'water', a:'H₂', b:'O', out:'H₂O', color:'#69e0df', label:'H₂ + O → H₂O' },
    { id:'amino', a:'N', b:'H₂O', out:'Aminoácidos', environments:['☀','⚡'], color:'#ffad79', label:'N + H₂O → aminoácidos' },
    { id:'fatty', a:'CO', b:'H₂', out:'Ácidos graxos', environments:['♨'], color:'#f1d069', label:'CO + H₂ → ácidos graxos' },
    { id:'nt', a:'P', b:'H₂O', out:'Nucleotídeos', environments:['☀','◐'], color:'#b895ff', label:'P + H₂O → nucleotídeos' },
    { id:'metabolism', a:'CO', b:'H₂', special:'metabolism', environments:['♨'], color:'#83dc94', label:'CO + H₂ → gradiente metabólico' }
  ];

  const ENV_RULES = {
    '☀': {
      benefited:['amino','nt'],
      harmed:['fatty'],
      auto:['amino','nt'],
      regress:[{resource:'Ácidos graxos',to:'CO',label:'Ácidos graxos expostos perderam estabilidade e recuaram para CO'}]
    },
    '⚡': {
      benefited:['amino'],
      harmed:['nt'],
      auto:['amino'],
      regress:[{resource:'Nucleotídeos',to:'P',label:'Nucleotídeos expostos foram desestabilizados e recuaram para P'}]
    },
    '♨': {
      benefited:['fatty','metabolism'],
      harmed:['nt'],
      auto:['fatty'],
      regress:[{resource:'Nucleotídeos',to:'P',label:'O calor hidrotermal desestabilizou nucleotídeos expostos e deixou P disponível'}]
    },
    '◐': {
      benefited:['nt'],
      harmed:[],
      auto:['nt'],
      regress:[]
    },
    '○': {
      benefited:[],
      harmed:[],
      auto:[],
      regress:[]
    }
  };

  const SIZE = {
    H:54, C:62, O:60, N:58, P:64, 'H₂':68, CO:72, 'H₂O':72,
    'Aminoácidos':88, 'Ácidos graxos':92, 'Nucleotídeos':88, '?':78
  };

  let nextId = 1;
  let nextEventId = 1;
  function id() { return 'b' + nextId++; }
  function sample(list) { return list[Math.floor(Math.random() * list.length)]; }
  function rand(min,max) { return Math.round(min + Math.random() * (max-min)); }
  function drawKnown() { return sample(KNOWN_RESOURCES); }
  function drawEnvironment() { return sample(ENV_BAG); }
  function resolveUnknown() { return sample(UNKNOWN_POOL); }

  function makeBubble(resource, zone, isNew) {
    return {
      id:id(),
      resource:resource,
      zone:zone,
      size:SIZE[resource] || 72,
      x:rand(8,82),
      y:rand(10,78),
      drift:rand(3400,6200),
      delay:rand(-1600,0),
      isNew:isNew !== false,
      mystery:resource === '?'
    };
  }

  function makePlayer(name) {
    return {
      name:name,
      hand:[
        makeBubble('H','hand',false),
        makeBubble('H','hand',false),
        makeBubble('C','hand',false),
        makeBubble('O','hand',false),
        makeBubble('N','hand',false)
      ],
      peptide:0,
      membrane:0,
      metabolism:0,
      rnaModules:0,
      collected:false,
      perturbed:false,
      selectedBubbleId:null
    };
  }

  function initialSoup() {
    const soup = Array.from({length:5}, () => makeBubble(drawKnown(),'soup',false));
    soup.splice(rand(0,5),0,makeBubble('?','soup',false));
    return soup;
  }

  function recipeById(recipeId) {
    return COMBOS.find(r=>r.id===recipeId) || null;
  }

  function findSoupPair(soup,recipe) {
    const first=soup.findIndex(b=>!b.mystery && b.resource===recipe.a);
    if(first<0) return null;
    const second=soup.findIndex((b,i)=>i!==first && !b.mystery && b.resource===recipe.b);
    if(second<0) return null;
    return [first,second];
  }

  function executeFavoredSoupReaction(state,recipeId) {
    const recipe=recipeById(recipeId);
    if(!recipe || !recipe.out) return null;
    const pair=findSoupPair(state.soup,recipe);
    if(!pair) return null;

    const firstIndex=pair[0], secondIndex=pair[1];
    state.soup[firstIndex]=makeBubble(recipe.out,'soup',true);
    state.soup[secondIndex]=makeBubble(drawKnown(),'soup',true);
    state.lastBornId=state.soup[firstIndex].id;
    return recipe.label;
  }

  function executeRegression(state,rule) {
    const index=state.soup.findIndex(b=>!b.mystery && b.resource===rule.resource);
    if(index<0) return null;
    state.soup[index]=makeBubble(rule.to,'soup',true);
    state.lastBornId=state.soup[index].id;
    return rule.label;
  }

  function triggerTurnEvent(state) {
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

    const benefitedLabels=rules.benefited.map(id=>{
      const recipe=recipeById(id);
      return recipe ? recipe.label : id;
    });
    const harmedLabels=rules.harmed.map(id=>{
      const recipe=recipeById(id);
      return recipe ? recipe.label : id;
    });

    state.lastEvent={
      id:nextEventId++,
      icon:icon,
      title:icon+' '+info.name,
      player:state.players[state.activePlayer].name,
      benefited:benefitedLabels,
      harmed:harmedLabels,
      effects:effects,
      quiet:effects.length===0
    };

    state.log.unshift(
      'Início do turno de '+state.players[state.activePlayer].name+': '+icon+' '+info.name+
      (effects.length ? ' — '+effects.join(' | ') : ' — ambiente sem reação automática na sopa.')
    );
    return state.lastEvent;
  }

  function createGame() {
    const state={
      round:1,
      activePlayer:0,
      players:[makePlayer('Jogador 1'),makePlayer('Jogador 2')],
      soup:initialSoup(),
      environment:Array.from({length:6},drawEnvironment),
      log:['A sopa primordial desperta. Uma bolha desconhecida flutua entre os recursos.'],
      winner:null,
      lastBornId:null,
      lastEvent:null
    };
    triggerTurnEvent(state);
    return state;
  }

  function isRecipeEnabled(recipe,currentEnvironment) {
    const rules=ENV_RULES[currentEnvironment];
    if(rules.harmed.includes(recipe.id)) return false;
    return !recipe.environments || recipe.environments.includes(currentEnvironment);
  }

  function recipeFor(a,b,currentEnvironment) {
    return COMBOS.find(function(recipe) {
      const pair=(recipe.a===a && recipe.b===b)||(recipe.a===b && recipe.b===a);
      return pair && isRecipeEnabled(recipe,currentEnvironment);
    }) || null;
  }

  function possibleRecipes(resource,currentEnvironment) {
    return COMBOS.filter(function(recipe) {
      return (recipe.a===resource || recipe.b===resource) && isRecipeEnabled(recipe,currentEnvironment);
    });
  }

  function collect(state,bubbleId) {
    const player=state.players[state.activePlayer];
    if (player.collected || state.winner!==null) return false;
    const index=state.soup.findIndex(b=>b.id===bubbleId);
    if(index<0) return false;

    const source=state.soup[index];
    const resolved=source.mystery ? resolveUnknown() : source.resource;
    const collected=makeBubble(resolved,'hand',true);
    player.hand.push(collected);
    player.collected=true;
    state.lastBornId=collected.id;

    if(source.mystery) {
      state.log.unshift(player.name+' arriscou a bolha ? e revelou '+resolved+'.');
      state.soup[index]=makeBubble('?','soup',true);
    } else {
      state.log.unshift(player.name+' coletou '+resolved+'.');
      state.soup[index]=makeBubble(drawKnown(),'soup',true);
    }
    return true;
  }

  function selectHandBubble(state,bubbleId) {
    const player=state.players[state.activePlayer];
    player.selectedBubbleId = player.selectedBubbleId===bubbleId ? null : bubbleId;
  }

  function perturbSelected(state) {
    const player=state.players[state.activePlayer];
    if(player.perturbed || !player.selectedBubbleId || state.environment.length<2 || state.winner!==null) return false;
    const index=player.hand.findIndex(b=>b.id===player.selectedBubbleId);
    if(index<0) return false;
    const discarded=player.hand.splice(index,1)[0];
    const removed=state.environment.splice(1,1)[0];
    state.environment.push(drawEnvironment());
    player.selectedBubbleId=null;
    player.perturbed=true;
    state.log.unshift(player.name+' sacrificou '+discarded.resource+' e removeu '+removed+' do futuro ambiental.');
    return true;
  }

  function availableCombos(state,sourceId,targetId) {
    const player=state.players[state.activePlayer];
    const a=player.hand.find(b=>b.id===sourceId);
    const b=player.hand.find(b=>b.id===targetId);
    if(!a || !b) return [];
    return COMBOS.filter(r=>{
      const pair=(r.a===a.resource&&r.b===b.resource)||(r.a===b.resource&&r.b===a.resource);
      return pair && isRecipeEnabled(r,state.environment[0]);
    });
  }

  function combine(state,sourceId,targetId,recipeId) {
    if(sourceId===targetId || state.winner!==null) return {ok:false};
    const player=state.players[state.activePlayer];
    const a=player.hand.find(b=>b.id===sourceId);
    const b=player.hand.find(b=>b.id===targetId);
    if(!a || !b) return {ok:false};

    const pairMatches=availableCombos(state,sourceId,targetId);
    if(!pairMatches.length) return {ok:false};
    const chosen=(recipeId && pairMatches.find(r=>r.id===recipeId)) || pairMatches[0];
    player.hand=player.hand.filter(x=>x.id!==sourceId && x.id!==targetId);
    player.selectedBubbleId=null;

    if(chosen.special==='metabolism') {
      player.metabolism+=1;
      state.log.unshift(player.name+' converteu '+a.resource+' + '+b.resource+' em um gradiente metabólico.');
    } else {
      const born=makeBubble(chosen.out,'hand',true);
      player.hand.push(born);
      state.lastBornId=born.id;
      state.log.unshift(player.name+' combinou '+a.resource+' + '+b.resource+' → '+chosen.out+'.');
    }
    checkWinner(state);
    return {ok:true,recipe:chosen};
  }

  function deposit(state,bubbleId,type) {
    const player=state.players[state.activePlayer];
    const index=player.hand.findIndex(b=>b.id===bubbleId);
    if(index<0 || state.winner!==null) return false;
    const bubble=player.hand[index];

    if(type==='peptide' && bubble.resource==='Aminoácidos') {
      player.hand.splice(index,1); player.peptide+=1;
      state.log.unshift(player.name+' incorporou aminoácidos ao catalisador peptídico.');
    } else if(type==='membrane' && bubble.resource==='Ácidos graxos') {
      player.hand.splice(index,1); player.membrane+=1;
      state.log.unshift(player.name+' incorporou lipídios à protocélula.');
    } else if(type==='rna' && bubble.resource==='Nucleotídeos' && state.environment[0]==='◐') {
      player.hand.splice(index,1); player.rnaModules=Math.min(5,player.rnaModules+1);
      state.log.unshift(player.name+' polimerizou um módulo de 9 nt da QT45.');
    } else {
      return false;
    }
    player.selectedBubbleId=null;
    checkWinner(state);
    return true;
  }

  function endTurn(state) {
    if(state.winner!==null) return;
    const current=state.players[state.activePlayer];
    current.collected=false;
    current.perturbed=false;
    current.selectedBubbleId=null;

    if(state.activePlayer===0) {
      state.activePlayer=1;
    } else {
      state.activePlayer=0;
      state.round+=1;
      state.environment.shift();
      state.environment.push(drawEnvironment());
      state.players.forEach(p=>{p.collected=false;p.perturbed=false;p.selectedBubbleId=null;});
    }
    triggerTurnEvent(state);
  }

  function checkWinner(state) {
    const winner=state.players.findIndex(p=>p.rnaModules>=5&&p.membrane>=2&&p.metabolism>=2);
    if(winner>=0) state.winner=winner;
  }

  function leadingRoute(player) {
    const routes=[
      ['RNA / QT45',player.rnaModules/5],
      ['Protocélula',player.membrane/2],
      ['Metabolismo',player.metabolism/2],
      ['Peptídeos',player.peptide/3]
    ];
    routes.sort((a,b)=>b[1]-a[1]);
    return routes[0][0];
  }

  function currentEnvironmentRules(state) {
    const icon=state.environment[0];
    return {icon:icon,info:ENV_INFO[icon],rules:ENV_RULES[icon]};
  }

  window.SopaGame={
    ENV_INFO:ENV_INFO,
    ENV_RULES:ENV_RULES,
    COMBOS:COMBOS,
    createGame:createGame,
    collect:collect,
    selectHandBubble:selectHandBubble,
    perturbSelected:perturbSelected,
    combine:combine,
    deposit:deposit,
    endTurn:endTurn,
    leadingRoute:leadingRoute,
    recipeFor:recipeFor,
    possibleRecipes:possibleRecipes,
    availableCombos:availableCombos,
    currentEnvironmentRules:currentEnvironmentRules
  };
})();