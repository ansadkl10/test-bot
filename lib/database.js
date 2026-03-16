import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Database {
    constructor() {
        this.path = path.join(__dirname, '../database/db.json');
        this.data = this.load();
    }
    
    load() {
        try {
            if (fs.existsSync(this.path)) {
                return JSON.parse(fs.readFileSync(this.path, 'utf-8'));
            }
        } catch (e) {}
        return {
            users: {},
            groups: {},
            economy: {},
            premium: [],
            settings: {}
        };
    }
    
    save() {
        try {
            fs.ensureDirSync(path.dirname(this.path));
            fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2));
        } catch (e) {}
    }
    
    getUser(jid) {
        if (!this.data.users[jid]) {
            this.data.users[jid] = {
                name: '',
                limit: 20,
                exp: 0,
                level: 1,
                registered: Date.now()
            };
            this.save();
        }
        return this.data.users[jid];
    }
    
    getGroup(jid) {
        if (!this.data.groups[jid]) {
            this.data.groups[jid] = {
                welcome: false,
                antilink: false,
                left: false
            };
            this.save();
        }
        return this.data.groups[jid];
    }
    
    isPremium(jid) {
        return this.data.premium?.includes(jid) || false;
    }
}

export default Database;
