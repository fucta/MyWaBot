const {
    downloadContentFromMessage
} = require("@whiskeysockets/baileys");

const upload = require("../../lib/upload");

module.exports = {
    command: ["hd"],
    tags: "tools",

    async run({ sock, msg, jid, prefix, command }) {
        try {
            const quoted =
                msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (!quoted) {
                return sock.sendReply(msg, `_Reply to an image or video with ${prefix + command} command._`);
            }

            if (quoted?.imageMessage) {
                return await processImage(sock, msg, quoted, jid);
            }
            
            if (quoted?.videoMessage) {
                return await processVideo(sock, msg, quoted, jid);
            }

            return sock.sendReply(msg, `_Reply to an image or video with ${prefix + command} command._`);

        } catch (err) {
            console.log(err);
            return sock.sendReply(msg, "Failed to process media.");
        }
    }
};

async function processImage(sock, msg, quoted, jid) {
    try {
        let wait = await sock.sendWait(jid, msg);
        
        const stream = await downloadContentFromMessage(
            quoted.imageMessage,
            "image"
        );

        let buffer = Buffer.alloc(0);

        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const url = await upload(buffer);
        
        const data = await neoxr('/upscale', {
            image: url
        });
        
        const image = data.data.url;
        if (!data.status) {
            return sock.sendError(jid, wait);
        }
        
        await sock.sendImage(jid, image, msg);
        await sock.sendSuccess(jid, wait);
        
    } catch (err) {
        console.log(err);
        return sock.sendReply(msg, "Failed to enhance image.");
    }
}

async function processVideo(sock, msg, quoted, jid) {
    try {
        let wait = await sock.sendWait(jid, msg);
        
        const stream = await downloadContentFromMessage(
            quoted.videoMessage,
            "video"
        );

        let buffer = Buffer.alloc(0);

        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const videoUrl = await upload(buffer);
        
        const data = await nexray.get('/tools/v1/hdvideo', {
            url: videoUrl,
            resolusi: 'hd'
        });
        
        if (!data.status) {
            return sock.sendError(jid, wait);
        }

        await sock.sendVideo(jid, data.result, "", msg);
        await sock.sendSuccess(jid, wait);
        
    } catch (err) {
        console.log(err);
        return sock.sendReply(msg, "Failed to enhance video.");
    }
}