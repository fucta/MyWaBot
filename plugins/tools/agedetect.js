const {
    downloadContentFromMessage
} = require("@whiskeysockets/baileys");
const axios = require('axios');

const upload = require("../../lib/upload");

module.exports = {
    command: ["agedetect"],
    tags: "tools",

    async run({ sock, msg, jid, prefix, command }) {
        try {
            const quoted =
                msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            const directImage = msg.message?.imageMessage;

            let media = null;

            if (quoted?.imageMessage) {
                media = quoted.imageMessage;
            } else if (directImage) {
                media = directImage;
            } else {
                return sock.sendReply(msg, `_Reply to image or send image with caption ${prefix + command}_`);
            }

            let wait = await sock.sendWait(jid, msg)

            const stream = await downloadContentFromMessage(
                media,
                "image"
            );

            let buffer = Buffer.alloc(0);

            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const url = await upload(buffer);
            
            const data = await neoxr('/age', {
              image: url
            })
            if (!data.status) {
              return sock.sendError(jid, wait)
            }
            
            let capt = `_Age:_ ${data.data.age}\n`
            capt += `_Gender:_ ${data.data.gender}`
            await sock.sendReply(msg, capt);
            await sock.sendSuccess(jid, wait)
        } catch (err) {
            console.log(err);
            return sock.sendReply(msg, "Failed enchant.");
        }
    }
};