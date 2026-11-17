/* Desktop update controls. Campaign storage remains managed by RPGStorage. */
(() => {
  'use strict';
  const desktop = window.RPGDesktop;
  if (!desktop?.updateStatus) return;
  let status;
  const messages = {
    idle: 'Verificação automática ao abrir o aplicativo.',
    checking: 'Procurando atualizações…',
    current: 'Você está usando a versão mais recente.',
    downloading: 'Baixando atualização…',
    ready: 'Atualização pronta. Ela será aplicada na próxima abertura ou ao reiniciar agora.',
    installer: 'Esta versão precisa de um novo instalador. Abra a página de downloads.',
    offline: 'Conecte-se à internet para receber atualizações.',
    error: 'Não foi possível atualizar. Tente novamente mais tarde.',
    development: 'Execução de teste. Atualizações automáticas ficam disponíveis no aplicativo instalado.'
  };

  function refresh() {
    const section = document.querySelector('[data-desktop-updates]');
    if (section && status) {
      section.querySelector('[data-update-version]').textContent = 'Versão instalada ' + status.currentVersion;
      section.querySelector('[data-update-message]').textContent = status.message || messages[status.phase];
      section.querySelector('[data-update-progress]').textContent = status.phase === 'downloading' ? status.progress + '%' : '';
      section.querySelector('[data-update-auto]').checked = status.automatic;
      section.querySelector('[data-update-check]').disabled = ['checking', 'downloading'].includes(status.phase);
      section.querySelector('[data-update-restart]').hidden = status.phase !== 'ready';
      section.querySelector('[data-update-release]').hidden = status.phase !== 'installer';
      section.querySelector('[data-update-restored]').hidden = !status.restored;
    }
    const utilities = document.querySelector('.nav-utilities');
    let notice = document.querySelector('[data-update-notice]');
    if (status?.phase === 'ready' && utilities && !notice) {
      notice = document.createElement('button');
      notice.className = 'nav-btn';
      notice.dataset.updateNotice = '';
      notice.textContent = '⇩ Atualização pronta';
      notice.onclick = () => window.RPGMasterHost.setView('settings');
      utilities.append(notice);
    }
    if (status?.phase !== 'ready') notice?.remove();
  }

  async function run(action) {
    try { const next = await action(); if (next?.phase) status = { ...status, ...next }; }
    catch (error) { window.RPGUI.alert(error.message); }
    refresh();
  }

  function bind() {
    const settings = document.querySelector('.settings');
    if (settings && !settings.querySelector('[data-desktop-updates]')) {
      const section = document.createElement('section');
      section.className = 'panel';
      section.dataset.desktopUpdates = '';
      section.innerHTML = '<h2>Atualizações do aplicativo</h2>' +
        '<p data-update-version></p><p data-update-message role="status"></p><p data-update-progress></p>' +
        '<p data-update-restored hidden>A última atualização não iniciou corretamente. A versão anterior foi restaurada.</p>' +
        '<label><input type="checkbox" data-update-auto> Receber atualizações automaticamente pela internet</label>' +
        '<p>Windows e macOS recebem a mesma versão. Cada computador mantém sua própria campanha e seus backups.</p>' +
        '<button class="metal-btn" data-update-check>Verificar agora</button> ' +
        '<button class="metal-btn" data-update-restart hidden>Salvar e reiniciar para atualizar</button> ' +
        '<button class="metal-btn" data-update-release hidden>Abrir downloads</button>';
      settings.prepend(section);
      section.querySelector('[data-update-auto]').onchange = event => run(() => desktop.automaticUpdates(event.target.checked));
      section.querySelector('[data-update-check]').onclick = () => run(() => desktop.checkUpdates());
      section.querySelector('[data-update-restart]').onclick = () => run(() => desktop.restartToUpdate());
      section.querySelector('[data-update-release]').onclick = () => run(() => desktop.updateRelease());
    }
    refresh();
  }

  desktop.onUpdateStatus(next => { status = { ...status, ...next }; refresh(); });
  desktop.updateStatus().then(next => { status = next; bind(); });
  const ready = setInterval(() => {
    if (!window.RPGMasterHost?.getState()) return;
    clearInterval(ready);
    desktop.applicationReady().catch(() => {});
  }, 250);
  window.RPGDesktopUpdates = { bind };
})();
