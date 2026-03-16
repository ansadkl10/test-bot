// Plugin: Status
status: {
    name: 'status',
    description: 'Check bot status',
    category: 'main',
    async execute(sock, m, args, { sender, config, isOwner }) {
        const mode = config.mode.toUpperCase();
        const role = isOwner ? '👑 Owner' : '👤 User';
        
        await sock.sendMessage(sender, { 
            text: `*🤖 Bot Status*\n\n` +
                  `📊 *Mode:* ${mode}\n` +
                  `👤 *Your Role:* ${role}\n` +
                  `⚡ *Prefix:* ${config.prefix}\n` +
                  `📦 *Commands:* ${commands?.size || 30}\n\n` +
                  `Public: Everyone can use\n` +
                  `Private: Only owner can use`
        });
    }
                  }
