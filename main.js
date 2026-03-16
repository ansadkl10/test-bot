// ✅ CORRECT IMPORT FOR BAILEYS v6.5.0
import pkg from '@whiskeysockets/baileys';
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = pkg;

import pino from 'pino';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import moment from 'moment-timezone';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config
const config = {
    botName: 'Nexa-Bot',
    version: '3.0.0',
    ownerName: 'ZenX',
    ownerNumber: '919876543210',
    prefix: '.',
    sessionName: 'nexa-session',
    timezone: 'Asia/Kolkata'
};

const logger = pino({ level: 'silent' });
const sessionDir = path.join(__dirname, 'sessions', config.sessionName);

// Database
let database = { users: {}, groups: {}, economy: {} };

function loadDatabase() {
    try {
        const dbPath = path.join(__dirname, 'database', 'db.json');
        if (fs.existsSync(dbPath)) {
            database = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
            console.log('✅ Database loaded');
        }
    } catch (e) {}
}

function saveDatabase() {
    try {
        const dbPath = path.join(__dirname, 'database', 'db.json');
        fs.ensureDirSync(path.dirname(dbPath));
        fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));
    } catch (e) {}
}

// Load plugins
async function loadPlugins() {
    const commands = new Map();
    const pluginFiles = fs.readdirSync(path.join(__dirname, 'plugins'));
    
    console.log('\n📦 Loading plugins...');
    
    for (const file of pluginFiles) {
        if (!file.endsWith('.js')) continue;
        
        try {
            const plugin = await import(`./plugins/${file}`);
            const pluginName = path.basename(file, '.js');
            
            if (plugin.default) {
                let cmdCount = 0;
                for (const [cmdName, cmd] of Object.entries(plugin.default)) {
                    cmd.category = pluginName;
                    commands.set(cmdName, cmd);
                    cmdCount++;
                }
                console.log(`✅ ${pluginName}: ${cmdCount} commands`);
            }
        } catch (error) {
            console.error(`❌ ${file}:`, error.message);
        }
    }
    
    console.log(`\n✅ Total: ${commands.size} commands\n`);
    return commands;
}

function isOwner(jid) {
    return jid === config.ownerNumber + '@s.whatsapp.net';
}

// Main function
async function startBot() {
    console.log(`\n🚀 Starting ${config.botName} v${config.version}`);
    console.log(`👑 Owner: ${config.ownerName} (${config.ownerNumber})`);
    
    await fs.ensureDir(sessionDir);
    await fs.ensureDir(path.join(__dirname, 'database'));
    loadDatabase();
    const commands = await loadPlugins();
    
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    
    // ✅ WORKING SOCKET CREATION
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        logger: logger,
        browser: ['Nexa-Bot', 'Chrome', '120.0.0.0']
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('\n📱 Scan QR:\n');
            qrcode.generate(qr, { small: true });
        }
        
        if (connection === 'open') {
            console.log(`✅ Connected as ${sock.user.id.split(':')[0]}`);
        }
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;
        
        const messageText = m.message.conversation || '';
        const sender = m.key.remoteJid;
        
        if (!messageText.startsWith(config.prefix)) return;
        
        const args = messageText.slice(1).trim().split(/ +/);
        const cmd = args.shift().toLowerCase();
        const command = commands.get(cmd);
        
        if (command) {
            console.log(`📨 ${cmd} from ${sender}`);
            try {
                await command.execute(sock, m, args, {
                    sender,
                    database,
                    saveDatabase,
                    isOwner: isOwner(sender),
                    config
                });
            } catch (error) {
                await sock.sendMessage(sender, { text: `❌ ${error.message}` });
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

// Start
startBot().catch(console.error);
