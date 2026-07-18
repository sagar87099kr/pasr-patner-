const mongoose = require('mongoose');

const mongoURI = "mongodb+srv://user1:52150495Sagar@cluster0.p7x32.mongodb.net/pasr"; // Assuming standard pasr URI, but wait, let me check backend/.env first

async function checkRecentShops() {
    try {
        require('dotenv').config({ path: '../pasr/backend/.env' });
        await mongoose.connect(process.env.ATLAS_DB_URL || mongoURI);
        console.log("Connected to MongoDB.");

        const Shop = require('../pasr/backend/data/shops.js');
        const recentShops = await Shop.find().sort({ createdAt: -1 }).limit(3);

        if (recentShops.length === 0) {
            console.log("No shops found in the database.");
        } else {
            console.log("Most recent shops:");
            recentShops.forEach((shop, index) => {
                console.log(`\n--- Shop ${index + 1} ---`);
                console.log(`ID: ${shop._id}`);
                console.log(`Name: ${shop.shopName}`);
                console.log(`Owner ID: ${shop.owner}`);
                console.log(`Category: ${shop.category}`);
                console.log(`Created At: ${shop.createdAt}`);
            });
        }
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkRecentShops();
