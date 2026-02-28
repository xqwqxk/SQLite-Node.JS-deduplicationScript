import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.resolve(__dirname, 'cleanup.db');

let db = null;

export function connect() {
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  console.log('Подключено к SQLite');
  console.log(`БД: ${DB_PATH}`);
  return db;
}

export function runSqlFile(filePath, description = '') {
  console.log(`\n${description || filePath}`);
  console.log('='.repeat(50));

  const fullPath = path.resolve(__dirname, filePath);
  const sql = fs.readFileSync(fullPath, 'utf-8');

  try {
    const startTime = Date.now();
    let deletes = 0;
    let inserts = 0;
    const allResults = [];

    const queries = sql
      .split(';')
      .map(q => q.trim())
      .filter(q => {
        if (!q) return false;
        const lines = q.split('\n').filter(line => !line.trim().startsWith('--'));
        return lines.join('\n').trim().length > 0;
      });

    for (const query of queries) {
      const cleanQuery = query
        .split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')
        .trim();
      
      if (!cleanQuery) continue;

      try {
        const upperQuery = cleanQuery.toUpperCase();
        
        let isReader = false;
        let firstWord = cleanQuery.split(/\s+/)[0].toUpperCase();
        let isDelete = false;
        
        if (firstWord === 'SELECT') {
          isReader = true;
        } else if (firstWord === 'WITH') {
          const asIndex = upperQuery.indexOf('AS');
          if (asIndex > 0) {
            const openParen = upperQuery.indexOf('(', asIndex);
            if (openParen > 0) {
              let depth = 1;
              let pos = openParen + 1;
              while (pos < upperQuery.length && depth > 0) {
                if (upperQuery[pos] === '(') depth++;
                else if (upperQuery[pos] === ')') depth--;
                pos++;
              }
              const mainQuery = upperQuery.substring(pos);
              const mainFirstWord = mainQuery.trim().split(/\s+/)[0];
              isReader = mainFirstWord === 'SELECT';
              isDelete = mainFirstWord === 'DELETE';
            }
          }
        }
        
        const stmt = db.prepare(cleanQuery);
        
        if (isReader) {
          const rows = stmt.all();
          if (rows && rows.length > 0) {
            const stage = rows[0][Object.keys(rows[0])[0]];
            allResults.push({ stage, rows });
          }
        } else {
          const result = stmt.run();
          if (result.changes > 0) {
            if (firstWord === 'DELETE') {
              deletes += result.changes;
              console.log(`  Удалено дубликатов: ${result.changes}`);
            } else if (firstWord === 'WITH' && isDelete) {
              deletes += result.changes;
              console.log(`  Удалено дубликатов (CTE): ${result.changes}`);
            } else if (firstWord === 'INSERT') {
              inserts += result.changes;
              console.log(`  Добавлено записей: ${result.changes}`);
            } else if (firstWord === 'UPDATE') {
              console.log(`  Обновлено записей: ${result.changes}`);
            } else if (firstWord === 'DROP' || firstWord === 'CREATE') {
            }
          }
        }
      } catch (err) {
        if (!err.message.includes('no such table')) {
          console.log(`  ${err.message.substring(0, 50)}...`);
        }
      }
    }

    const duration = Date.now() - startTime;
    console.log(`Выполнено за ${duration}ms`);
    console.log(`  Всего удалено дубликатов: ${deletes}`);

    if (allResults.length > 0) {
      console.log('\n  Результаты SELECT:');
      console.log('-'.repeat(50));
      
      allResults.forEach((result, idx) => {
        console.log(`\n  >> ${result.stage}`);
        result.rows.forEach(row => {
          const values = Object.values(row).map(v => String(v).padEnd(20)).join(' | ');
          console.log(`    ${values}`);
        });
      });
    }

    return { 
      success: true, 
      duration, 
      deletes,
      inserts,
      selectResults: allResults 
    };
  } catch (error) {
    console.log(`Ошибка: ${error.message}`);
    return { success: false, error: error.message };
  }
}

export function close() {
  if (db) {
    db.close();
    console.log('  БД закрыта');
  }
}

export function resetDatabase() {
  if (db) {
    db.close();
    db = null;
  }
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
  }
  const walPath = DB_PATH + '-wal';
  const shmPath = DB_PATH + '-shm';
  if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
  if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
}
