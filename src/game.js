(function () {
  const RESOURCES = ['H','H','H','H','C','C','O','O','N','N','P','P','H₂','CO','H₂O','Aminoácidos','Ácidos graxos','Nucleotídeos'];
  const ENV_BAG = ['☀','☀','☀','⚡','⚡','⚡','♨','♨','◐','◐','◐','○','○','○','○'];

  const ENV_INFO = {
    '☀': { name: 'UV', className: 'env-uv', benefit: 'Orgânicos e precursores de RNA' },
    '⚡': { name: 'Descarga elétrica', className: 'env-lightning', benefit: 'Química energética e aminoácidos' },
    '♨': { name: 'Hidrotermal', className: 'env-thermal', benefit: 'Metabolismo e lipídios' },
    '◐': { name: 'Úmido-seco', className: 'env-wetdry', benefit: 'Polimerização, peptídeos e RNA' },
    '○': { name: 'Calmaria', className: 'env-calm', benefit: 'Preparação e estabilidade' }
  };

  const RECIPES = [
    { id:'h2', label:'Formar H₂', inputs:['H','H'], output:'H₂' },
    { id:'co', label:'Formar CO', inputs:['C','O'], output:'CO' },
    { id:'water', label:'Formar H₂O', inputs:['H','H','O'], output:'H₂O' },
    { id:'amino', label:'Gerar aminoácidos', inputs:['N','H₂O'], output:'Aminoácidos', environments:['☀','⚡'] },
    { id:'fatty', label:'Gerar ácidos graxos', inputs:['CO','H₂'], output:'Ácidos graxos', environments:['♨'] },
    { id:'nt', label:'Gerar nucleotídeos', inputs:['P','H₂O'], output:'Nucleotídeos', environments:['☀','◐'] },
    { id:'metabolism', label:'Fixar gradiente metabólico', inputs:['CO','H₂'], environments:['♨'], metabolism:1 }
  ];

  function sample(list) { return list[Math.floor(Math.random() * list.length)]; }
  function drawResource() { return sample(RESOURCES); }
  function drawEnvironment() { return sample(ENV_BAG); }
  function makePlayer(name) {
    return { name, hand:['H','H','C','O','N'], peptide:0, membrane:0, metabolism:0, rnaModules:0, collected:false, perturbed:false };
  }

  function createGame() {
    return {
      round:1,
      activePlayer:0,
      players:[makePlayer('Jogador 1'), makePlayer('Jogador 2')],
      soup:Array.from({length:6}, drawResource),
      environment:Array.from({length:6}, drawEnvironment),
      log:['A sopa primordial desperta.'],
      winner:null
    };
  }

  function removeInputs(hand, inputs) {
    const next = hand.slice();
    for (const input of inputs) {
      const index = next.indexOf(input);
      if (index < 0) return null;
      next.splice(index, 1);
    }
    return next;
  }

  function canUseRecipe(state, recipe) {
    const player = state.players[state.activePlayer];
    if (recipe.environments && !recipe.environments.includes(state.environment[0])) return false;
    return removeInputs(player.hand, recipe.inputs) !== null;
  }

  function collect(state, index) {
    const player = state.players[state.activePlayer];
    if (player.collected || state.winner !== null) return;
    const resource = state.soup[index];
    player.hand.push(resource);
    player.collected = true;
    state.soup[index] = drawResource();
    state.log.unshift(player.name + ' coletou ' + resource + '.');
  }

  function perturb(state, index) {
    const player = state.players[state.activePlayer];
    if (player.perturbed || state.winner !== null || state.environment.length < 2) return;
    const discarded = player.hand.splice(index, 1)[0];
    const removed = state.environment.splice(1, 1)[0];
    state.environment.push(drawEnvironment());
    player.perturbed = true;
    state.log.unshift(player.name + ' sacrificou ' + discarded + ' e removeu ' + removed + ' da sequência ambiental.');
  }

  function synthesize(state, recipeId) {
    const recipe = RECIPES.find(r => r.id === recipeId);
    if (!recipe || !canUseRecipe(state, recipe) || state.winner !== null) return;
    const player = state.players[state.activePlayer];
    player.hand = removeInputs(player.hand, recipe.inputs);
    if (recipe.output) player.hand.push(recipe.output);
    if (recipe.metabolism) player.metabolism += recipe.metabolism;
    state.log.unshift(player.name + ': ' + recipe.label + (recipe.output ? ' → ' + recipe.output : '') + '.');
    checkWinner(state);
  }

  function deposit(state, index, type) {
    const player = state.players[state.activePlayer];
    const resource = player.hand[index];
    if (state.winner !== null) return;

    if (type === 'peptide' && resource === 'Aminoácidos') {
      player.hand.splice(index, 1);
      player.peptide += 1;
      state.log.unshift(player.name + ' incorporou aminoácidos ao catalisador peptídico.');
    } else if (type === 'membrane' && resource === 'Ácidos graxos') {
      player.hand.splice(index, 1);
      player.membrane += 1;
      state.log.unshift(player.name + ' incorporou lipídios à protocélula.');
    } else if (type === 'rna' && resource === 'Nucleotídeos' && state.environment[0] === '◐') {
      player.hand.splice(index, 1);
      player.rnaModules = Math.min(5, player.rnaModules + 1);
      state.log.unshift(player.name + ' polimerizou +9 nt da QT45.');
    } else {
      return;
    }
    checkWinner(state);
  }

  function endTurn(state) {
    if (state.winner !== null) return;
    state.players[state.activePlayer].collected = false;
    state.players[state.activePlayer].perturbed = false;
    if (state.activePlayer === 0) {
      state.activePlayer = 1;
    } else {
      state.activePlayer = 0;
      state.round += 1;
      state.environment.shift();
      state.environment.push(drawEnvironment());
      state.players.forEach(p => { p.collected = false; p.perturbed = false; });
      state.log.unshift('O ambiente avançou para ' + state.environment[0] + '.');
    }
  }

  function checkWinner(state) {
    const winner = state.players.findIndex(p => p.rnaModules >= 5 && p.membrane >= 2 && p.metabolism >= 2);
    if (winner >= 0) state.winner = winner;
  }

  function leadingRoute(player) {
    const routes = [
      ['RNA / QT45', player.rnaModules / 5],
      ['Protocélula', player.membrane / 2],
      ['Metabolismo', player.metabolism / 2],
      ['Peptídeos', player.peptide / 3]
    ];
    routes.sort((a,b) => b[1] - a[1]);
    return routes[0][0];
  }

  window.SopaGame = { ENV_INFO, RECIPES, createGame, canUseRecipe, collect, perturb, synthesize, deposit, endTurn, leadingRoute };
})();