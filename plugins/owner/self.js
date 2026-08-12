module.exports = {
    command: ["self"],
    tags: "owner",
    owner: true,
    async run({ sock, msg, args }) {
        const option = (args[0] || "").toLowerCase();

        if (!option) {
            return sock.sendReply(msg, `Self Mode\n\nStatus: ${global.isPublic ? "PUBLIC" : "SELF"}\n\nUsage: self on/off`);
        }

        if (option === "on") {
            global.isPublic = false;
            return sock.sendReply(msg, "✅ Bot changed to SELF mode. Only owner can use the bot.");
        }

        if (option === "off") {
            global.isPublic = true;
            return sock.sendReply(msg, "✅ Bot changed to PUBLIC mode. Everyone can use the bot.");
        }

        return sock.sendReply(msg, "_Example: self on/off_");
    }
};