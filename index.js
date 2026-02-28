import { connect, runSqlFile, close, resetDatabase } from './database.js';

// Фикс кодировки
if (process.platform === 'win32') {
  process.stdout.setDefaultEncoding('utf8');
  try {
    require('child_process').execSync('chcp 65001', { stdio: 'ignore' });
  } catch (e) {}
}

async function main() {
  console.log('\n[SQLite Data Cleanup Tool]');
  console.log('='.repeat(50));

  resetDatabase();
  connect();

  await runSqlFile(
    'remove_duplicates.sql',
    'Удаление дубликатов'
  );

  console.log('\n' + '='.repeat(50));
  console.log('Все скрипты выполнены\n');

  close();
}

main().catch(console.error);
