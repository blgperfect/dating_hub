const mongoose = require('mongoose');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_TOKEN);
    } catch (error) {
        console.error('❌ Erreur lors de la connexion à MongoDB :', error);
        process.exit(1);
    }
}

module.exports = connectDB;
