# Sopa Primordial

Protótipo web estático de **Sopa Primordial**.

## Executar

Abra `index.html` diretamente no navegador ou publique a raiz do repositório em qualquer hospedagem estática.

Arquivos principais:

- `index.html`
- `src/styles.css`
- `src/game.js`
- `src/main.js`

## Interface orgânica

A oferta compartilhada aparece como uma poça primordial central. As bolhas possuem tamanhos e movimentos diferentes e novos recursos emergem por uma animação de crescimento.

Uma bolha `?` permanece na sopa como opção de risco. Ao coletá-la, seu conteúdo é revelado e uma nova bolha desconhecida volta à sopa.

A mão do jogador é uma segunda poça menor. Para sintetizar, arraste uma bolha da mão sobre outra. Ingredientes compatíveis compartilham cores nas bordas e os parceiros possíveis ficam destacados durante o arraste.

Algumas combinações podem levar a mais de um caminho. Nesses casos, o jogo pede que o jogador escolha o resultado.

Aminoácidos, ácidos graxos e nucleotídeos podem ser arrastados para seus projetos de peptídeos, protocélula e QT45.

## Perturbar ambiente

Selecione uma bolha da mão e use **Perturbar** para sacrificá-la. Isso remove o próximo ícone futuro da sequência ambiental e aproxima todos os eventos posteriores em uma posição.

O custo é pessoal, mas o efeito é global: todos os jogadores passam a enfrentar a nova sequência ambiental. Cada jogador pode perturbar o ambiente uma vez por turno.

## Estado do protótipo

A versão atual valida o relógio ambiental compartilhado, química por combinação direta, rotas de RNA/QT45, protocélula, metabolismo e peptídeos. Custos, distribuição de recursos, efeitos ambientais e condição de vitória ainda são parâmetros de balanceamento.
