import fs from 'fs'
import ProductManager from './ProductManager.js'

// Crear una instancia de la clase ProductManager
const productManager = new ProductManager()

// Definición de la clase CartManager
export class CartManager {
    constructor() {
        this.path = './src/api/carts.json' // Ruta del archivo JSON para almacenar los carritos
        this.carts = [] // Arreglo para almacenar los datos de los carritos
    }

    // Método para crear un nuevo carrito
    createCart = async () => {
        try {
            if (!fs.existsSync(this.path)) {
                const cart = {
                    id: this.carts.length + 1,
                    productos: [],
                };

                this.carts.push(cart);
                await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, '\t'));
                return 'Se creó el carrito correctamente';
            }

            const data = await fs.promises.readFile(this.path, 'utf-8');
            this.carts = JSON.parse(data);

            const cart = {
                id: this.carts.length + 1,
                productos: [],
            };

            this.carts.push(cart);
            await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, '\t'));
            return 'Se creó el carrito correctamente';
        } catch (error) {
            return error
        }
    }

    // Método para obtener todos los carritos
    getCarts = async () => {
        try {
            if (!fs.existsSync(this.path)) return this.carts

            const data = await fs.promises.readFile(this.path, 'utf-8')
            this.carts = JSON.parse(data)

            return this.carts
        } catch (error) {
            return error
        }
    }

    // Método para obtener un carrito por su ID
    getCartById = async (cid) => {
        try {
            const data = await fs.promises.readFile(this.path, 'utf-8')
            this.carts = JSON.parse(data)
            const carrito = this.carts.find(cart => cart.id == cid)

            return carrito ? carrito : 'Not found'
        } catch (error) {
            return error
        }
    }

    // Método para agregar un producto a un carrito
    addProductInCart = async (cid, pid) => {
        try {
            const data = await fs.promises.readFile(this.path, 'utf-8')
            this.carts = JSON.parse(data);
            const carrito = this.carts.find(cart => cart.id === cid)
            const prod = await productManager.getProductById(pid)

            if (prod === 'Not found') return 'Producto no encontrado'
            if (!carrito) return 'Carrito no encontrado'

            const product = carrito.productos.find(p => p.pid === pid)

            if (!product) {
                carrito.productos.push({ pid: pid, quantity: 1 })
            } else {
                product.quantity++
            }

            await fs.promises.writeFile(this.path, JSON.stringify(this.carts, null, '\t'))
            return 'Se agregó el producto correctamente'
        } catch (error) {
            return error
        }
    }
}
