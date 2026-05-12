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
        IF EXISTS (SELECT * FROM sysobjects WHERE name='Empleados' and xtype='U')
            DROP TABLE Empleados;

        CREATE TABLE Empleados (
            Id INT IDENTITY(1,1) PRIMARY KEY,
            Usuario_Id INT FOREIGN KEY REFERENCES Usuarios(Id),
            DocumentodeIdentidad VARCHAR(50) NOT NULL,
            Nombre VARCHAR(100) NOT NULL,
            Email VARCHAR(100) NOT NULL,
            Telefono VARCHAR(50),
            Cargo VARCHAR(50),
            FechaIngreso DATE DEFAULT GETDATE(),
            Activo BIT DEFAULT 1
        );
    `);
}).then(() => {
    console.log('Table Empleados modified successfully');
    process.exit(0);
}).catch(err => {
    console.error('Error modifying table:', err);
    process.exit(1);
});
