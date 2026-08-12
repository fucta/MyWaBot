const fs = require("fs");
const path = require("path");

const dbFile = path.join(__dirname, "../../database/blacklist.json");

module.exports = {
    command: ["blacklist"],
    tags: "group",
    group: true,
    admin: true,
    botAdmin: true,

    async run({ sock, msg, jid, args }) {
        if (!fs.existsSync(dbFile)) {
            fs.writeFileSync(dbFile, "{}");
        }

        const db = JSON.parse(fs.readFileSync(dbFile));

        if (!db[jid]) db[jid] = [];

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

        if (db[jid].includes(id)) {
            return sock.sendReply(msg, "User is already blacklisted.");
        }

        db[jid].push(id);

        fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));

        sock.sendReply(msg, "User added to blacklist.");
    }
};