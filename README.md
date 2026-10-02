# Sopa Primordial

Protótipo web estático e singleplayer de **Sopa Primordial**, um jogo de construção progressiva inspirado em química prebiótica.

## Campanha com 44 fases

A campanha detalhada aplica a regra **1 fase = 1 receita principal = 1 produto novo = 1 meta própria**.

As fases são liberadas progressivamente. O modo `#editor` mantém acesso direto à trilha inteira.

### Atmosfera primitiva

1. Hidrogênio molecular — `H + H → H₂`
2. Água — `H₂ + O → H₂O`
3. Monóxido de carbono — `C + O → CO`
4. Metano — `C + H₂ → CH₄`
5. Amônia — `N + H₂ → NH₃`
6. Fosfato disponível — `P + H₂O → Fosfato`

### Precursores orgânicos e aminoácidos

7. Formaldeído
8. Cianeto
9. Mistura de açúcares
10. Ribose
11. Glicina
12. Aspartato
13. Glutamina
14. Ácidos graxos

### Bases nitrogenadas

15. Adenina
16. Guanina
17. Uracila
18. Citosina

### Compartimentalização

19. Lipídios simples
20. Primeira vesícula
21. Peptídeo curto
22. Peptídeo catalítico
23. Protobionte

A membrana visual surge ao concluir **Primeira vesícula**. Antes disso a química ocorre em ambiente aberto.

### Nucleosídeos

24. Adenosina
25. Guanosina
26. Uridina
27. Citidina

### Nucleotídeos

28. AMP
29. GMP
30. UMP
31. CMP
32. Pool A/U
33. Pool C/G
34. Pool completo de RNA
35. Nucleotídeos ativados
36. Trinucleotídeos ativados

### Mundo de RNA e replicação

37. Oligômero de RNA
38. RNA molde
39. RNA catalítico
40. QT45
41. Fita complementar
42. Cópia de QT45
43. RNA autorreplicante
44. Sistema autorreplicante

## Condições ambientais

Receitas que dependem de energia ou ambiente mostram suas condições logo abaixo da fórmula.

Os eventos de uso único são:

- `⚡` Descarga elétrica
- `☀` UV
- `♨` Hidrotermal
- `◐` Úmido-seco
- `❄` Gelo eutético

Cada evento capturado arma uma reação compatível e é consumido quando a reação acontece.

`☀ Fotólise` permanece como evento especial vermelho: ele destaca moléculas decomponíveis e permite quebrar uma delas nos precursores imediatos da receita do jogo.

## Gelo eutético e QT45

As etapas finais usam `❄ Gelo eutético` para representar a condição experimental em que QT45 foi caracterizado. QT45 é uma ribozima polimerase de 45 nucleotídeos que utiliza substratos trinucleotídicos trifosfato e foi demonstrada sintetizando sua fita complementar e uma cópia de si mesma em gelo eutético levemente alcalino.

No jogo, as receitas anteriores a QT45 comprimem muitas redes químicas reais em transformações binárias jogáveis. Elas são **abstrações estratégicas**, e não equações estequiométricas literais.

## Progressão persistente

Moléculas e estruturas construídas seguem acumuladas ao avançar. Átomos livres deixam o estado persistente da fase.

Receitas de fases futuras ficam bloqueadas até sua etapa ser liberada. Assim, cada descoberta da trilha introduz de fato uma transformação nova.

Algumas bolhas representam pools. Em etapas finais, o pool de trinucleotídeos pode ser preservado enquanto alimenta mais de uma síntese, evitando reconstrução excessiva da árvore inteira.

## Ambiente aberto e compartimento

Antes da vesícula, clicar em uma partícula interrompe seu movimento e a seleciona. Uma segunda partícula compatível pode reagir com ela. Clicar em espaço vazio devolve a seleção ao fluxo.

Depois da vesícula, passa a existir uma fronteira visual entre exterior e interior. Matéria pode ser sugada ou arrastada para dentro; bolhas internas podem ser organizadas e também liberadas novamente.

## Arquivos principais

- `index.html`
- `src/styles.css`
- `src/game.js`
- `src/main.js`
- `src/toasts.mjs`

O jogo permanece estático e compatível com GitHub Pages.
