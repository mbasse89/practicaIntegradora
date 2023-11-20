import { Router } from 'express';
import productModel from '../DAO/models/productModel.js';
import messageModel from '../DAO/models/messageModel.js';

const router = Router()

router.get('/', async (req, res) => {
    try {
        const allProducts = await productModel.find().lean().exec()
        console.log(allProducts.map(item => item._id))
        res.render('home', { allProducts })
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: 'error', error: err.message })
    }
})

router.get('/realTimeProducts', async (req, res) => {
    try {
        const allProducts = await productModel.find().lean().exec()
        res.render('realTimeProducts', { allProducts })
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: 'error', error: err.message })
    }
})

router.get('/chat', async (req, res) => {
    try {
        const messages = await messageModel.find().lean().exec()
        res.render('chat', { messages })
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: 'error', error: err.message })
    }
})

export default router