export interface Image {
    thumbnail?: string;
    mobile?: string;
    tablet?: string;
    desktop?: string;
}

export interface ProductCart  {
    id?: number;
    name: string;
    category: string;
    price: number;
    image :{
        thumbnail?: string;
        mobile?: string;
        tablet?: string;
        desktop?: string;
    }
}

export class DatabaseService<T extends ProductCart> {
    private db: IDBDatabase | null = null;
    private readonly DB_NAME = 'ProductDB';
    private readonly STORE_NAME = 'ProductCart';

    constructor() {
        this.initDatabase();
    }

    public initDatabase(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, 1);

            request.onerror = (event) => {
                console.error("Database error:", event);
                reject(event);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log("Database opened successfully");
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    console.log("Creating object store");
                    const objectStore = db.createObjectStore(this.STORE_NAME, { keyPath: "id", autoIncrement: true });
                    objectStore.createIndex("name", "name", { unique: false });
                }
            };
        });
    }

    async getAllProducts(): Promise<T[]> {
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.STORE_NAME], "readonly");
            const objectStore = transaction.objectStore(this.STORE_NAME);
            const request = objectStore.getAll();

            request.onerror = (event) => {
                console.error("Error getting products:", event);
                reject(event);
            };

            request.onsuccess = () => {
                console.log("Products retrieved successfully");
                resolve(request.result);
            };
        });
    }

    async storeProducts(products: T[]): Promise<void> {
        const transaction = this.db!.transaction([this.STORE_NAME], "readwrite");
        const objectStore = transaction.objectStore(this.STORE_NAME);

        products.forEach(product => {
            objectStore.add(product);
        });

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => {
                console.log("All products added successfully");
                resolve();
            };

            transaction.onerror = (event) => {
                console.error("Error adding products:", event);
                reject(event);
            };
        });
    }

    async updateProduct(product: T): Promise<void> {
        const transaction = this.db!.transaction([this.STORE_NAME], "readwrite");
        const objectStore = transaction.objectStore(this.STORE_NAME);
        const request = objectStore.put(product); 

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                console.log("Product updated successfully");
                resolve();
            };

            request.onerror = (event) => {
                console.error("Error updating product:", event);
                reject(event);
            };
        });
    }

    async deleteProduct(id: number): Promise<void> {
        const transaction = this.db!.transaction([this.STORE_NAME], "readwrite");
        const objectStore = transaction.objectStore(this.STORE_NAME);
        const request = objectStore.delete(id); 

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                console.log("Product deleted successfully");
                resolve();
            };

            request.onerror = (event) => {
                console.error("Error deleting product:", event);
                reject(event);
            };
        });
    }

    async createProducts(products: T[]): Promise<void> {
        await this.storeProducts(products); 
    }
}
