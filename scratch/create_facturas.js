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
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Facturas' and xtype='U')
        CREATE TABLE Facturas (
            Id INT IDENTITY(1,1) PRIMARY KEY,
            Numero_Factura VARCHAR(50) NOT NULL,
            Nombre_Cliente VARCHAR(100),
            Dni_Cliente VARCHAR(50),
            Breve_Descripcion VARCHAR(255),
            Fecha DATE,
            Vencimiento DATE,
            Fecha_Pago DATE,
            Estatus VARCHAR(50),
            Cerrado BIT,
            Cobrar_IVA BIT,
            Firma_Cliente VARCHAR(MAX),
            Cantidad DECIMAL(18,2),
            Importe_IVA DECIMAL(18,2),
            Cantidad_Total DECIMAL(18,2),
            Cantidad_Pagar DECIMAL(18,2),
            Pagos DECIMAL(18,2),
            Importe_Pendiente DECIMAL(18,2)
        );

        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='FacturaDetalles' and xtype='U')
        CREATE TABLE FacturaDetalles (
            Id INT IDENTITY(1,1) PRIMARY KEY,
            Factura_Id INT,
            Articulo VARCHAR(100),
            Cantidad INT,
            Unidad_Venta VARCHAR(50),
            Precio DECIMAL(18,2),
            Descuento_Porcentaje DECIMAL(18,2),
            Importe_IVA DECIMAL(18,2),
            Cantidad_Total DECIMAL(18,2)
        );
    `);
}).then(() => {
    console.log('Tables Facturas and FacturaDetalles created');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
