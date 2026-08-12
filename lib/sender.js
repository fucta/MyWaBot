const fs = require("fs");
const { Sticker } = require("wa-sticker-formatter");

module.exports = function(sock) {

    sock.sendWait = async (jid, quoted) => {
        return await sock.sendMessage(
            jid,
            {
                text: "_In Process..._"
            },
            { quoted }
        );
    };

    sock.sendSuccess = async (jid, message, text = "_Process Success._") => {
        return await sock.sendMessage(
            jid,
            {
                text,
                edit: message.key
            }
        );
    };

    sock.sendError = async (jid, message, text = "_Process Failed._") => {
        return await sock.sendMessage(
            jid,
            {
                text,
                edit: message.key
            }
        );
    };

    sock.sendText = (jid, text, quoted) => {
        return sock.sendMessage(jid, { text }, { quoted });
    };

    sock.sendReply = (msg, text) => {
        return sock.sendMessage(
            msg.key.remoteJid,
            { text },
            { quoted: msg }
        );
    };

    sock.sendSticker = async (jid, sticker, quoted) => {
        const buffer = Buffer.isBuffer(sticker)
            ? sticker
            : fs.readFileSync(sticker);

        const st = new Sticker(buffer, {
            pack: global.botName,
            author: global.name,
            type: "full"
        });

        return sock.sendMessage(
            jid,
            { sticker: await st.toBuffer() },
            { quoted }
        );
    };

    sock.sendImage = (jid, image, captionOrQuoted, quoted) => {
        let caption = "";

        if (typeof captionOrQuoted === "string") {
            caption = captionOrQuoted;
        } else {
            quoted = captionOrQuoted;
        }

        if (Buffer.isBuffer(image)) {
            return sock.sendMessage(
                jid,
                { image, caption },
                { quoted }
            );
        }

        if (typeof image === "string" && /^https?:\/\//.test(image)) {
            return sock.sendMessage(
                jid,
                { image: { url: image }, caption },
                { quoted }
            );
        }

        return sock.sendMessage(
            jid,
            { image: fs.readFileSync(image), caption },
            { quoted }
        );
    };

    sock.sendVideo = (jid, video, caption = "", quoted) => {
        return sock.sendMessage(
            jid,
            {
                video: Buffer.isBuffer(video)
                    ? video
                    : typeof video === "string"
                    ? { url: video }
                    : video,
                caption
            },
            { quoted }
        );
    };

    return sock;
};