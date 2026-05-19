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
        await sql.query(`
            IF OBJECT_ID('Envios', 'U') IS NOT NULL 
                DROP TABLE Envios;

            CREATE TABLE Envios (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                Numero_Guia VARCHAR(100),
                Nombre_Cliente VARCHAR(150),
                DocumentodeIdentidad VARCHAR(50),
                Dni_Cliente VARCHAR(50),
                Telefono_Cliente VARCHAR(50),
                Destino VARCHAR(255),
                Direccion VARCHAR(255),
                Observaciones VARCHAR(MAX),
                Nombre_Recibe VARCHAR(150),
                Cedula_Recibe VARCHAR(50),
                Telefono_Recibe VARCHAR(50),
                Usuario_Id INT,
                Fecha_Recepcion DATETIME,
                Estado_Envio_Id INT
            );
        `);
        console.log("Tabla Envios recreada exitosamente.");
        process.exit(0);
    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
});
