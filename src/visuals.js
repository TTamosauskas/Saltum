(function(){
  const ATOM_COLORS={H:'#FFFFFF',C:'#909090',N:'#3050F8',O:'#FF0D0D',P:'#FF8000'};

  const RESOURCE_VISUALS={
    H:{family:'Átomo',kind:'atom',width:34,height:34,accent:'#FFFFFF',formula:'H',detail:'chemical',atom:'H'},
    C:{family:'Átomo',kind:'atom',width:42,height:42,accent:'#909090',formula:'C',detail:'chemical',atom:'C'},
    N:{family:'Átomo',kind:'atom',width:40,height:40,accent:'#3050F8',formula:'N',detail:'chemical',atom:'N'},
    O:{family:'Átomo',kind:'atom',width:40,height:40,accent:'#FF0D0D',formula:'O',detail:'chemical',atom:'O'},
    P:{family:'Átomo',kind:'atom',width:46,height:46,accent:'#FF8000',formula:'P',detail:'chemical',atom:'P'},

    'H₂':{family:'Molécula pequena',kind:'diatomic',width:64,height:36,accent:'#DFF6FF',formula:'H₂',detail:'chemical',atoms:['H','H']},
    'H₂O':{family:'Molécula pequena',kind:'bent',width:70,height:54,accent:'#5ED6E3',formula:'H₂O',detail:'chemical',atoms:['H','O','H']},
    CO:{family:'Molécula pequena',kind:'linear',width:68,height:40,accent:'#B6A497',formula:'CO',detail:'chemical',atoms:['C','O'],bond:3},
    'CH₄':{family:'Molécula pequena',kind:'tetrahedral',width:72,height:64,accent:'#6EC7A0',formula:'CH₄',detail:'chemical'},
    'NH₃':{family:'Molécula pequena',kind:'pyramidal',width:72,height:62,accent:'#6688FF',formula:'NH₃',detail:'chemical'},
    Fosfato:{family:'Grupo fosfato',kind:'phosphate',width:78,height:70,accent:'#FF9C42',formula:'PO₄³⁻',detail:'chemical'},

    Formaldeído:{family:'Precursor orgânico',kind:'skeletal',variant:'formaldehyde',width:80,height:56,accent:'#D9954C',formula:'CH₂O',detail:'chemical'},
    Cianeto:{family:'Precursor nitrogenado',kind:'skeletal',variant:'cyanide',width:70,height:38,accent:'#4CB7C5',formula:'CN⁻',detail:'chemical'},
    Açúcares:{family:'Pool de açúcares',kind:'pool',variant:'sugars',width:84,height:68,accent:'#E0A458',formula:'mistura',detail:'game'},
    Ribose:{family:'Açúcar',kind:'skeletal',variant:'ribose',width:76,height:70,accent:'#D98A4C',formula:'C₅H₁₀O₅',detail:'chemical'},

    Glicina:{family:'Aminoácido',kind:'skeletal',variant:'glycine',width:78,height:58,accent:'#FFAD79',formula:'NH₂CH₂COOH',detail:'chemical'},
    Aspartato:{family:'Aminoácido',kind:'skeletal',variant:'aspartate',width:88,height:62,accent:'#FF9274',formula:'C₄H₇NO₄',detail:'chemical'},
    Glutamina:{family:'Aminoácido',kind:'skeletal',variant:'glutamine',width:94,height:62,accent:'#FF7F76',formula:'C₅H₁₀N₂O₃',detail:'chemical'},
    'Ácidos graxos':{family:'Anfifílico',kind:'amphiphile',width:110,height:38,accent:'#F1D069',formula:'R–COOH',detail:'game'},

    Adenina:{family:'Base nitrogenada · Purina',kind:'base',width:82,height:66,accent:'#78E29F',formula:'C₅H₅N₅',detail:'chemical',base:'A',rings:2,pairPorts:2},
    Guanina:{family:'Base nitrogenada · Purina',kind:'base',width:82,height:66,accent:'#65D7D8',formula:'C₅H₅N₅O',detail:'chemical',base:'G',rings:2,pairPorts:3},
    Uracila:{family:'Base nitrogenada · Pirimidina',kind:'base',width:70,height:64,accent:'#C29BFF',formula:'C₄H₄N₂O₂',detail:'chemical',base:'U',rings:1,pairPorts:2},
    Citosina:{family:'Base nitrogenada · Pirimidina',kind:'base',width:70,height:64,accent:'#EE91CF',formula:'C₄H₅N₃O',detail:'chemical',base:'C',rings:1,pairPorts:3},

    'Lipídio simples':{family:'Membrana',kind:'lipid',width:100,height:70,accent:'#E7D875',formula:'anfifílicos',detail:'game'},
    Vesícula:{family:'Compartimento',kind:'vesicle',width:112,height:112,accent:'#E9DF84',formula:'bicamada anfifílica',detail:'game'},
    'Peptídeo curto':{family:'Peptídeo',kind:'peptide',width:108,height:52,accent:'#FF8F72',formula:'oligopeptídeo',detail:'game',folded:false},
    'Peptídeo catalítico':{family:'Peptídeo',kind:'peptide',width:120,height:72,accent:'#FF776D',formula:'peptídeo dobrado',detail:'game',folded:true},
    Protobionte:{family:'Protocélula',kind:'protobiont',width:130,height:130,accent:'#75D8B9',formula:'vesícula + peptídeo',detail:'game'},

    Adenosina:{family:'Nucleosídeo',kind:'nucleoside',width:104,height:74,accent:'#78E29F',formula:'C₁₀H₁₃N₅O₄',detail:'chemical',base:'A',rings:2},
    Guanosina:{family:'Nucleosídeo',kind:'nucleoside',width:104,height:74,accent:'#65D7D8',formula:'C₁₀H₁₃N₅O₅',detail:'chemical',base:'G',rings:2},
    Uridina:{family:'Nucleosídeo',kind:'nucleoside',width:96,height:72,accent:'#C29BFF',formula:'C₉H₁₂N₂O₆',detail:'chemical',base:'U',rings:1},
    Citidina:{family:'Nucleosídeo',kind:'nucleoside',width:96,height:72,accent:'#EE91CF',formula:'C₉H₁₃N₃O₅',detail:'chemical',base:'C',rings:1},

    AMP:{family:'Nucleotídeo',kind:'nucleotide',width:118,height:76,accent:'#74E09A',formula:'C₁₀H₁₄N₅O₇P',detail:'chemical',base:'A',rings:2},
    GMP:{family:'Nucleotídeo',kind:'nucleotide',width:118,height:76,accent:'#66D5D7',formula:'C₁₀H₁₄N₅O₈P',detail:'chemical',base:'G',rings:2},
    UMP:{family:'Nucleotídeo',kind:'nucleotide',width:112,height:76,accent:'#B995FF',formula:'C₉H₁₃N₂O₉P',detail:'chemical',base:'U',rings:1},
    CMP:{family:'Nucleotídeo',kind:'nucleotide',width:112,height:76,accent:'#E48DCA',formula:'C₉H₁₄N₃O₈P',detail:'chemical',base:'C',rings:1},

    'Pool A/U':{family:'Pool de nucleotídeos',kind:'pairpool',width:120,height:82,accent:'#93CCDF',formula:'A + U',detail:'game',bases:['A','U']},
    'Pool C/G':{family:'Pool de nucleotídeos',kind:'pairpool',width:120,height:82,accent:'#B4A8DB',formula:'C + G',detail:'game',bases:['C','G']},
    'Pool de RNA':{family:'Pool de nucleotídeos',kind:'rnapool',width:128,height:92,accent:'#9DA8FF',formula:'A · G · C · U',detail:'game'},
    'Nucleotídeos ativados':{family:'Pool ativado',kind:'rnapool',width:132,height:92,accent:'#9E91FF',formula:'nucleotídeos ativados',detail:'game',activated:true},
    'Trinucleotídeos ativados':{family:'Substrato de RNA',kind:'triplet',width:144,height:72,accent:'#A58DFF',formula:'N₃–PPP',detail:'game'},

    'Oligômero de RNA':{family:'RNA',kind:'rna',variant:'oligomer',width:150,height:62,accent:'#AA8CFF',formula:'RNA curto',detail:'game'},
    'RNA molde':{family:'RNA',kind:'rna',variant:'template',width:164,height:70,accent:'#AE8EFF',formula:'5′→3′',detail:'game'},
    'RNA catalítico':{family:'RNA catalítico',kind:'rna',variant:'catalytic',width:142,height:102,accent:'#B08CFF',formula:'RNA dobrado',detail:'game'},
    QT45:{family:'Ribozima polimerase',kind:'rna',variant:'qt45',width:148,height:110,accent:'#B895FF',formula:'45 nt',detail:'game'},
    'Fita complementar':{family:'RNA',kind:'rna',variant:'complement',width:164,height:70,accent:'#C09CFF',formula:'3′←5′',detail:'game'},
    'Cópia de QT45':{family:'Ribozima · cópia',kind:'rna',variant:'qt45copy',width:148,height:110,accent:'#C8A4FF',formula:'45 nt',detail:'game'},
    'RNA autorreplicante':{family:'Sistema de RNA',kind:'rna',variant:'self',width:168,height:116,accent:'#D0AFFF',formula:'ciclo de replicação',detail:'game'},
    'Sistema autorreplicante':{family:'Sistema integrado',kind:'system',width:180,height:140,accent:'#FFFFFF',formula:'protobionte + RNA',detail:'game'}
  };

  const BASE_COLORS={A:'#78E29F',G:'#65D7D8',U:'#C29BFF',C:'#EE91CF'};

  function spec(resource){
    return RESOURCE_VISUALS[resource]||{family:'Recurso',kind:'label',width:76,height:64,accent:'#9EC9C8',formula:resource,detail:'game'};
  }

  function circle(x,y,r,atom){
    const fill=ATOM_COLORS[atom]||'#CBD7D7';
    const text=atom==='H'?'#1b2628':'#fff';
    return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+fill+'" stroke="rgba(255,255,255,.65)" stroke-width="2"/>'+
      '<text x="'+x+'" y="'+(y+4)+'" text-anchor="middle" fill="'+text+'" font-size="'+Math.max(10,r*.8)+'" font-weight="900">'+atom+'</text>';
  }

  function bond(x1,y1,x2,y2,count){
    let out='';
    const c=count||1;
    for(let i=0;i<c;i++){
      const offset=(i-(c-1)/2)*5;
      out+='<line class="bond" x1="'+x1+'" y1="'+(y1+offset)+'" x2="'+x2+'" y2="'+(y2+offset)+'"/>';
    }
    return out;
  }

  function ringPoints(cx,cy,r,n,rotation){
    const pts=[];
    for(let i=0;i<n;i++){
      const a=(rotation||-90)+i*360/n;
      pts.push((cx+Math.cos(a*Math.PI/180)*r).toFixed(1)+','+(cy+Math.sin(a*Math.PI/180)*r).toFixed(1));
    }
    return pts.join(' ');
  }

  function baseShape(s,cx,cy,scale,detail){
    const accent=s.accent, sc=scale||1;
    let body='';
    if(s.rings===2){
      body+='<polygon class="chem-ring" points="'+ringPoints(cx-18*sc,cy,28*sc,6,30)+'" fill="'+accent+'22" stroke="'+accent+'"/>';
      body+='<polygon class="chem-ring" points="'+ringPoints(cx+21*sc,cy+1*sc,23*sc,5,-18)+'" fill="'+accent+'22" stroke="'+accent+'"/>';
    }else{
      body+='<polygon class="chem-ring" points="'+ringPoints(cx,cy,30*sc,6,30)+'" fill="'+accent+'22" stroke="'+accent+'"/>';
    }
    body+='<text x="'+cx+'" y="'+(cy+7)+'" text-anchor="middle" fill="'+accent+'" font-size="'+(25*sc)+'" font-weight="950">'+s.base+'</text>';

    if(detail){
      const fs=10*sc;
      const n='#3050F8', o='#FF0D0D';
      if(s.base==='A'){
        body+='<text x="'+(cx-39*sc)+'" y="'+(cy-7*sc)+'" fill="'+n+'" font-size="'+fs+'" font-weight="900">N</text>'+
          '<text x="'+(cx-10*sc)+'" y="'+(cy-30*sc)+'" fill="'+n+'" font-size="'+fs+'" font-weight="900">N</text>'+
          '<text x="'+(cx+23*sc)+'" y="'+(cy-21*sc)+'" fill="'+n+'" font-size="'+fs+'" font-weight="900">N</text>'+
          '<text x="'+(cx+39*sc)+'" y="'+(cy+6*sc)+'" fill="'+n+'" font-size="'+fs+'" font-weight="900">N</text>'+
          '<text x="'+(cx+5*sc)+'" y="'+(cy+33*sc)+'" fill="'+n+'" font-size="'+fs+'" font-weight="900">N</text>'+
          '<text x="'+(cx-18*sc)+'" y="'+(cy-39*sc)+'" fill="'+n+'" font-size="'+(9*sc)+'" font-weight="900">NH₂</text>';
      }else if(s.base==='G'){
        body+='<text x="'+(cx-39*sc)+'" y="'+(cy-7*sc)+'" fill="'+n+'" font-size="'+fs+'" font-weight="900">N</text>'+
          '<text x="'+(cx-10*sc)+'" y="'+(cy-30*sc)+'" fill="'+n+'" font-size="'+fs+'" font-weight="900">N</text>'+
          '<text x="'+(cx+24*sc)+'" y="'+(cy-21*sc)+'" fill="'+n+'" font-size="'+fs+'" font-weight="900">N</text>'+
          '<text x="'+(cx+39*sc)+'" y="'+(cy+6*sc)+'" fill="'+n+'" font-size="'+fs+'" font-weight="900">N</text>'+
          '<text x="'+(cx+5*sc)+'" y="'+(cy+33*sc)+'" fill="'+n+'" font-size="'+fs+'" font-weight="900">N</text>'+
          '<text x="'+(cx-20*sc)+'" y="'+(cy-40*sc)+'" fill="'+o+'" font-size="'+(10*sc)+'" font-weight="900">O</text>'+
          '<text x="'+(cx-42*sc)+'" y="'+(cy+28*sc)+'" fill="'+n+'" font-size="'+(9*sc)+'" font-weight="900">NH₂</text>';
      }else if(s.base==='U'){
        body+='<text x="'+(cx-30*sc)+'" y="'+(cy+8*sc)+'" fill="'+n+'" font-size="'+fs+'" font-weight="900">N</text>'+
          '<text x="'+(cx+2*sc)+'" y="'+(cy+34*sc)+'" fill="'+n+'" font-size="'+fs+'" font-weight="900">N</text>'+
          '<text x="'+(cx-14*sc)+'" y="'+(cy-35*sc)+'" fill="'+o+'" font-size="'+(10*sc)+'" font-weight="900">O</text>'+
          '<text x="'+(cx+33*sc)+'" y="'+(cy+22*sc)+'" fill="'+o+'" font-size="'+(10*sc)+'" font-weight="900">O</text>';
      }else if(s.base==='C'){
        body+='<text x="'+(cx-30*sc)+'" y="'+(cy+8*sc)+'" fill="'+n+'" font-size="'+fs+'" font-weight="900">N</text>'+
          '<text x="'+(cx+2*sc)+'" y="'+(cy+34*sc)+'" fill="'+n+'" font-size="'+fs+'" font-weight="900">N</text>'+
          '<text x="'+(cx+29*sc)+'" y="'+(cy-5*sc)+'" fill="'+n+'" font-size="'+fs+'" font-weight="900">N</text>'+
          '<text x="'+(cx+31*sc)+'" y="'+(cy+22*sc)+'" fill="'+o+'" font-size="'+(10*sc)+'" font-weight="900">O</text>'+
          '<text x="'+(cx-14*sc)+'" y="'+(cy-35*sc)+'" fill="'+n+'" font-size="'+(9*sc)+'" font-weight="900">NH₂</text>';
      }
    }
    return body;
  }

  function skeletal(s){
    const a=s.accent;
    if(s.variant==='formaldehyde'){
      return bond(70,60,110,40,2)+bond(70,60,35,43,1)+bond(70,60,35,78,1)+
        circle(116,37,14,'O')+circle(28,40,11,'H')+circle(28,81,11,'H')+
        '<text x="70" y="66" text-anchor="middle" fill="'+ATOM_COLORS.C+'" font-size="17" font-weight="950">C</text>';
    }
    if(s.variant==='cyanide'){
      return bond(55,60,118,60,3)+circle(47,60,16,'C')+circle(126,60,16,'N');
    }
    if(s.variant==='ribose'){
      return '<polygon class="chem-ring bond" points="'+ringPoints(88,58,38,5,-90)+'" fill="'+a+'13" stroke="'+a+'"/>'+
        '<text x="88" y="64" text-anchor="middle" fill="'+a+'" font-size="16" font-weight="900">ribose</text>'+
        '<text x="118" y="25" fill="'+ATOM_COLORS.O+'" font-size="12" font-weight="900">O</text>'+
        '<text x="35" y="100" fill="'+ATOM_COLORS.O+'" font-size="11">OH</text>';
    }
    if(s.variant==='glycine'){
      return '<polyline class="bond" points="28,60 70,60 112,60 145,42"/>'+
        '<text x="14" y="64" fill="'+ATOM_COLORS.N+'" font-size="14" font-weight="900">NH₂</text>'+
        '<text x="65" y="51" fill="'+ATOM_COLORS.C+'" font-size="11">CH₂</text>'+
        '<text x="121" y="76" fill="'+ATOM_COLORS.O+'" font-size="13" font-weight="900">COOH</text>';
    }
    if(s.variant==='aspartate'){
      return '<polyline class="bond" points="22,60 58,60 92,44 124,60 153,45"/>'+
        '<line class="bond" x1="92" y1="44" x2="91" y2="85"/>'+
        '<text x="5" y="64" fill="'+ATOM_COLORS.N+'" font-size="13" font-weight="900">NH₂</text>'+
        '<text x="132" y="78" fill="'+ATOM_COLORS.O+'" font-size="12">COOH</text>'+
        '<text x="72" y="101" fill="'+ATOM_COLORS.O+'" font-size="12">COOH</text>';
    }
    if(s.variant==='glutamine'){
      return '<polyline class="bond" points="18,60 48,60 75,43 104,60 132,43 158,60"/>'+
        '<text x="2" y="64" fill="'+ATOM_COLORS.N+'" font-size="12" font-weight="900">NH₂</text>'+
        '<text x="130" y="30" fill="'+ATOM_COLORS.N+'" font-size="11">CONH₂</text>'+
        '<text x="133" y="81" fill="'+ATOM_COLORS.O+'" font-size="11">COOH</text>';
    }
    return '<text x="90" y="64" text-anchor="middle" fill="'+a+'" font-size="18" font-weight="900">'+s.formula+'</text>';
  }

  function nucleotideModules(s,includePhosphate,detail){
    const base={family:'Base',accent:s.accent,base:s.base,rings:s.rings};
    let body='';
    if(includePhosphate){
      body+='<circle cx="27" cy="60" r="18" fill="'+ATOM_COLORS.P+'33" stroke="'+ATOM_COLORS.P+'" stroke-width="3"/><text x="27" y="66" text-anchor="middle" fill="'+ATOM_COLORS.P+'" font-size="16" font-weight="950">P</text>';
      body+=bond(45,60,67,60,1);
    }
    const shift=includePhosphate?0:-17;
    body+='<polygon class="chem-ring" points="'+ringPoints(92+shift,60,24,5,-90)+'" fill="#D98A4C22" stroke="#D98A4C"/>';
    body+='<text x="'+(92+shift)+'" y="65" text-anchor="middle" fill="#D98A4C" font-size="10" font-weight="900">R</text>';
    body+=bond(116+shift,60,132+shift,60,1);
    body+=baseShape(base,151+shift,60,.58,detail);
    return body;
  }

  function rnaGlyph(s){
    const a=s.accent;
    if(s.variant==='oligomer'||s.variant==='template'||s.variant==='complement'){
      const y=s.variant==='complement'?68:52;
      let body='<path class="rna-backbone" d="M16 '+y+' C45 '+(y-30)+' 78 '+(y+27)+' 112 '+y+' S155 '+(y-20)+' 168 '+y+'" stroke="'+a+'"/>';
      for(let i=0;i<7;i++){
        const x=28+i*20;
        body+='<line class="base-tick" x1="'+x+'" y1="'+(y-3)+'" x2="'+x+'" y2="'+(y+(i%2?17:-17))+'" stroke="'+BASE_COLORS[['A','U','G','C'][i%4]]+'"/>';
      }
      if(s.variant==='template') body+='<text x="13" y="108" fill="'+a+'" font-size="10">5′</text><text x="158" y="108" fill="'+a+'" font-size="10">3′</text>';
      if(s.variant==='complement') body+='<text x="13" y="25" fill="'+a+'" font-size="10">3′</text><text x="158" y="25" fill="'+a+'" font-size="10">5′</text>';
      return body;
    }
    if(s.variant==='catalytic'||s.variant==='qt45'||s.variant==='qt45copy'){
      let body='<path class="rna-backbone folded" d="M30 91 C28 55 45 28 72 38 C94 45 83 72 63 67 C44 62 52 30 92 25 C133 20 143 49 125 69 C111 85 91 76 96 54 C102 30 148 48 145 93" stroke="'+a+'"/>';
      body+='<circle cx="76" cy="54" r="8" fill="'+a+'33" stroke="'+a+'"/>';
      if(s.variant==='qt45'||s.variant==='qt45copy') body+='<text x="90" y="108" text-anchor="middle" fill="'+a+'" font-size="12" font-weight="950">45 nt</text>';
      if(s.variant==='qt45copy') body+='<path d="M43 103 C80 118 120 113 149 91" fill="none" stroke="'+a+'" stroke-width="2" stroke-dasharray="4 4"/>';
      return body;
    }
    if(s.variant==='self'){
      return '<path class="rna-backbone" d="M30 72 C40 24 91 22 106 51 C118 75 91 94 66 82" stroke="'+a+'"/>'+
        '<path class="rna-backbone" d="M138 47 C152 87 120 111 88 93 C66 80 75 52 101 49" stroke="#C8A4FF"/>'+
        '<path class="cycle-arrow" d="M41 34 C74 5 126 13 148 43" stroke="'+a+'"/><polygon points="150,42 139,38 145,50" fill="'+a+'"/>'+
        '<path class="cycle-arrow" d="M141 101 C104 124 55 113 31 84" stroke="'+a+'"/><polygon points="29,84 40,87 34,76" fill="'+a+'"/>';
    }
    return '<path class="rna-backbone" d="M18 60 C60 18 116 104 164 55" stroke="'+a+'"/>';
  }

  function svgFor(resource,detail){
    const s=spec(resource);
    let body='';
    if(s.kind==='atom') body=circle(90,60,detail?34:30,s.atom);
    else if(s.kind==='diatomic') body=bond(60,60,120,60,1)+circle(50,60,20,'H')+circle(130,60,20,'H');
    else if(s.kind==='bent') body=bond(90,58,52,88,1)+bond(90,58,128,88,1)+circle(90,52,22,'O')+circle(44,94,15,'H')+circle(136,94,15,'H');
    else if(s.kind==='linear') body=bond(58,60,122,60,s.bond||1)+circle(47,60,19,'C')+circle(133,60,19,'O');
    else if(s.kind==='tetrahedral') body=bond(90,60,90,18,1)+bond(90,60,52,91,1)+bond(90,60,128,91,1)+bond(90,60,148,48,1)+circle(90,60,20,'C')+circle(90,15,12,'H')+circle(48,96,12,'H')+circle(132,96,12,'H')+circle(153,45,12,'H');
    else if(s.kind==='pyramidal') body=bond(90,52,48,88,1)+bond(90,52,132,88,1)+bond(90,52,90,101,1)+circle(90,50,21,'N')+circle(43,93,12,'H')+circle(137,93,12,'H')+circle(90,105,12,'H');
    else if(s.kind==='phosphate') body=bond(90,60,90,17,1)+bond(90,60,49,60,1)+bond(90,60,131,60,1)+bond(90,60,90,103,1)+circle(90,60,20,'P')+circle(90,13,12,'O')+circle(43,60,12,'O')+circle(137,60,12,'O')+circle(90,107,12,'O');
    else if(s.kind==='skeletal') body=skeletal(s);
    else if(s.kind==='pool'&&s.variant==='sugars') body='<polygon class="chem-ring" points="'+ringPoints(67,53,27,5,-90)+'" fill="'+s.accent+'16" stroke="'+s.accent+'"/><polygon class="chem-ring" points="'+ringPoints(106,49,25,5,-90)+'" fill="'+s.accent+'12" stroke="'+s.accent+'"/><polygon class="chem-ring" points="'+ringPoints(91,80,24,5,-90)+'" fill="'+s.accent+'0e" stroke="'+s.accent+'"/><text x="90" y="113" text-anchor="middle" fill="'+s.accent+'" font-size="10" font-weight="900">POOL</text>';
    else if(s.kind==='base') body=baseShape(s,90,58,1,detail)+(s.pairPorts?Array.from({length:s.pairPorts},(_,i)=>'<circle cx="158" cy="'+(48+i*14)+'" r="3.5" fill="'+s.accent+'"/>').join(''):'');
    else if(s.kind==='amphiphile') body='<circle cx="30" cy="60" r="18" fill="'+s.accent+'55" stroke="'+s.accent+'" stroke-width="3"/><path class="tail" d="M48 60 l18 -13 18 13 18 -13 18 13 18 -13 18 13" stroke="'+s.accent+'"/><text x="30" y="65" text-anchor="middle" fill="'+s.accent+'" font-size="9" font-weight="900">COOH</text>';
    else if(s.kind==='lipid') body='<circle cx="42" cy="38" r="14" fill="'+s.accent+'55" stroke="'+s.accent+'"/><circle cx="42" cy="82" r="14" fill="'+s.accent+'55" stroke="'+s.accent+'"/><path class="tail" d="M56 38 l20 -12 18 12 18 -12 18 12 18 -12" stroke="'+s.accent+'"/><path class="tail" d="M56 82 l20 12 18 -12 18 12 18 -12 18 12" stroke="'+s.accent+'"/>';
    else if(s.kind==='vesicle'){
      for(let i=0;i<16;i++){const a=i*Math.PI*2/16,x=90+Math.cos(a)*45,y=60+Math.sin(a)*45;body+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="6" fill="'+s.accent+'55" stroke="'+s.accent+'"/>';}
      body+='<circle cx="90" cy="60" r="34" fill="rgba(69,176,184,.08)" stroke="'+s.accent+'55" stroke-width="2"/>';
    }
    else if(s.kind==='peptide'){
      const pts=s.folded?'25,80 48,31 77,73 100,28 128,66 154,41':'18,68 49,45 78,70 110,42 144,66 164,49';
      body='<polyline class="peptide-chain" points="'+pts+'" stroke="'+s.accent+'"/>';
      const nodes=s.folded?[[25,80],[48,31],[77,73],[100,28],[128,66],[154,41]]:[[18,68],[49,45],[78,70],[110,42],[144,66],[164,49]];
      nodes.forEach((p,i)=>body+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+(i===3&&s.folded?9:6)+'" fill="'+s.accent+(i===3&&s.folded?'88':'44')+'" stroke="'+s.accent+'"/>');
      if(s.folded) body+='<circle cx="100" cy="54" r="18" fill="none" stroke="'+s.accent+'" stroke-dasharray="3 4"/>';
    }
    else if(s.kind==='protobiont') body='<circle cx="90" cy="60" r="50" fill="'+s.accent+'0e" stroke="'+s.accent+'" stroke-width="5" stroke-dasharray="3 5"/><polyline class="peptide-chain" points="45,68 64,39 88,69 109,35 137,65" stroke="#FF776D"/><circle cx="109" cy="35" r="7" fill="#FF776D55" stroke="#FF776D"/>';
    else if(s.kind==='nucleoside') body=nucleotideModules(s,false,detail);
    else if(s.kind==='nucleotide') body=nucleotideModules(s,true,detail);
    else if(s.kind==='pairpool'){
      const a={accent:BASE_COLORS[s.bases[0]],base:s.bases[0],rings:(s.bases[0]==='A'||s.bases[0]==='G')?2:1};
      const b={accent:BASE_COLORS[s.bases[1]],base:s.bases[1],rings:(s.bases[1]==='A'||s.bases[1]==='G')?2:1};
      body=baseShape(a,56,57,.55,detail)+baseShape(b,124,57,.55,detail)+'<path d="M20 20 H10 V100 H20 M160 20 H170 V100 H160" fill="none" stroke="'+s.accent+'" stroke-width="2"/><text x="90" y="112" text-anchor="middle" fill="'+s.accent+'" font-size="9" font-weight="900">POOL</text>';
    }
    else if(s.kind==='rnapool'){
      const bases=['A','G','C','U'];
      bases.forEach((b,i)=>{const x=45+(i%2)*90,y=36+Math.floor(i/2)*50;body+='<circle cx="'+x+'" cy="'+y+'" r="20" fill="'+BASE_COLORS[b]+'22" stroke="'+BASE_COLORS[b]+'" stroke-width="2"/><text x="'+x+'" y="'+(y+6)+'" text-anchor="middle" fill="'+BASE_COLORS[b]+'" font-size="18" font-weight="950">'+b+'</text>';});
      if(s.activated) body+='<circle cx="90" cy="60" r="52" fill="none" stroke="#FF8000" stroke-width="3" stroke-dasharray="5 5"/><text x="90" y="117" text-anchor="middle" fill="#FFB266" font-size="9">ATIVADOS</text>';
    }
    else if(s.kind==='triplet'){
      ['A','U','G'].forEach((b,i)=>body+='<circle cx="'+(40+i*46)+'" cy="56" r="18" fill="'+BASE_COLORS[b]+'22" stroke="'+BASE_COLORS[b]+'"/><text x="'+(40+i*46)+'" y="62" text-anchor="middle" fill="'+BASE_COLORS[b]+'" font-size="16" font-weight="950">'+b+'</text>');
      body+='<path class="bond" d="M58 56 H68 M104 56 H114"/><circle cx="161" cy="56" r="13" fill="'+ATOM_COLORS.P+'33" stroke="'+ATOM_COLORS.P+'"/><text x="161" y="61" text-anchor="middle" fill="'+ATOM_COLORS.P+'" font-size="10" font-weight="950">PPP</text>';
    }
    else if(s.kind==='rna') body=rnaGlyph(s);
    else if(s.kind==='system') body='<circle cx="90" cy="60" r="52" fill="rgba(117,216,185,.08)" stroke="#75D8B9" stroke-width="5" stroke-dasharray="3 5"/>'+rnaGlyph({accent:'#D0AFFF',variant:'self'});
    else body='<text x="90" y="65" text-anchor="middle" fill="'+s.accent+'" font-size="16" font-weight="900">'+resource+'</text>';

    return '<svg class="molecular-svg kind-'+s.kind+(detail?' detail':'')+'" viewBox="0 0 180 120" aria-hidden="true">'+body+'</svg>';
  }

  function render(resource,mode){
    const s=spec(resource);
    const detail=mode==='detail';
    const scale=mode==='trail'?.52:mode==='catalog'?.62:1;
    const width=Math.max(28,Math.round(s.width*scale));
    const height=Math.max(26,Math.round(s.height*scale));
    return '<span class="resource-visual visual-'+s.kind+'" data-resource-visual="'+resource.replace(/"/g,'&quot;')+'" style="--rv-accent:'+s.accent+';--rv-w:'+width+'px;--rv-h:'+height+'px">'+svgFor(resource,detail)+'</span>';
  }

  function scienceBadge(resource){
    const s=spec(resource);
    return s.detail==='chemical'?'ESTRUTURA QUÍMICA':'REPRESENTAÇÃO DO JOGO';
  }

  window.SopaVisuals={ATOM_COLORS,RESOURCE_VISUALS,spec,render,svgFor,scienceBadge};
})();