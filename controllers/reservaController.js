const Producto = require("../models/producto"); 
const Usuario = require("../models/usuario");
const Imagen = require("../models/imagen");
const Reserva = require("../models/usuario_producto");
const { Op } = require("sequelize");
const { enviarCorreoReserva } = require('./notificationController');
const { now } = require("sequelize/lib/utils");

// Obtener detalle temporal de reserva (producto, usuario y fecha seleccionada)
exports.obtenerDetalleReserva = async (req, res) => {
    try {
        const { productoId, usuarioId, fecha } = req.body; // datos recibidos del frontend
        const producto = await Producto.findByPk(productoId);
        const usuario = await Usuario.findByPk(usuarioId);

        if (!producto || !usuario) {
            return res.status(404).json({ mensaje: 'Producto o usuario no encontrados' });
        }

        // Retornamos los detalles de la reserva sin guardar
        res.json({
            producto,
            usuario,
            fecha
        });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener los detalles de la reserva', error });
    }
};

exports.confirmarReserva = async (req, res) => {
    try {
        const { productoId, usuarioId, fecha } = req.body;
        // Crear la reserva en la base de datos
        const nuevaReserva = await Reserva.create({
            producto_id: productoId,
            usuario_id: usuarioId,
            fecha_uso: fecha,
            fecha_reserva: new Date()
        });

        // Obtener el producto y el usuario para los detalles del correo
        const producto = await Producto.findByPk(productoId);
        const usuario = await Usuario.findByPk(usuarioId);

        if (!producto || !usuario) {
            return res.status(404).json({ mensaje: 'Producto o usuario no encontrados' });
        }

        // Enviar correo electrónico con los detalles de la reserva
        await enviarCorreoReserva(usuario, producto, fecha);

        res.json({
            mensaje: 'Reserva confirmada exitosamente y correo enviado',
            reserva: nuevaReserva
        });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al confirmar la reserva: '+ error });
    }
};

exports.obtenerFechasDisponibles = async (req, res) => {
    try {
        const { producto_id, fechaInicio, fechaFin } = req.body;

        // Obtener todas las reservas para el producto en el rango de fechas dado filtrando por fecha_uso
        const reservas = await Reserva.findAll({
            where: {
                producto_id,
                fecha_uso: {
                    [Op.between]: [fechaInicio, fechaFin]  // Filtrar por fecha_uso
                }
            }
        });

        // Extraer todas las fechas de uso reservadas
        const fechasReservadas = reservas.map(reserva => {
            const fechaUso = new Date(reserva.fecha_uso); // Asegurarse de que sea un objeto Date
            return fechaUso.toISOString().split('T')[0];
        });

        // Crear una lista de todas las fechas en el rango dado
        const fechasDisponibles = [];
        let currentFecha = new Date(fechaInicio);
        const finFecha = new Date(fechaFin);

        while (currentFecha <= finFecha) {
            const fechaString = currentFecha.toISOString().split('T')[0];
            if (!fechasReservadas.includes(fechaString)) {
                fechasDisponibles.push(fechaString);
            }
            currentFecha.setDate(currentFecha.getDate() + 1);
        }

        // Retornar las fechas disponibles y no disponibles
        res.json({ fechasDisponibles, fechasNoDisponibles: fechasReservadas });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener las fechas disponibles y no disponibles: ' + error.message });
    }
};



// Obtener historial de reservas del usuario autenticado
exports.obtenerHistorialReservas = async (req, res) => {
    try {
        const usuarioId = req.params.usuarioId; // Obtener el ID del usuario desde los parámetros de la solicitud

        // Verificar que el ID del usuario esté presente
        if (!usuarioId) {
            return res.status(400).json({ mensaje: 'ID de usuario no proporcionado' });
        }

        // Obtener todas las reservas asociadas al usuario
        const reservas = await Reserva.findAll({
            where: {
                usuario_id: usuarioId
            },
            include: [
                {
                    model: Producto, 
                    attributes: ['nombre', 'descripcion', 'precio'],
                    include: [
                        {
                            model: Imagen,
                            as: 'imagenes', 
                            attributes: ['url'] 
                        }
                    ]
                }
            ],
            order: [['fecha_reserva', 'DESC']] // Ordenar por fecha de reserva (más recientes primero)
        });

        // Retornar las reservas con detalles del producto
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener el historial de reservas', error });
    }
};

exports.obtenerFechasReservadas = async (req, res) => {
    try {
        const { productoId } = req.params;

        // Validar que se envió el productoId
        if (!productoId) {
            return res.status(400).json({ mensaje: 'Producto ID es requerido' });
        }

        // Obtener todas las reservas del producto seleccionado
        const reservas = await Reserva.findAll({
            where: {
                producto_id: productoId
            },
            attributes: ['fecha_reserva'] // Seleccionamos solo la columna de fecha_reserva
        });

        // Extraer solo las fechas de uso y retornarlas
        const fechasReservadas = reservas.map(reserva => reserva.fecha_reserva);

        res.json({ fechasReservadas });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener las fechas reservadas', error });
    }
};


