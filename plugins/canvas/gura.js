const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const upload = require("../../lib/upload");

module.exports = {
    command: ["gura", "gawr", "gawrgura"],
    tags: "canvas",
    async run({ sock, msg, jid, args, command, prefix }) {
        try {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            let imageUrl = args[0]

            if (!imageUrl && !quoted?.imageMessage) {
                return sock.sendReply(msg, `_Reply pics or send URL with ${prefix + command}_`, msg)
            }

            let wait = await sock.sendWait(jid, msg)

            if (quoted?.imageMessage) {
                const stream = await downloadContentFromMessage(
                    quoted.imageMessage,
                    "image"
                );

                let buffer = Buffer.alloc(0);

                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }

                imageUrl = await upload(buffer);
            }

            const response = await nexray.get("/canvas/gura", {
              url: imageUrl
            })

            if (!response) {
                await sock.sendReply(msg, 'Failed to generate image.', msg)
                await sock.sendSuccess(jid, wait)
                return
            }

            await sock.sendImage(jid, Buffer.from(response, "binary"), msg)
            await sock.sendSuccess(jid, wait)
        } catch(err) {
            console.log(err)
            return sock.sendReply(msg, 'Failed generating image.', msg)
        }
    }
}