global.instantEditor = global.instantEditor || {};

module.exports = {
    async run({ sock, msg, jid, body }) {
        const session = global.instantEditor[jid];
        if (!session) return;

        if (Date.now() > session.timeout) {
            delete global.instantEditor[jid];
            return;
        }

        const quotedId = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;

        if (quotedId !== session.messageId) return;

        const styles = {
            "1": "ink",
            "2": "3d-cartoon",
            "3": "anime"
        };

        const style = styles[body.trim()];

        if (!style) {
            return sock.sendReply(
                msg,
                "Current setting :\n\n1. ink\n2. 3d-cartoon\n3. anime"
            );
        }

        let wait = await sock.sendWait(jid, msg);

        const data = await neoxr("/instant-editor", {
            image: session.image,
            style
        });

        delete global.instantEditor[jid];

        if (!data.status) {
            return sock.sendError(jid, wait);
        }

        await sock.sendImage(jid, data.data.url, msg);
        await sock.sendSuccess(jid, wait);
    }
};