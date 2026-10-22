const { spawn } = require('child_process');
const path = require('path');

console.log('================================================================');
console.log('  Starting CyberHero Local Development Environment');
console.log('  Dhaanish Ahmed College of Engineering, Chennai');
console.log('  - Frontend: http://localhost:5173');
console.log('  - Backend:  http://localhost:5000');
console.log('================================================================\n');

const server = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true,
});

const client = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true,
});

const cleanup = () => {
  try {
    server.kill();
    client.kill();
  } catch (e) {}
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
