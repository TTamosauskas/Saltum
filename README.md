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

## Linguagem molecular visual

O campo usa um registro central `RESOURCE_VISUALS` com representação própria para todas as 49 espécies presentes no motor.

Cada entrada declara família, tipo de desenho, largura, altura, cor de identidade, fórmula e se o detalhe representa uma estrutura química ou uma abstração do jogo.

Os átomos usam a convenção visual CPK/Jmol dentro das estruturas: H branco, C cinza, N azul, O vermelho e P laranja.

As famílias evoluem visualmente junto com a campanha:

- átomos usam esferas;
- H₂, H₂O, CO, CH₄ e NH₃ usam geometrias moleculares simplificadas;
- ribose e pequenas moléculas orgânicas usam estruturas em bastão;
- glicina, aspartato e glutamina usam esqueletos próprios;
- ácidos graxos usam cabeça polar e cauda hidrofóbica;
- Adenina e Guanina usam duas estruturas de anel; Uracila e Citosina usam uma;
- bases exibem A/G/C/U de forma redundante com a cor;
- A–U recebe duas marcas de ligação de hidrogênio e G–C recebe três quando as bases complementares estão próximas;
- nucleosídeos mostram base + ribose;
- nucleotídeos mostram fosfato + ribose + base;
- pools usam representações agregadas identificáveis;
- peptídeos passam de cadeia curta para dobra catalítica;
- vesícula e protobionte são representados como compartimentos;
- produtos de RNA passam de fitas curtas para estruturas dobradas e sistemas replicantes.

A área clicável mantém dimensão mínima de 56 × 56 px independentemente da forma visível.

Ao selecionar uma espécie, o painel científico amplia o SVG e mostra nome, família e fórmula. Moléculas definidas recebem o selo **ESTRUTURA QUÍMICA**; pools, peptídeos abstratos, vesículas e sistemas de RNA recebem **REPRESENTAÇÃO DO JOGO**.

Produtos recém-formados animam a montagem de ligações e componentes. A mesma linguagem aparece em miniatura na trilha e no catálogo de receitas.

## Arquivos principais

- `index.html`
- `src/styles.css`
- `src/game.js`
- `src/visuals.js`
- `src/main.js`
- `src/toasts.mjs`

O jogo permanece estático e compatível com GitHub Pages.


## Ajustes de legibilidade dos objetos

Os átomos H, C, N, O e P usam glifos centrais ampliados para leitura imediata nas primeiras fases.

Todos os objetos moleculares mantêm seus desenhos internos próprios, porém o invólucro interativo externo passa a ser circular. O diâmetro cresce de acordo com a maior dimensão da estrutura, preservando espaço para moléculas alongadas sem voltar ao cartão retangular arredondado.

A Fotólise continua como losango vermelho flutuante no ambiente. O controlador mantém no máximo uma ocorrência por vez. Ao clicar nela, a Fotólise fica armada e o losango sai do fluxo; depois da decomposição, um novo losango volta a atravessar a tela. Se o losango completar sua travessia sem ser usado, outro entra em seguida.


## Agrupamento de recursos e combinação direta

Recursos idênticos agora ocupam um único círculo. A partir da segunda unidade, o círculo exibe um contador como `×2`, `×3` e assim por diante.

Receitas consomem apenas as unidades necessárias do agrupamento. Quando um grupo participa de uma reação, sua quantidade diminui e a seleção é limpa. Quando a quantidade chega a zero, o círculo desaparece.

Receitas com dois reagentes idênticos, como `H + H → H₂`, continuam funcionando usando duas unidades do mesmo agrupamento.

Além do fluxo por cliques sucessivos, uma receita pode ser concluída arrastando diretamente um reagente sobre outro compatível. O resultado respeita as mesmas regras de desbloqueio e catalisadores.

A área de objetivo foi simplificada. Receitas sem catalisador exibem apenas objetivo e fórmula. Quando uma condição ambiental é exigida, a interface mostra somente a linha curta dos catalisadores, por exemplo `☀ UV ou ⚡ Descarga elétrica`.
