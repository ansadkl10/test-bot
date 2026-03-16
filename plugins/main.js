export default {
    // Plugin 1: Ping
    ping: {
        name: 'ping',
        description: 'Check bot response',
        category: 'main',
        async execute(sock, m, args, { sender }) {
            const start = Date.now();
            await sock.sendMessage(sender, { text: '🏓' });
            const end = Date.now();
            
            await sock.sendMessage(sender, { 
                text: `🏓 *Pong!*\n⏱️ Response: ${end - start}ms` 
            });
        }
    },
    
    // Plugin 2: Menu
    menu: {
        name: 'menu',
        description: 'Show all commands',
        category: 'main',
        async execute(sock, m, args, { sender, commands, config }) {
            let menu = `╭━━━『 *${config.botName}* 』━━━╮\n`;
            menu += `┃ 🤖 *Version:* ${config.version}\n`;
            menu += `┃ ⚡ *Prefix:* ${config.prefix}\n`;
            menu += `┃ 📦 *Commands:* ${commands.size}\n`;
            menu += `╰━━━━━━━━━━━━━━╯\n\n`;
            
            const categories = new Set();
            commands.forEach(cmd => categories.add(cmd.category));
            
            for (const cat of categories) {
                menu += `*📁 ${cat.toUpperCase()}*\n`;
                commands.forEach((cmd, name) => {
                    if (cmd.category === cat) {
                        menu += `┠ ${config.prefix}${name} - ${cmd.description}\n`;
                    }
                });
                menu += '\n';
            }
            
            await sock.sendMessage(sender, { text: menu });
        }
    },
    
    // Plugin 3: Owner Info
    owner: {
        name: 'owner',
        description: 'Show owner info',
        category: 'main',
        async execute(sock, m, args, { sender, config }) {
            await sock.sendMessage(sender, { 
                text: `👑 *Owner Info*\n\nName: ${config.ownerName}\nNumber: @${config.ownerNumber}`,
                mentions: [`${config.ownerNumber}@s.whatsapp.net`]
            });
        }
    },
    
    // Plugin 4: Runtime
    runtime: {
        name: 'runtime',
        description: 'Check bot uptime',
        category: 'main',
        async execute(sock, m, args, { sender }) {
            const uptime = process.uptime();
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);
            
            await sock.sendMessage(sender, { 
                text: `⏱️ *Runtime:* ${hours}h ${minutes}m ${seconds}s` 
            });
        }
    },
    
    // Plugin 5: Info
    info: {
        name: 'info',
        description: 'Bot information',
        category: 'main',
        async execute(sock, m, args, { sender, config, commands }) {
            const info = `*🤖 ${config.botName} Information*\n\n` +
                        `📦 *Version:* ${config.version}\n` +
                        `⚡ *Prefix:* ${config.prefix}\n` +
                        `📊 *Commands:* ${commands.size}\n` +
                        `💻 *Runtime:* Node.js ${process.version}\n` +
                        `👑 *Owner:* ${config.ownerName}\n` +
                        `📱 *Platform:* Termux/Android`;
            
            await sock.sendMessage(sender, { text: info });
        }
    }
};
