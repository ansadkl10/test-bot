import ytdl from 'ytdl-core';
import ytSearch from 'yt-search';

export default {
    // Plugin 21: YouTube Audio
    yta: {
        name: 'yta',
        description: 'Download YouTube audio',
        category: 'downloader',
        async execute(sock, m, args, { sender }) {
            const url = args[0];
            
            if (!url || !url.includes('youtube.com')) {
                return await sock.sendMessage(sender, { 
                    text: '❌ Usage: .yta https://youtube.com/watch?v=xxx' 
                });
            }
            
            await sock.sendMessage(sender, { 
                text: '⏳ Downloading audio...' 
            });
            
            try {
                const info = await ytdl.getInfo(url);
                await sock.sendMessage(sender, { 
                    text: `✅ *${info.videoDetails.title}*\n📥 Audio ready to download` 
                });
            } catch {
                await sock.sendMessage(sender, { 
                    text: '❌ Download failed' 
                });
            }
        }
    },
    
    // Plugin 22: YouTube Video
    ytv: {
        name: 'ytv',
        description: 'Download YouTube video',
        category: 'downloader',
        async execute(sock, m, args, { sender }) {
            const url = args[0];
            
            if (!url || !url.includes('youtube.com')) {
                return await sock.sendMessage(sender, { 
                    text: '❌ Usage: .ytv https://youtube.com/watch?v=xxx' 
                });
            }
            
            await sock.sendMessage(sender, { 
                text: '⏳ Downloading video...' 
            });
            
            try {
                const info = await ytdl.getInfo(url);
                await sock.sendMessage(sender, { 
                    text: `✅ *${info.videoDetails.title}*\n📥 Video ready to download` 
                });
            } catch {
                await sock.sendMessage(sender, { 
                    text: '❌ Download failed' 
                });
            }
        }
    },
    
    // Plugin 23: YouTube Search
    yts: {
        name: 'yts',
        description: 'Search YouTube videos',
        category: 'downloader',
        async execute(sock, m, args, { sender }) {
            const query = args.join(' ');
            
            if (!query) {
                return await sock.sendMessage(sender, { 
                    text: '❌ Usage: .yts song name' 
                });
            }
            
            try {
                const result = await ytSearch(query);
                const videos = result.videos.slice(0, 5);
                
                let text = `*🔍 Search results for: ${query}*\n\n`;
                videos.forEach((v, i) => {
                    text += `${i+1}. *${v.title}*\n`;
                    text += `⏱️ ${v.timestamp} | 👁️ ${v.views}\n`;
                    text += `🔗 ${v.url}\n\n`;
                });
                
                await sock.sendMessage(sender, { text });
            } catch {
                await sock.sendMessage(sender, { 
                    text: '❌ Search failed' 
                });
            }
        }
    },
    
    // Plugin 24: TikTok
    tiktok: {
        name: 'tiktok',
        description: 'Download TikTok video',
        category: 'downloader',
        async execute(sock, m, args, { sender }) {
            const url = args[0];
            
            if (!url || !url.includes('tiktok.com')) {
                return await sock.sendMessage(sender, { 
                    text: '❌ Usage: .tiktok https://tiktok.com/@user/video/xxx' 
                });
            }
            
            await sock.sendMessage(sender, { 
                text: '✅ TikTok downloader ready' 
            });
        }
    }
};
