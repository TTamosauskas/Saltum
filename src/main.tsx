import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  canUseRecipe,
  collect,
  createGame,
  depositMembrane,
  depositPeptide,
  depositRna,
  endTurn,
  envInfo,
  leadingRoute,
  perturb,
  recipes,
  synthesize,
  type GameState,
} from './game'
import './styles.css'

const familyClass: Record<string,string> = {
  H:'family-element', C:'family-element', O:'family-element', N:'family-element', P:'family-mineral',
  'H₂':'family-simple', CO:'family-simple', 'H₂O':'family-simple',
  'Aminoácidos':'family-peptide', 'Ácidos graxos':'family-lipid', 'Nucleotídeos':'family-rna'
}

function App() {
  const [game,setGame]=useState<GameState>(()=>createGame())
  const active=game.players[game.activePlayer]
  const current=game.environment[0]
  const currentInfo=envInfo[current]
  const readyRecipes=useMemo(
    ()=>recipes.map(recipe=>({recipe,ready:canUseRecipe(game,recipe)})),
    [game]
  )

  const reset=()=>setGame(createGame())

  return <main className="app-shell">
    <header className="hero">
      <div>
        <p className="eyebrow">Protótipo 0.1</p>
        <h1>Sopa Primordial</h1>
        <p className="subtitle">Dispute matéria, altere o futuro ambiental e integre metabolismo, compartimento e informação até a vida emergente.</p>
      </div>
      <button className="ghost" onClick={reset}>Nova partida</button>
    </header>

    <section className="status-grid">
      <article className="panel round-card">
        <span>Rodada</span>
        <strong>{game.round}</strong>
      </article>
      <article className="panel active-card">
        <span>Jogador ativo</span>
        <strong>{active.name}</strong>
        <small>Rota dominante: {leadingRoute(active)}</small>
      </article>
      <article className="panel env-current">
        <span>Ambiente atual</span>
        <strong>{current} {currentInfo.name}</strong>
        <small>{currentInfo.benefit}</small>
      </article>
    </section>

    <section className="panel environment-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Relógio ambiental compartilhado</p>
          <h2>Próximos estados</h2>
        </div>
        <p>Descarte uma bolha da mão para remover o próximo ícone. A perturbação afeta todos.</p>
      </div>
      <div className="environment-track">
        {game.environment.map((icon,index)=>{
          const info=envInfo[icon]
          return <div key={index} className={`env-token ${info.className} ${index===0?'current':''}`} title={`${info.name}: ${info.benefit}`}>
            <span>{icon}</span>
            <small>{index===0?'agora':`+${index}`}</small>
          </div>
        })}
      </div>
    </section>

    <section className="board-grid">
      <article className="panel soup-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Oferta compartilhada</p>
            <h2>Sopa</h2>
          </div>
          <p>Uma coleta por turno.</p>
        </div>
        <div className="bubble-grid">
          {game.soup.map((resource,index)=>
            <button key={index} className={`bubble ${familyClass[resource]??''}`} onClick={()=>setGame(g=>collect(g,index))} disabled={active.collected || game.winner!==null}>
              <strong>{resource}</strong>
              <small>{active.collected?'coleta usada':'coletar'}</small>
            </button>
          )}
        </div>
      </article>

      <article className="panel hand-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Matéria pessoal</p>
            <h2>Mão de {active.name}</h2>
          </div>
          <p>{active.hand.length} bolhas</p>
        </div>
        <div className="hand-list">
          {active.hand.map((resource,index)=>
            <div key={index} className={`hand-card ${familyClass[resource]??''}`}>
              <strong>{resource}</strong>
              <div className="mini-actions">
                {!active.perturbed && <button onClick={()=>setGame(g=>perturb(g,index))}>Perturbar</button>}
                {resource==='Aminoácidos' && <button onClick={()=>setGame(g=>depositPeptide(g,index))}>Peptídeo</button>}
                {resource==='Ácidos graxos' && <button onClick={()=>setGame(g=>depositMembrane(g,index))}>Membrana</button>}
                {resource==='Nucleotídeos' && <button disabled={current!=='◐'} onClick={()=>setGame(g=>depositRna(g,index))}>QT45 +9 nt</button>}
              </div>
            </div>
          )}
        </div>
        <button className="primary end-turn" onClick={()=>setGame(endTurn)} disabled={game.winner!==null}>Encerrar turno</button>
      </article>
    </section>

    <section className="progress-grid">
      {game.players.map((player,index)=>
        <article key={player.name} className={`panel player-progress ${index===game.activePlayer?'active-player':''}`}>
          <div className="section-heading compact">
            <h2>{player.name}</h2>
            <span>{leadingRoute(player)}</span>
          </div>
          <Track label="QT45" value={player.rnaModules} max={5} note={`${player.rnaModules*9}/45 nt`} />
          <Track label="Protocélula" value={player.membrane} max={2} note={player.membrane>=2?'vesícula pronta':'lipídios'} />
          <Track label="Metabolismo" value={player.metabolism} max={2} note="gradientes" />
          <Track label="Peptídeos" value={player.peptide} max={3} note="catalisador opcional" />
        </article>
      )}
    </section>

    <section className="panel recipes-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Química disponível</p>
          <h2>Receitas</h2>
        </div>
        <p>A borda ambiental indica quais rotas recebem impulso agora.</p>
      </div>
      <div className="recipe-grid">
        {readyRecipes.map(({recipe,ready})=>
          <button key={recipe.id} className={`recipe-card ${ready?'ready':''}`} disabled={!ready || game.winner!==null} onClick={()=>setGame(g=>synthesize(g,recipe))}>
            <strong>{recipe.label}</strong>
            <span>{recipe.inputs.join(' + ')}{recipe.output?` → ${recipe.output}`:''}</span>
            <small>{recipe.environments?recipe.environments.join(' ou '):'qualquer ambiente'} · {recipe.description}</small>
          </button>
        )}
      </div>
    </section>

    <section className="panel log-panel">
      <div className="section-heading compact">
        <h2>Histórico</h2>
        <span>{game.log.length} eventos</span>
      </div>
      <div className="log">
        {game.log.slice(0,10).map((line,index)=><p key={index}>{line}</p>)}
      </div>
    </section>

    {game.winner!==null && <div className="victory">
      <div className="victory-card">
        <p className="eyebrow">Vida emergente</p>
        <h2>{game.players[game.winner].name} integrou o primeiro sistema viável.</h2>
        <p>QT45 completa, protocélula formada e dois gradientes metabólicos sustentados.</p>
        <button className="primary" onClick={reset}>Jogar novamente</button>
      </div>
    </div>}
  </main>
}

function Track({label,value,max,note}:{label:string;value:number;max:number;note:string}) {
  const pct=Math.min(100,(value/max)*100)
  return <div className="track">
    <div className="track-row"><span>{label}</span><small>{note}</small></div>
    <div className="track-bar"><i style={{width:`${pct}%`}} /></div>
  </div>
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
