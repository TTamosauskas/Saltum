# Sopa Primordial

Primeira versão jogável do protótipo web de **Sopa Primordial**.

## Executar

Abra `index.html` diretamente no navegador. Nenhuma instalação, build ou servidor é necessário.

Arquivos usados pela versão estática:

- `index.html`
- `src/styles.css`
- `src/game.js`
- `src/main.js`

A mesma estrutura também funciona em qualquer hospedagem estática.

## O que já existe

- Partida local para duas pessoas.
- Sopa compartilhada com coleta de matéria.
- Relógio ambiental aleatório com `☀ UV`, `⚡ Descarga elétrica`, `♨ Hidrotermal`, `◐ Úmido-seco` e `○ Calmaria`.
- Ação **Perturbar**: uma vez por turno, descarte uma bolha da mão para remover o próximo evento da fila ambiental.
- Receitas condicionadas ao ambiente.
- Quatro trilhas estratégicas: RNA/QT45, protocélula, metabolismo e peptídeos.
- QT45 abstraída em cinco módulos de 9 nt.
- Vitória por integração de QT45 completa, protocélula e metabolismo.

## Desenvolvimento

Os arquivos TypeScript/Vite permanecem no repositório como base de desenvolvimento, enquanto a versão jogável distribuída roda diretamente em HTML, CSS e JavaScript estáticos.
