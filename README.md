# Sopa Primordial

Protótipo web estático e singleplayer de **Sopa Primordial**.

## Executar

Abra `index.html` diretamente no navegador ou publique a raiz do repositório em qualquer hospedagem estática.

Arquivos principais:

- `index.html`
- `src/styles.css`
- `src/game.js`
- `src/main.js`
- `src/toasts.mjs`

## Estrutura do jogo

A campanha é dividida em fases. Cada fase apresenta uma receita principal e monta automaticamente uma única **Sopa Primordial** com toda a matéria necessária para concluir esse objetivo, além de alguns elementos extras e uma bolha `?` para experimentação.

Toda a interação acontece dentro da mesma poça. Selecione uma bolha para destacar parceiros compatíveis e arraste uma bolha sobre outra para executar a reação.

Novas moléculas surgem crescendo dentro da própria sopa.

## Fases atuais

1. Hidrogênio molecular — `H + H → H₂`
2. Água — `H₂ + O → H₂O`
3. Carbono reativo — `C + O → CO`
4. Primeiros aminoácidos — `N + H₂O → Aminoácidos`
5. Lipídios prebióticos — `CO + H₂ → Ácidos graxos`
6. Nucleotídeos — `P + H₂O → Nucleotídeos`
7. Catálise peptídica — combinação de aminoácidos
8. Primeira vesícula — combinação de ácidos graxos
9. RNA catalítico — montagem estratégica de QT45
10. Integração prebiótica — formação de um protobionte e integração com QT45

As fases finais são abstrações estratégicas de jogo, usadas para representar a integração gradual de sistemas prebióticos.

## Ambiente

A barra ambiental mostra o evento atual e os próximos eventos.

No início de cada turno, o evento atual é disparado e informado por um toast via React Toastify. O ambiente pode favorecer reações, prejudicar compostos expostos e executar reações secundárias na sopa.

A receita-objetivo da fase permanece reservada para a ação do jogador.

## Perturbar ambiente

Selecione uma bolha da sopa e use **Perturbar ambiente** para sacrificá-la. O próximo evento futuro da fila é removido e os eventos seguintes avançam uma posição.

A ação pode ser usada uma vez por turno. Como a própria sopa contém os reagentes da fase, sacrificar uma matéria importante pode tornar vantajoso reiniciar a fase pelo Menu.

## Bolha desconhecida

Cada fase inclui uma bolha `?`. Toque nela para revelar um recurso aleatório. O resultado pode abrir uma reação alternativa ou, em alguns casos, acelerar o objetivo.

## Campanha

O Menu mostra as fases já desbloqueadas, permite revisitar fases anteriores, reiniciar a fase atual e consultar o registro da sopa.

O jogo permanece totalmente estático para distribuição via GitHub Pages.
