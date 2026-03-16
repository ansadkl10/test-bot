// Plugin: Set Mode
setmode: {
    name: 'setmode',
    description: 'Change bot mode (public/private)',
    category: 'owner',
    async execute(sock, m, args, { sender, isOwner, config }) {
        if (!isOwner) return;
        
        const newMode = args[0]?.toLowerCase();
        
        if (!newMode || (newMode !== 'public' && newMode !== 'private')) {
            return await sock.sendMessage(sender, { 
                text: '❌ Usage: .setmode public OR .setmode private' 
            });
        }
        
        config.mode = newMode;
        
        await sock.sendMessage(sender, { 
            text: `✅ Mode changed to: *${newMode.toUpperCase()}*` 
        });
        
        // Broadcast to all groups (optional)
        if (newMode === 'private') {
            const groups = await sock.groupFetchAllParticipating();
            for (const group of Object.values(groups)) {
                await sock.sendMessage(group.id, { 
                    text: `🔐 *Bot is now in PRIVATE mode*\nOnly owner can use commands.` 
                });
            }
        }
    }
}
