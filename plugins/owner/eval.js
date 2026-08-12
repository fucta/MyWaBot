module.exports = {
    command: ["eval", "=>"],
    tags: "owner",
    owner: true,

    async run({ sock, msg, args, jid }) {
        let code = args.join(" ");

        const quoted =
            msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!code && quoted) {
            code =
                quoted.conversation ||
                quoted.extendedTextMessage?.text ||
                quoted.imageMessage?.caption ||
                quoted.videoMessage?.caption ||
                "";
        }

        if (!code) {
            return sock.sendReply(
                msg,
                "Please provide JavaScript code."
            );
        }

        try {
            const result = await eval(`(async () => {
                ${code}
            })()`);

            await sock.sendReply(
                msg,
                result === undefined
                    ? "Code executed successfully."
                    : String(result)
            );

        } catch (error) {
            await sock.sendReply(
                msg,
                error.stack || String(error)
            );
        }
    }
};