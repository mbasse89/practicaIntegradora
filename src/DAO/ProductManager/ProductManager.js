import fs from 'fs/promises';
import { __dirname } from '../../utils.js'

export default class ProductManager {
    // Constructor que recibe la ruta del archivo de la base de datos
    constructor( ) {
        this.path = "./src/api/products.json"
        this.products = []
    }

    // Método para validar un producto antes de agregarlo
    async validate(product) {
        const requiredFields = ["title", "price", "code", "stock"]; // Campos obligatorios
        const missingFields = requiredFields.filter((field) => !product[field]);
    
        if (missingFields.length > 0) {
            throw new Error("ERROR: Los siguientes campos obligatorios faltan o están vacíos: " + missingFields.join(", "));
        }
    
        try {
            // Verifica si el archivo de la base de datos existe
            if (await this.pathExists()) {
                const db = await this.readDB();
                const checkCode = db.some((p) => p.code === product.code);
    
                if (checkCode) {
                    throw new Error("ERROR: El código del producto ya está en uso");
                }
            }
        } catch (error) {
            throw new Error("Error en validación: " + error.message);
        }
    }

    // Verificar si el archivo de la base de datos existe
    async pathExists() {
        try {
            await fs.access(this.path);
            return true;
        } catch (error) {
            return false;
        }
    }

    // Leer la base de datos
    async readDB() {
        const data = await fs.readFile(this.path, "utf-8");
        return JSON.parse(data);
    }

    // Obtener un producto por su ID
    async getProductsById(id) {
        try {
            const db = JSON.parse(await fs.readFile(this.path, "utf-8"));
            const productById = db.find((p) => p.id === id);

            if (productById) {
                return productById;
            } else {
                throw new Error("Producto no encontrado");
            }
        } catch (error) {
            throw new Error("Error en el procesamiento: " + error.message);
        }
    }

    // Obtener todos los productos
    async getProducts() {
        try {
            await fs.access(this.path); // Asegúrate de que el archivo exista
            const db = await fs.readFile(this.path, "utf-8");
            return JSON.parse(db);
        } catch (error) {
            console.error("Error: " + error.message);
            return [];
        }
    }

    // Crear un ID para un nuevo producto
    async createId() {
        try {
            const db = await fs.readFile(this.path, "utf-8");
            const id = JSON.parse(db).length + 1;
            return id;
        } catch (error) {
            if (error.code === 'ENOENT') {
                // Si el archivo no existe, se asume que es el primer producto
                return 1;
            }
            console.error("Id error: " + error.message);
            return;
        }
    }

    // Agregar un nuevo producto
    async addProduct(title, description, price, thumbnail, code, stock) {
        const product = {
            id: await this.createId(),
            title,
            description,
            price,
            thumbnail: thumbnail || [],
            code,
            category,
            stock,
            status: true,
        };

        try {
            await this.validate(product);

            if (!(await fs.access(this.path).catch(() => false))) {
                await fs.writeFile(this.path, JSON.stringify([product], null, '\t'));
            } else {
                const db = JSON.parse(await fs.readFile(this.path, "utf-8"));
                const newDB = [...db, product];
                await fs.writeFile(this.path, JSON.stringify(newDB, null, '\t'));
            }

            console.log("Producto agregado");
        } catch (error) {
            console.error("Error: " + error.message);
        }
    }

    // Eliminar un producto por su ID
    async deleteProduct(id) {
        try {
            const db = JSON.parse(await fs.readFile(this.path, "utf-8"));
            const productById = db.find((p) => p.id === id);

            if (productById) {
                const newProductsArray = db.filter((p) => p.id != id);
                await fs.writeFile(this.path, JSON.stringify(newProductsArray, null, '\t'));
                console.log("Producto " + id + " ha sido borrado");
            } else {
                console.error("Error en ID");
            }
        } catch (error) {
            console.error("Borrando error: " + error.message);
        }
    }

    // Actualizar un producto por su ID y una clave específica
    async updateProduct(id, keyToUpdate, newValue) {
        try {
            const db = await this.readDB();
            const index = db.findIndex((p) => p.id === id);

            if (index !== -1) {
                if (keyToUpdate in db[index]) {
                    db[index][keyToUpdate] = newValue;
                    await fs.writeFile(this.path, JSON.stringify(db, null, '\t'));
                    console.log(JSON.parse(await fs.readFile(this.path, 'utf-8')));
                } else {
                    console.error('La clave es incorrecta');
                }
            } else {
                console.error('ID incorrecto');
            }
        } catch (error) {
            console.error('Error: ' + error.message);
        }
    }
}
