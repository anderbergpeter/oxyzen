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

run('npx expo export --platform web');
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
