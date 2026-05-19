const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// Configurar transporte de correo (Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'wesles0631@gmail.com',
        pass: 'bniw yscc druz latp' // Contraseña de aplicación de Gmail
    }
});

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

sql.connect(config)
    .then(() => console.log("Conectado a SQL Server"))
    .catch(err => console.log(err));

app.get('/usuarios', async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM Usuarios`;
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/usuarios', async (req, res) => {
    try {
        const { nombre, email, password, rol_id, telefono, cedula } = req.body;
        
        if (!nombre || !email || !password) {
            return res.status(400).json({ error: "Nombre, email y password son requeridos" });
        }

        const request = new sql.Request();
        // Asignar rol_id = 1 (User) por defecto si no se proporciona
        const finalRolId = rol_id || 1;
        
        request.input('nombre', sql.VarChar, nombre);
        request.input('email', sql.VarChar, email);
        request.input('password', sql.VarChar, password);
        request.input('rol_id', sql.Int, finalRolId);
        request.input('phone', sql.VarChar, telefono || null);
        request.input('cedula', sql.VarChar, cedula || null);

        await request.query(`
            INSERT INTO Usuarios (Nombre, Email, Password, Rol_Id, Phone, DocumentodeIdentidad) 
            VALUES (@nombre, @email, @password, @rol_id, @phone, @cedula)
        `);
        
        res.json({ mensaje: "Usuario agregado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint de Login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: "Email y password son requeridos" });
        }

        const request = new sql.Request();
        const result = await request.query`
            SELECT * FROM Usuarios WHERE Email = ${email} AND Password = ${password}
        `;
        
        if (result.recordset.length === 0) {
            return res.status(401).json({ error: "Email o contraseña incorrectos" });
        }

        const usuario = result.recordset[0];
        res.json({ 
            mensaje: "Login exitoso",
            usuario: {
                id: usuario.Id,
                nombre: usuario.Nombre,
                email: usuario.Email,
                rol_id: usuario.Rol_Id
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/enviar-contacto', async (req, res) => {
    try {
        const { name, email, phone, service, message } = req.body;
        
        if (!name || !email || !service || !message) {
            return res.status(400).json({ error: "Nombre, email, servicio y mensaje son requeridos" });
        }

        // Correo para el usuario
        const mailToUser = {
            from: 'wesles0631@gmail.com',
            to: email,
            subject: 'Hemos recibido tu solicitud - Grupo JAMI Envíos',
            html: `
                <h2>¡Gracias por tu solicitud!</h2>
                <p>Hola ${name},</p>
                <p>Hemos recibido tu solicitud correctamente. Nuestro equipo se pondrá en contacto contigo pronto.</p>
                <hr/>
                <p><strong>Detalles de tu solicitud:</strong></p>
                <ul>
                    <li><strong>Nombre:</strong> ${name}</li>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Teléfono:</strong> ${phone || 'No proporcionado'}</li>
                    <li><strong>Servicio:</strong> ${service}</li>
                    <li><strong>Mensaje:</strong> ${message}</li>
                </ul>
                <hr/>
                <p>Puedes comunicarte directamente con nosotros:</p>
                <p>Teléfono: +34 695 820 526, +34 935 807 066</p>
                <p>Correo: Jami870@gmail.com</p>
                <p>Ubicación: Carrer Tamarit 136, Ripollet, Barcelona</p>
            `
        };

        // Correo para el admin
        const mailToAdmin = {
            from: 'wesles0631@gmail.com',
            to: 'wesles0631@gmail.com',
            subject: 'Nueva solicitud de contacto - ' + name,
            html: `
                <h2>Nueva solicitud de contacto</h2>
                <p><strong>Nombre:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Teléfono:</strong> ${phone || 'No proporcionado'}</p>
                <p><strong>Servicio de interés:</strong> ${service}</p>
                <p><strong>Mensaje:</strong></p>
                <p>${message}</p>
            `
        };

        // Enviar ambos correos
        await transporter.sendMail(mailToUser);
        await transporter.sendMail(mailToAdmin);

        res.json({ mensaje: "Solicitud enviada correctamente" });
    } catch (err) {
        console.error("Error al enviar correo:", err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/usuarios', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 100;
        let query = `SELECT TOP ${limit} * FROM Usuarios WHERE 1=1`;
        
        const request = new sql.Request();

        if (req.query.nombre) {
            query += ` AND Nombre LIKE @nombre`;
            request.input('nombre', sql.VarChar, `%${req.query.nombre}%`);
        }
        
        if (req.query.email) {
            query += ` AND Email LIKE @email`;
            request.input('email', sql.VarChar, `%${req.query.email}%`);
        }

        if (req.query.documento) {
            query += ` AND DocumentodeIdentidad LIKE @documento`;
            request.input('documento', sql.VarChar, `%${req.query.documento}%`);
        }
        
        query += ` ORDER BY Id DESC`;

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/envios', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 100;
        let query = `
            SELECT e.*, ee.Nombre as Estado_Nombre, ee.Activo 
            FROM Envios e
            LEFT JOIN EstadosEnvio ee ON e.Estado_Envio_Id = ee.Id
            WHERE 1=1
        `;
        
        const request = new sql.Request();

        if (req.query.cliente) {
            query += ` AND e.Nombre_Cliente LIKE @cliente`;
            request.input('cliente', sql.VarChar, `%${req.query.cliente}%`);
        }
        
        if (req.query.estado) {
            if (req.query.estado === 'Activos') {
                query += ` AND ee.Activo = 1`;
            } else {
                query += ` AND e.Estado_Envio_Id = @estadoId`;
                request.input('estadoId', sql.Int, parseInt(req.query.estado));
            }
        }

        if (req.query.guia) {
            query += ` AND e.Numero_Guia LIKE @guia`;
            request.input('guia', sql.VarChar, `%${req.query.guia}%`);
        }

        if (req.query.recibe) {
            query += ` AND e.Nombre_Recibe LIKE @recibe`;
            request.input('recibe', sql.VarChar, `%${req.query.recibe}%`);
        }

        if (req.query.destino) {
            query += ` AND e.Destino LIKE @destino`;
            request.input('destino', sql.VarChar, `%${req.query.destino}%`);
        }

        if (req.query.direccion) {
            query += ` AND e.Direccion LIKE @direccion`;
            request.input('direccion', sql.VarChar, `%${req.query.direccion}%`);
        }

        if (req.query.fechaInicio) {
            query += ` AND e.Fecha_Recepcion >= @fechaInicio`;
            request.input('fechaInicio', sql.Date, req.query.fechaInicio);
        }

        if (req.query.fechaFin) {
            query += ` AND e.Fecha_Recepcion <= @fechaFin`;
            request.input('fechaFin', sql.Date, req.query.fechaFin);
        }

        if (req.query.usuarioId) {
            query += ` AND e.Usuario_Id = @usuarioId`;
            request.input('usuarioId', sql.Int, req.query.usuarioId);
        }

        query += ` ORDER BY e.Id DESC`;

        // Apply TOP logic if needed manually, or modify the SELECT. We'll stick to a simple execute.
        // It's safe since there aren't thousands of records in this sample.
        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/envios/tracking/:numero_guia', async (req, res) => {
    try {
        const { numero_guia } = req.params;
        const request = new sql.Request();
        request.input('numero_guia', sql.VarChar, numero_guia);
        const result = await request.query(`
            SELECT TOP 1 e.*, ee.Nombre as Estado_Nombre 
            FROM Envios e
            LEFT JOIN EstadosEnvio ee ON e.Estado_Envio_Id = ee.Id
            WHERE e.Numero_Guia LIKE '%' + @numero_guia + '%'
            ORDER BY e.Id DESC
        `);
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "Envío no encontrado" });
        }
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/envios/:id/estado', async (req, res) => {
    try {
        const { id } = req.params;
        const { estado_id } = req.body;

        if (!estado_id) {
            return res.status(400).json({ error: "El estado_id es requerido" });
        }

        const request = new sql.Request();
        const result = await request.query(`
            UPDATE Envios 
            SET Estado_Envio_Id = ${estado_id} 
            WHERE Id = ${id}
        `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Envío no encontrado" });
        }

        res.json({ mensaje: "Estado actualizado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admin/envios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { Numero_Guia, Nombre_Cliente, Dni_Cliente, Telefono_Cliente, Estado_Envio_Id, Destino, Observaciones, Nombre_Recibe, Cedula_Recibe, Telefono_Recibe } = req.body;

        const request = new sql.Request();
        // 2. Usamos parámetros (.input) por seguridad y para manejar Nulllos
        request.input('id', sql.Int, id);
        request.input('guia', sql.VarChar, Numero_Guia);
        request.input('cliente', sql.VarChar, Nombre_Cliente);
        request.input('dni', sql.VarChar, Dni_Cliente || null);
        request.input('telefono', sql.VarChar, Telefono_Cliente || null);
        request.input('estadoId', sql.Int, Estado_Envio_Id);
        request.input('destino', sql.VarChar, Destino);
        request.input('obs', sql.VarChar, Observaciones || '');
        request.input('recibe', sql.VarChar, Nombre_Recibe || null);
        request.input('cedula', sql.VarChar, Cedula_Recibe || null);
        request.input('telefonoRecibe', sql.VarChar, Telefono_Recibe || null);
        const result = await request.query(`
            UPDATE Envios 
            SET Numero_Guia = @guia, 
                Nombre_Cliente = @cliente, 
                Dni_Cliente = @dni,
                Telefono_Cliente = @telefono,
                Estado_Envio_Id = @estadoId, 
                Destino = @destino, 
                Observaciones = @obs,
                Nombre_Recibe = @recibe,
                Cedula_Recibe = @cedula,
                Telefono_Recibe = @telefonoRecibe

            WHERE Id = @id
        `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Envío no encontrado" });
        }

        res.json({ mensaje: "Envío actualizado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/empleados', async (req, res) => {
    try {
        let query = `SELECT * FROM Empleados WHERE 1=1`;
        const request = new sql.Request();

        if (req.query.documento) {
            query += ` AND DocumentodeIdentidad LIKE @documento`;
            request.input('documento', sql.VarChar, `%${req.query.documento}%`);
        }

        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/empleados', async (req, res) => {
    try {
        const { Usuario_Id, DocumentodeIdentidad, Nombre, Email, Telefono, Cargo } = req.body;
        const request = new sql.Request();
        
        request.input('usuario_id', sql.Int, Usuario_Id || null);
        request.input('doc', sql.VarChar, DocumentodeIdentidad);
        request.input('nombre', sql.VarChar, Nombre);
        request.input('email', sql.VarChar, Email);
        request.input('telefono', sql.VarChar, Telefono || null);
        request.input('cargo', sql.VarChar, Cargo || null);

        await request.query(`
            INSERT INTO Empleados (Usuario_Id, DocumentodeIdentidad, Nombre, Email, Telefono, Cargo) 
            VALUES (@usuario_id, @doc, @nombre, @email, @telefono, @cargo)
        `);
        res.json({ mensaje: "Empleado agregado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/envios', async (req, res) => {
    try {
        const {
            Numero_Guia, Nombre_Cliente, DocumentodeIdentidad, Telefono_Cliente,
            Destino, Observaciones, Nombre_Recibe, Cedula_Recibe,
            Telefono_Recibe
        } = req.body;

        let clienteUsuarioId = null;

        // Verify if user exists with DocumentodeIdentidad and Nombre
        if (DocumentodeIdentidad && Nombre_Cliente) {
            const checkUserRequest = new sql.Request();
            checkUserRequest.input('doc', sql.VarChar, DocumentodeIdentidad);
            checkUserRequest.input('nombre', sql.VarChar, Nombre_Cliente);
            const userRes = await checkUserRequest.query(`
                SELECT Id FROM Usuarios WHERE DocumentodeIdentidad = @doc AND Nombre = @nombre
            `);
            if (userRes.recordset.length > 0) {
                clienteUsuarioId = userRes.recordset[0].Id;
            }
        }

        const request = new sql.Request();
        request.input('guia', sql.VarChar, Numero_Guia);
        request.input('cliente', sql.VarChar, Nombre_Cliente);
        request.input('doc', sql.VarChar, DocumentodeIdentidad || null);
        request.input('telefono', sql.VarChar, Telefono_Cliente || null);
        request.input('destino', sql.VarChar, Destino);
        request.input('obs', sql.VarChar, Observaciones || '');
        request.input('recibe', sql.VarChar, Nombre_Recibe || null);
        request.input('cedula', sql.VarChar, Cedula_Recibe || null);
        request.input('telefonoRecibe', sql.VarChar, Telefono_Recibe || null);
        request.input('usuarioId', sql.Int, clienteUsuarioId); 

        await request.query(`
            INSERT INTO Envios 
            (Numero_Guia, Nombre_Cliente, DocumentodeIdentidad, Telefono_Cliente, Destino, Observaciones, Nombre_Recibe, Cedula_Recibe, Telefono_Recibe, Usuario_Id, Fecha_Recepcion, Estado_Envio_Id) 
            VALUES 
            (@guia, @cliente, @doc, @telefono, @destino, @obs, @recibe, @cedula, @telefonoRecibe, @usuarioId, GETDATE(), 1)
        `);
        res.json({ mensaje: "Envío creado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/facturas', async (req, res) => {
    try {
        const {
            Nombre_Cliente, DocumentodeIdentidad, Breve_Descripcion,
            Fecha, Vencimiento, Fecha_Pago, Estatus, Cerrado, Cobrar_IVA,
            Firma_Cliente, Cantidad, Importe_IVA, Cantidad_Total,
            Cantidad_Pagar, Pagos, Importe_Pendiente, Detalles
        } = req.body;

        let clienteUsuarioId = null;

        if (DocumentodeIdentidad && Nombre_Cliente) {
            const checkUserRequest = new sql.Request();
            checkUserRequest.input('doc', sql.VarChar, DocumentodeIdentidad);
            checkUserRequest.input('nombre', sql.VarChar, Nombre_Cliente);
            const userRes = await checkUserRequest.query(`
                SELECT Id FROM Usuarios WHERE DocumentodeIdentidad = @doc AND Nombre = @nombre
            `);
            if (userRes.recordset.length > 0) {
                clienteUsuarioId = userRes.recordset[0].Id;
            }
        }

        const request = new sql.Request();
        
        request.input('nombre', sql.VarChar, Nombre_Cliente);
        request.input('doc', sql.VarChar, DocumentodeIdentidad || null);
        request.input('desc', sql.VarChar, Breve_Descripcion || null);
        request.input('fecha', sql.Date, Fecha || null);
        request.input('vencimiento', sql.Date, Vencimiento || null);
        request.input('fechaPago', sql.Date, Fecha_Pago || null);
        request.input('estatus', sql.VarChar, Estatus || 'No pagado');
        request.input('cerrado', sql.Bit, Cerrado ? 1 : 0);
        request.input('cobrarIva', sql.Bit, Cobrar_IVA ? 1 : 0);
        request.input('firma', sql.VarChar, Firma_Cliente || null);
        request.input('cantidad', sql.Decimal(18,2), Cantidad || 0);
        request.input('importeIva', sql.Decimal(18,2), Importe_IVA || 0);
        request.input('cantidadTotal', sql.Decimal(18,2), Cantidad_Total || 0);
        request.input('cantidadPagar', sql.Decimal(18,2), Cantidad_Pagar || 0);
        request.input('pagos', sql.Decimal(18,2), Pagos || 0);
        request.input('pendiente', sql.Decimal(18,2), Importe_Pendiente || 0);
        request.input('usuarioId', sql.Int, clienteUsuarioId);

        const result = await request.query(`
            INSERT INTO Facturas 
            (Nombre_Cliente, DocumentodeIdentidad, Breve_Descripcion, Fecha, Vencimiento, Fecha_Pago, Estatus, Cerrado, Cobrar_IVA, Firma_Cliente, Cantidad, Importe_IVA, Cantidad_Total, Cantidad_Pagar, Pagos, Importe_Pendiente, Usuario_Id)
            OUTPUT INSERTED.Id
            VALUES 
            (@nombre, @doc, @desc, @fecha, @vencimiento, @fechaPago, @estatus, @cerrado, @cobrarIva, @firma, @cantidad, @importeIva, @cantidadTotal, @cantidadPagar, @pagos, @pendiente, @usuarioId)
        `);
        
        const facturaId = result.recordset[0].Id;
        
        if (Detalles && Detalles.length > 0) {
            for (let det of Detalles) {
                const detReq = new sql.Request();
                detReq.input('facturaId', sql.Int, facturaId);
                detReq.input('articulo', sql.VarChar, det.Articulo);
                detReq.input('cantidad', sql.Int, det.Cantidad || 1);
                detReq.input('unidad', sql.VarChar, det.Unidad_Venta || '');
                detReq.input('precio', sql.Decimal(18,2), det.Precio || 0);
                detReq.input('descuento', sql.Decimal(18,2), det.Descuento_Porcentaje || 0);
                detReq.input('iva', sql.Decimal(18,2), det.Importe_IVA || 0);
                detReq.input('total', sql.Decimal(18,2), det.Cantidad_Total || 0);
                
                await detReq.query(`
                    INSERT INTO FacturaDetalles 
                    (Factura_Id, Articulo, Cantidad, Unidad_Venta, Precio, Descuento_Porcentaje, Importe_IVA, Cantidad_Total)
                    VALUES
                    (@facturaId, @articulo, @cantidad, @unidad, @precio, @descuento, @iva, @total)
                `);
            }
        }

        res.json({ mensaje: "Factura creada correctamente", Id: facturaId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/facturas', async (req, res) => {
    try {
        let query = `SELECT * FROM Facturas WHERE 1=1`;
        const request = new sql.Request();

        if (req.query.cliente) {
            query += ` AND Nombre_Cliente LIKE @cliente`;
            request.input('cliente', sql.VarChar, '%' + req.query.cliente + '%');
        }
        if (req.query.numero) {
            query += ` AND Numero_Factura LIKE @numero`;
            request.input('numero', sql.VarChar, '%' + req.query.numero + '%');
        }
        if (req.query.fechaInicio) {
            query += ` AND Fecha >= @fechaInicio`;
            request.input('fechaInicio', sql.Date, req.query.fechaInicio);
        }
        if (req.query.fechaFin) {
            query += ` AND Fecha <= @fechaFin`;
            request.input('fechaFin', sql.Date, req.query.fechaFin);
        }
        
        query += ` ORDER BY Id DESC`;
        
        const result = await request.query(query);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => {
    console.log("Servidor en http://localhost:3000");
});