[🇷🇺 Read in Russian](README.md)
# SQLite Data Cleanup w/ Node.js wrapper

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3.25+-blue.svg)](https://www.sqlite.org/)

---

## Overview

This script demonstrates three different approaches to removing duplicate records from a SQLite database. Each method has its own advantages and suits different scenarios.
The project includes SQL scripts and a Node.js wrapper for easy execution and CI/CD integration.

---

## Deduplication Methods

| Method | Technology |
|--------|------------|
| **Method 1** | `DELETE` + subquery with `MIN(id)` |
| **Method 2** | Window functions `ROW_NUMBER()` |
| **Method 3** | CTE + `ROW_NUMBER()` |

---

## Project Structure

```
main/
├── run-script.js               # Deduplication runner script
├── remove_duplicates.sql       # Main SQL script
├── database.js
├── index.js                    # Entry point
├── package.json
├── package-lock.json
├── .gitignore
└── cleanup.db                  # SQLite database (created at runtime)
```

---

## Installation & Usage

### 1. Install dependencies

```bash
cd sql_cleanup
npm install
```

### 2. Run

```bash
# Main script
npm start

# Or duplicates only
npm run duplicates
```

### 3. Run without npm (Windows PowerShell)

```powershell
node index.js
```

---

## Notes

- All methods preserve the record with the **minimum ID**
- Script includes test data for demonstration
- Database is deleted after execution (for clean test)

---
