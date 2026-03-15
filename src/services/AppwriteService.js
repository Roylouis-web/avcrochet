import { Client, Account, TablesDB, Storage, ID, Query } from 'appwrite';

class AppwriteService {
    constructor() {
        this.client = new Client()
            .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
            .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

        this.account = new Account(this.client);
        this.tables = new TablesDB(this.client); // Replaces Databases
        this.storage = new Storage(this.client);

        this.dbId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        this.bucketId = import.meta.env.VITE_APPWRITE_BUCKET_ID;

        this.cols = {
            profiles: import.meta.env.VITE_APPWRITE_COLLECTION_PROFILES,
            products: import.meta.env.VITE_APPWRITE_COLLECTION_PRODUCTS,
            orders: import.meta.env.VITE_APPWRITE_COLLECTION_ORDERS,
            carts: import.meta.env.VITE_APPWRITE_COLLECTION_CARTS
        };
    }

    // --- STORAGE (IMAGE MANAGEMENT) ---

    async uploadFile(file) {
        try {
            const uploadedFile = await this.storage.createFile({
                bucketId: this.bucketId,
                fileId: ID.unique(),
                file: file
            });
            // Returns a persistent View URL
            return `${this.client.config.endpoint}/storage/buckets/${this.bucketId}/files/${uploadedFile.$id}/view?project=${this.client.config.project}`;
        } catch (error) {
            throw error;
        }
    }

    async deleteFile(fileId) {
        try {
            return await this.storage.deleteFile({
                bucketId: this.bucketId,
                fileId: fileId
            });
        } catch (error) {
            console.error("Storage Delete Error:", error);
        }
    }

    // --- AUTHENTICATION ---

    async createUser({ email, password, firstName, lastName, address, telephone }) {
        try {
            const user = await this.account.create({
                userId: ID.unique(),
                email,
                password,
                name: `${firstName} ${lastName}`
            });

            await this.tables.createRow({
                databaseId: this.dbId,
                tableId: this.cols.profiles,
                rowId: user.$id,
                data: {
                    userId: user.$id,
                    firstName,
                    lastName,
                    address: address || '',
                    telephone: telephone || '',
                    role: 'customer'
                }
            });
            return user;
        } catch (error) { throw error; }
    }

    // --- USER PROFILE MANAGEMENT ---

    async editUser(userId, data) {
        try {
            // In your system, account.$id matches the profile rowId
            return await this.tables.updateRow({
                databaseId: this.dbId,
                tableId: this.cols.profiles,
                rowId: userId,
                data: data // Should contain { firstName, lastName, telephone, address }
            });
        } catch (error) {
            console.error("AppwriteService :: editUser :: error", error);
            throw error;
        }
    }


    async login(email, password) {
        return await this.account.createEmailPasswordSession({
            email,
            password
        });
    }

    async logout() {
        return await this.account.deleteSession({
            sessionId: 'current'
        });
    }

    async getFullUser() {
        try {
            const account = await this.account.get();
            const profile = await this.tables.getRow({
                databaseId: this.dbId,
                tableId: this.cols.profiles,
                rowId: account.$id
            });
            return { ...account, ...profile };
        } catch {
            return null;
        }
    }

    // --- PRODUCTS (FLAT STRUCTURE) ---

    async createProduct(data) {
        try {
            return await this.tables.createRow({
                databaseId: this.dbId,
                tableId: this.cols.products,
                rowId: ID.unique(),
                data: data
            });
        } catch (error) { throw error; }
    }

    async getProducts(queries = []) {
        try {
            const response = await this.tables.listRows({
                databaseId: this.dbId,
                tableId: this.cols.products,
                queries
            });
            // Map rows to "documents" for frontend compatibility
            return { ...response, documents: response.rows || [] };
        } catch (error) { throw error; }
    }

    async getProduct(productId) {
        try {
            const product = await this.tables.getRow({
                databaseId: this.dbId,
                tableId: this.cols.products,
                rowId: productId
            });
            return { id: product.$id, ...product };
        } catch (error) { throw error; }
    }

    async editProduct(productId, data) {
        try {
            return await this.tables.updateRow({
                databaseId: this.dbId,
                tableId: this.cols.products,
                rowId: productId,
                data
            });
        } catch (error) { throw error; }
    }

    async deleteProduct(productId) {
        try {
            return await this.tables.deleteRow({
                databaseId: this.dbId,
                tableId: this.cols.products,
                rowId: productId
            });
        } catch (error) { throw error; }
    }

    // --- ORDERS & CART ---

    async getOrders(queries = []) {
        try {
            const response = await this.tables.listRows({
                databaseId: this.dbId,
                tableId: this.cols.orders,
                queries
            });
            return { ...response, rows: response.rows || [] };
        } catch (error) { throw error; }
    }

    async createOrder(data) {
        try {
            return await this.tables.createRow({
                databaseId: this.dbId,
                tableId: this.cols.orders,
                rowId: ID.unique(),
                data
            });
        } catch (error) { throw error; }
    }

    // --- ORDERS & CART ---

    // Add this method:
    async updateOrder(orderId, data) {
        try {
            return await this.tables.updateRow({
                databaseId: this.dbId,
                tableId: this.cols.orders,
                rowId: orderId,
                data: data // e.g., { status: 'completed' }
            });
        } catch (error) {
            console.error("Appwrite Update Order Error:", error);
            throw error;
        }
    }

    async getCarts(queries = []) {
        try {
            const response = await this.tables.listRows({
                databaseId: this.dbId,
                tableId: this.cols.carts,
                queries
            });
            return { ...response, rows: response.rows || [] };
        } catch (error) { throw error; }
    }

    // AppwriteService.js

    async addToCart(cartData) {
        try {
            return await this.tables.createRow({
                databaseId: this.dbId,
                tableId: this.cols.carts,
                rowId: ID.unique(),
                data: cartData
            });
        } catch (error) {
            throw error;
        }
    }


    async updateCart(cartRowId, quantity) {
        try {
            return await this.tables.updateRow({
                databaseId: this.dbId,
                tableId: this.cols.carts,
                rowId: cartRowId,
                data: { quantity }
            });
        } catch (error) { throw error; }
    }

    async deleteCartItem(cartRowId) {
        try {
            return await this.tables.deleteRow({
                databaseId: this.dbId,
                tableId: this.cols.carts,
                rowId: cartRowId
            });
        } catch (error) { throw error; }
    }

    // --- CLEANUP ---

    async cleanupUserData(userId) {
        try {
            const tablesToClean = [this.cols.profiles, this.cols.carts];
            for (const tableId of tablesToClean) {
                const response = await this.tables.listRows({
                    databaseId: this.dbId,
                    tableId: tableId,
                    queries: [Query.equal('userId', userId)]
                });

                for (const row of response.rows) {
                    await this.tables.deleteRow({
                        databaseId: this.dbId,
                        tableId: tableId,
                        rowId: row.$id
                    });
                }
            }
            return true;
        } catch (error) { throw error; }
    }

    async deleteUser() {
        try {
            const user = await this.account.get();
            await this.cleanupUserData(user.$id);
            return await this.account.deleteIdentity({
                identityId: 'current'
            });
        } catch (error) { throw error; }
    }
}

export default new AppwriteService();
