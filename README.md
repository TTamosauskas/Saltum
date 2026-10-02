# Sopa Primordial

Primeira versão jogável do protótipo web de **Sopa Primordial**.

## Executar

Abra `index.html` diretamente no navegador.

O jogo usa apenas arquivos estáticos com caminhos relativos:

- `index.html`
- `src/styles.css`
- `src/game.js`
- `src/main.js`

Também pode ser publicado em qualquer hospedagem estática.

## O que já existe

- Partida local para duas pessoas.
- Sopa compartilhada com coleta de matéria.
- Relógio ambiental aleatório com `☀ UV`, `⚡ Descarga elétrica`, `♨ Hidrotermal`, `◐ Úmido-seco` e `○ Calmaria`.
- Ação **Perturbar**: uma vez por turno, descarte uma bolha da mão para remover o próximo evento da fila ambiental.
- Receitas condicionadas ao ambiente.
- Quatro trilhas estratégicas: RNA/QT45, protocélula, metabolismo e peptídeos.
- QT45 abstraída em cinco módulos de 9 nt.
- Vitória por integração de QT45 completa, protocélula e metabolismo.

## Desenvolvimento opcional

O projeto ainda mantém a configuração Vite/TypeScript como base para evolução futura, porém ela deixou de ser necessária para jogar a versão atual.

## Estado do design

Esta versão é um vertical slice para validar interação, leitura do relógio ambiental e caminhos estratégicos. Custos, oferta, proporções do saco ambiental e condição de vitória ainda são parâmetros de protótipo.
