const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const upload = require("../../lib/upload");

module.exports = {
    command: ["upscale", "enhance"],
    tags: "tools",
    async run({ sock, msg, jid, args, command, prefix }) {
        try {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const directImage = msg.message?.imageMessage;
            let imageUrl = args[0]
            let resolusi = args[1] || "16"

            if (!imageUrl && !quoted?.imageMessage && !directImage) {
                return sock.sendReply(msg, `_Reply image, send image with caption, or send URL with ${prefix + command}_`, msg)
            }

            let wait = await sock.sendWait(jid, msg)

            let media = null;
            
            if (quoted?.imageMessage) {
                media = quoted.imageMessage;
            } else if (directImage) {
                media = directImage;
            }

            if (media) {
                const stream = await downloadContentFromMessage(
                    media,
                    "image"
                );

                let buffer = Buffer.alloc(0);

                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }

                imageUrl = await upload(buffer);
            }

            const response = await nexray.get("/tools/upscale", {
                url: imageUrl,
                resolusi: resolusi
            })

            if (!response) {
                await sock.sendReply(msg, 'Failed to upscale image.', msg)
                await sock.sendSuccess(jid, wait)
                return
            }

            await sock.sendImage(jid, Buffer.from(response, "binary"), msg)
            await sock.sendSuccess(jid, wait)
        } catch(err) {
            console.log(err)
            return sock.sendReply(msg, 'Failed upscaling image.', msg)
        }
    }
}