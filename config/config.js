module.exports = {
  development: {
    username: process.env.DB_USER || "admin", // Cambia a usar variable de entorno
    password: process.env.DB_PASSWORD || "CateringL1nk#", // Cambia a usar variable de entorno
    database: process.env.DB_NAME || "cateringlink", // Cambia a usar variable de entorno
    host: process.env.DB_HOST || "database-1.c5e2kmgo41bv.us-east-2.rds.amazonaws.com", // Cambia a usar variable de entorno
    dialect: "mysql",
  },
};