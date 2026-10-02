# Sopa Primordial

Protótipo web estático e singleplayer de **Sopa Primordial**.

## Executar

Abra `index.html` diretamente no navegador ou publique a raiz do repositório em qualquer hospedagem estática.

## Fluxo de matéria

Cada fase começa com a Sopa Primordial vazia.

A matéria do período atravessa continuamente a tela por várias direções. O fluxo pertence ao período, e não à receita específica da fase.

Durante **Atmosfera primitiva**, o conjunto é sempre:

`C, H, H, O, N`

O hidrogênio aparece com peso duplo. Cabe ao jogador identificar e capturar apenas os átomos úteis para o objetivo atual.

A partir de **Atmosfera + minerais**, fósforo entra no fluxo:

`C, H, H, O, N, P`

## Captura

Ao clicar em um átomo em movimento, ele interrompe sua trajetória e é sugado para um ponto dentro da Sopa Primordial.

A bolha interna só é criada quando a animação de absorção chega à poça, exatamente no ponto final da trajetória.

## Reações

Ingredientes compatíveis podem reagir de duas formas:

- clique em duas bolhas compatíveis em sequência;
- arraste uma bolha sobre outra.

Quando a combinação é válida, os reagentes desaparecem e o produto emerge dentro da sopa.

## Eventos

Eventos também atravessam a tela por várias direções, porém aparecem como losangos luminosos.

Eles nunca entram na sopa. Ao clicar em um evento, o losango se desfaz e dispara seu efeito temporário:

- `☀ UV` abre uma janela fotoquímica para aminoácidos e nucleotídeos;
- `⚡ Descarga elétrica` abre uma janela energética para aminoácidos;
- `♨ Hidrotermal` abre a síntese de ácidos graxos;
- `◐ Úmido-seco` abre nucleotídeos, peptídeos e a montagem estratégica de QT45.

O efeito ativo aparece apenas como um pequeno indicador temporário e também é anunciado por React Toastify.

## Campanha

A campanha atual possui dez fases, da formação de H₂ até a integração prebiótica.

As primeiras fases pertencem à Atmosfera primitiva e recebem sempre o mesmo conjunto elemental, mesmo quando parte dele é irrelevante à receita. Fases posteriores acrescentam minerais ao período e passam a incluir P.

Moléculas e estruturas maiores precisam ser construídas dentro da sopa a partir da matéria capturada.

As fases finais são abstrações estratégicas de jogo.

## Arquivos principais

- `index.html`
- `src/styles.css`
- `src/game.js`
- `src/main.js`
- `src/toasts.mjs`

O jogo permanece totalmente estático para distribuição via GitHub Pages.
