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
            -- Insert Empleado Prueba
            INSERT INTO Empleados (Usuario_Id, DocumentodeIdentidad, Nombre, Email, Telefono, Cargo, FechaIngreso, Activo)
            VALUES (3, '001-3456789-0', 'Empleado Prueba', 'empleado.prueba@gmail.com', '+18090000004', 'Asesor de Envíos', GETDATE(), 1);

            -- Insert Empleado Demo
            INSERT INTO Empleados (Usuario_Id, DocumentodeIdentidad, Nombre, Email, Telefono, Cargo, FechaIngreso, Activo)
            VALUES (7, '001-7890123-4', 'Empleado Demo', 'empleado.demo@gmail.com', '+18090000004', 'Coordinador de Logística', GETDATE(), 1);

            -- Crear un usuario nuevo para tener más variedad
            INSERT INTO Usuarios (Nombre, Email, Password, Rol_Id, Phone, DocumentodeIdentidad)
            VALUES ('María Fernández', 'maria.empleada@jamienvios.com', '123456', 4, '+18290001111', '001-9988776-5');
        `);

        await sql.query(`
            DECLARE @NewUserId INT;
            SELECT @NewUserId = Id FROM Usuarios WHERE Email = 'maria.empleada@jamienvios.com';

            INSERT INTO Empleados (Usuario_Id, DocumentodeIdentidad, Nombre, Email, Telefono, Cargo, FechaIngreso, Activo)
            VALUES (@NewUserId, '001-9988776-5', 'María Fernández', 'maria.empleada@jamienvios.com', '+18290001111', 'Atención al Cliente', GETDATE(), 1);
        `);
        console.log('Datos insertados exitosamente');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
});
