const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const upload = require("../../lib/upload");

module.exports = {
    command: ["musiccard", "music"],
    tags: "canvas",
    async run({ sock, msg, jid, args, command, prefix }) {
        try {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!args[0]) {
                return sock.sendReply(msg, `_Example: ${prefix + command} shape of you|Billt_`, msg)
            }

            const input = args.join(' ').split('|')
            const judul = input[0]?.trim()
            const nama = input[1]?.trim()

            if (!judul || !nama) {
                return sock.sendReply(msg, `_Format: ${prefix + command} judul|nama_\n_Example: ${prefix + command} shape of you|Billt_`, msg)
            }

            let imageUrl = args[2]

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

            if (!imageUrl) {
                return sock.sendReply(msg, `_Reply image or send URL with ${prefix + command}_`, msg)
            }

            let wait = await sock.sendWait(jid, msg)

            const response = await nexray.get("/canvas/musiccard", {
                judul: judul,
                nama: nama,
                image_url: imageUrl
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