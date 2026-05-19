const sql = require('mssql');
const fs = require('fs');

const config = {
    user: 'jami_user',
    password: '6013',
    server: 'localhost',
    database: 'JamiEnvios',
    options: { encrypt: false, trustServerCertificate: true }
};

sql.connect(config).then(() => {
    return sql.query(`
        SELECT 
            t.name as TableName,
            c.name as ColumnName,
            ty.name as DataType,
            c.max_length,
            c.is_nullable,
            c.is_identity,
            kc.name as PrimaryKey
        FROM sys.tables t 
        INNER JOIN sys.columns c ON t.object_id = c.object_id 
        INNER JOIN sys.types ty ON c.user_type_id = ty.user_type_id 
        LEFT JOIN sys.index_columns ic ON ic.object_id = c.object_id AND ic.column_id = c.column_id
        LEFT JOIN sys.indexes i ON i.object_id = ic.object_id AND i.index_id = ic.index_id AND i.is_primary_key = 1
        LEFT JOIN sys.key_constraints kc ON kc.parent_object_id = t.object_id AND kc.unique_index_id = i.index_id
        ORDER BY t.name, c.column_id
    `);
}).then(res => {
    const schema = res.recordset;
    const tables = {};
    schema.forEach(col => {
        if (!tables[col.TableName]) tables[col.TableName] = [];
        tables[col.TableName].push(col);
    });

    let sqlOutput = '';
    for (const tableName in tables) {
        sqlOutput += `CREATE TABLE [${tableName}] (\n`;
        const cols = tables[tableName];
        const colDefs = [];
        for (const col of cols) {
            let def = `    [${col.ColumnName}] ${col.DataType.toUpperCase()}`;
            if (col.DataType === 'varchar') {
                def += `(${col.max_length === -1 ? 'MAX' : col.max_length})`;
            } else if (col.DataType === 'decimal') {
                def += `(18, 2)`;
            }
            if (col.is_identity) def += ' IDENTITY(1,1)';
            if (col.PrimaryKey) def += ' PRIMARY KEY';
            if (!col.is_nullable && !col.PrimaryKey) def += ' NOT NULL';
            
            colDefs.push(def);
        }
        sqlOutput += colDefs.join(',\n') + '\n);\nGO\n\n';
    }

    fs.writeFileSync('schema.sql', sqlOutput);
    console.log('Schema written to schema.sql');
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
