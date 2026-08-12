const {
    downloadContentFromMessage
} = require("@whiskeysockets/baileys");
const axios = require('axios');

const upload = require("../../lib/upload");

module.exports = {
    command: ["tourl"],
    tags: "tools",

    async run({ sock, msg, jid, prefix, command }) {
        try {
            const quoted =
                msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (!quoted?.imageMessage) {
                return sock.sendReply(msg, `_Reply pics with a ${prefix + command} command._`);
            }
            
            let wait = await sock.sendWait(jid, msg)
            const stream = await downloadContentFromMessage(
                quoted.imageMessage,
                "image"
            );

            let buffer = Buffer.alloc(0);

            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const url = await upload(buffer);
            await sock.sendReply(msg, url);
            await sock.sendSuccess(jid, wait)
        } catch (err) {
            console.log(err);
            return sock.sendReply(msg, "Failed enchant.");
        }
    }
};