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
        EXEC sp_rename 'Envios.Dni_Cliente', 'DocumentodeIdentidad', 'COLUMN';
    `);
}).then(() => {
    console.log('Envios altered successfully');
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
