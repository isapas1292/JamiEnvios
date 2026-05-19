const fs = require('fs');
const schema = require('./schema.json');

const tables = {};
schema.forEach(col => {
    if (!tables[col.TableName]) tables[col.TableName] = [];
    tables[col.TableName].push(col);
});

let sql = '';
for (const tableName in tables) {
    sql += `CREATE TABLE [${tableName}] (\n`;
    const cols = tables[tableName];
    const colDefs = [];
    for (const col of cols) {
        let def = `    [${col.ColumnName}] ${col.DataType.toUpperCase()}`;
        if (col.DataType === 'varchar') {
            def += `(${col.max_length === -1 ? 'MAX' : col.max_length})`;
        } else if (col.DataType === 'decimal') {
            def += `(18, 2)`; // Defaulting to 18,2 for simplicity based on previous scripts
        }
        if (col.is_identity) def += ' IDENTITY(1,1)';
        if (col.PrimaryKey) def += ' PRIMARY KEY';
        if (!col.is_nullable && !col.PrimaryKey) def += ' NOT NULL';
        
        colDefs.push(def);
    }
    sql += colDefs.join(',\n') + '\n);\nGO\n\n';
}

fs.writeFileSync('schema.sql', sql);
console.log('Schema written to schema.sql');
