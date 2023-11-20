import express from 'express'
import handlebars from 'express-handlebars'
import mongoose from 'mongoose'
import { Server } from 'socket.io'
import { __dirname, PORT } from './utils.js'

import productsRouter from './Router/products.router.js'
import cartsRouter from './Router/carts.router.js'
import viewsRouter from './Router/views.router.js'
import messageModel from './DAO/models/messageModel.js'

// Configuración de express
const app = express()
app.use(express.json())
const mongoURL = 'mongodb+srv://matiasbasse:Luna2014@codercluster0.gatfryd.mongodb.net/'    
const mongoDBName = 'ecommerce'

app.engine('handlebars', handlebars.engine())
app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars')
app.use(express.static(__dirname + '/public'))

// Configuración de rutas
app.get('/', (req,res) => res.render('index', { name: 'Usuario' }))
app.use('/api/products', productsRouter)
app.use('/api/carts', cartsRouter)
app.use('/home', viewsRouter)

// Conexión a MongoDB e inicio servidor
mongoose.connect(mongoURL, {dbName: mongoDBName})
    .then(() => {
        console.log('DB connected 😎')
        const httpServer = app.listen(PORT, () => console.log(`Listening 🏃...`))

        // Configuración de socket.io
        const io = new Server(httpServer)
        app.set('socketio', io)

        io.on('connection', async socket => {
            console.log('Successful connection🤝')
            socket.on('productList', data => {
                io.emit('updatedProducts', data)
            })

            let messages = (await messageModel.find()) ? await messageModel.find() : []

            socket.broadcast.emit('alerta')
            socket.emit('logs', messages)
            socket.on('message', data => {
                messages.push(data)
                messageModel.create(messages)
                io.emit('logs', messages)
            })
        })
    })
    .catch(e => console.error('Error to connect 🚨🚨'))