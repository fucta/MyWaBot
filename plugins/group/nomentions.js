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
    command: ["antimention"],
    tags: "group",
    group: true,
    admin: true,
    botAdmin: true,

    async run({ sock, msg, jid, args }) {
        if (!db[jid]) db[jid] = {};

        const option = (args[0] || "").toLowerCase();

        if (!option) {
            return sock.sendReply(
                msg,
                `Anti Mention\n\nStatus: ${db[jid].antimention ? "ON" : "OFF"}`
            );
        }

        if (option === "on") {
            db[jid].antimention = true;
            save();
            return sock.sendReply(msg, "Anti Mention has been enabled.");
        }

        if (option === "off") {
            db[jid].antimention = false;
            save();
            return sock.sendReply(msg, "Anti Mention has been disabled.");
        }

        return sock.sendReply(msg, "_Example: antimention on/off_");
    }
};