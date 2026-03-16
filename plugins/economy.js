export default {
    // Plugin 25: Bank
    bank: {
        name: 'bank',
        description: 'Check your balance',
        category: 'economy',
        async execute(sock, m, args, { sender, participant, database, saveDatabase }) {
            const userId = participant;
            
            if (!database.economy) database.economy = {};
            if (!database.economy[userId]) {
                database.economy[userId] = { balance: 1000, bank: 0, daily: 0 };
                saveDatabase();
            }
            
            const user = database.economy[userId];
            
            await sock.sendMessage(sender, { 
                text: `💰 *Bank Account*\n\n` +
                      `💵 Cash: ${user.balance}\n` +
                      `🏦 Bank: ${user.bank}\n` +
                      `💳 Total: ${user.balance + user.bank}` 
            });
        }
    },
    
    // Plugin 26: Daily
    daily: {
        name: 'daily',
        description: 'Claim daily reward',
        category: 'economy',
        async execute(sock, m, args, { sender, participant, database, saveDatabase }) {
            const userId = participant;
            
            if (!database.economy) database.economy = {};
            if (!database.economy[userId]) {
                database.economy[userId] = { balance: 1000, bank: 0, daily: 0 };
            }
            
            const now = Date.now();
            const lastDaily = database.economy[userId].daily || 0;
            
            if (now - lastDaily < 86400000) {
                const remaining = Math.ceil((86400000 - (now - lastDaily)) / 3600000);
                return await sock.sendMessage(sender, { 
                    text: `⏳ Daily available in ${remaining} hours` 
                });
            }
            
            database.economy[userId].balance += 500;
            database.economy[userId].daily = now;
            saveDatabase();
            
            await sock.sendMessage(sender, { 
                text: `✅ Daily claimed! +500 coins` 
            });
        }
    },
    
    // Plugin 27: Transfer
    transfer: {
        name: 'transfer',
        description: 'Send money to user',
        category: 'economy',
        async execute(sock, m, args, { sender, participant, database, saveDatabase }) {
            const to = args[0];
            const amount = parseInt(args[1]);
            
            if (!to || !amount) {
                return await sock.sendMessage(sender, { 
                    text: '❌ Usage: .transfer @user 100' 
                });
            }
            
            const fromId = participant;
            const toId = to.replace('@', '') + '@s.whatsapp.net';
            
            if (!database.economy) database.economy = {};
            if (!database.economy[fromId]) {
                database.economy[fromId] = { balance: 1000, bank: 0 };
            }
            
            if (database.economy[fromId].balance < amount) {
                return await sock.sendMessage(sender, { 
                    text: '❌ Insufficient balance' 
                });
            }
            
            if (!database.economy[toId]) {
                database.economy[toId] = { balance: 1000, bank: 0 };
            }
            
            database.economy[fromId].balance -= amount;
            database.economy[toId].balance += amount;
            saveDatabase();
            
            await sock.sendMessage(sender, { 
                text: `✅ Transferred ${amount} coins to @${to}`,
                mentions: [toId]
            });
        }
    },
    
    // Plugin 28: Shop
    shop: {
        name: 'shop',
        description: 'View shop items',
        category: 'economy',
        async execute(sock, m, args, { sender }) {
            const items = [
                '🎫 *Lottery Ticket* - 100 coins',
                '🪙 *Gold Coin* - 1000 coins',
                '💎 *Diamond* - 5000 coins',
                '👑 *VIP* - 10000 coins'
            ];
            
            await sock.sendMessage(sender, { 
                text: `🛒 *SHOP*\n\n${items.join('\n')}\n\nUse .buy <item>` 
            });
        }
    }
};
