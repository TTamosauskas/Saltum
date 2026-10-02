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
      duration:0,
      description:'Radiação ultravioleta fornece energia para algumas rotas fotoquímicas prebióticas.'
    },
    '⚡': {
      icon:'⚡',
      name:'Descarga elétrica',
      className:'event-lightning',
      duration:0,
      description:'Uma descarga fornece energia para transformações de pequenas moléculas e precursores orgânicos.'
    },
    '♨': {
      icon:'♨',
      name:'Hidrotermal',
      className:'event-thermal',
      duration:0,
      description:'Calor, minerais e gradientes hidrotermais favorecem algumas sínteses e condensações.'
    },
    '◐': {
      icon:'◐',
      name:'Úmido-seco',
      className:'event-wetdry',
      duration:0,
      description:'Ciclos de concentração e reidratação favorecem condensação e polimerização.'
    },
    '❄': {
      icon:'❄',
      name:'Gelo eutético',
      className:'event-eutectic',
      duration:0,
      description:'O gelo eutético concentra RNA e substratos em uma fase líquida microscópica.'
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
      name:'Sopa mineral',
      atoms:['C','H','H','O','N','P']
    },
    organic: {
      id:'organic',
      name:'Sopa orgânica',
      atoms:['C','H','H','O','N','P']
    },
    protocell: {
      id:'protocell',
      name:'Compartimentalização',
      atoms:['C','H','H','O','N','P']
    },
    rna: {
      id:'rna',
      name:'Mundo de RNA',
      atoms:['C','H','H','O','N','P']
    }
  };

  const COMBOS = [
    { id:'h2', a:'H', b:'H', out:'H₂', color:'#62d6ff', label:'H + H → H₂' },
    { id:'water', a:'H₂', b:'O', out:'H₂O', color:'#69e0df', label:'H₂ + O → H₂O' },
    { id:'co', a:'C', b:'O', out:'CO', color:'#ff9c70', label:'C + O → CO' },
    { id:'methane', a:'C', b:'H₂', out:'CH₄', color:'#74c9a8', label:'C + H₂ → CH₄' },
    { id:'ammonia', a:'N', b:'H₂', out:'NH₃', color:'#8ac8ff', label:'N + H₂ → NH₃' },
    { id:'phosphate', a:'P', b:'H₂O', out:'Fosfato', color:'#d9b6ff', label:'P + H₂O → Fosfato' },

    { id:'formaldehyde', a:'CH₄', b:'O', out:'Formaldeído', events:['☀','⚡'], color:'#f6a76d', label:'CH₄ + O → Formaldeído' },
    { id:'cyanide', a:'C', b:'N', out:'Cianeto', events:['☀','⚡'], color:'#79c7d7', label:'C + N → Cianeto' },
    { id:'sugars', a:'Formaldeído', b:'Formaldeído', out:'Açúcares', events:['◐'], color:'#f0bc78', label:'Formaldeído + Formaldeído → Açúcares' },
    { id:'ribose', a:'Açúcares', b:'H₂O', out:'Ribose', events:['◐'], color:'#e7a76f', label:'Açúcares + H₂O → Ribose' },
    { id:'glycine', a:'Formaldeído', b:'Cianeto', out:'Glicina', events:['⚡','☀','♨'], color:'#ffad79', label:'Formaldeído + Cianeto → Glicina' },
    { id:'aspartate', a:'Glicina', b:'CO', out:'Aspartato', events:['♨','◐'], color:'#ff9274', label:'Glicina + CO → Aspartato' },
    { id:'glutamine', a:'Aspartato', b:'NH₃', out:'Glutamina', events:['♨'], color:'#ff7f76', label:'Aspartato + NH₃ → Glutamina' },
    { id:'fatty', a:'CO', b:'H₂', out:'Ácidos graxos', events:['♨'], color:'#f1d069', label:'CO + H₂ → Ácidos graxos' },

    { id:'adenine', a:'Cianeto', b:'Cianeto', out:'Adenina', events:['☀'], color:'#78e29f', label:'Cianeto + Cianeto → Adenina' },
    { id:'guanine', a:'Cianeto', b:'NH₃', out:'Guanina', events:['☀','♨'], color:'#65d7d8', label:'Cianeto + NH₃ → Guanina' },
    { id:'uracil', a:'Aspartato', b:'CO', out:'Uracila', events:['☀','◐'], color:'#c29bff', label:'Aspartato + CO → Uracila' },
    { id:'cytosine', a:'Uracila', b:'NH₃', out:'Citosina', events:['☀','♨'], color:'#ee91cf', label:'Uracila + NH₃ → Citosina' },

    { id:'simple-lipid', a:'Ácidos graxos', b:'Ácidos graxos', out:'Lipídio simples', color:'#e7d875', label:'Ácidos graxos + Ácidos graxos → Lipídio simples' },
    { id:'vesicle', a:'Lipídio simples', b:'Lipídio simples', out:'Vesícula', color:'#e9df84', label:'Lipídio simples + Lipídio simples → Vesícula' },
    { id:'short-peptide', a:'Glicina', b:'Aspartato', out:'Peptídeo curto', events:['◐','♨'], color:'#ff8f72', label:'Glicina + Aspartato → Peptídeo curto' },
    { id:'catalytic-peptide', a:'Peptídeo curto', b:'Glutamina', out:'Peptídeo catalítico', events:['◐','♨'], color:'#ff776d', label:'Peptídeo curto + Glutamina → Peptídeo catalítico' },
    { id:'protobiont', a:'Vesícula', b:'Peptídeo catalítico', out:'Protobionte', color:'#75d8b9', label:'Vesícula + Peptídeo catalítico → Protobionte' },

    { id:'adenosine', a:'Adenina', b:'Ribose', out:'Adenosina', events:['☀','◐'], color:'#81e2a2', label:'Adenina + Ribose → Adenosina' },
    { id:'guanosine', a:'Guanina', b:'Ribose', out:'Guanosina', events:['☀','◐'], color:'#78dbdc', label:'Guanina + Ribose → Guanosina' },
    { id:'uridine', a:'Uracila', b:'Ribose', out:'Uridina', events:['☀','◐'], color:'#c4a4ff', label:'Uracila + Ribose → Uridina' },
    { id:'cytidine', a:'Citosina', b:'Ribose', out:'Citidina', events:['☀','◐'], color:'#ed9ad3', label:'Citosina + Ribose → Citidina' },

    { id:'amp', a:'Adenosina', b:'Fosfato', out:'AMP', events:['◐'], color:'#74e09a', label:'Adenosina + Fosfato → AMP' },
    { id:'gmp', a:'Guanosina', b:'Fosfato', out:'GMP', events:['◐'], color:'#66d5d7', label:'Guanosina + Fosfato → GMP' },
    { id:'ump', a:'Uridina', b:'Fosfato', out:'UMP', events:['◐'], color:'#b995ff', label:'Uridina + Fosfato → UMP' },
    { id:'cmp', a:'Citidina', b:'Fosfato', out:'CMP', events:['◐'], color:'#e48dca', label:'Citidina + Fosfato → CMP' },
    { id:'au-pair', a:'AMP', b:'UMP', out:'Pool A/U', color:'#93ccdf', label:'AMP + UMP → Pool A/U' },
    { id:'cg-pair', a:'CMP', b:'GMP', out:'Pool C/G', color:'#b4a8db', label:'CMP + GMP → Pool C/G' },
    { id:'rna-pool', a:'Pool A/U', b:'Pool C/G', out:'Pool de RNA', color:'#9da8ff', label:'Pool A/U + Pool C/G → Pool de RNA' },
    { id:'activated-nt', a:'Pool de RNA', b:'Fosfato', out:'Nucleotídeos ativados', events:['◐'], color:'#9e91ff', label:'Pool de RNA + Fosfato → Nucleotídeos ativados' },
    { id:'activated-triplets', a:'Nucleotídeos ativados', b:'Nucleotídeos ativados', out:'Trinucleotídeos ativados', events:['◐','❄'], color:'#a58dff', label:'Nucleotídeos ativados + Nucleotídeos ativados → Trinucleotídeos ativados' },

    { id:'rna-oligomer', a:'Trinucleotídeos ativados', b:'H₂O', out:'Oligômero de RNA', events:['◐','❄'], preserve:['Trinucleotídeos ativados'], color:'#aa8cff', label:'Trinucleotídeos ativados + H₂O → Oligômero de RNA' },
    { id:'rna-template', a:'Oligômero de RNA', b:'Oligômero de RNA', out:'RNA molde', events:['◐','❄'], color:'#ae8eff', label:'Oligômero de RNA + Oligômero de RNA → RNA molde' },
    { id:'catalytic-rna', a:'RNA molde', b:'Trinucleotídeos ativados', out:'RNA catalítico', events:['❄'], preserve:['Trinucleotídeos ativados'], color:'#b08cff', label:'RNA molde + Trinucleotídeos ativados → RNA catalítico' },
    { id:'qt45', a:'RNA catalítico', b:'Trinucleotídeos ativados', out:'QT45', events:['❄'], preserve:['Trinucleotídeos ativados'], color:'#b895ff', label:'RNA catalítico + Trinucleotídeos ativados → QT45' },
    { id:'complement', a:'QT45', b:'Trinucleotídeos ativados', out:'Fita complementar', events:['❄'], preserve:['QT45','Trinucleotídeos ativados'], color:'#c09cff', label:'QT45 + Trinucleotídeos ativados → Fita complementar' },
    { id:'qt45-copy', a:'Fita complementar', b:'Trinucleotídeos ativados', out:'Cópia de QT45', events:['❄'], preserve:['Trinucleotídeos ativados'], color:'#c8a4ff', label:'Fita complementar + Trinucleotídeos ativados → Cópia de QT45' },
    { id:'self-replicating-rna', a:'QT45', b:'Cópia de QT45', out:'RNA autorreplicante', events:['❄'], color:'#d0afff', label:'QT45 + Cópia de QT45 → RNA autorreplicante' },
    { id:'replicating-system', a:'Protobionte', b:'RNA autorreplicante', out:'Sistema autorreplicante', color:'#ffffff', label:'Protobionte + RNA autorreplicante → Sistema autorreplicante' }
  ];

  const PHASES = [
    {id:'h2',title:'Hidrogênio molecular',chapter:'Atmosfera primitiva',period:'atmosphere',objective:'Forme 3 H₂',formula:'H + H → H₂',hint:'Estabilize hidrogênio molecular para alimentar várias rotas seguintes.',target:'H₂',targetCount:3},
    {id:'water',title:'Água',chapter:'Atmosfera primitiva',period:'atmosphere',objective:'Forme 3 H₂O',formula:'H₂ + O → H₂O',hint:'Use H₂ acumulado e incorpore oxigênio.',target:'H₂O',targetCount:3},
    {id:'co',title:'Monóxido de carbono',chapter:'Atmosfera primitiva',period:'atmosphere',objective:'Forme 3 CO',formula:'C + O → CO',hint:'Construa um reservatório de carbono reativo.',target:'CO',targetCount:3},
    {id:'methane',title:'Metano',chapter:'Atmosfera primitiva',period:'atmosphere',objective:'Forme 2 CH₄',formula:'C + H₂ → CH₄',hint:'Receita simplificada do jogo para um gás reduzido rico em carbono.',target:'CH₄',targetCount:2},
    {id:'ammonia',title:'Amônia',chapter:'Atmosfera primitiva',period:'atmosphere',objective:'Forme 2 NH₃',formula:'N + H₂ → NH₃',hint:'Receita simplificada do jogo para nitrogênio reduzido.',target:'NH₃',targetCount:2},
    {id:'phosphate',title:'Fosfato disponível',chapter:'Atmosfera + minerais',period:'mineral',objective:'Disponibilize 4 fosfatos',formula:'P + H₂O → Fosfato',hint:'O fósforo entra no fluxo mineral e será reutilizado na química de nucleotídeos.',target:'Fosfato',targetCount:4},

    {id:'formaldehyde',title:'Formaldeído',chapter:'Precursores orgânicos',period:'organic',objective:'Produza 3 formaldeídos',formula:'CH₄ + O → Formaldeído',hint:'Ative UV ou descarga elétrica para esta abstração fotoquímica/energética.',target:'Formaldeído',targetCount:3},
    {id:'cyanide',title:'Cianeto',chapter:'Precursores orgânicos',period:'organic',objective:'Produza 3 cianetos',formula:'C + N → Cianeto',hint:'Ative UV ou descarga elétrica para formar o precursor nitrogenado do jogo.',target:'Cianeto',targetCount:3},
    {id:'sugars',title:'Mistura de açúcares',chapter:'Precursores orgânicos',period:'organic',objective:'Forme 2 pools de açúcares',formula:'2 Formaldeídos → Açúcares',hint:'Um ciclo úmido-seco concentra a química de carbonilas.',target:'Açúcares',targetCount:2},
    {id:'ribose',title:'Ribose',chapter:'Precursores orgânicos',period:'organic',objective:'Separe 4 riboses',formula:'Açúcares + H₂O → Ribose',hint:'O jogo resume formação e seleção de ribose em uma etapa de concentração.',target:'Ribose',targetCount:4},
    {id:'glycine',title:'Glicina',chapter:'Aminoácidos',period:'organic',objective:'Produza 2 glicinas',formula:'Formaldeído + Cianeto → Glicina',hint:'⚡, ☀ ou ♨ podem fornecer a condição ambiental desta síntese abstrata.',target:'Glicina',targetCount:2},
    {id:'aspartate',title:'Aspartato',chapter:'Aminoácidos',period:'organic',objective:'Produza 2 aspartatos',formula:'Glicina + CO → Aspartato',hint:'A etapa representa uma rota de diversificação de aminoácidos do jogo.',target:'Aspartato',targetCount:2},
    {id:'glutamine',title:'Glutamina',chapter:'Aminoácidos',period:'organic',objective:'Produza Glutamina',formula:'Aspartato + NH₃ → Glutamina',hint:'A rota é uma abstração estratégica e utiliza ambiente hidrotermal.',target:'Glutamina',targetCount:1},
    {id:'fatty',title:'Ácidos graxos',chapter:'Precursores orgânicos',period:'organic',objective:'Produza 4 ácidos graxos',formula:'CO + H₂ → Ácidos graxos',hint:'Capture ♨ e acumule anfifílicos suficientes para a futura membrana.',target:'Ácidos graxos',targetCount:4},

    {id:'adenine',title:'Adenina',chapter:'Bases nitrogenadas',period:'organic',objective:'Produza Adenina',formula:'2 Cianetos → Adenina',hint:'O jogo comprime uma rede de química de cianeto em uma descoberta de purina.',target:'Adenina',targetCount:1},
    {id:'guanine',title:'Guanina',chapter:'Bases nitrogenadas',period:'organic',objective:'Produza Guanina',formula:'Cianeto + NH₃ → Guanina',hint:'Uma segunda rota nitrogenada abre a outra purina.',target:'Guanina',targetCount:1},
    {id:'uracil',title:'Uracila',chapter:'Bases nitrogenadas',period:'organic',objective:'Produza 2 Uracilas',formula:'Aspartato + CO → Uracila',hint:'A receita representa um ramo de pirimidinas do jogo.',target:'Uracila',targetCount:2},
    {id:'cytosine',title:'Citosina',chapter:'Bases nitrogenadas',period:'organic',objective:'Produza Citosina',formula:'Uracila + NH₃ → Citosina',hint:'Complete o segundo ramo de pirimidinas.',target:'Citosina',targetCount:1},

    {id:'simple-lipid',title:'Lipídios simples',chapter:'Compartimentalização',period:'protocell',objective:'Forme 2 lipídios simples',formula:'2 Ácidos graxos → Lipídio simples',hint:'Concentre anfifílicos antes da auto-organização da membrana.',target:'Lipídio simples',targetCount:2},
    {id:'vesicle',title:'Primeira vesícula',chapter:'Compartimentalização',period:'protocell',objective:'Feche a primeira vesícula',formula:'2 Lipídios simples → Vesícula',hint:'Ao concluir esta fase surge pela primeira vez o contorno do compartimento.',target:'Vesícula',targetCount:1},
    {id:'short-peptide',title:'Peptídeo curto',chapter:'Compartimentalização',period:'protocell',objective:'Forme um peptídeo curto',formula:'Glicina + Aspartato → Peptídeo curto',hint:'Ciclos úmido-seco ou ambiente hidrotermal favorecem a condensação do jogo.',target:'Peptídeo curto',targetCount:1},
    {id:'catalytic-peptide',title:'Peptídeo catalítico',chapter:'Compartimentalização',period:'protocell',objective:'Forme um peptídeo catalítico',formula:'Peptídeo curto + Glutamina → Peptídeo catalítico',hint:'A cadeia peptídica passa a estabilizar e enriquecer o compartimento.',target:'Peptídeo catalítico',targetCount:1},
    {id:'protobiont',title:'Protobionte',chapter:'Compartimentalização',period:'protocell',objective:'Integre um protobionte',formula:'Vesícula + Peptídeo catalítico → Protobionte',hint:'Integre membrana e química peptídica em um único sistema.',target:'Protobionte',targetCount:1},

    {id:'adenosine',title:'Adenosina',chapter:'Nucleosídeos',period:'rna',objective:'Forme Adenosina',formula:'Adenina + Ribose → Adenosina',hint:'Una a purina A à ribose.',target:'Adenosina',targetCount:1},
    {id:'guanosine',title:'Guanosina',chapter:'Nucleosídeos',period:'rna',objective:'Forme Guanosina',formula:'Guanina + Ribose → Guanosina',hint:'Una a purina G à ribose.',target:'Guanosina',targetCount:1},
    {id:'uridine',title:'Uridina',chapter:'Nucleosídeos',period:'rna',objective:'Forme Uridina',formula:'Uracila + Ribose → Uridina',hint:'Una a pirimidina U à ribose.',target:'Uridina',targetCount:1},
    {id:'cytidine',title:'Citidina',chapter:'Nucleosídeos',period:'rna',objective:'Forme Citidina',formula:'Citosina + Ribose → Citidina',hint:'Una a pirimidina C à ribose.',target:'Citidina',targetCount:1},

    {id:'amp',title:'AMP',chapter:'Nucleotídeos',period:'rna',objective:'Forme AMP',formula:'Adenosina + Fosfato → AMP',hint:'Fosforile o nucleosídeo de adenina.',target:'AMP',targetCount:1},
    {id:'gmp',title:'GMP',chapter:'Nucleotídeos',period:'rna',objective:'Forme GMP',formula:'Guanosina + Fosfato → GMP',hint:'Fosforile o nucleosídeo de guanina.',target:'GMP',targetCount:1},
    {id:'ump',title:'UMP',chapter:'Nucleotídeos',period:'rna',objective:'Forme UMP',formula:'Uridina + Fosfato → UMP',hint:'Fosforile o nucleosídeo de uracila.',target:'UMP',targetCount:1},
    {id:'cmp',title:'CMP',chapter:'Nucleotídeos',period:'rna',objective:'Forme CMP',formula:'Citidina + Fosfato → CMP',hint:'Fosforile o nucleosídeo de citosina.',target:'CMP',targetCount:1},
    {id:'au-pair',title:'Pool A/U',chapter:'Nucleotídeos',period:'rna',objective:'Monte o pool A/U',formula:'AMP + UMP → Pool A/U',hint:'Reserve um conjunto complementar A/U.',target:'Pool A/U',targetCount:1},
    {id:'cg-pair',title:'Pool C/G',chapter:'Nucleotídeos',period:'rna',objective:'Monte o pool C/G',formula:'CMP + GMP → Pool C/G',hint:'Reserve um conjunto complementar C/G.',target:'Pool C/G',targetCount:1},
    {id:'rna-pool',title:'Pool completo de RNA',chapter:'Nucleotídeos',period:'rna',objective:'Reúna os quatro tipos de nucleotídeo',formula:'Pool A/U + Pool C/G → Pool de RNA',hint:'Os quatro alfabetos do RNA convergem nesta fase.',target:'Pool de RNA',targetCount:1},
    {id:'activated-nt',title:'Nucleotídeos ativados',chapter:'Nucleotídeos',period:'rna',objective:'Ative o pool de nucleotídeos',formula:'Pool de RNA + Fosfato → Nucleotídeos ativados',hint:'A ativação é uma abstração energética do jogo.',target:'Nucleotídeos ativados',targetCount:2},
    {id:'activated-triplets',title:'Trinucleotídeos ativados',chapter:'Nucleotídeos',period:'rna',objective:'Forme um pool de trinucleotídeos',formula:'2 Nucleotídeos ativados → Trinucleotídeos ativados',hint:'Os substratos de três bases preparam a química usada por QT45.',target:'Trinucleotídeos ativados',targetCount:1},

    {id:'rna-oligomer',title:'Oligômero de RNA',chapter:'Mundo de RNA',period:'rna',objective:'Forme 2 oligômeros de RNA',formula:'Trinucleotídeos ativados + H₂O → Oligômero de RNA',hint:'Concentre e ligue unidades menores em cadeias curtas.',target:'Oligômero de RNA',targetCount:2},
    {id:'rna-template',title:'RNA molde',chapter:'Mundo de RNA',period:'rna',objective:'Monte um RNA molde',formula:'2 Oligômeros de RNA → RNA molde',hint:'A sequência é abstrata; o jogo representa apenas sua montagem funcional.',target:'RNA molde',targetCount:1},
    {id:'catalytic-rna',title:'RNA catalítico',chapter:'Mundo de RNA',period:'rna',objective:'Obtenha RNA catalítico',formula:'RNA molde + Trinucleotídeos ativados → RNA catalítico',hint:'O gelo eutético concentra RNA e substratos para a etapa catalítica.',target:'RNA catalítico',targetCount:1},
    {id:'qt45',title:'QT45',chapter:'Mundo de RNA',period:'rna',objective:'Monte QT45',formula:'RNA catalítico + Trinucleotídeos ativados → QT45',hint:'QT45 representa a ribozima polimerase de 45 nucleotídeos no modelo do jogo.',target:'QT45',targetCount:1},
    {id:'complement',title:'Fita complementar',chapter:'Replicação de RNA',period:'rna',objective:'Sintetize a fita complementar',formula:'QT45 + Trinucleotídeos ativados → Fita complementar',hint:'QT45 permanece ativo enquanto catalisa a síntese dirigida por molde.',target:'Fita complementar',targetCount:1},
    {id:'qt45-copy',title:'Cópia de QT45',chapter:'Replicação de RNA',period:'rna',objective:'Sintetize uma cópia de QT45',formula:'Fita complementar + Trinucleotídeos ativados → Cópia de QT45',hint:'Complete o segundo braço necessário para o ciclo de replicação.',target:'Cópia de QT45',targetCount:1},
    {id:'self-replicating-rna',title:'RNA autorreplicante',chapter:'Replicação de RNA',period:'rna',objective:'Feche o ciclo de autorreplicação',formula:'QT45 + Cópia de QT45 → RNA autorreplicante',hint:'O jogo registra um sistema de RNA capaz de produzir as duas direções do ciclo.',target:'RNA autorreplicante',targetCount:1},
    {id:'replicating-system',title:'Sistema autorreplicante',chapter:'Replicação de RNA',period:'rna',objective:'Integre replicação e compartimento',formula:'Protobionte + RNA autorreplicante → Sistema autorreplicante',hint:'Integre o sistema de RNA ao compartimento prebiótico para concluir a campanha.',target:'Sistema autorreplicante',targetCount:1}
  ].map(p=>{
    const recipe=COMBOS.find(r=>r.id===p.id);
    return {...p,spawnEvents:['☀F',...((recipe&&recipe.events)||[])]};
  });

  const SIZE = {
    H:54,C:62,O:60,N:58,P:64,
    'H₂':68,'H₂O':72,CO:72,'CH₄':72,'NH₃':72,'Fosfato':78,
    'Formaldeído':84,'Cianeto':78,'Açúcares':86,'Ribose':82,
    'Glicina':82,'Aspartato':86,'Glutamina':88,'Ácidos graxos':92,
    'Adenina':82,'Guanina':82,'Uracila':82,'Citosina':82,
    'Lipídio simples':94,'Vesícula':102,'Peptídeo curto':96,'Peptídeo catalítico':104,'Protobionte':108,
    'Adenosina':88,'Guanosina':88,'Uridina':88,'Citidina':88,
    AMP:74,GMP:74,UMP:74,CMP:74,'Pool A/U':86,'Pool C/G':86,'Pool de RNA':94,
    'Nucleotídeos ativados':98,'Trinucleotídeos ativados':104,
    'Oligômero de RNA':104,'RNA molde':106,'RNA catalítico':108,'QT45':104,
    'Fita complementar':110,'Cópia de QT45':110,'RNA autorreplicante':114,'Sistema autorreplicante':118
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
    if(audit.valid&&audit.allPhaseTargetsCovered){
      state.log.unshift('Auditoria de receitas: 44 fases, 44 receitas e 44 metas únicas validadas.');
    }
    return state;
  }

  function activeEventIcon(state){
    expireEvent(state);
    return state.activeEvent?state.activeEvent.icon:null;
  }

  function expireEvent(state){
    if(state.activeEvent&&state.activeEvent.consumable) return false;
    if(state.activeEvent&&state.activeEvent.expiresAt&&Date.now()>=state.activeEvent.expiresAt){
      state.log.unshift(state.activeEvent.icon+' '+state.activeEvent.name+' terminou.');
      state.activeEvent=null;
      return true;
    }
    return false;
  }

  function recipePhaseIndex(recipe){
    return PHASES.findIndex(p=>p.id===recipe.id);
  }

  function recipeUnlocked(state,recipe){
    const index=recipePhaseIndex(recipe);
    return index>=0&&index<=state.phaseIndex;
  }

  function isRecipeEnabled(state,recipe){
    if(!recipeUnlocked(state,recipe)) return false;
    if(!recipe.events||!recipe.events.length) return true;
    const icon=activeEventIcon(state);
    return !!icon&&recipe.events.includes(icon);
  }

  function possibleRecipes(state,resource){
    return COMBOS.filter(recipe=>
      recipeUnlocked(state,recipe)&&
      (recipe.a===resource||recipe.b===resource)&&
      isRecipeEnabled(state,recipe)
    );
  }

  function recipeConditions(recipe){
    return recipe&&Array.isArray(recipe.events)?recipe.events.slice():[];
  }

  function phaseRecipe(state){
    return recipeById(phase(state).id);
  }

  function phaseConditions(state){
    return recipeConditions(phaseRecipe(state));
  }

  function allRecipesFor(state,resource){
    return COMBOS.filter(recipe=>
      recipeUnlocked(state,recipe)&&(recipe.a===resource||recipe.b===resource)
    );
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
    const blocked=allRecipesFor(state,bubble.resource).filter(r=>!available.some(a=>a.id===r.id));
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
        harmed:[],
        targets:eligible,
        effects:[spec.description],
        quiet:false
      };
      state.lastEvent=event;
      state.log.unshift('☀ Fotólise ativada. '+eligible.length+' bolha(s) elegível(is) para decomposição.');
      return event;
    }
    state.activeEvent={
      icon,
      name:spec.name,
      className:spec.className,
      consumable:true,
      startedAt:Date.now(),
      expiresAt:null,
      duration:null
    };
    const benefited=COMBOS.filter(r=>r.events&&r.events.includes(icon)).map(r=>r.label);
    const event={
      id:nextEventId++,
      icon,
      title:icon+' '+spec.name,
      subtitle:'Catalisador capturado · 1 reação',
      benefited,
      harmed:[],
      effects:[spec.description,'A próxima receita compatível consumirá este catalisador.'],
      quiet:false
    };
    state.lastEvent=event;
    state.log.unshift(icon+' '+spec.name+' foi capturado como catalisador para uma reação.');
    return event;
  }

  function nextFaller(state){
    const p=phase(state);
    const hasEvents=p.spawnEvents.length>0;
    const eventProbability=hasEvents?0.30:0;
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
    const preserve=new Set(recipe.preserve||[]);
    const ids=[a,b].filter(item=>!preserve.has(item.resource)).map(item=>item.id);
    state.soup=state.soup.filter(item=>!ids.includes(item.id));
    const born=makeBubble(recipe.out,true,x,y);
    state.soup.push(born);
    state.selectedBubbleId=null;
    state.lastBornId=born.id;
    state.log.unshift(recipe.label+'.');
    if(recipe.events&&recipe.events.length&&state.activeEvent&&recipe.events.includes(state.activeEvent.icon)){
      state.log.unshift(state.activeEvent.icon+' '+state.activeEvent.name+' foi consumido pela reação.');
      state.activeEvent=null;
    }
    checkPhaseComplete(state);
    return {ok:true,recipe,born};
  }

  function recipeAudit(){
    const outputs=new Set(COMBOS.map(r=>r.out));
    const ids=COMBOS.map(r=>r.id);
    const idSet=new Set(ids);
    const phaseTargets=PHASES.map(p=>({
      phase:p.id,
      target:p.target,
      covered:outputs.has(p.target),
      recipe:idSet.has(p.id)
    }));
    const missingRecipes=PHASES.filter(p=>!idSet.has(p.id)).map(p=>p.id);
    const duplicateRecipeIds=ids.filter((id,index)=>ids.indexOf(id)!==index);
    const targetNames=PHASES.map(p=>p.target);
    const duplicateTargets=targetNames.filter((target,index)=>targetNames.indexOf(target)!==index);
    return {
      phaseTargets,
      missingRecipes,
      duplicateRecipeIds:[...new Set(duplicateRecipeIds)],
      duplicateTargets:[...new Set(duplicateTargets)],
      allPhaseTargetsCovered:phaseTargets.every(item=>item.covered&&item.recipe),
      valid:missingRecipes.length===0&&duplicateRecipeIds.length===0&&duplicateTargets.length===0
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
      progress:phaseProgress(state),
      conditions:phaseConditions(state)
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

  function hasCompartment(state){
    const vesicleIndex=PHASES.findIndex(p=>p.id==='vesicle');
    return state.completedPhases.includes(vesicleIndex)||state.phaseIndex>vesicleIndex;
  }

  function phaseStatus(state,index){
    if(index===state.phaseIndex) return 'current';
    if(state.completedPhases.includes(index)) return 'completed';
    if(state.editorMode||index<=state.unlockedPhase) return 'available';
    return 'locked';
  }

  window.SopaGame={
    ATOMS,EVENTS,PERIODS,COMBOS,PHASES,
    createGame,phase,period,objective,phaseProgress,phaseStatus,hasCompartment,phaseRecipe,phaseConditions,recipeConditions,recipeUnlocked,
    captureAtom,captureMatter,moveBubble,releaseBubble,activateEvent,nextFaller,expireEvent,activeEventIcon,
    photolysisActive,canDecompose,decomposeBubble,
    selectBubble,selectedContext,possibleRecipes,availableCombos,combine,
    nextPhase,restartPhase,jumpToPhase,countResource,recipeAudit
  };
})();