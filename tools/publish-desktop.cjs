'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync, spawnSync } = require('node:child_process');
const { Readable } = require('node:stream');
const { verifyManifest } = require('../desktop/update-core.cjs');
const pkg = require('../package.json');
const repository = 'RhuanLUX/Masterdashboard';

async function publish() {
  const root = path.resolve(__dirname, '..');
  const directory = path.join(root, 'dist');
  const version = pkg.version;
  const stageOnly = process.argv.includes('--stage-update');
  const tag = 'desktop-v' + version;
  const revision = execFileSync('git', ['rev-parse', tag + '^{commit}'], { encoding: 'utf8' }).trim();
  const manifest = verifyManifest(JSON.parse(fs.readFileSync(path.join(directory, 'rpg-update.json'), 'utf8')), fs.readFileSync(path.join(root, 'desktop/update-public.pem')));
  if (manifest.version !== version || manifest.sourceCommit !== revision) throw Error('O pacote assinado não corresponde à tag de publicação.');
  const installers = [
    'RPG-Master-' + version + '-Windows-x64.exe',
    'RPG-Master-' + version + '-macOS-x64.dmg',
    'RPG-Master-' + version + '-macOS-arm64.dmg'
  ];
  const names = [
    ...(stageOnly ? [] : installers),
    'RPG-Master-' + version + '-update.asar.gz',
    'rpg-update.json'
  ];
  const hashes = [];
  for (const name of names) {
    const file = path.join(directory, name);
    const hash = crypto.createHash('sha256');
    for await (const chunk of fs.createReadStream(file)) hash.update(chunk);
    const digest = hash.digest('hex');
    if (name.endsWith('.gz') && digest !== manifest.sha256) throw Error('Hash do pacote de atualização diverge do manifesto.');
    hashes.push(digest + '  ' + name);
  }
  if (!stageOnly) {
    fs.writeFileSync(path.join(directory, 'SHA256SUMS-' + version + '.txt'), hashes.join('\n') + '\n');
    names.push('SHA256SUMS-' + version + '.txt');
  }
  let token = process.env.GITHUB_TOKEN;
  if (!token) {
    const result = spawnSync('git', ['credential', 'fill'], { input: 'protocol=https\nhost=github.com\n\n', encoding: 'utf8', windowsHide: true, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } });
    token = result.stdout.split('\n').find(line => line.startsWith('password='))?.slice(9);
  }
  if (!token) throw Error('Credencial GitHub indisponível.');
  const headers = { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'User-Agent': 'RPG-Master-release' };
  async function api(endpoint, options = {}) {
    const response = await fetch('https://api.github.com/repos/' + repository + endpoint, { ...options, headers: { ...headers, 'Content-Type': 'application/json' } });
    if (!response.ok) throw Error('GitHub HTTP ' + response.status + ' em ' + endpoint);
    return response.json();
  }
  const notes = 'Instaladores Windows x64, macOS Intel e Apple Silicon da mesma base.\n\n' +
    'Atualizações verificadas com assinatura Ed25519 são baixadas em segundo plano e aplicadas na próxima abertura. ' +
    'Configurações > Atualizações permite verificar e reiniciar. Campanhas permanecem locais.\n\n' +
    'No Mac, arraste RPG Master para Aplicativos. A assinatura ad-hoc pode exigir autorização da primeira abertura em Privacidade e Segurança.\n\n' +
    'Guia: https://github.com/' + repository + '/blob/' + tag + '/docs/INSTALACAO_E_ATUALIZACOES.md';
  const existing = await fetch('https://api.github.com/repos/' + repository + '/releases/tags/' + tag, { headers });
  let release;
  if (existing.status === 404) release = await api('/releases', { method: 'POST', body: JSON.stringify({ tag_name: tag, target_commitish: revision, name: 'RPG Master V2 · ' + version + ' · Instalação e atualizações', body: notes, draft: true }) });
  else if (existing.ok) release = await existing.json();
  else throw Error('Não foi possível consultar a publicação.');
  if (!release.draft) throw Error('Esta versão já foi publicada. Crie uma nova versão para alterações.');
  for (const name of names) {
    const file = path.join(directory, name);
    const prior = release.assets.find(asset => asset.name === name);
    if (prior) {
      const response = await fetch('https://api.github.com/repos/' + repository + '/releases/assets/' + prior.id, { method: 'DELETE', headers });
      if (!response.ok) throw Error('Não foi possível substituir o arquivo do rascunho.');
    }
    const response = await fetch(release.upload_url.replace(/\{.*$/, '') + '?name=' + encodeURIComponent(name), {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/octet-stream', 'Content-Length': String(fs.statSync(file).size) },
      body: Readable.toWeb(fs.createReadStream(file)), duplex: 'half', signal: AbortSignal.timeout(30 * 60000)
    });
    if (!response.ok) throw Error('Falha no envio de ' + name + ': HTTP ' + response.status);
    console.log('UPLOADED', name);
  }
  const assets = await api('/releases/' + release.id + '/assets');
  if (!names.every(name => assets.some(asset => asset.name === name))) throw Error('Publicação incompleta. Rascunho preservado.');
  if (stageOnly) { console.log('SIGNED_UPDATE_STAGED', tag); return; }
  await api('/releases/' + release.id, { method: 'PATCH', body: JSON.stringify({ draft: false, make_latest: 'true' }) });
  console.log('PUBLISHED', release.html_url);
}
publish().catch(error => { console.error(error.message); process.exitCode = 1; });
