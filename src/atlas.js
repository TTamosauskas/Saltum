/* Sopa Primordial — editorial discovery atlas. Images are local repository assets. */
(function(){
  'use strict';

  const G=window.SopaGame;
  if(!G) return;

  const IMG='./assets/atlas/images/';
  const wiki=title=>'https://pt.wikipedia.org/wiki/'+encodeURIComponent(String(title).replace(/ /g,'_'));

  const STRUCTURE_INFO={
    H:['Hidrogênio é o elemento químico mais simples e abundante do Universo; no jogo, H representa átomos disponíveis para formar moléculas pequenas.','Em cenários prebióticos, compostos ricos em hidrogênio participam de reações de redução e ajudam a definir a química disponível no ambiente.',wiki('Hidrogênio'),'miller-urey.png'],
    C:['Carbono é o elemento que sustenta a enorme diversidade estrutural da química orgânica graças à capacidade de formar várias ligações covalentes.','A química da origem da vida depende de fontes de carbono capazes de alimentar moléculas cada vez mais complexas.',wiki('Carbono'),'miller-urey.png'],
    O:['Oxigênio é um elemento muito reativo que aparece em água, óxidos, carbonilas e inúmeros grupos funcionais.','Na Terra primitiva, o oxigênio livre era escasso; no jogo ele representa de forma simplificada fontes oxidantes disponíveis para certas transformações.',wiki('Oxigênio'),'water.png'],
    N:['Nitrogênio é um elemento essencial de aminoácidos, bases nitrogenadas e muitos cofatores biológicos.','Tornar nitrogênio quimicamente acessível é um passo importante em rotas prebióticas que levam a aminoácidos e nucleobases.',wiki('Nitrogênio'),'ammonia.png'],
    P:['Fósforo integra fosfatos, membranas modernas e o esqueleto dos ácidos nucleicos.','A disponibilidade de fosfato é um problema central em química prebiótica; minerais e ciclos ambientais podem concentrar e ativar espécies de fósforo.',wiki('Fósforo'),'black-smoker.jpg'],
    'H₂':['Hidrogênio molecular é formado por dois átomos de hidrogênio e atua como um reservatório simples de poder redutor.','Ambientes ricos em H₂, inclusive sistemas hidrotermais, são relevantes em hipóteses sobre fontes de energia química na Terra primitiva.',wiki('Hidrogênio'),'miller-urey.png'],
    'H₂O':['Água é uma molécula polar formada por dois hidrogênios e um oxigênio; suas propriedades de solvatação estruturam grande parte da química da vida.','Além de solvente, água participa diretamente de hidrólises, condensações e da auto-organização de anfifílicos em compartimentos.',wiki('Água'),'water.png'],
    CO:['Monóxido de carbono é uma pequena molécula contendo carbono e oxigênio, capaz de participar de redes de síntese em condições adequadas.','CO aparece em diferentes cenários geoquímicos e astroquímicos como uma fonte de carbono reduzido para química orgânica.',wiki('Monóxido de carbono'),'miller-urey.png'],
    'CH₄':['Metano é o hidrocarboneto mais simples, com um carbono ligado a quatro hidrogênios.','Misturas contendo metano foram historicamente exploradas em experimentos de química prebiótica por fornecerem carbono em estado reduzido.',wiki('Metano'),'methane.png'],
    'NH₃':['Amônia é uma molécula simples de nitrogênio e hidrogênio e uma fonte reativa de nitrogênio reduzido.','Em experimentos prebióticos, amônia pode alimentar a formação de compostos nitrogenados; sua abundância real depende do ambiente considerado.',wiki('Amoníaco'),'ammonia.png'],
    'Fosfato':['Fosfato é uma família de espécies derivadas do ácido fosfórico e contém fósforo ligado a oxigênio.','Fosfatos são fundamentais para nucleotídeos e transferência de energia, mas sua disponibilidade prebiótica exige mecanismos de concentração e ativação.',wiki('Fosfato'),'black-smoker.jpg'],
    'Formaldeído':['Formaldeído é o aldeído mais simples e possui um carbono altamente reativo em um grupo carbonila.','Ele é um intermediário clássico em redes prebióticas de formação de açúcares. A receita do jogo comprime várias etapas químicas em uma única transformação.',wiki('Formaldeído'),'formaldehyde.png'],
    'Cianeto':['Cianeto designa espécies que contêm o grupo C≡N; formas como o cianeto de hidrogênio são pequenas, reativas e ricas em carbono e nitrogênio.','HCN e seus derivados aparecem em muitas rotas experimentais para bases nitrogenadas, aminoácidos e outros precursores.',wiki('Cianeto'),'miller-urey.png'],
    'Açúcares':['Açúcares são carboidratos com vários grupos hidroxila e carbonila, capazes de existir em muitas estruturas e isômeros.','A química prebiótica pode gerar misturas complexas de açúcares; o jogo representa essa diversidade como um único pool antes de destacar a ribose.',wiki('Carboidrato'),'ribose.png'],
    'Ribose':['Ribose é um açúcar de cinco carbonos que compõe o esqueleto do RNA.','Produzir e selecionar ribose de maneira plausível é um desafio da química prebiótica. No jogo, uma etapa resume formação, concentração e seleção.',wiki('Ribose'),'ribose.png'],
    'Glicina':['Glicina é o aminoácido proteinogênico mais simples, com um grupo amino e um grupo carboxila ligados ao mesmo carbono.','É um produto frequente em experimentos e materiais extraterrestres relacionados à química prebiótica, tornando-se um bom marco de complexidade orgânica.',wiki('Glicina'),'glycine.png'],
    'Aspartato':['Aspartato é a forma ionizada do ácido aspártico, um aminoácido com um segundo grupo carboxila na cadeia lateral.','No jogo ele representa a diversificação de aminoácidos a partir de uma rede orgânica já mais rica, não uma única reação prebiótica estabelecida.',wiki('Ácido aspártico'),'aspartic-acid.png'],
    'Glutamina':['Glutamina é um aminoácido com um grupo amida na cadeia lateral e desempenha papel importante no metabolismo moderno do nitrogênio.','Sua formação no jogo é uma abstração de aumento de complexidade química; não pretende reproduzir uma rota prebiótica única e comprovada.',wiki('Glutamina'),'glutamine.png'],
    'Ácidos graxos':['Ácidos graxos possuem uma cabeça carboxílica polar ligada a uma cadeia hidrocarbonada hidrofóbica.','Moléculas anfifílicas simples podem se auto-organizar em micelas e vesículas, oferecendo uma rota plausível para compartimentos anteriores às células modernas.',wiki('Ácido graxo'),'fatty-acid.png'],
    'Lipídio simples':['Aqui, “lipídio simples” representa um conjunto de anfifílicos concentrados e organizados, não uma espécie molecular única.','A etapa modela a tendência de moléculas com regiões hidrofílicas e hidrofóbicas se associarem em água antes da formação de uma vesícula fechada.',wiki('Lipídio'),'fatty-acid.png'],
    'Vesícula':['Uma vesícula é um compartimento delimitado por uma camada ou bicamada de moléculas anfifílicas.','Vesículas de ácidos graxos são modelos importantes de protocélulas porque podem concentrar moléculas e criar um interior quimicamente distinto do ambiente.',wiki('Lipossoma'),'fatty-acid.png'],
    'Adenina':['Adenina é uma base nitrogenada do grupo das purinas, formada por dois anéis fundidos ricos em nitrogênio.','Ela participa de RNA, DNA e moléculas energéticas modernas. Rotas prebióticas baseadas em cianeto demonstram caminhos para purinas.',wiki('Adenina'),'adenine.png'],
    'Guanina':['Guanina é uma purina nitrogenada que forma pares canônicos com citosina nos ácidos nucleicos.','Sua presença amplia o alfabeto químico disponível para sistemas informacionais; o jogo comprime redes de síntese reais em uma etapa estratégica.',wiki('Guanina'),'guanine.png'],
    'Uracila':['Uracila é uma base pirimídica de um único anel usada no RNA, onde faz pareamento com adenina.','Pirimidinas possuem rotas prebióticas diferentes das purinas; reuni-las no mesmo cenário é parte do desafio de explicar a origem de sistemas de RNA.',wiki('Uracila'),'uracil.png'],
    'Citosina':['Citosina é uma base pirimídica nitrogenada que pareia com guanina em RNA e DNA.','A citosina é quimicamente menos estável que algumas outras bases em certos ambientes, tornando sua produção e persistência um ponto relevante em cenários prebióticos.',wiki('Citosina'),'cytosine.png'],
    'Peptídeo curto':['Peptídeos são cadeias de aminoácidos unidos por ligações peptídicas; uma cadeia curta já pode apresentar propriedades diferentes de seus monômeros.','Ciclos de secagem, superfícies minerais e fontes de energia são investigados como maneiras de favorecer condensação de aminoácidos antes de enzimas modernas.',wiki('Peptídeo'),'glycine.png'],
    'Peptídeo catalítico':['“Peptídeo catalítico” representa uma pequena cadeia capaz de favorecer alguma transformação química.','O jogo usa essa estrutura como ponte entre moléculas simples e sistemas mais funcionais; não corresponde a uma enzima moderna específica.',wiki('Catálise enzimática'),'glutamine.png'],
    'Protobionte':['Protobionte é um termo usado para modelos de sistemas pré-celulares que combinam compartimento e química interna organizada.','Na Sopa, o protobionte integra uma vesícula já existente com componentes peptídicos, simbolizando a emergência de cooperação entre fronteira e química interna.',wiki('Protocélula'),'fatty-acid.png'],
    'Adenosina':['Adenosina é um nucleosídeo formado pela ligação da adenina à ribose.','Nucleosídeos conectam bases informacionais a açúcares e preparam a arquitetura usada por nucleotídeos de RNA.',wiki('Adenosina'),'adenine.png'],
    'Guanosina':['Guanosina é o nucleosídeo formado por guanina e ribose.','Sua formação representa a integração entre duas famílias de precursores — açúcares e bases — que precisam coexistir em um mesmo ambiente químico.',wiki('Guanosina'),'guanine.png'],
    'Uridina':['Uridina é um nucleosídeo composto por uracila ligada a ribose.','Como os demais ribonucleosídeos, é um passo estrutural entre uma base livre e os nucleotídeos usados para construir RNA.',wiki('Uridina'),'uracil.png'],
    'Citidina':['Citidina é o nucleosídeo composto por citosina ligada a ribose.','A montagem de nucleosídeos em condições prebióticas é uma área ativa de pesquisa, e o jogo representa o resultado como uma união direta.',wiki('Citidina'),'cytosine.png'],
    AMP:['AMP, ou monofosfato de adenosina, é um ribonucleotídeo contendo adenina, ribose e fosfato.','Nucleotídeos são os monômeros do RNA. A fosforilação prebiótica requer fontes de fosfato e condições capazes de favorecer sua incorporação.',wiki('Monofosfato de adenosina'),'adenine.png'],
    GMP:['GMP é o ribonucleotídeo formado por guanina, ribose e um grupo fosfato.','No jogo, sua formação representa a passagem de um nucleosídeo para uma unidade pronta para integrar o alfabeto de RNA.',wiki('Monofosfato de guanosina'),'guanine.png'],
    UMP:['UMP é o ribonucleotídeo formado por uracila, ribose e fosfato.','A reunião de diferentes ribonucleotídeos permite que sequências passem a carregar informação na ordem de suas bases.',wiki('Monofosfato de uridina'),'uracil.png'],
    CMP:['CMP é o ribonucleotídeo formado por citosina, ribose e fosfato.','Ele completa, no modelo do jogo, o conjunto das quatro unidades fundamentais necessárias para representar RNA.',wiki('Monofosfato de citidina'),'cytosine.png'],
    'Pool A/U':['Pool A/U é uma representação do jogo para um estoque conjunto de nucleotídeos contendo adenina e uracila.','Não existe como uma molécula única: ele simplifica a logística de manter quantidades complementares de diferentes nucleotídeos disponíveis para etapas posteriores.',wiki('Ácido ribonucleico'),'adenine.png'],
    'Pool C/G':['Pool C/G é uma representação do jogo para um estoque conjunto dos nucleotídeos de citosina e guanina.','O agrupamento reduz repetição de inventário e destaca a complementaridade química entre as bases C e G.',wiki('Ácido ribonucleico'),'guanine.png'],
    'Pool de RNA':['Pool de RNA representa, no jogo, um conjunto disponível dos quatro tipos de ribonucleotídeos.','Esse pool não é uma espécie química única; ele resume a condição de ter diversidade suficiente de monômeros para avançar à química de polímeros informacionais.',wiki('Ácido ribonucleico'),'ribose.png'],
    'Nucleotídeos ativados':['Nucleotídeos ativados são monômeros que carregam grupos ou ligações de alta energia capazes de favorecer a formação de novas ligações fosfodiéster.','A ativação química é crucial porque polimerizar RNA em água não ocorre eficientemente apenas misturando nucleotídeos comuns.',wiki('Nucleótido'),'ribose.png'],
    'Trinucleotídeos ativados':['Trinucleotídeos ativados são representados no jogo como pequenos blocos de três unidades preparados para extensão de RNA.','Essa etapa é uma abstração inspirada em sistemas experimentais que usam substratos oligoméricos ativados para favorecer síntese dirigida por molde.',wiki('Oligonucleótido'),'ribose.png'],
    'Oligômero de RNA':['Um oligômero de RNA é uma cadeia curta de ribonucleotídeos conectados por ligações fosfodiéster.','Cadeias curtas já podem parear com sequências complementares e adotar estruturas locais, abrindo caminho para seleção e catálise.',wiki('Ácido ribonucleico'),'ribose.png'],
    'RNA molde':['RNA molde é uma cadeia cuja sequência orienta o pareamento de novos nucleotídeos ou oligômeros complementares.','A cópia dirigida por molde é uma ideia central para transformar química de polímeros em um sistema capaz de transmitir informação.',wiki('Replicação'),'ribose.png'],
    'RNA catalítico':['RNA catalítico, ou ribozima, é uma molécula de RNA cuja estrutura tridimensional acelera uma reação química.','Ribozimas demonstram que uma mesma classe de molécula pode combinar informação e função catalítica, fundamento importante do cenário do mundo de RNA.',wiki('Ribozima'),'ribose.png'],
    QT45:['QT45 é a ribozima polimerase usada como marco experimental na campanha da Sopa Primordial.','No jogo ela representa uma etapa em que RNA catalítico consegue estender sequências com substratos ativados; detalhes do experimento são comprimidos para gameplay.',wiki('Ribozima'),'ribose.png'],
    'Fita complementar':['Uma fita complementar possui bases capazes de parear com as da sequência molde seguindo regras de complementaridade.','Formar a fita complementar cria um intermediário necessário para ciclos de cópia em que informação pode ser recuperada em outra molécula.',wiki('Ácido ribonucleico'),'ribose.png'],
    'Cópia de QT45':['A cópia de QT45 representa uma nova molécula com a sequência correspondente à ribozima original.','A etapa fecha a segunda direção da replicação modelada no jogo: produzir uma sequência funcional a partir de sua complementar.',wiki('Replicação'),'ribose.png'],
    'RNA autorreplicante':['RNA autorreplicante representa um sistema de moléculas de RNA capaz de sustentar as duas direções necessárias para produzir novas cópias.','Autorreplicação com herança e variação é um requisito central para evolução darwiniana, embora sistemas experimentais reais ainda dependam de condições cuidadosamente controladas.',wiki('Mundo de RNA'),'ribose.png'],
    'Sistema autorreplicante':['O sistema autorreplicante é o ponto final da campanha: compartimento e química informacional passam a funcionar como um conjunto.','Ele não representa uma célula viva moderna, mas um limiar conceitual em que fronteira, catálise e replicação podem começar a participar de seleção evolutiva.',wiki('Origem da vida'),'fatty-acid.png']
  };

  const IMAGE_BY_RESOURCE={};
  Object.entries(STRUCTURE_INFO).forEach(([resource,info])=>{IMAGE_BY_RESOURCE[resource]=IMG+info[3]});

  function structureKey(resource){return 'structure:'+resource}
  function reactionKey(id){return 'reaction:'+id}
  function processKey(icon){return 'process:'+icon}

  function structureEntry(resource){
    const info=STRUCTURE_INFO[resource]||[
      resource+' é uma estrutura representada no modelo progressivo da Sopa Primordial.',
      'Esta entrada funciona como uma abstração didática para acompanhar a complexidade acumulada durante a campanha.',
      wiki('Origem da vida'),
      'miller-urey.png'
    ];
    return {
      key:structureKey(resource),
      category:'structures',
      title:resource,
      image:IMG+info[3],
      paragraphs:[info[0],info[1]],
      wikipedia:info[2],
      resource
    };
  }

  const structures=[...new Set([
    ...G.ATOMS,
    ...G.COMBOS.flatMap(recipe=>[recipe.a,recipe.b,recipe.out])
  ])].map(structureEntry);

  const phaseById=Object.fromEntries(G.PHASES.map(phase=>[phase.id,phase]));
  const reactions=G.COMBOS.map(recipe=>{
    const phase=phaseById[recipe.id];
    const product=structureEntry(recipe.out);
    return {
      key:reactionKey(recipe.id),
      category:'reactions',
      title:recipe.label,
      image:product.image,
      paragraphs:[
        'Na Sopa Primordial, esta receita representa a transformação '+recipe.label+'. Ela é a ação jogável que libera '+recipe.out+' pela primeira vez.',
        (phase?.hint||'A transformação resume uma rede química mais ampla.')+' A equação do jogo deve ser lida como uma abstração estratégica, não como uma descrição estequiométrica completa da química real.'
      ],
      wikipedia:product.wikipedia,
      recipeId:recipe.id,
      product:recipe.out
    };
  });

  const PROCESS_INFO={
    '☀F':{
      title:'Fotólise',
      image:IMG+'miller-urey.png',
      paragraphs:[
        'Fotólise é a quebra ou transformação de moléculas provocada pela absorção de luz. Fótons suficientemente energéticos podem abrir rotas químicas que não ocorreriam no escuro.',
        'Na Sopa, a Fotólise desmonta uma estrutura em seus precursores imediatos como ferramenta didática. Na química real, os produtos dependem da molécula, do comprimento de onda e do ambiente.'
      ],
      wikipedia:wiki('Fotólise')
    },
    '☀':{
      title:'Radiação ultravioleta',
      image:IMG+'miller-urey.png',
      paragraphs:[
        'Radiação ultravioleta possui energia suficiente para excitar ou romper determinadas ligações químicas e alterar a reatividade de moléculas.',
        'Sem uma camada de ozônio como a atual, a superfície da Terra primitiva recebeu um regime de UV diferente. Essa energia pode tanto destruir compostos quanto alimentar sínteses prebióticas.'
      ],
      wikipedia:wiki('Radiação ultravioleta')
    },
    '⚡':{
      title:'Descarga elétrica',
      image:IMG+'miller-urey.png',
      paragraphs:[
        'Descargas elétricas transferem grande quantidade de energia para gases em pouco tempo, criando íons, radicais e espécies altamente reativas.',
        'Experimentos clássicos como Miller–Urey mostraram que faíscas em misturas gasosas podem gerar moléculas orgânicas. O resultado depende fortemente da composição da atmosfera usada.'
      ],
      wikipedia:wiki('Experiência de Miller e Urey')
    },
    '♨':{
      title:'Ambiente hidrotermal',
      image:IMG+'black-smoker.jpg',
      paragraphs:[
        'Sistemas hidrotermais surgem quando água circula por rochas quentes e retorna carregada de minerais, gases e fortes gradientes de temperatura e composição.',
        'Esses ambientes oferecem energia química, superfícies minerais e microcompartimentos naturais, por isso aparecem em várias hipóteses sobre etapas iniciais da origem da vida.'
      ],
      wikipedia:wiki('Fonte hidrotermal')
    },
    '◐':{
      title:'Ciclo úmido-seco',
      image:IMG+'miller-urey.png',
      paragraphs:[
        'Ciclos úmido-seco alternam períodos de diluição em água com fases de evaporação e concentração de solutos.',
        'A concentração durante a secagem pode favorecer reações de condensação e associação molecular. Lagos rasos, margens e áreas geotérmicas são cenários estudados para esse mecanismo.'
      ],
      wikipedia:wiki('Origem da vida')
    },
    '❄':{
      title:'Gelo eutético',
      image:IMG+'water.png',
      paragraphs:[
        'Quando água congela, muitos solutos são expulsos da rede cristalina do gelo e ficam concentrados em pequenos canais e bolsões líquidos.',
        'Esses microambientes frios podem concentrar RNA e reagentes ao mesmo tempo em que reduzem certas degradações. A campanha usa essa condição nas etapas experimentais ligadas a QT45.'
      ],
      wikipedia:wiki('Mistura eutética')
    }
  };
  const processes=Object.entries(PROCESS_INFO).map(([icon,info])=>({key:processKey(icon),category:'processes',icon,...info}));

  const ALL=[...structures,...reactions,...processes];
  const BY_KEY=new Map(ALL.map(entry=>[entry.key,entry]));
  const BASE_KNOWN=['H','C','O','N'].map(structureKey);

  function createState(saved,editor=false){
    const state={
      known:new Set(Array.isArray(saved?.known)?saved.known.filter(key=>BY_KEY.has(key)):[]),
      unread:new Set(Array.isArray(saved?.unread)?saved.unread.filter(key=>BY_KEY.has(key)):[])
    };
    for(const key of BASE_KNOWN) state.known.add(key);
    if(editor) for(const entry of ALL) state.known.add(entry.key);
    return state;
  }

  function serialize(state){
    return {known:[...state.known],unread:[...state.unread]};
  }

  function discover(state,keys,{markUnread=true}={}){
    const fresh=[];
    for(const key of [...new Set(keys||[])]){
      if(!BY_KEY.has(key)||state.known.has(key)) continue;
      state.known.add(key);
      if(markUnread) state.unread.add(key);
      fresh.push(key);
    }
    return fresh;
  }

  function markRead(state,key){
    if(!key) return false;
    return state.unread.delete(key);
  }

  function isKnown(state,key,editor=false){
    return !!editor||state.known.has(key);
  }

  function entries(category){
    return ALL.filter(entry=>!category||entry.category===category);
  }

  function entry(key){return BY_KEY.get(key)||null}

  function counts(state,editor=false){
    const result={structures:{known:0,total:structures.length},reactions:{known:0,total:reactions.length},processes:{known:0,total:processes.length},unread:state.unread.size};
    for(const item of ALL) if(isKnown(state,item.key,editor)) result[item.category].known++;
    return result;
  }

  function imageForResource(resource){
    return IMAGE_BY_RESOURCE[resource]||IMG+'miller-urey.png';
  }

  window.SopaAtlas=Object.freeze({
    structures,reactions,processes,all:ALL,
    createState,serialize,discover,markRead,isKnown,entries,entry,counts,imageForResource,
    structureKey,reactionKey,processKey
  });
})();