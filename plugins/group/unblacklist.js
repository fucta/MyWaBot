const fs = require("fs");
const path = require("path");

const dbFile = path.join(__dirname, "../../database/blacklist.json");

module.exports = {
    command: ["unblacklist"],
    tags: "group",
    group: true,
    admin: true,
    botAdmin: true,

    async run({ sock, msg, jid, args }) {
        if (!fs.existsSync(dbFile)) {
            return sock.sendReply(msg, "Blacklist database not found.");
        }

        const db = JSON.parse(fs.readFileSync(dbFile));

        if (!db[jid]) {
            return sock.sendReply(msg, "Blacklist is empty.");
        }

        const target =
            msg.message?.extendedTextMessage?.contextInfo?.participantAlt ||
            msg.message?.extendedTextMessage?.contextInfo?.participant ||
            (args[0]
                ? args[0].replace(/\D/g, "") + "@s.whatsapp.net"
                : null);

        if (!target) {
            return sock.sendReply(msg, "Reply to a user or enter a number.");
        }

        const id = target.split("@")[0];

        db[jid] = db[jid].filter(v => v !== id);

        fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));

        sock.sendReply(msg, "User removed from blacklist.");
    }
};