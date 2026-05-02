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
        const { nombre, email, password, rol_id } = req.body;
        
        if (!nombre || !email || !password) {
            return res.status(400).json({ error: "Nombre, email y password son requeridos" });
        }

        const request = new sql.Request();
        // Asignar rol_id = 2 (usuario normal) por defecto si no se proporciona
        const finalRolId = rol_id || 2;
        
        await request.query(`
            INSERT INTO Usuarios (Nombre, Email, Password, Rol_Id) 
            VALUES ('${nombre}', '${email}', '${password}', ${finalRolId})
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

app.listen(3000, () => {
    console.log("Servidor en http://localhost:3000");
});