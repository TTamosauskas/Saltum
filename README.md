# Sopa Primordial

Protótipo web estático e singleplayer de **Sopa Primordial**.

## Executar

Abra `index.html` diretamente no navegador ou publique a raiz do repositório em qualquer hospedagem estática.

## Loop principal

Cada fase começa com a Sopa Primordial vazia.

Átomos apropriados à fase caem lentamente e continuamente do topo da página. Clique em um átomo para capturá-lo; ele desaparece da queda e surge como bolha dentro da sopa.

Dentro da sopa, ingredientes compatíveis podem reagir de duas formas:

- clique em duas bolhas compatíveis em sequência;
- arraste uma bolha sobre outra.

Quando a combinação é válida, os reagentes desaparecem e o produto emerge dentro da sopa.

## Eventos

A antiga barra de eventos foi removida.

Eventos aparecem entre a matéria em queda como objetos especiais, mais brilhantes e em formato de losango. Eles nunca entram na sopa.

Ao clicar em um evento, ele é consumido e dispara seu efeito temporário:

- `☀ UV` abre uma janela fotoquímica para aminoácidos e nucleotídeos;
- `⚡ Descarga elétrica` abre uma janela energética para aminoácidos;
- `♨ Hidrotermal` abre a síntese de ácidos graxos;
- `◐ Úmido-seco` abre nucleotídeos, peptídeos e a montagem estratégica de QT45.

O efeito ativo aparece apenas como um pequeno indicador temporário. O clique no evento também dispara uma notificação via React Toastify.

## Fases

A campanha atual usa apenas átomos `H`, `C`, `O`, `N` e `P` como matéria que cai. Moléculas e estruturas precisam ser reconstruídas dentro da própria sopa.

1. Hidrogênio molecular — `H + H → H₂`
2. Água — `H + H → H₂`, depois `H₂ + O → H₂O`
3. Carbono reativo — `C + O → CO`
4. Primeiros aminoácidos — construção de H₂O e depois `N + H₂O`
5. Lipídios prebióticos — construção de H₂ e CO e depois síntese hidrotermal
6. Nucleotídeos — construção de H₂O e reação com P
7. Catálise peptídica — dois aminoácidos e evento úmido-seco
8. Primeira vesícula — dois ácidos graxos
9. RNA catalítico — dois nucleotídeos e evento úmido-seco
10. Integração prebiótica — reconstrução dos sistemas até Vida emergente

As fases finais são abstrações estratégicas de jogo.

## Interface

A tela principal mostra apenas fase, objetivo, progresso, efeito ambiental temporário quando existir, Sopa Primordial e painel contextual da seleção.

O Menu contém navegação de fases desbloqueadas, reinício da fase e registro da sopa.

## Arquivos principais

- `index.html`
- `src/styles.css`
- `src/game.js`
- `src/main.js`
- `src/toasts.mjs`

O jogo permanece totalmente estático para distribuição via GitHub Pages.
