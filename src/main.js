(function () {
  const G = window.SopaGame;
  let state = G.createGame();

  function esc(value) {
    return String(value).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  function track(label, value, max, note) {
    const pct = Math.min(100, (value / max) * 100);
    return '<div class="track"><div class="track-row"><span>' + label + '</span><small>' + note + '</small></div><div class="track-bar"><i style="width:' + pct + '%"></i></div></div>';
  }

  function render() {
    const app = document.getElementById('app');
    const active = state.players[state.activePlayer];
    const current = state.environment[0];
    const info = G.ENV_INFO[current];

    app.innerHTML =
      '<div class="app-shell">' +
      '<header class="hero"><div><p class="eyebrow">Protótipo estático</p><h1>Sopa Primordial</h1><p class="subtitle">Dispute matéria, altere o futuro ambiental e integre diferentes caminhos até a vida.</p></div><button class="ghost" id="newGame">Nova partida</button></header>' +
      '<section class="status-grid">' +
      '<article class="panel"><span>Rodada</span><strong>' + state.round + '</strong></article>' +
      '<article class="panel"><span>Jogador ativo</span><strong>' + esc(active.name) + '</strong><small>Rota dominante: ' + G.leadingRoute(active) + '</small></article>' +
      '<article class="panel"><span>Ambiente atual</span><strong>' + current + ' ' + info.name + '</strong><small>' + info.benefit + '</small></article>' +
      '</section>' +
      '<section class="panel environment-panel"><div class="section-heading"><div><p class="eyebrow">Relógio ambiental compartilhado</p><h2>Próximos estados</h2></div><p>Descarte uma bolha para remover o próximo ícone. A alteração afeta todos.</p></div><div class="environment-track">' +
      state.environment.map((icon, i) => '<div class="env-token ' + G.ENV_INFO[icon].className + (i === 0 ? ' current' : '') + '"><span>' + icon + '</span><small>' + (i === 0 ? 'agora' : '+' + i) + '</small></div>').join('') +
      '</div></section>' +
      '<section class="board-grid"><article class="panel soup-panel"><div class="section-heading"><div><p class="eyebrow">Oferta compartilhada</p><h2>Sopa</h2></div><p>Uma coleta por turno.</p></div><div class="bubble-grid">' +
      state.soup.map((r, i) => '<button class="bubble" data-action="collect" data-index="' + i + '"' + (active.collected ? ' disabled' : '') + '><strong>' + esc(r) + '</strong><small>' + (active.collected ? 'coleta usada' : 'coletar') + '</small></button>').join('') +
      '</div></article>' +
      '<article class="panel hand-panel"><div class="section-heading"><div><p class="eyebrow">Matéria pessoal</p><h2>Mão de ' + esc(active.name) + '</h2></div><p>' + active.hand.length + ' bolhas</p></div><div class="hand-list">' +
      active.hand.map((r, i) => '<div class="hand-card"><strong>' + esc(r) + '</strong><div class="mini-actions">' +
        (!active.perturbed ? '<button data-action="perturb" data-index="' + i + '">Perturbar</button>' : '') +
        (r === 'Aminoácidos' ? '<button data-action="deposit" data-type="peptide" data-index="' + i + '">Peptídeo</button>' : '') +
        (r === 'Ácidos graxos' ? '<button data-action="deposit" data-type="membrane" data-index="' + i + '">Membrana</button>' : '') +
        (r === 'Nucleotídeos' ? '<button data-action="deposit" data-type="rna" data-index="' + i + '"' + (current !== '◐' ? ' disabled' : '') + '>QT45 +9 nt</button>' : '') +
      '</div></div>').join('') +
      '</div><button class="primary end-turn" id="endTurn">Encerrar turno</button></article></section>' +
      '<section class="progress-grid">' +
      state.players.map(p => '<article class="panel player-progress"><div class="section-heading compact"><h2>' + esc(p.name) + '</h2><span>' + G.leadingRoute(p) + '</span></div>' +
        track('QT45', p.rnaModules, 5, (p.rnaModules * 9) + '/45 nt') +
        track('Protocélula', p.membrane, 2, p.membrane + '/2') +
        track('Metabolismo', p.metabolism, 2, p.metabolism + '/2') +
        track('Peptídeos', p.peptide, 3, p.peptide + '/3') +
      '</article>').join('') +
      '</section>' +
      '<section class="panel recipes-panel"><div class="section-heading"><div><p class="eyebrow">Química disponível</p><h2>Receitas</h2></div></div><div class="recipe-grid">' +
      G.RECIPES.map(r => {
        const ready = G.canUseRecipe(state, r);
        return '<button class="recipe-card ' + (ready ? 'ready' : '') + '" data-action="synthesize" data-id="' + r.id + '"' + (!ready ? ' disabled' : '') + '><strong>' + r.label + '</strong><span>' + r.inputs.join(' + ') + (r.output ? ' → ' + r.output : '') + '</span><small>' + (r.environments ? r.environments.join(' ou ') : 'qualquer ambiente') + '</small></button>';
      }).join('') +
      '</div></section>' +
      '<section class="panel log-panel"><div class="section-heading compact"><h2>Histórico</h2><span>' + state.log.length + ' eventos</span></div><div class="log">' +
      state.log.slice(0, 10).map(line => '<p>' + esc(line) + '</p>').join('') +
      '</div></section></div>' +
      (state.winner !== null ? '<div class="victory"><div class="victory-card"><p class="eyebrow">Vida emergente</p><h2>' + esc(state.players[state.winner].name) + ' integrou o primeiro sistema viável.</h2><p>QT45 completa, protocélula formada e metabolismo sustentado.</p><button class="primary" id="restart">Jogar novamente</button></div></div>' : '');

    bind();
  }

  function bind() {
    document.getElementById('newGame').onclick = function () { state = G.createGame(); render(); };
    document.getElementById('endTurn').onclick = function () { G.endTurn(state); render(); };
    const restart = document.getElementById('restart');
    if (restart) restart.onclick = function () { state = G.createGame(); render(); };

    document.querySelectorAll('[data-action="collect"]').forEach(el => el.onclick = function () {
      G.collect(state, Number(this.dataset.index)); render();
    });
    document.querySelectorAll('[data-action="perturb"]').forEach(el => el.onclick = function () {
      G.perturb(state, Number(this.dataset.index)); render();
    });
    document.querySelectorAll('[data-action="deposit"]').forEach(el => el.onclick = function () {
      G.deposit(state, Number(this.dataset.index), this.dataset.type); render();
    });
    document.querySelectorAll('[data-action="synthesize"]').forEach(el => el.onclick = function () {
      G.synthesize(state, this.dataset.id); render();
    });
  }

  render();
})();