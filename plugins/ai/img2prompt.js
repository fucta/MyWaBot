const {
    downloadContentFromMessage
} = require("@whiskeysockets/baileys");
const upload = require("../../lib/upload");

module.exports = {
    command: ["img2prompt", "describe", "prompt"],
    tags: "ai",

    async run({ sock, msg, jid, prefix, command }) {
        try {
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (!quoted?.imageMessage) {
                return sock.sendReply(msg, `_Reply pics with a ${prefix + command} command._`, msg);
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

            const url = await upload(buffer);
            
            const data = await neoxr('/img2prompt', {
              image: url
            })
            
            if (!data.status) {
                await sock.sendReply(msg, 'Failed to generate prompt.', msg)
                await sock.sendSuccess(jid, wait)
                return
            }
            
            let resultText = `_Prompt Description:_\n\n${data.data.prompt}`
            
            await sock.sendReply(msg, resultText, msg)
            await sock.sendSuccess(jid, wait)
        } catch (err) {
            console.log(err);
            return sock.sendReply(msg, "Failed generating prompt.", msg);
        }
    }
};