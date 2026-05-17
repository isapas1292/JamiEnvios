const sql = require('mssql');
const config = {
    user: 'jami_user',
    password: '6013',
    server: 'localhost',
    database: 'JamiEnvios',
    options: { encrypt: false, trustServerCertificate: true }
};
sql.connect(config).then(() => {
    return sql.query(`
        EXEC sp_rename 'Facturas.Dni_Cliente', 'DocumentodeIdentidad', 'COLUMN';
        
        IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'Usuario_Id' AND Object_ID = Object_ID(N'Facturas'))
        BEGIN
            ALTER TABLE Facturas ADD Usuario_Id INT NULL;
        END
    `);
}).then(() => {
    console.log('Facturas altered successfully');
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
