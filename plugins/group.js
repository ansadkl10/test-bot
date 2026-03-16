export default {
    // Plugin 11: Group Info
    ginfo: {
        name: 'ginfo',
        description: 'Get group information',
        category: 'group',
        async execute(sock, m, args, { sender, isGroup }) {
            if (!isGroup) {
                return await sock.sendMessage(sender, { 
                    text: '❌ This command is for groups only!' 
                });
            }
            
            const metadata = await sock.groupMetadata(sender);
            const participants = metadata.participants;
            const admins = participants.filter(p => p.admin);
            
            const info = `*📊 Group Information*\n\n` +
                        `📌 *Name:* ${metadata.subject}\n` +
                        `🆔 *ID:* ${metadata.id}\n` +
                        `👥 *Members:* ${participants.length}\n` +
                        `👑 *Admins:* ${admins.length}\n` +
                        `📅 *Created:* ${new Date(metadata.creation).toLocaleDateString()}\n` +
                        `🔗 *Invite:* ${metadata.inviteCode || 'N/A'}`;
            
            await sock.sendMessage(sender, { text: info });
        }
    },
    
    // Plugin 12: Tag All
    tagall: {
        name: 'tagall',
        description: 'Tag all group members',
        category: 'group',
        async execute(sock, m, args, { sender, isGroup }) {
            if (!isGroup) return;
            
            const metadata = await sock.groupMetadata(sender);
            const participants = metadata.participants;
            
            let text = args.join(' ') || 'Attention all members!';
            let mentions = participants.map(p => p.id);
            
            text += '\n\n' + participants.map(p => `@${p.id.split('@')[0]}`).join('\n');
            
            await sock.sendMessage(sender, { text, mentions });
        }
    },
    
    // Plugin 13: Promote
    promote: {
        name: 'promote',
        description: 'Promote member to admin',
        category: 'group',
        async execute(sock, m, args, { sender, isGroup }) {
            if (!isGroup) return;
            
            const user = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || args[0];
            
            if (!user) {
                return await sock.sendMessage(sender, { 
                    text: '❌ Please mention the user to promote' 
                });
            }
            
            try {
                await sock.groupParticipantsUpdate(sender, [user], 'promote');
                await sock.sendMessage(sender, { 
                    text: `✅ Promoted @${user.split('@')[0]} to admin`,
                    mentions: [user]
                });
            } catch (error) {
                await sock.sendMessage(sender, { 
                    text: `❌ Failed: ${error.message}` 
                });
            }
        }
    },
    
    // Plugin 14: Demote
    demote: {
        name: 'demote',
        description: 'Demote admin to member',
        category: 'group',
        async execute(sock, m, args, { sender, isGroup }) {
            if (!isGroup) return;
            
            const user = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || args[0];
            
            if (!user) return;
            
            try {
                await sock.groupParticipantsUpdate(sender, [user], 'demote');
                await sock.sendMessage(sender, { 
                    text: `✅ Demoted @${user.split('@')[0]}`,
                    mentions: [user]
                });
            } catch (error) {
                await sock.sendMessage(sender, { 
                    text: `❌ Failed: ${error.message}` 
                });
            }
        }
    },
    
    // Plugin 15: Kick
    kick: {
        name: 'kick',
        description: 'Remove member from group',
        category: 'group',
        async execute(sock, m, args, { sender, isGroup }) {
            if (!isGroup) return;
            
            const user = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || args[0];
            
            if (!user) return;
            
            try {
                await sock.groupParticipantsUpdate(sender, [user], 'remove');
                await sock.sendMessage(sender, { 
                    text: `✅ Removed @${user.split('@')[0]}`,
                    mentions: [user]
                });
            } catch (error) {
                await sock.sendMessage(sender, { 
                    text: `❌ Failed: ${error.message}` 
                });
            }
        }
    }
};
