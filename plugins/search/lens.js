const {
    downloadContentFromMessage
} = require("@whiskeysockets/baileys");

const upload = require("../../lib/upload");

module.exports = {
    command: ["lens"],
    tags: "search",

    async run({ sock, msg, jid, prefix, command }) {
        try {
            const quoted =
                msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (!quoted?.imageMessage) {
                return sock.sendReply(
                    msg,
                    `_Reply to an image with ${prefix + command}._`
                );
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

            const image = await upload(buffer);
            const data = await neoxr('/lens', {
              image
            })
            
            if (!data.status) {
              return sock.sendError(jid, wait)
            }
            
            let capt = ""
            data.data.forEach((data, index) => {
              capt += `${index + 1}.\n`
              capt += `• *Snippet :* ${data.snippet}\n`
              capt += `• *IMG URL :* ${data.imageUrl}\n`
              capt += `• *Source URL :* ${data.source}\n\n`
            })
            await sock.sendReply(msg, capt);
            await sock.sendSuccess(jid, wait);
        } catch (err) {
            console.log(err);
            sock.sendReply(msg, "Failed to load image.");
        }
    }
};