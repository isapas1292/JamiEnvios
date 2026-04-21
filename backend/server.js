const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

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
        await request.query(`
            INSERT INTO Usuarios (Nombre, Email, Password, Rol_Id) 
            VALUES ('${nombre}', '${email}', '${password}', ${rol_id || 'NULL'})
        `);
        
        res.json({ mensaje: "Usuario agregado correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => {
    console.log("Servidor en http://localhost:3000");
});