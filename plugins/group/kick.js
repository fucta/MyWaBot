module.exports = {
    command: ["kick"],
    tags: "group",
    group: true,
    admin: true,
    botAdmin: true,
    async run({ sock, msg, jid, isGroup, isAdmin, isBotAdmin }) {
        const target = msg.message?.extendedTextMessage?.contextInfo?.participant ||
                       msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

        if (!target) return sock.sendReply(msg, "_Reply or tag a user._");

        await sock.groupParticipantsUpdate(jid, [target], "remove");
        return sock.sendReply(msg, "Done.");
    }
};