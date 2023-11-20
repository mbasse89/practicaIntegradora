import mongoose from 'mongoose'

const cartsCollection = 'carts'

const cartSchema = new mongoose.Schema({
    products: {
        type: [{
            _id: false,
            product: mongoose.ObjectId,
            quantity: Number,
        }],
        default: [],
    }
})

const cartModel = mongoose.model(cartsCollection, cartSchema)

export default cartModel 