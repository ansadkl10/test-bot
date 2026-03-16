export default {
    // Plugin 6: Broadcast
    bc: {
        name: 'bc',
        description: 'Broadcast to all groups',
        category: 'owner',
        async execute(sock, m, args, { sender, isOwner }) {
            if (!isOwner) {
                return await sock.sendMessage(sender, { 
                    text: '❌ This command is only for owner!' 
                });
            }
            
            const text = args.join(' ');
            if (!text) {
                return await sock.sendMessage(sender, { 
                    text: '❌ Usage: .bc Hello everyone!' 
                });
            }
            
            await sock.sendMessage(sender, { 
                text: '⏳ Broadcasting...' 
            });
            
            const groups = await sock.groupFetchAllParticipating();
            let sent = 0;
            
            for (const group of Object.values(groups)) {
                try {
                    await sock.sendMessage(group.id, { text });
                    sent++;
                } catch (e) {}
                await new Promise(r => setTimeout(r, 1000));
            }
            
            await sock.sendMessage(sender, { 
                text: `✅ Broadcast sent to ${sent} groups` 
            });
        }
    },
    
    // Plugin 7: Join Group
    join: {
        name: 'join',
        description: 'Join group via link',
        category: 'owner',
        async execute(sock, m, args, { sender, isOwner }) {
            if (!isOwner) return;
            
            const link = args[0];
            if (!link || !link.includes('chat.whatsapp.com')) {
                return await sock.sendMessage(sender, { 
                    text: '❌ Usage: .join https://chat.whatsapp.com/xxx' 
                });
            }
            
            try {
                const code = link.split('chat.whatsapp.com/')[1];
                const res = await sock.groupAcceptInvite(code);
                await sock.sendMessage(sender, { 
                    text: `✅ Joined group: ${res}` 
                });
            } catch (error) {
                await sock.sendMessage(sender, { 
                    text: `❌ Failed: ${error.message}` 
                });
            }
        }
    },
    
    // Plugin 8: Leave Group
    leave: {
        name: 'leave',
        description: 'Leave current group',
        category: 'owner',
        async execute(sock, m, args, { sender, isOwner }) {
            if (!isOwner) return;
            
            try {
                await sock.groupLeave(sender);
            } catch (error) {
                await sock.sendMessage(sender, { 
                    text: `❌ Failed: ${error.message}` 
                });
            }
        }
    },
    
    // Plugin 9: Add Premium
    addprem: {
        name: 'addprem',
        description: 'Add premium user',
        category: 'owner',
        async execute(sock, m, args, { sender, isOwner, database, saveDatabase }) {
            if (!isOwner) return;
            
            const user = args[0];
            if (!user) {
                return await sock.sendMessage(sender, { 
                    text: '❌ Usage: .addprem 919876543210' 
                });
            }
            
            if (!database.premium) database.premium = [];
            if (!database.premium.includes(user)) {
                database.premium.push(user);
                saveDatabase();
                await sock.sendMessage(sender, { 
                    text: `✅ Added @${user} to premium`,
                    mentions: [`${user}@s.whatsapp.net`]
                });
            } else {
                await sock.sendMessage(sender, { 
                    text: '❌ User already premium' 
                });
            }
        }
    },
    
    // Plugin 10: Remove Premium
    delprem: {
        name: 'delprem',
        description: 'Remove premium user',
        category: 'owner',
        async execute(sock, m, args, { sender, isOwner, database, saveDatabase }) {
            if (!isOwner) return;
            
            const user = args[0];
            if (!user) return;
            
            if (database.premium) {
                database.premium = database.premium.filter(u => u !== user);
                saveDatabase();
                await sock.sendMessage(sender, { 
                    text: `✅ Removed @${user} from premium`,
                    mentions: [`${user}@s.whatsapp.net`]
                });
            }
        }
    }
};
