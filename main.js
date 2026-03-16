import { default as makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import moment from 'moment-timezone';

// ES Module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import config
import config from './config.js';

// Logger
const logger = pino({ level: 'silent' });

// Session path
const sessionDir = path.join(__dirname, 'sessions', config.sessionName);

// Database
let database = {
    users: {},
    groups: {},
    economy: {},
    premium: [],
    settings: {}
};

// Load database
function loadDatabase() {
    try {
        const dbPath = path.join(__dirname, 'database', 'db.json');
        if (fs.existsSync(dbPath)) {
            database = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            console.log('✅ Database loaded');
        }
    } catch (e) {
        console.error('❌ Database load error:', e.message);
    }
}

// Save database
function saveDatabase() {
    try {
        const dbPath = path.join(__dirname, 'database', 'db.json');
        fs.ensureDirSync(path.dirname(dbPath));
        fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));
    } catch (e) {
        console.error('❌ Database save error:', e.message);
    }
}

// Load plugins dynamically
async function loadPlugins() {
    const commands = new Map();
    const pluginFiles = fs.readdirSync(path.join(__dirname, 'plugins'))
        .filter(file => file.endsWith('.js') && !file.startsWith('_'));
    
    console.log('\n📦 Loading plugins...');
    
    for (const file of pluginFiles) {
        try {
            const plugin = await import(`./plugins/${file}`);
            const pluginName = path.basename(file, '.js');
            
            if (plugin.default && typeof plugin.default === 'object') {
                const pluginCommands = plugin.default;
                let cmdCount = 0;
                
                for (const [cmdName, cmd] of Object.entries(pluginCommands)) {
                    cmd.category = pluginName;
                    commands.set(cmdName, cmd);
                    cmdCount++;
                }
                
                console.log(`✅ ${pluginName}: ${cmdCount} commands`);
            }
        } catch (error) {
            console.error(`❌ Failed to load ${file}:`, error.message);
        }
    }
    
    console.log(`\n✅ Total commands: ${commands.size}\n`);
    return commands;
}

// Check owner
function isOwner(jid) {
    const ownerJid = config.ownerNumber + '@s.whatsapp.net';
    return jid === ownerJid;
}

// Main function
async function startBot() {
    console.log(`\n🚀 Starting ${config.botName} v${config.version}`);
    console.log(`👑 Owner: ${config.ownerName} (${config.ownerNumber})`);
    console.log(`📁 Session: ${config.sessionName}\n`);
    
    // Ensure directories
    await fs.ensureDir(sessionDir);
    await fs.ensureDir(path.join(__dirname, 'database'));
    await fs.ensureDir(path.join(__dirname, 'tmp'));
    
    // Load database
    loadDatabase();
    
    // Load plugins
    const commands = await loadPlugins();
    
    // Auth
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    
    // Create socket
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: logger,
        browser: [config.botName, 'Chrome', '120.0.0.0'],
        getMessage: async () => ({ conversation: '' })
    });

    // QR handler
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('\n📱 Scan QR code:\n');
            qrcode.generate(qr, { small: true });
            console.log('\n➡️ WhatsApp → Menu → Linked Devices\n');
        }
        
        if (connection === 'open') {
            console.log(`✅ Bot connected as ${sock.user.id.split(':')[0]}`);
            console.log(`📦 Commands: ${commands.size}`);
            console.log(`🕐 Time: ${moment().tz(config.timezone).format('DD/MM/YYYY HH:mm:ss')}\n`);
        }
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('❌ Disconnected, reconnecting:', shouldReconnect);
            
            if (shouldReconnect) {
                startBot();
            }
        }
    });

    // Message handler
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        
        if (!m.message || m.key.fromMe) return;
        
        const messageText = m.message.conversation || 
                           m.message.extendedTextMessage?.text || 
                           m.message.imageMessage?.caption || '';
        
        const sender = m.key.remoteJid;
        const isGroup = sender.endsWith('@g.us');
        const participant = isGroup ? m.key.participant : sender;
        const senderName = m.pushName || 'User';
        
        // Check prefix
        if (!messageText.startsWith(config.prefix)) return;
        
        const args = messageText.slice(config.prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        
        // Find command
        const command = commands.get(commandName);
        
        if (command) {
            console.log(`📨 ${moment().tz(config.timezone).format('HH:mm:ss')} | ${senderName} | ${commandName}`);
            
            try {
                await command.execute(sock, m, args, {
                    sender,
                    isGroup,
                    participant,
                    senderName,
                    database,
                    saveDatabase,
                    isOwner: isOwner(participant),
                    config,
                    commands
                });
            } catch (error) {
                console.error(`❌ Error:`, error);
                await sock.sendMessage(sender, { 
                    text: `❌ Error: ${error.message}` 
                });
            }
        }
    });

    // Creds update
    sock.ev.on('creds.update', saveCreds);
    
    return sock;
}

// Handle errors
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});

// Start
startBot().catch(console.error);
