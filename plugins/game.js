export default {
    // Plugin 29: Slot Machine
    slot: {
        name: 'slot',
        description: 'Play slot machine',
        category: 'game',
        async execute(sock, m, args, { sender, participant, database, saveDatabase }) {
            const userId = participant;
            
            if (!database.economy) database.economy = {};
            if (!database.economy[userId]) {
                database.economy[userId] = { balance: 1000 };
            }
            
            const bet = parseInt(args[0]) || 100;
            
            if (database.economy[userId].balance < bet) {
                return await sock.sendMessage(sender, { 
                    text: '❌ Insufficient balance' 
                });
            }
            
            const slots = ['🍎', '🍊', '🍇', '🍒', '💎', '7️⃣'];
            const result = [
                slots[Math.floor(Math.random() * slots.length)],
                slots[Math.floor(Math.random() * slots.length)],
                slots[Math.floor(Math.random() * slots.length)]
            ];
            
            let win = false;
            let multiplier = 1;
            
            if (result[0] === result[1] && result[1] === result[2]) {
                win = true;
                multiplier = 5;
            } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
                win = true;
                multiplier = 2;
            }
            
            if (win) {
                database.economy[userId].balance += bet * multiplier;
                await sock.sendMessage(sender, { 
                    text: `🎰 *SLOT MACHINE*\n\n${result.join(' | ')}\n\n🎉 You won ${bet * multiplier} coins!` 
                });
            } else {
                database.economy[userId].balance -= bet;
                await sock.sendMessage(sender, { 
                    text: `🎰 *SLOT MACHINE*\n\n${result.join(' | ')}\n\n😢 You lost ${bet} coins!` 
                });
            }
            
            saveDatabase();
        }
    },
    
    // Plugin 30: Guess Number
    guess: {
        name: 'guess',
        description: 'Guess the number game',
        category: 'game',
        async execute(sock, m, args, { sender }) {
            const number = Math.floor(Math.random() * 10) + 1;
            
            await sock.sendMessage(sender, { 
                text: `🎮 *Guess the Number*\n\nI'm thinking of a number between 1-10. Guess it!` 
            });
            
            // Game logic would need state management
        }
    }
};
