const express = require("express");
const sequelize = require("./config/database");
const routes = require("./routes");
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

app.use("/api", routes);

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';  // Permitir acceso desde cualquier red

// Sincronizar modelos y luego iniciar el servidor
sequelize.
  sync({ alter: true })
  .then(() => {
    app.listen(PORT, HOST, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error al sincronizar la base de datos:", err);
  });

  // Definir una ruta para manejar solicitudes a "/"
app.get('/', (req, res) => {
  res.send('Bienvenido a la API'); 
});
