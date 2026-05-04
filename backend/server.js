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
        const { nombre, email, password, rol_id, telefono } = req.body;
        
        if (!nombre || !email || !password) {
            return res.status(400).json({ error: "Nombre, email y password son requeridos" });
        }

        const request = new sql.Request();
        // Asignar rol_id = 1 (User) por defecto si no se proporciona
        const finalRolId = rol_id || 1;
        
        await request.query(`
            INSERT INTO Usuarios (Nombre, Email, Password, Rol_Id, Phone) 
            VALUES ('${nombre}', '${email}', '${password}', ${finalRolId}, ${telefono ? `'${telefono}'` : 'NULL'})
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
        const { Numero_Guia, Nombre_Cliente, Estado_Envio_Id, Destino, Observaciones } = req.body;

        const request = new sql.Request();
        const result = await request.query(`
            UPDATE Envios 
            SET Numero_Guia = '${Numero_Guia}', 
                Nombre_Cliente = '${Nombre_Cliente}', 
                Estado_Envio_Id = ${Estado_Envio_Id}, 
                Destino = '${Destino}', 
                Observaciones = '${Observaciones}'
            WHERE Id = ${id}
        `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Envío no encontrado" });
        }

        res.json({ mensaje: "Envío actualizado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => {
    console.log("Servidor en http://localhost:3000");
});