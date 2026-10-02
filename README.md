# Sopa Primordial

Primeira versão jogável do protótipo web de **Sopa Primordial**.

## O que já existe

- Partida local para duas pessoas.
- Sopa compartilhada com coleta de matéria.
- Relógio ambiental aleatório com `☀ UV`, `⚡ Descarga elétrica`, `♨ Hidrotermal`, `◐ Úmido-seco` e `○ Calmaria`.
- Ação **Perturbar**: uma vez por turno, descarte uma bolha da mão para remover o próximo evento da fila ambiental.
- Receitas condicionadas ao ambiente.
- Quatro trilhas estratégicas: RNA/QT45, protocélula, metabolismo e peptídeos.
- QT45 abstraída em cinco módulos de 9 nt.
- Vitória por integração de QT45 completa, protocélula e metabolismo.

## Rodar localmente

```bash
npm install
npm run dev
```

Para gerar a versão de produção:

```bash
npm run build
```

## Estado do design

Esta versão é um vertical slice para validar interação, leitura do relógio ambiental e caminhos estratégicos. Custos, oferta, proporções do saco ambiental e condição de vitória ainda são parâmetros de protótipo.
