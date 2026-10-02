# Sopa Primordial

Protótipo web estático e singleplayer de **Sopa Primordial**.

## Fluxo de matéria

A matéria do período atravessa continuamente a tela por várias direções.

Durante **Atmosfera primitiva**, o fluxo é sempre:

`C, H, H, O, N`

Durante **Atmosfera + minerais**, fósforo entra no conjunto:

`C, H, H, O, N, P`

O fluxo pertence ao período, e cabe ao jogador selecionar a matéria útil para a receita atual.

## Captura

Átomos podem ser capturados de duas formas.

Um clique interrompe a trajetória e suga o átomo automaticamente para um ponto dentro da Sopa Primordial.

Também é possível arrastar o átomo em movimento e soltá-lo diretamente dentro da poça. A sopa recebe destaque verde quando funciona como destino válido.

A bolha só passa a existir dentro da sopa ao final da captura.

## Reações

Ingredientes compatíveis podem reagir por dois cliques em sequência ou por drag-and-drop dentro da sopa.

O produto emerge no ponto da reação e permanece disponível como matéria acumulada.

## Progressão persistente

A sopa funciona como um sistema cumulativo ao longo da campanha.

Ao concluir uma fase e avançar, átomos livres deixam o tabuleiro, enquanto moléculas e estruturas construídas permanecem dentro da sopa. Esses produtos podem ser usados como precursores em fases posteriores.

Reiniciar uma fase restaura o checkpoint molecular do início daquela etapa.

## Repetição por complexidade

Cada fase pede várias ocorrências da receita principal:

- fases básicas: 2 repetições;
- fases intermediárias: 3 repetições;
- fases complexas: 4 repetições.

A sequência atual é:

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

Isso permite que produtos de fases anteriores sejam consumidos ou combinados nas etapas seguintes.

## Eventos

Eventos atravessam a tela como losangos luminosos e nunca entram na sopa.

Ao clicar em um evento, ele dispara seu efeito temporário:

- `☀ UV` abre uma janela fotoquímica para aminoácidos e nucleotídeos;
- `⚡ Descarga elétrica` abre uma janela energética para aminoácidos;
- `♨ Hidrotermal` abre a síntese de ácidos graxos;
- `◐ Úmido-seco` abre nucleotídeos, peptídeos e a montagem estratégica de QT45.

O evento ativo aparece apenas como um pequeno indicador temporário e também é anunciado por React Toastify.

## Interface

A legenda e a contagem de bolhas dentro da poça foram removidas. A própria sopa funciona como superfície visual principal.

## Arquivos principais

- `index.html`
- `src/styles.css`
- `src/game.js`
- `src/main.js`
- `src/toasts.mjs`

O jogo permanece totalmente estático para distribuição via GitHub Pages.
