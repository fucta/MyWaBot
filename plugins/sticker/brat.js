const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { image, video } = require("../../lib/sticker");
const { bratGen } = require("brat-canvas");
const { bratVid } = require("brat-canvas/video");

module.exports = {
    command: ["brat"],
    tags: "sticker",

    async run({ sock, msg, jid, args, prefix, command }) {
        try {
            const index = args.indexOf("--vid");
            const isVideo = index !== -1;

            if (isVideo) args.splice(index, 1);

            const text = args.join(" ").trim();

            if (!text) {
                return sock.sendReply(
                    msg,
`Example:
${prefix + command} Hello World
${prefix + command} --vid Hello World
${prefix + command} Hello World --vid

Options:
--vid   Generate animated Brat sticker.`
                );
            }

            const wait = await sock.sendWait(jid, msg);

            const tempDir = path.join(__dirname, "../temp");

            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            const timestamp = Date.now();

            const output = path.join(
                tempDir,
                `brat_${timestamp}.webp`
            );

            let mediaBuffer;
            
            if (isVideo) {
                mediaBuffer = await bratVid(text, {
                    outputFormat: 'mp4'
                });
            } else {
                mediaBuffer = await bratGen(text);
            }

            const inputExt = isVideo ? "mp4" : "png";
            const input = path.join(
                tempDir,
                `brat_${timestamp}.${inputExt}`
            );
            
            fs.writeFileSync(input, mediaBuffer);

            if (isVideo) {
                await video(input, output);
            } else {
                await image(input, output);
            }

            const stickerBuffer = fs.readFileSync(output);

            await sock.sendSticker(jid, stickerBuffer, msg);
            await sock.sendSuccess(jid, wait);

            if (fs.existsSync(input)) fs.unlinkSync(input);
            if (fs.existsSync(output)) fs.unlinkSync(output);

        } catch (err) {
            console.error(err);
            sock.sendReply(msg, "Failed create sticker.");
        }
    }
};