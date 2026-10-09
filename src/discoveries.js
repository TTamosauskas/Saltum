(function () {
  'use strict';
  const descriptions={
    h2:'O hidrogênio molecular alimenta novas rotas químicas.',
    water:'A água compõe ambientes fundamentais para a química da vida.',
    ribose:'A ribose integra a estrutura dos nucleotídeos do RNA.',
    adenine:'A adenina é uma das bases utilizadas na informação genética.',
    vesicle:'Uma membrana reúne moléculas em um compartimento e permite novas interações.',
    'rna-template':'Uma sequência pode orientar a formação de uma fita complementar no modelo.',
    'replicating-system':'O sistema integra compartimento e ciclos de cópia no modelo do jogo.'
  };
  const milestones=new Set(['vesicle','rna-template','protobiont','self-replicating-rna']);
  const style=document.createElement('style');
  style.textContent=[
    '.discovery-feedback:not(:empty){margin-top:10px;padding:10px 12px;border:1px solid rgba(127,222,195,.45);border-radius:12px;background:rgba(27,72,66,.85);color:#ebfff8;animation:discovery-reveal .35s ease both}',
    '.discovery-feedback strong{display:block;font-size:14px;margin-bottom:4px}',
    '.discovery-feedback small{display:block;opacity:.9;line-height:1.35}',
    '.discovery-feedback .discovery-impact{display:block;color:#a8f1dc;font-size:12px;font-weight:700;margin-top:5px}',
    '.discovery-feedback.tier-3{border-color:#d9ce86;background:rgba(77,70,38,.9)}',
    '.discovery-feedback.tier-4{border-color:#d0afff;background:rgba(64,45,83,.9)}',
    '.objective-card.discovery-highlight{animation:discovery-card-pulse .65s ease-out}',
    '@keyframes discovery-reveal{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}',
    '@keyframes discovery-card-pulse{50%{box-shadow:0 0 0 5px rgba(142,224,199,.22)}}',
    '@media(prefers-reduced-motion:reduce){.discovery-feedback,.objective-card.discovery-highlight{animation:none}}'
  ].join('');
  document.head.appendChild(style);
  let clearHandle;
  function describe({phase,recipe,progressBefore,progressAfter,completed}){
    if(!phase||!recipe)return null;
    const gained=Math.max(0,progressAfter-progressBefore);
    const important=recipe.id===phase.id&&gained>0;
    const tier=completed?(phase.id==='replicating-system'?4:milestones.has(phase.id)?3:2):important?2:1;
    const title=completed?(tier>=3?'Marco científico alcançado':'Objetivo concluído'):important?'Progresso da fase':'Reação realizada';
    const impact=completed?(phase.id==='vesicle'?'Nova capacidade: compartimentos. Explore a membrana.':phase.id==='replicating-system'?'Campanha concluída.':'Próxima fase disponível.'):important?'Objetivo: '+progressAfter+'/'+phase.targetCount+' · +'+gained:'Recurso produzido para futuras combinações.';
    return {tier,title,product:recipe.out,description:important||completed?descriptions[phase.id]||phase.hint:'',impact,complete:completed};
  }
  function present(event,container,card){
    if(!container||!event)return;
    clearTimeout(clearHandle);
    const safe=value=>String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    container.className='discovery-feedback tier-'+event.tier;
    container.innerHTML='<strong>'+safe(event.title)+' · '+safe(event.product)+'</strong>'+(event.description?'<small>'+safe(event.description)+'</small>':'')+'<span class="discovery-impact">'+safe(event.impact)+'</span>';
    card?.classList.remove('discovery-highlight');
    void card?.offsetWidth;
    card?.classList.add('discovery-highlight');
    if(!event.complete)clearHandle=setTimeout(()=>{container.textContent='';container.className='discovery-feedback';card?.classList.remove('discovery-highlight');},event.tier===1?2400:5000);
  }
  window.SopaDiscoveries={describe,present};
})();