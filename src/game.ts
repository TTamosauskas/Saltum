export type EnvIcon = '☀' | '⚡' | '♨' | '◐' | '○'
export type Resource =
  | 'H'
  | 'C'
  | 'O'
  | 'N'
  | 'P'
  | 'H₂'
  | 'CO'
  | 'H₂O'
  | 'Aminoácidos'
  | 'Ácidos graxos'
  | 'Nucleotídeos'

export type Player = {
  name: string
  hand: Resource[]
  peptide: number
  membrane: number
  metabolism: number
  rnaModules: number
  perturbed: boolean
  collected: boolean
}

export type GameState = {
  round: number
  activePlayer: number
  players: Player[]
  soup: Resource[]
  environment: EnvIcon[]
  winner: number | null
  log: string[]
}

export type Recipe = {
  id: string
  label: string
  inputs: Resource[]
  output?: Resource
  environments?: EnvIcon[]
  description: string
  apply?: (player: Player) => Player
}

const resourceBag: Resource[] = [
  'H','H','H','H','H','C','C','C','O','O','O','N','N','P','P',
  'H₂','CO','H₂O','Aminoácidos','Ácidos graxos','Nucleotídeos'
]

const envBag: EnvIcon[] = ['☀','☀','☀','⚡','⚡','⚡','♨','♨','◐','◐','◐','○','○','○','○']

export const envInfo: Record<EnvIcon, {name:string; benefit:string; risk:string; className:string}> = {
  '☀': { name:'UV', benefit:'Orgânicos e precursores de RNA', risk:'Acelera degradação de moléculas frágeis', className:'env-uv' },
  '⚡': { name:'Descarga elétrica', benefit:'Aminoácidos e química energética', risk:'Favorece reações rápidas e instabilidade', className:'env-lightning' },
  '♨': { name:'Hidrotermal', benefit:'Metabolismo e lipídios', risk:'Calor pressiona compostos delicados', className:'env-thermal' },
  '◐': { name:'Úmido-seco', benefit:'Polimerização, peptídeos e RNA', risk:'Concentração força escolhas de timing', className:'env-wetdry' },
  '○': { name:'Calmaria', benefit:'Preparação e estabilidade', risk:'Pouca química ambiental disponível', className:'env-calm' },
}

const sample = <T,>(arr:T[]):T => arr[Math.floor(Math.random()*arr.length)]
const drawResource = () => sample(resourceBag)
const drawEnvironment = () => sample(envBag)

export const recipes: Recipe[] = [
  { id:'h2', label:'Formar H₂', inputs:['H','H'], output:'H₂', description:'Combina dois hidrogênios em um reagente simples.' },
  { id:'co', label:'Formar CO', inputs:['C','O'], output:'CO', description:'Produz monóxido de carbono, útil em rotas hidrotermais.' },
  { id:'water', label:'Formar H₂O', inputs:['H','H','O'], output:'H₂O', description:'Produz água para sínteses orgânicas.' },
  {
    id:'amino',
    label:'Gerar aminoácidos',
    inputs:['N','H₂O'],
    output:'Aminoácidos',
    environments:['☀','⚡'],
    description:'UV ou descarga elétrica favorece precursores nitrogenados.'
  },
  {
    id:'fatty',
    label:'Gerar ácidos graxos',
    inputs:['CO','H₂'],
    output:'Ácidos graxos',
    environments:['♨'],
    description:'A rota hidrotermal favorece componentes de membrana.'
  },
  {
    id:'nt',
    label:'Gerar nucleotídeos',
    inputs:['P','H₂O'],
    output:'Nucleotídeos',
    environments:['☀','◐'],
    description:'Ativação e concentração aproximam o sistema de RNA.'
  },
  {
    id:'metabolism',
    label:'Fixar gradiente metabólico',
    inputs:['CO','H₂'],
    environments:['♨'],
    description:'Converte fluxo geoquímico em progresso metabólico.',
    apply:(player) => ({...player, metabolism: player.metabolism + 1})
  },
]

export function createGame(names=['Jogador 1','Jogador 2']): GameState {
  const players = names.map(name => ({
    name,
    hand:['H','H','C','O','N'] as Resource[],
    peptide:0,
    membrane:0,
    metabolism:0,
    rnaModules:0,
    perturbed:false,
    collected:false,
  }))
  return {
    round:1,
    activePlayer:0,
    players,
    soup:Array.from({length:6}, drawResource),
    environment:Array.from({length:6}, drawEnvironment),
    winner:null,
    log:['A sopa desperta. Cada jogador começa com H, H, C, O e N.'],
  }
}

function removeInputs(hand:Resource[], inputs:Resource[]) {
  const next=[...hand]
  for (const input of inputs) {
    const idx=next.indexOf(input)
    if (idx<0) return null
    next.splice(idx,1)
  }
  return next
}

export function canUseRecipe(state:GameState, recipe:Recipe) {
  const player=state.players[state.activePlayer]
  if (recipe.environments && !recipe.environments.includes(state.environment[0])) return false
  return removeInputs(player.hand,recipe.inputs)!==null
}

export function synthesize(state:GameState, recipe:Recipe):GameState {
  if (state.winner!==null || !canUseRecipe(state,recipe)) return state
  const players=state.players.map(p=>({...p,hand:[...p.hand]}))
  let player=players[state.activePlayer]
  const remaining=removeInputs(player.hand,recipe.inputs)
  if (!remaining) return state
  player={...player,hand:remaining}
  if (recipe.output) player.hand=[...player.hand,recipe.output]
  if (recipe.apply) player=recipe.apply(player)
  players[state.activePlayer]=player
  const outcome=recipe.output ? ` → ${recipe.output}` : ''
  return checkWinner({...state,players,log:[`${player.name}: ${recipe.label}${outcome}.`,...state.log]})
}

export function collect(state:GameState, soupIndex:number):GameState {
  if (state.winner!==null) return state
  const player=state.players[state.activePlayer]
  if (player.collected || soupIndex<0 || soupIndex>=state.soup.length) return state
  const resource=state.soup[soupIndex]
  const players=state.players.map(p=>({...p,hand:[...p.hand]}))
  players[state.activePlayer]={...player,hand:[...player.hand,resource],collected:true}
  const soup=[...state.soup]
  soup[soupIndex]=drawResource()
  return {...state,players,soup,log:[`${player.name} coletou ${resource}.`,...state.log]}
}

export function perturb(state:GameState, handIndex:number):GameState {
  if (state.winner!==null) return state
  const player=state.players[state.activePlayer]
  if (player.perturbed || handIndex<0 || handIndex>=player.hand.length || state.environment.length<2) return state
  const discarded=player.hand[handIndex]
  const players=state.players.map(p=>({...p,hand:[...p.hand]}))
  const hand=[...player.hand]
  hand.splice(handIndex,1)
  players[state.activePlayer]={...player,hand,perturbed:true}
  const environment=[...state.environment]
  const removed=environment.splice(1,1)[0]
  environment.push(drawEnvironment())
  return {
    ...state,
    players,
    environment,
    log:[`${player.name} sacrificou ${discarded} e removeu ${removed} da sequência ambiental.`,...state.log]
  }
}

export function depositPeptide(state:GameState, handIndex:number):GameState {
  return deposit(state, handIndex, 'Aminoácidos', (p)=>({...p,peptide:p.peptide+1}), 'incorporou aminoácidos ao catalisador peptídico')
}

export function depositMembrane(state:GameState, handIndex:number):GameState {
  return deposit(state, handIndex, 'Ácidos graxos', (p)=>({...p,membrane:p.membrane+1}), 'incorporou lipídios à protocélula')
}

export function depositRna(state:GameState, handIndex:number):GameState {
  if (state.environment[0]!=='◐') return state
  return deposit(state, handIndex, 'Nucleotídeos', (p)=>({...p,rnaModules:Math.min(5,p.rnaModules+1)}), 'polimerizou um módulo de 9 nt da QT45')
}

function deposit(
  state:GameState,
  handIndex:number,
  required:Resource,
  apply:(player:Player)=>Player,
  message:string
):GameState {
  if (state.winner!==null) return state
  const player=state.players[state.activePlayer]
  if (player.hand[handIndex]!==required) return state
  const players=state.players.map(p=>({...p,hand:[...p.hand]}))
  const hand=[...player.hand]
  hand.splice(handIndex,1)
  const next=apply({...player,hand})
  players[state.activePlayer]=next
  return checkWinner({...state,players,log:[`${player.name} ${message}.`,...state.log]})
}

export function endTurn(state:GameState):GameState {
  if (state.winner!==null) return state
  const players=state.players.map(p=>({...p,hand:[...p.hand],perturbed:false,collected:false}))
  const last=state.activePlayer===state.players.length-1
  if (!last) return {...state,players,activePlayer:state.activePlayer+1}

  const environment=[...state.environment.slice(1),drawEnvironment()]
  return {
    ...state,
    players,
    activePlayer:0,
    round:state.round+1,
    environment,
    log:[`A rodada ${state.round} terminou. O ambiente avançou para ${environment[0]}.`,...state.log]
  }
}

function checkWinner(state:GameState):GameState {
  const winner=state.players.findIndex(p=>p.rnaModules>=5 && p.membrane>=2 && p.metabolism>=2)
  if (winner<0) return state
  return {
    ...state,
    winner,
    log:[`${state.players[winner].name} integrou QT45, compartimento e metabolismo: vida emergente!`,...state.log]
  }
}

export function leadingRoute(player:Player) {
  const entries=[
    ['RNA / QT45', player.rnaModules/5],
    ['Protocélula', player.membrane/2],
    ['Metabolismo', player.metabolism/2],
    ['Peptídeos', player.peptide/3],
  ] as const
  return [...entries].sort((a,b)=>b[1]-a[1])[0][0]
}
