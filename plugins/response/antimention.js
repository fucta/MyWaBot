const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../../database/groups.json");

module.exports = {
    async run({ sock, msg, jid }) {
        if (!jid?.endsWith("@g.us")) return;
        if (!fs.existsSync(dbPath)) return;

        const db = JSON.parse(fs.readFileSync(dbPath));

        if (!db[jid]?.antimention) return;

        const message = msg?.message;
        if (!message) return;

        const isGroupMention = !!message.groupStatusMentionMessage;

        if (!isGroupMention) return;

        try {
            await sock.sendMessage(jid, {
                delete: msg.key
            });
        } catch (err) {
            console.error("Gagal hapus group mention:", err);
        }
    }
};