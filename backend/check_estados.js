const sql = require('mssql');

const config = {
    user: 'jami_user',
    password: '6013',
    server: 'localhost',
    database: 'JamiEnvios',
    options: { encrypt: false, trustServerCertificate: true }
};

sql.connect(config).then(async () => {
    try {
        const res = await sql.query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='EstadosEnvio' and xtype='U')
            BEGIN
                CREATE TABLE EstadosEnvio (
                    Id INT PRIMARY KEY,
                    Nombre VARCHAR(50),
                    Activo BIT DEFAULT 1
                );
                INSERT INTO EstadosEnvio (Id, Nombre, Activo) VALUES 
                (1, 'Pendiente', 1),
                (2, 'En Tránsito', 1),
                (3, 'En Aduana', 1),
                (4, 'En Reparto', 1),
                (5, 'Entregado', 0),
                (6, 'Cancelado', 0);
            END
        `);
        console.log("EstadosEnvio check done");
        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
});
