const {
    downloadContentFromMessage
} = require("@whiskeysockets/baileys");

const upload = require("../../lib/upload");

global.instantEditor = global.instantEditor || {};

module.exports = {
    command: ["instant-editor"],
    tags: "ai",

    async run({ sock, msg, jid, prefix, command }) {
        try {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (!quoted?.imageMessage) {
                return sock.sendReply(
                    msg,
                    `_Reply to an image with ${prefix + command}._`
                );
            }

            const stream = await downloadContentFromMessage(
                quoted.imageMessage,
                "image"
            );

            let buffer = Buffer.alloc(0);

            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const image = await upload(buffer);

            const sent = await sock.sendReply(
                msg,
                `Reply to this message with a style number.

Current styles:
• 1. ink
• 2. 3d-cartoon
• 3. anime`
            );

            global.instantEditor[jid] = {
                image,
                messageId: sent.key.id,
                timeout: Date.now() + 60000
            };

        } catch (err) {
            console.log(err);
            sock.sendReply(msg, "Failed to load image.");
        }
    }
};