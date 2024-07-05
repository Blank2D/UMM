//Libreria de Express
const express = require('express');
//Libreria Path
const path = require('path');
//Libreria Mysql
const mysql = require('mysql');

const multer = require('multer');

const app = express();
const port = 3000;
const upload = multer({ dest: 'imagenes/' });

// Configurar la conexión a la base de datos
const connection = mysql.createConnection({
    host: '10.0.6.39',
    user: 'estudiante',
    password: 'Info-2023',
    database: 'HeladeriaCristobal'
});
//Verificacion de errores para validar si la conexion es correcta
connection.connect((err) => {
    if (err) {
        console.error('Error de conexión a la base de datos: ' + err.stack);
        return;
    }
    console.log('Conexión exitosa a la base de datos.');
});

//imagenes imagenees imagenes

// Middleware para parsear el cuerpo de la solicitud
app.use(express.urlencoded({ extended: true }));
// Servir archivos estáticos de la carpeta 'imagenes'
app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));

// Ruta para servir el formulario HTML
app.use(express.static(path.join(__dirname, 'pagina_principal')));

//imagenes imagenes imagenes


//Envio los datos del formulario por url
app.use(express.urlencoded({ extended: true }));
//Convierto en formato json
app.use(express.json());
//Configuro para que la aplicacon inicie desde el director o carpeta pagina principal
app.use(express.static(path.join(__dirname, 'pagina_principal')));
//Recibo los valores y los envio a la tabla
app.post('/guardar_helado', upload.single('imagen'),(req, res) => {
    const { nombre, descripcion, sabor, tipo, cobertura, precio } = req.body;
    const imagen = req.file.filename;
    const sql = 'INSERT INTO Helado (nombre, descripcion, sabor, tipo, cobertura, precio, imagen) VALUES (?, ?, ?, ?, ?, ?,?)';
    connection.query(sql, [nombre, descripcion, sabor, tipo, cobertura, precio, imagen], (err, result) => {
        if (err) {
            console.error('Error al enviar los datos de la base de datos: ' + err.stack);
            res.status(500).send('Error al enviar los datos de la base de datos.');
        return;
        }        
        console.log('Helado insertada correctamente.');
        res.redirect('/listardatos.html');
    });
});
//Ruta para mostrar las películas en el listardatos.html con metodo GET
app.get('/helados', (req, res) => {
    //Realiza una consulta SQL para seleccionar todas las filas de la tabla "peliculas"
    connection.query('SELECT * FROM Helado', (err, result) => {
        //Maneja los errores, si los hay
        if (err) {
            console.error('Error al obtener los datos de la base de datos: ' + err.stack);
            res.status(500).send('Error al obtener los datos de la base de datos.');
            return;
        }
        res.json(result); //Aquí puedes enviar la respuesta como quieras (por ejemplo, renderizar un HTML o enviar un JSON)
    });
});
// Ruta para obtener los datos de una película por su ID
app.get('/helado_especifico/:id', (req, res) => {
    // Extraer el ID de los parámetros de la solicitud
    const id = req.params.id;
    // Ejecutar una consulta SQL para obtener los datos de la película con el ID proporcionado
    connection.query('SELECT * FROM Helado WHERE id = ?', [id], (err, result) => {
        if (err) {
            // Manejar el error si ocurre durante la consulta
            console.error('Error al obtener los datos de la película:', err);
            res.status(500).send('Error interno del servidor');
            return;
        }
        // Verificar si no se encontró ninguna película con el ID proporcionado
        if (result.length === 0) {
            res.status(404).send('Película no encontrada');
            return;
        }
        // Enviar los datos de la película como respuesta en formato JSON
        res.json(result[0]);
    });
});

// Nueva ruta para eliminar un usuario
app.delete('/eliminar_usuario/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM Helado WHERE id = ?';
    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el helado:', err);
            res.status(500).send('Error al eliminar el helado');
        } else {
            res.status(200).send('Helado eliminado exitosamente');
        }
    });
});

// REGISTRO DE USUARIOS // REGISTRO DE USUARIOS // REGISTRO DE USUARIOS // REGISTRO DE USUARIOS

// Ruta para manejar el registro de usuario
app.post('/registrar_usuario', (req, res) => {
    const { correo, contraseña, rol } = req.body;

    const query = 'INSERT INTO Usuarios (correo, contraseña, rol) VALUES (?, ?, ?)';
    connection.query(query, [correo, contraseña, rol], (err, result) => {
        if (err) {
            console.error('Error al registrar el usuario:', err);
            res.send('Error al registrar el usuario');
        } else {
            console.log('Usuario registrado exitosamente:', result);
            res.send('Usuario registrado exitosamente');
            res.redirect('/index.html');
        }
    });
});

// Ruta para manejar el inicio de sesión
app.post('/iniciar_sesion', (req, res) => { // Define una ruta POST para '/iniciar_sesion'
    const { correo, contraseña } = req.body; // Extrae 'correo' y 'contraseña' del cuerpo de la solicitud

    // Define la consulta SQL para obtener el rol del usuario que coincida con el correo y la contraseña
    const query = 'SELECT rol FROM Usuarios WHERE correo = ? AND contraseña = ?';

    // Ejecuta la consulta SQL con los valores de 'correo' y 'contraseña'
    connection.query(query, [correo, contraseña], (err, results) => {
        if (err) { // Si hay un error en la consulta
            console.error('Error al iniciar sesión:', err); // Imprime el error en la consola
            res.send('Error al iniciar sesión'); // Envía una respuesta de error al cliente
        } else if (results.length > 0) { // Si la consulta devuelve al menos un resultado
            const rol = results[0].rol; // Obtiene el rol del usuario del primer resultado
            if (rol === 1) { // Si el rol es 1 (administrador)
                res.redirect('/listardatos.html'); // Redirige a la página del administrador
            } else if (rol === 2) { // Si el rol es 2 (usuario normal)
                res.redirect('/usuario.html'); // Redirige a la página del usuario
            }
        } else { // Si no se encuentra ningún usuario con las credenciales proporcionadas
            res.send('Correo o clave incorrectos'); // Envía una respuesta indicando que las credenciales son incorrectas
        }
    });
});

// REGISTRO DE USUARIOS // REGISTRO DE USUARIOS // REGISTRO DE USUARIOS // REGISTRO DE USUARIOS

//Servidor ejecutandose en el puerto 3000
app.listen(port, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});

