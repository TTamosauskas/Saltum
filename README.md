# Sopa Primordial

Protótipo web estático e singleplayer de **Sopa Primordial**.

## Tela inicial e trilha de fases

A página inicial mostra uma trilha de campanha inspirada no mapa de fases do Ardua.

Cada fase pode estar em um destes estados:

- fase atual;
- concluída;
- disponível;
- bloqueada.

No modo normal, novas fases são liberadas progressivamente conforme os objetivos são concluídos.

Ao abrir a URL com `#editor`, todas as fases ficam disponíveis para navegação direta desde o início.

A trilha também pode ser aberta a qualquer momento pelo Menu sem perder o estado da fase atual.

## Fluxo de matéria

A matéria do período atravessa continuamente a tela por várias direções.

Durante **Atmosfera primitiva**, o fluxo é sempre:

`C, H, H, O, N`

Durante **Atmosfera + minerais**, fósforo entra no conjunto:

`C, H, H, O, N, P`

O fluxo pertence ao período, e cabe ao jogador selecionar a matéria útil para a receita atual.

## Captura

Átomos podem ser capturados por clique ou por arraste direto para dentro da Sopa Primordial.

O clique inicia uma animação de sucção automática até um ponto da poça.

Ao arrastar, a sopa recebe destaque verde quando funciona como destino válido.

## Organização e descarte

Bolhas já capturadas podem ser movidas livremente dentro da sopa para organização visual.

Ao arrastar uma bolha para fora da poça, ela é liberada novamente para o fluxo exterior e continua vagando pela tela.

Moléculas liberadas podem ser recapturadas durante a mesma fase.

Ao trocar de fase, todo o fluxo exterior é descartado.

## Reações

Ingredientes compatíveis podem reagir por dois cliques em sequência ou por drag-and-drop dentro da sopa.

A receita `N + H₂O → Aminoácidos` funciona diretamente na fase **Primeiros aminoácidos**.

Eventos ambientais deixaram de funcionar como trava de receita. Eles atuam como catalisadores especiais: ao clicar em um evento, o jogo tenta executar automaticamente uma reação favorecida que já possua os reagentes necessários dentro da sopa.

## Catálogo de receitas

O Menu exibe todas as receitas presentes no motor atual:

- `H + H → H₂`
- `H₂ + O → H₂O`
- `C + O → CO`
- `N + H₂O → Aminoácidos`
- `CO + H₂ → Ácidos graxos`
- `P + H₂O → Nucleotídeos`
- `Aminoácidos + Aminoácidos → Peptídeo`
- `Ácidos graxos + Ácidos graxos → Vesícula`
- `Nucleotídeos + Nucleotídeos → QT45`
- `Peptídeo + Vesícula → Protobionte`
- `Protobionte + QT45 → Vida emergente`

O motor executa uma auditoria dessas receitas ao iniciar a campanha e verifica se todas as metas das fases possuem uma transformação correspondente.

## Progressão persistente

A sopa funciona como um sistema cumulativo ao longo da campanha.

Ao concluir uma fase e avançar, átomos livres saem da sopa, enquanto moléculas e estruturas construídas permanecem disponíveis para fases posteriores.

Reiniciar uma fase restaura o checkpoint molecular existente no começo daquela etapa.

## Repetição por complexidade

As fases básicas pedem 2 repetições, as intermediárias 3 e as complexas 4.

1. H₂ ×2
2. H₂O ×2
3. CO ×2
4. Aminoácidos ×3
5. Ácidos graxos ×3
6. Nucleotídeos ×3
7. Peptídeos ×4
8. Vesículas ×4
9. QT45 ×4
10. Vida emergente ×4

## Eventos

Eventos atravessam a tela como losangos luminosos e nunca entram na sopa.

Ao clicar em um evento, ele executa sua ação catalítica e é anunciado por React Toastify.

## Arquivos principais

- `index.html`
- `src/styles.css`
- `src/game.js`
- `src/main.js`
- `src/toasts.mjs`

O jogo permanece totalmente estático para distribuição via GitHub Pages.


## Fotólise

A campanha também inclui um evento especial de decomposição:

`☀ Fotólise`

Ele usa o mesmo símbolo solar do UV, porém aparece como um losango com borda e brilho vermelho intenso para ficar visualmente distinto do UV normal.

Ao clicar no losango, a Fotólise fica armada. Todas as bolhas que foram formadas por alguma receita recebem um contorno vermelho intenso.

O próximo clique em uma dessas bolhas desmonta a molécula em seus dois precursores imediatos e encerra a Fotólise.

Exemplos:

- `H₂ → H + H`
- `H₂O → H₂ + O`
- `CO → C + O`
- `Aminoácidos → N + H₂O`
- `Vesícula → Ácidos graxos + Ácidos graxos`

A decomposição segue as receitas do próprio jogo e funciona como uma abstração estratégica de fotólise.


## Condições ambientais das receitas

Receitas prebióticas passam a declarar explicitamente as condições ambientais que podem habilitá-las. A interface mostra essas opções logo abaixo da receita.

No protótipo atual:

- Aminoácidos: ⚡ Descarga elétrica, ☀ UV ou ♨ Hidrotermal.
- Ácidos graxos: ♨ Hidrotermal.
- Nucleotídeos: ☀ UV.
- Peptídeos: ◐ Úmido-seco ou ♨ Hidrotermal.
- QT45: ◐ Úmido-seco como abstração estratégica da etapa de polimerização.
- H₂, H₂O, CO, Vesícula, Protobionte e Vida emergente: sem evento obrigatório.

Os ícones representam condições ambientais/energéticas do jogo e funcionam como uma abstração de vias prebióticas plausíveis, em vez de catalisadores químicos universais.


## Consumo de catalisadores

Eventos ambientais usados como catalisadores agora funcionam como uma carga de uso único.

Ao capturar `⚡`, `☀`, `♨` ou `◐`, o jogo arma esse catalisador para exatamente uma reação compatível. A reação consome a carga imediatamente.

Exemplo: `N + H₂O → Aminoácidos` exige uma carga ativa de `⚡`, `☀` ou `♨`. Depois que Aminoácidos é formado, o catalisador é removido e uma nova unidade precisa ser capturada para repetir a reação.

Isso elimina a ambiguidade das antigas janelas temporárias.
