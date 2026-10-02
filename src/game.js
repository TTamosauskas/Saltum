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

  const SIZE = {
    H:54, C:62, O:60, N:58, P:64, 'H₂':68, CO:72, 'H₂O':72,
    'Aminoácidos':88, 'Ácidos graxos':92, 'Nucleotídeos':88, '?':78
  };

  let nextId = 1;
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

  function createGame() {
    return {
      round:1,
      activePlayer:0,
      players:[makePlayer('Jogador 1'),makePlayer('Jogador 2')],
      soup:initialSoup(),
      environment:Array.from({length:6},drawEnvironment),
      log:['A sopa primordial desperta. Uma bolha desconhecida flutua entre os recursos.'],
      winner:null,
      lastBornId:null
    };
  }

  function recipeFor(a,b,currentEnvironment) {
    return COMBOS.find(function(recipe) {
      const pair=(recipe.a===a && recipe.b===b)||(recipe.a===b && recipe.b===a);
      return pair && (!recipe.environments || recipe.environments.includes(currentEnvironment));
    }) || null;
  }

  function possibleRecipes(resource,currentEnvironment) {
    return COMBOS.filter(function(recipe) {
      return (recipe.a===resource || recipe.b===resource) &&
        (!recipe.environments || recipe.environments.includes(currentEnvironment));
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

  function combine(state,sourceId,targetId) {
    if(sourceId===targetId || state.winner!==null) return {ok:false};
    const player=state.players[state.activePlayer];
    const a=player.hand.find(b=>b.id===sourceId);
    const b=player.hand.find(b=>b.id===targetId);
    if(!a || !b) return {ok:false};

    const recipe=recipeFor(a.resource,b.resource,state.environment[0]);
    if(!recipe) return {ok:false};

    const pairMatches=COMBOS.filter(r=>{
      const pair=(r.a===a.resource&&r.b===b.resource)||(r.a===b.resource&&r.b===a.resource);
      return pair && (!r.environments || r.environments.includes(state.environment[0]));
    });
    const chosen=pairMatches.find(r=>r.special!=='metabolism') || pairMatches[0];
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
      state.log.unshift('O ambiente avançou para '+state.environment[0]+'.');
    }
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

  window.SopaGame={
    ENV_INFO:ENV_INFO,
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
    possibleRecipes:possibleRecipes
  };
})();