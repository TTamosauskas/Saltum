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
      benefited:['amino','nt'], harmed:['fatty'], auto:['amino','nt'],
      regress:[{resource:'Ácidos graxos',to:'CO',label:'Ácidos graxos expostos perderam estabilidade e recuaram para CO'}]
    },
    '⚡': {
      benefited:['amino'], harmed:['nt'], auto:['amino'],
      regress:[{resource:'Nucleotídeos',to:'P',label:'Nucleotídeos expostos foram desestabilizados e recuaram para P'}]
    },
    '♨': {
      benefited:['fatty','metabolism'], harmed:['nt'], auto:['fatty'],
      regress:[{resource:'Nucleotídeos',to:'P',label:'O calor hidrotermal desestabilizou nucleotídeos expostos e deixou P disponível'}]
    },
    '◐': { benefited:['nt'], harmed:[], auto:['nt'], regress:[] },
    '○': { benefited:[], harmed:[], auto:[], regress:[] }
  };

  const ROUTES = {
    peptide:{id:'peptide',name:'Peptídeos',short:'Catálise peptídica',color:'#ffad79'},
    membrane:{id:'membrane',name:'Protocélula',short:'Compartimentalização',color:'#f1d069'},
    metabolism:{id:'metabolism',name:'Metabolismo',short:'Fluxo geoquímico',color:'#83dc94'},
    rna:{id:'rna',name:'Mundo de RNA',short:'Informação / QT45',color:'#b895ff'}
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
  function countResource(player,resource) { return player.hand.filter(b=>b.resource===resource).length; }
  function hasResource(player,resource) { return countResource(player,resource)>0; }

  function makeBubble(resource, zone, isNew) {
    return {
      id:id(), resource:resource, zone:zone, size:SIZE[resource] || 72,
      x:rand(8,82), y:rand(10,78), drift:rand(3400,6200), delay:rand(-1600,0),
      isNew:isNew !== false, mystery:resource === '?'
    };
  }

  function makePlayer(name) {
    return {
      name:name,
      hand:[
        makeBubble('H','hand',false), makeBubble('H','hand',false),
        makeBubble('C','hand',false), makeBubble('O','hand',false), makeBubble('N','hand',false)
      ],
      peptide:0, membrane:0, metabolism:0, rnaModules:0,
      collected:false, perturbed:false, selectedBubbleId:null, focus:'auto'
    };
  }

  function initialSoup() {
    const soup = Array.from({length:5}, () => makeBubble(drawKnown(),'soup',false));
    soup.splice(rand(0,5),0,makeBubble('?','soup',false));
    return soup;
  }

  function recipeById(recipeId) { return COMBOS.find(r=>r.id===recipeId) || null; }

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

  function allRecipesFor(resource) {
    return COMBOS.filter(r=>r.a===resource || r.b===resource);
  }

  function routeDiscovery(player) {
    return {
      peptide: player.peptide>0 || hasResource(player,'Aminoácidos'),
      membrane: player.membrane>0 || hasResource(player,'Ácidos graxos'),
      metabolism: player.metabolism>0,
      rna: player.rnaModules>0 || hasResource(player,'Nucleotídeos')
    };
  }

  function routeProgress(player,routeId) {
    if(routeId==='peptide') return {value:player.peptide,max:3,label:player.peptide+'/3'};
    if(routeId==='membrane') return {value:player.membrane,max:2,label:player.membrane+'/2'};
    if(routeId==='metabolism') return {value:player.metabolism,max:2,label:player.metabolism+'/2'};
    if(routeId==='rna') return {value:player.rnaModules,max:5,label:(player.rnaModules*9)+'/45 nt'};
    return {value:0,max:1,label:'0/1'};
  }

  function autoRoute(player) {
    if(player.rnaModules>0 || hasResource(player,'Nucleotídeos')) return 'rna';
    if(player.membrane>0 || hasResource(player,'Ácidos graxos')) return 'membrane';
    if(player.metabolism>0) return 'metabolism';
    if(player.peptide>0 || hasResource(player,'Aminoácidos')) return 'peptide';
    return null;
  }

  function routeObjective(state,routeId) {
    const player=state.players[state.activePlayer];
    if(routeId==='rna') {
      if(hasResource(player,'Nucleotídeos')) return {
        route:'rna', kicker:'Mundo de RNA', title:'Incorpore nucleotídeos à QT45',
        formula:'Nucleotídeos → QT45 +9 nt', hint:'A polimerização fica disponível durante ◐ úmido-seco.',
        progress:routeProgress(player,'rna')
      };
      return {
        route:'rna', kicker:'Mundo de RNA', title:'Produza nucleotídeos',
        formula:'P + H₂O → Nucleotídeos', hint:'☀ UV ou ◐ úmido-seco favorecem esta reação.',
        progress:routeProgress(player,'rna')
      };
    }
    if(routeId==='membrane') {
      if(hasResource(player,'Ácidos graxos')) return {
        route:'membrane', kicker:'Compartimentalização', title:'Incorpore lipídios à protocélula',
        formula:'Ácidos graxos → Membrana', hint:'Arraste a bolha para o destino mostrado no painel contextual.',
        progress:routeProgress(player,'membrane')
      };
      return {
        route:'membrane', kicker:'Compartimentalização', title:'Produza ácidos graxos',
        formula:'CO + H₂ → Ácidos graxos', hint:'♨ hidrotermal favorece esta reação.',
        progress:routeProgress(player,'membrane')
      };
    }
    if(routeId==='metabolism') {
      return {
        route:'metabolism', kicker:'Metabolismo primeiro', title:'Estabeleça um gradiente metabólico',
        formula:'CO + H₂ → Gradiente', hint:'♨ hidrotermal permite converter este par em metabolismo.',
        progress:routeProgress(player,'metabolism')
      };
    }
    if(routeId==='peptide') {
      if(hasResource(player,'Aminoácidos')) return {
        route:'peptide', kicker:'Catálise peptídica', title:'Incorpore aminoácidos ao catalisador',
        formula:'Aminoácidos → Peptídeo', hint:'Use o destino mostrado ao selecionar a bolha.',
        progress:routeProgress(player,'peptide')
      };
      return {
        route:'peptide', kicker:'Catálise peptídica', title:'Produza aminoácidos',
        formula:'N + H₂O → Aminoácidos', hint:'☀ UV ou ⚡ descarga elétrica favorecem esta reação.',
        progress:routeProgress(player,'peptide')
      };
    }
    return null;
  }

  function getObjective(state) {
    const player=state.players[state.activePlayer];
    const chosen=player.focus!=='auto' ? player.focus : autoRoute(player);
    const routed=chosen ? routeObjective(state,chosen) : null;
    if(routed) return routed;

    const env=state.environment[0];
    if(hasResource(player,'N') && hasResource(player,'H₂O') && ['☀','⚡'].includes(env)) {
      return {route:'peptide',kicker:'Possibilidade emergente',title:'Produza aminoácidos',formula:'N + H₂O → Aminoácidos',hint:'Esta combinação abre a rota de catálise peptídica.',progress:{value:0,max:1,label:'0/1'}};
    }
    if(hasResource(player,'P') && hasResource(player,'H₂O') && ['☀','◐'].includes(env)) {
      return {route:'rna',kicker:'Possibilidade emergente',title:'Produza nucleotídeos',formula:'P + H₂O → Nucleotídeos',hint:'Esta combinação abre a rota de Mundo de RNA.',progress:{value:0,max:1,label:'0/1'}};
    }
    if(hasResource(player,'CO') && hasResource(player,'H₂') && env==='♨') {
      return {route:'membrane',kicker:'Possibilidade emergente',title:'Explore a química hidrotermal',formula:'CO + H₂ → Lipídios ou Gradiente',hint:'A mesma matéria pode abrir compartimentalização ou metabolismo.',progress:{value:0,max:1,label:'0/1'}};
    }

    if(hasResource(player,'H₂') && hasResource(player,'O')) {
      return {route:null,kicker:'Química básica',title:'Forme água',formula:'H₂ + O → H₂O',hint:'Toque em H₂ para destacar parceiros possíveis.',progress:{value:hasResource(player,'H₂O')?1:0,max:1,label:hasResource(player,'H₂O')?'1/1':'0/1'}};
    }
    if(countResource(player,'H')>=2) {
      return {route:null,kicker:'Química básica',title:'Forme hidrogênio molecular',formula:'H + H → H₂',hint:'Selecione uma bolha H e combine com outra H.',progress:{value:hasResource(player,'H₂')?1:0,max:1,label:hasResource(player,'H₂')?'1/1':'0/1'}};
    }
    if(hasResource(player,'C') && hasResource(player,'O')) {
      return {route:null,kicker:'Química básica',title:'Forme monóxido de carbono',formula:'C + O → CO',hint:'CO abre possibilidades hidrotermais.',progress:{value:hasResource(player,'CO')?1:0,max:1,label:hasResource(player,'CO')?'1/1':'0/1'}};
    }
    return {route:null,kicker:'Exploração prebiótica',title:'Colete matéria da sopa',formula:'Escolha uma bolha da poça central',hint:'A bolha ? revela um recurso aleatório.',progress:{value:player.collected?1:0,max:1,label:player.collected?'1/1':'0/1'}};
  }

  function selectedContext(state) {
    const player=state.players[state.activePlayer];
    const bubble=player.hand.find(b=>b.id===player.selectedBubbleId);
    if(!bubble) return null;
    const available=possibleRecipes(bubble.resource,state.environment[0]);
    const all=allRecipesFor(bubble.resource);
    const blocked=all.filter(r=>!available.some(a=>a.id===r.id));
    const deposits=[];
    if(bubble.resource==='Aminoácidos') deposits.push({id:'peptide',label:'Incorporar em Peptídeos'});
    if(bubble.resource==='Ácidos graxos') deposits.push({id:'membrane',label:'Incorporar na Protocélula'});
    if(bubble.resource==='Nucleotídeos') deposits.push({id:'rna',label:'Adicionar +9 nt à QT45',enabled:state.environment[0]==='◐'});
    return {bubble:bubble,available:available,blocked:blocked,deposits:deposits};
  }

  function setFocus(state,focus) {
    const player=state.players[state.activePlayer];
    player.focus=focus || 'auto';
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
    state.soup[pair[0]]=makeBubble(recipe.out,'soup',true);
    state.soup[pair[1]]=makeBubble(drawKnown(),'soup',true);
    state.lastBornId=state.soup[pair[0]].id;
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
    rules.auto.forEach(recipeId=>{ const effect=executeFavoredSoupReaction(state,recipeId); if(effect) effects.push('Favorecida: '+effect); });
    rules.regress.forEach(rule=>{ const effect=executeRegression(state,rule); if(effect) effects.push('Prejudicada: '+effect); });

    state.lastEvent={
      id:nextEventId++, icon:icon, title:icon+' '+info.name,
      player:state.players[state.activePlayer].name,
      benefited:rules.benefited.map(id=>recipeById(id)?.label || id),
      harmed:rules.harmed.map(id=>recipeById(id)?.label || id),
      effects:effects, quiet:effects.length===0
    };
    state.log.unshift('Início do turno de '+state.players[state.activePlayer].name+': '+icon+' '+info.name+(effects.length?' — '+effects.join(' | '):' — ambiente sem reação automática na sopa.'));
  }

  function createGame() {
    const state={
      round:1, activePlayer:0,
      players:[makePlayer('Jogador 1'),makePlayer('Jogador 2')],
      soup:initialSoup(),
      environment:Array.from({length:6},drawEnvironment),
      log:['A sopa primordial desperta. Uma bolha desconhecida flutua entre os recursos.'],
      winner:null, lastBornId:null, lastEvent:null
    };
    triggerTurnEvent(state);
    return state;
  }

  function collect(state,bubbleId) {
    const player=state.players[state.activePlayer];
    if(player.collected || state.winner!==null) return false;
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
    player.selectedBubbleId=player.selectedBubbleId===bubbleId ? null : bubbleId;
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
    } else return false;
    player.selectedBubbleId=null;
    checkWinner(state);
    return true;
  }

  function endTurn(state) {
    if(state.winner!==null) return;
    const current=state.players[state.activePlayer];
    current.collected=false; current.perturbed=false; current.selectedBubbleId=null;
    if(state.activePlayer===0) state.activePlayer=1;
    else {
      state.activePlayer=0; state.round+=1;
      state.environment.shift(); state.environment.push(drawEnvironment());
      state.players.forEach(p=>{p.collected=false;p.perturbed=false;p.selectedBubbleId=null;});
    }
    triggerTurnEvent(state);
  }

  function checkWinner(state) {
    const winner=state.players.findIndex(p=>p.rnaModules>=5&&p.membrane>=2&&p.metabolism>=2);
    if(winner>=0) state.winner=winner;
  }

  function leadingRoute(player) {
    const entries=[
      ['rna',player.rnaModules/5],['membrane',player.membrane/2],
      ['metabolism',player.metabolism/2],['peptide',player.peptide/3]
    ].sort((a,b)=>b[1]-a[1]);
    return entries[0][1]>0 ? ROUTES[entries[0][0]].name : 'Exploração prebiótica';
  }

  function currentEnvironmentRules(state) {
    const icon=state.environment[0];
    return {icon:icon,info:ENV_INFO[icon],rules:ENV_RULES[icon]};
  }

  window.SopaGame={
    ENV_INFO, ENV_RULES, COMBOS, ROUTES,
    createGame, collect, selectHandBubble, perturbSelected, combine, deposit, endTurn,
    leadingRoute, recipeFor, possibleRecipes, availableCombos, currentEnvironmentRules,
    routeDiscovery, routeProgress, getObjective, selectedContext, setFocus
  };
})();