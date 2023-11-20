import { Router } from 'express'
import productModel from '../DAO/models/productModel.js'
 
const router = Router()

  router.get('/', async (req, res) => {
    try {
        const limit = req.query.limit
        const products = await productModel.find().lean().exec()

        if (limit) {
            const limitedProducts = products.slice(0, limit)
            res.status(206).json( limitedProducts )
        } else {
            res.status(200).json({ products: products })
        } 
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: 'error', error: err.message })
    }
})

router.get('/:pid', async (req, res) => {
    try {
        const pid = req.params.pid
        const product = await productModel.findById(pid).lean().exec()
        if (product === null) {
            return res.status(404).json({ status: 'error', error: 'The product does not exist' })   
        }
        res.status(200).json({ status: 'success', payload: product })
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: 'error', error: err.message })
    }
})


router.post('/', async (req, res) => {
    try {
        const product = req.body
        const addProduct = await productModel.create(product)  
        const products = await productModel.find().lean().exec()
        req.app.get('socketio').emit('updatedProducts', products)
        res.status(201).json({ status: 'success', payload: addProduct })
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: 'error', error: err.message })
    }
})


router.put('/:pid', async (req, res) => {
    try {
        const pid = req.params.pid
        if (req.body.id !== pid && req.body.id !== undefined) {
            return res.status(404).json({ error: 'Cannot modify product id' })
        }
        const updated = req.body
        const productFind = await productModel.findById(pid)
        if (!productFind) {
            return res.status(404).json({ error: 'The product does not exist' })
        }
        await productModel.updateOne({ _id: pid }, updated)
        const updatedProducts = await productModel.find().lean().exec()
        req.app.get('socketio').emit('updatedProducts', updatedProducts) 
        res.status(200).json({ message: `Updating the product: ${productFind.title}` })
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: 'error', error: err.message })
    }
})


router.delete('/:pid', async (req, res) => {
    try {
        const pid = req.params.pid
        const result = await productModel.findByIdAndDelete(pid)
        if (result === null) {
            return res.status(404).json({ status: 'error', error: `No such product with id: ${pid}` })
        }
        const updatedProducts = await productModel.find().lean().exec()
        req.app.get('socketio').emit('updatedProducts', updatedProducts)
        res.status(200).json({ message: `Product with id ${pid} removed successfully`, products: updatedProducts })
    } catch (err) {
        console.log(err)
        res.status(500).json({ status: 'error', error: err.message })
    }
})

export default router
