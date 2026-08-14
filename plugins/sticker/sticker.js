const fs = require("fs");
const path = require("path");
const {
    downloadContentFromMessage
} = require("@whiskeysockets/baileys");

const { image, video } = require("../../lib/sticker");

module.exports = {
    command: ["sticker", "s"],
    tags: "sticker",
    async run({ sock, msg, args, prefix, command }) {
        try {
            const quoted =
                msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            const directImage = msg.message?.imageMessage;
            const directVideo = msg.message?.videoMessage;

            let mediaType = null;
            let media = null;

            if (quoted?.imageMessage) {
                mediaType = "image";
                media = quoted.imageMessage;
            } else if (quoted?.videoMessage) {
                mediaType = "video";
                media = quoted.videoMessage;
            } else if (directImage) {
                mediaType = "image";
                media = directImage;
            } else if (directVideo) {
                mediaType = "video";
                media = directVideo;
            } else {
                return sock.sendMessage(
                    msg.key.remoteJid,
                    {
                        text: `_Reply to image/video or send image/video with caption ${prefix + command}_`
                    },
                    { quoted: msg }
                );
            }

            if (mediaType === "video") {
                const seconds = media.seconds || 0;

                if (seconds > 8) {
                    return sock.sendMessage(
                        msg.key.remoteJid,
                        {
                            text: "Durasi video maksimal 8 detik."
                        },
                        { quoted: msg }
                    );
                }
            }

            if ((media.fileLength || 0) > 10 * 1024 * 1024) {
                return sock.sendMessage(
                    msg.key.remoteJid,
                    {
                        text: "Ukuran media maksimal 10MB."
                    },
                    { quoted: msg }
                );
            }

            const wait = await sock.sendWait(msg.key.remoteJid, msg);

            const stream = await downloadContentFromMessage(
                media,
                mediaType
            );

            let buffer = Buffer.from([]);

            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const tempDir = path.join(__dirname, "../temp");

            if (!fs.existsSync(tempDir))
                fs.mkdirSync(tempDir, { recursive: true });

            const input = path.join(
                tempDir,
                `input_${Date.now()}.${mediaType === "image" ? "jpg" : "mp4"}`
            );

            const output = path.join(
                tempDir,
                `output_${Date.now()}.webp`
            );

            fs.writeFileSync(input, buffer);

            if (mediaType === "image") {
                await image(input, output);
            } else {
                await video(input, output);
            }

            const stickerBuffer = fs.readFileSync(output);

            await sock.sendSticker(msg.key.remoteJid, stickerBuffer, msg);
            await sock.sendSuccess(msg.key.remoteJid, wait);

            if (fs.existsSync(input)) fs.unlinkSync(input);
            if (fs.existsSync(output)) fs.unlinkSync(output);

        } catch (err) {
            console.error(err);

            await sock.sendMessage(
                msg.key.remoteJid,
                {
                    text: `❌ Gagal membuat sticker.\n\n${err.message}`
                },
                { quoted: msg }
            );
        }
    }
};