// models/producto.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Imagen = require("./imagen");

// Definir el modelo Producto
const Producto = sequelize.define("producto", {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  categoria_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  precio: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  keywords: {
    type: DataTypes.STRING, 
    allowNull: true,
  },
}, {
  timestamps: false
});

// Definir la relación 1 a muchos entre Producto e Imagen
Producto.hasMany(Imagen, { as: 'imagenes', foreignKey: 'productoId' });
Imagen.belongsTo(Producto, { foreignKey: 'productoId' });

module.exports = Producto;
