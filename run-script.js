import { connect, runSqlFile, close, resetDatabase } from '../database.js';

// Фикс кодировки
if (process.platform === 'win32') {
  process.stdout.setDefaultEncoding('utf8');
  try {
    require('child_process').execSync('chcp 65001', { stdio: 'ignore' });
  } catch (e) {}
}

async function main() {
  console.log('\n[Remove Duplicates]');
  console.log('='.repeat(50));
  console.log('  SQLite Edition\n');

  resetDatabase();
  connect();

  const result = await runSqlFile(
    'remove_duplicates.sql',
    '[SQL] Скрипт удаления дубликатов'
  );

  console.log('\n' + '='.repeat(50));
  if (result.success) {
    console.log('[OK] Скрипт выполнен успешно!');
    console.log(`  Время выполнения: ${result.duration}ms`);
  } else {
    console.log('[ERROR] Ошибка выполнения скрипта');
  }
  console.log();

  close();
}

main().catch(console.error);
