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
        IF EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'Numero_Factura' AND Object_ID = Object_ID(N'Facturas'))
        BEGIN
            ALTER TABLE Facturas DROP COLUMN Numero_Factura;
        END
        
        ALTER TABLE Facturas ADD Numero_Factura AS CAST(Id + 100000 AS VARCHAR(50));
    `);
}).then(() => {
    console.log('Facturas altered successfully');
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
