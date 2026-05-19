const sql = require('mssql');

const config = {
    user: 'jami_user',
    password: '6013',
    server: 'localhost',
    database: 'JamiEnvios',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

sql.connect(config).then(async () => {
    try {
        const result = await sql.query`SELECT COUNT(*) as count FROM Envios`;
        console.log(result.recordset[0].count);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
});
