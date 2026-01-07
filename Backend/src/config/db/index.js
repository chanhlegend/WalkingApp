const mongoose = require('mongoose');
require('dotenv').config();

// Lấy URL từ .env
const { MONGO_URI } = process.env;

// Hàm kết nối đến MongoDB
async function connect() {
    if (!MONGO_URI) {
        console.error('MONGO_URI is not defined in .env file');
        throw new Error('MONGO_URI is not defined in .env file');
    }

    try {
        mongoose.set('strictQuery', false); 
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 15000,
            connectTimeoutMS: 15000,
            socketTimeoutMS: 45000,
        });
        console.log('Connected to MongoDB successfully');
        try {
            const { host, name, port } = mongoose.connection;
            console.log(`MongoDB connection details: host=${host}${port ? `:${port}` : ''} db=${name}`);
        } catch (e) {
            // ignore logging errors
        }
        return mongoose.connection;
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error.message);
        if (process.env.NODE_ENV !== 'production') {
            console.error(error);
        }
        throw error;
    }
}

module.exports = { connect };
