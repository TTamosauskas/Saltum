/* Sopa Primordial — audiovisual reaction motif inspired by Ardua's objective motif. */
(function () {
  'use strict';

  const V=window.SopaVisuals;
  if(!V) return;

  const ROOTS=Object.freeze([196,220,247,262,294,330]);
  const PROFILE=Object.freeze({
    noteMainGain:.074,
    noteStrongGain:.086,
    harmonicRatio:.30,
    chordMainGain:.040,
    chordHarmGain:.014,
    finalAccentGain:.022,
    noteDuration:.24,
    strongDuration:.28,
    harmonicDurationRatio:.82,
    chordDuration:.52,
    chordHarmDuration:.42,
    finalAccentDuration:.56
  });

  let audioCtx=null;
  let motif=null;
  const voices=new Set();

  function wait(ms){
    return new Promise(resolve=>setTimeout(resolve,ms));
  }

  function reducedMotion(){
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true;
  }

  function esc(value){
    return String(value).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  function hash(text=''){
    let h=17;
    for(const ch of String(text)) h=(h*31+ch.charCodeAt(0))>>>0;
    return h;
  }

  function recipeKey(recipe){
    return recipe?.id||[recipe?.a,recipe?.b,recipe?.out].filter(Boolean).join('>');
  }

  function rootFor(recipe){
    return ROOTS[hash(recipeKey(recipe))%ROOTS.length];
  }

  function ensureAudio(){
    try{
      const Ctx=window.AudioContext||window.webkitAudioContext;
      if(!Ctx) return null;
      audioCtx??=new Ctx();
      if(audioCtx.state==='suspended') audioCtx.resume().catch(()=>{});
      return audioCtx;
    }catch(_error){
      return null;
    }
  }

  function tone(freq,duration,type,gain,delay=0){
    try{
      const ctx=ensureAudio();
      if(!ctx) return;
      const play=()=>{
        try{
          const osc=ctx.createOscillator();
          const amp=ctx.createGain();
          const now=ctx.currentTime+Math.max(0,Number(delay)||0);
          osc.type=type;
          osc.frequency.setValueAtTime(freq,now);
          amp.gain.setValueAtTime(Math.max(.0001,gain),now);
          osc.connect(amp);
          amp.connect(ctx.destination);
          const voice={osc,amp};
          voices.add(voice);
          osc.onended=()=>voices.delete(voice);
          osc.start(now);
          amp.gain.exponentialRampToValueAtTime(.0001,now+duration);
          osc.stop(now+duration+.02);
        }catch(_error){}
      };
      if(ctx.state==='suspended'){
        const resumed=ctx.resume();
        if(resumed&&typeof resumed.then==='function') resumed.then(play).catch(()=>{});
        else play();
      }else{
        play();
      }
    }catch(_error){}
  }

  function stopVoices(){
    if(!audioCtx) return;
    const now=audioCtx.currentTime;
    for(const voice of [...voices]){
      try{voice.osc.stop(now+.01)}catch(_error){}
    }
    voices.clear();
  }

  function notesFor(recipe){
    const root=rootFor(recipe);
    return [root,root*1.25,root*1.5];
  }

  function playNote(recipe,index){
    const notes=notesFor(recipe);
    const i=Math.max(0,Math.min(2,index));
    const freq=notes[i];
    const strong=i===2;
    const duration=strong?PROFILE.strongDuration:PROFILE.noteDuration;
    const gain=strong?PROFILE.noteStrongGain:PROFILE.noteMainGain;
    tone(freq,duration,'triangle',gain);
    tone(freq*2,duration*PROFILE.harmonicDurationRatio,'sine',gain*PROFILE.harmonicRatio);
  }

  function playChord(recipe,final){
    const notes=notesFor(recipe);
    for(const freq of notes){
      tone(freq,PROFILE.chordDuration,'triangle',PROFILE.chordMainGain);
      tone(freq*2,PROFILE.chordHarmDuration,'sine',PROFILE.chordHarmGain);
    }
    if(final) tone(notes[0]*2,PROFILE.finalAccentDuration,'triangle',PROFILE.finalAccentGain);
  }

  function arm(recipe){
    ensureAudio();
    if(!recipe) return false;
    const key=recipeKey(recipe);
    if(motif&&motif.key===key&&!motif.done&&motif.step>=1) return true;
    motif={key,recipe,step:1,done:false};
    playNote(recipe,0);
    return true;
  }

  function cancel({stop=false}={}){
    motif=null;
    if(stop) stopVoices();
    document.documentElement.classList.remove('reaction-motif-running');
    document.getElementById('soupPond')?.classList.remove('reaction-motif-active');
    document.querySelectorAll('.reaction-motif-stage').forEach(node=>node.remove());
    document.querySelectorAll('.organic-bubble.motif-source').forEach(node=>node.classList.remove('motif-source'));
  }

  async function confirm(recipe){
    ensureAudio();
    const key=recipeKey(recipe);
    if(!motif||motif.key!==key||motif.done){
      motif={key,recipe,step:0,done:false};
      playNote(recipe,0);
      motif.step=1;
      await wait(reducedMotion()?28:105);
    }
    if(motif.step<2){
      playNote(recipe,1);
      motif.step=2;
    }
  }

  function nodeFor(resource,kind,color){
    const spec=V.spec(resource);
    const node=document.createElement('div');
    node.className='reaction-motif-node '+kind+' kind-'+spec.kind;
    node.style.setProperty('--motif-color',color||spec.accent||'#8adbd4');
    node.style.setProperty('--motif-visual-w',Math.max(58,Number(spec.width)||58)+'px');
    node.style.setProperty('--motif-visual-h',Math.max(58,Number(spec.height)||58)+'px');
    node.innerHTML='<span class="reaction-motif-art">'+V.render(resource,'field')+'</span><small>'+esc(resource)+'</small>';
    return node;
  }

  function markSources(reactants){
    for(const reactant of reactants||[]){
      if(!reactant?.id) continue;
      document.querySelector('.organic-bubble[data-bubble-id="'+reactant.id+'"]')?.classList.add('motif-source');
    }
  }

  function spark(stage,color,index){
    const dot=document.createElement('i');
    dot.className='reaction-motif-spark';
    dot.style.setProperty('--motif-color',color||'#8adbd4');
    dot.style.setProperty('--spark-angle',(index*45)+'deg');
    dot.style.setProperty('--spark-distance',(44+(index%3)*9)+'px');
    stage.appendChild(dot);
  }

  async function resolve({recipe,reactants,product,final=false}={}){
    const pond=document.getElementById('soupPond');
    if(!pond||!recipe||!product||!Array.isArray(reactants)||reactants.length!==2){
      if(recipe){
        await confirm(recipe);
        playChord(recipe,final);
      }
      motif=null;
      return false;
    }

    await confirm(recipe);

    const reduced=reducedMotion();
    const stage=document.createElement('div');
    stage.className='reaction-motif-stage';
    stage.setAttribute('aria-hidden','true');
    document.documentElement.classList.add('reaction-motif-running');
    pond.classList.add('reaction-motif-active');
    pond.appendChild(stage);
    markSources(reactants);

    const nodes=reactants.map((reactant,index)=>{
      const node=nodeFor(reactant.resource,'reactant',recipe.color);
      node.dataset.side=index?'right':'left';
      node.style.left=(Number(reactant.x)||50)+'%';
      node.style.top=(Number(reactant.y)||50)+'%';
      stage.appendChild(node);
      return node;
    });

    await wait(reduced?25:50);
    nodes[0].style.left='28%';
    nodes[1].style.left='72%';
    for(const node of nodes){
      node.style.top='50%';
      node.classList.add('aligned');
    }

    await wait(reduced?80:285);
    if(motif){
      playNote(recipe,2);
      motif.step=3;
    }
    stage.classList.add('aligned');

    await wait(reduced?50:115);
    for(const node of nodes){
      node.style.left='50%';
      node.style.top='50%';
      node.classList.add('converging');
    }

    await wait(reduced?65:190);
    const result=nodeFor(product.resource,'result',recipe.color);
    result.style.left='50%';
    result.style.top='50%';
    stage.appendChild(result);
    requestAnimationFrame(()=>result.classList.add('visible'));
    playChord(recipe,final);
    for(let i=0;i<8;i++) spark(stage,recipe.color,i);
    if(motif){
      motif.step=4;
      motif.done=true;
    }

    await wait(reduced?90:310);
    result.classList.add('settling');
    result.style.left=(Number(product.x)||50)+'%';
    result.style.top=(Number(product.y)||50)+'%';

    await wait(reduced?70:245);
    stage.remove();
    pond.classList.remove('reaction-motif-active');
    document.documentElement.classList.remove('reaction-motif-running');
    document.querySelectorAll('.organic-bubble.motif-source').forEach(node=>node.classList.remove('motif-source'));
    motif=null;
    return true;
  }

  document.addEventListener('pointerdown',ensureAudio,{capture:true,passive:true});
  document.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' ') ensureAudio();
  },{capture:true});
  window.addEventListener('blur',()=>stopVoices());

  window.SopaReactionMotif=Object.freeze({
    arm,
    cancel,
    resolve,
    busy:()=>document.documentElement.classList.contains('reaction-motif-running')
  });
})();