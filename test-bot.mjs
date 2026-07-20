import './telegram-bot.js';
console.log('Bot imported, waiting 10s...');
setTimeout(() => {
  console.log('Done waiting. Bot was:', typeof globalThis.__botRunning);
  process.exit(0);
}, 10000);
