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
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Empleados' and xtype='U')
        CREATE TABLE Empleados (
            Id INT IDENTITY(1,1) PRIMARY KEY,
            DocumentodeIdentidad VARCHAR(50) NOT NULL,
            Nombre VARCHAR(100) NOT NULL,
            Email VARCHAR(100) NOT NULL,
            Telefono VARCHAR(50),
            Cargo VARCHAR(50),
            FechaIngreso DATE DEFAULT GETDATE(),
            Activo BIT DEFAULT 1
        )
    `);
}).then(() => {
    console.log('Table Empleados created');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
