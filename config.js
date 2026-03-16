import dotenv from 'dotenv';
dotenv.config();

export default {
    // Bot info
    botName: 'Nexa-Bot',
    version: '3.0.0',
    author: 'ZenX',
    
    // Owner info
    ownerName: 'ZenX',
    ownerNumber: process.env.OWNER_NUMBER || '919876543210',
    
    // Settings
    prefix: '.',
    sessionName: 'nexa-session',
    timezone: 'Asia/Kolkata',
    
    // Features
    maxFileSize: 100 * 1024 * 1024, // 100MB
    autoRead: false,
    public: true,
    
    // Database
    database: {
        type: 'json', // 'json' or 'mongodb'
        url: process.env.MONGODB_URL || ''
    },
    
    // APIs
    apiKeys: {
        weather: process.env.WEATHER_API || '',
        openai: process.env.OPENAI_API || ''
    }
};
