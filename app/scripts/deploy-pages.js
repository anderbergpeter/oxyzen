// Bygger webbversionen och pushar dist/ till grenen gh-pages med vanlig git.
// (npm-paketet gh-pages hoppar över allt som heter node_modules, vilket
// Expo använder som sökväg för typsnitt, så vi gör det själva.)
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = path.resolve(__dirname, '..');
const dist = path.join(app, 'dist');
const run = (cmd, cwd = app) => execSync(cmd, { cwd, stdio: 'inherit' });
const out = (cmd, cwd = app) => execSync(cmd, { cwd, encoding: 'utf8' }).trim();

// Standard: demo utan backend (allt lokalt i telefonen). Kör med
// --with-backend för att ta med nycklarna från .env.
const envFile = path.join(app, '.env');
const envBackup = path.join(app, '.env.deploy-bak');
const demo = !process.argv.includes('--with-backend');
if (demo && fs.existsSync(envFile)) {
  // Expo läser .env även om variablerna sätts tomma, så vi flyttar undan filen.
  fs.renameSync(envFile, envBackup);
  console.log('Bygger demo utan backend (lägg till --with-backend för Supabase).');
}
try {
  run('npx expo export --platform web --clear');
} finally {
  if (fs.existsSync(envBackup)) fs.renameSync(envBackup, envFile);
}
fs.copyFileSync(path.join(dist, 'index.html'), path.join(dist, '404.html'));
fs.writeFileSync(path.join(dist, '.nojekyll'), '');

const remote = out('git config --get remote.origin.url');
fs.rmSync(path.join(dist, '.git'), { recursive: true, force: true });
run('git init -q -b gh-pages', dist);
run('git add -A', dist);
run('git -c user.name=deploy -c user.email=deploy@oxyzen.local commit -q -m "Publicera PWA"', dist);
run(`git push -f "${remote}" gh-pages:gh-pages`, dist);
fs.rmSync(path.join(dist, '.git'), { recursive: true, force: true });
console.log('Publicerat till gh-pages.');
