const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../../database/groups.json");

if (!fs.existsSync(path.dirname(dbPath))) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, "{}");
}

const db = JSON.parse(fs.readFileSync(dbPath));

const save = () => {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
};

module.exports = {
    command: ["nolink"],
    tags: "group",
    group: true,
    admin: true,
    botAdmin: true,
    async run({ sock, msg, jid, args, isGroup, isAdmin, isBotAdmin }) {
        if (!db[jid]) db[jid] = {};

        const option = (args[0] || "").toLowerCase();

        if (!option) return sock.sendReply(msg, `No Link\n\nStatus: ${db[jid].nolink ? "ON" : "OFF"}`);
        if (option === "on") {
            db[jid].nolink = true;
            save();
            return sock.sendReply(msg, "No Link has been enabled.");
        }
        if (option === "off") {
            db[jid].nolink = false;
            save();
            return sock.sendReply(msg, "No Link has been disabled.");
        }
        return sock.sendReply(msg, "_Example: nolink on/off_");
    }
};