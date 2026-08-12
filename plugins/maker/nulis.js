module.exports = {
    command: ["nulis", "tulis", "handwriting"],
    tags: "maker",
    async run({ sock, msg, jid, args, command, prefix }) {
        try {
            if (!args[0]) {
                return sock.sendReply(msg, `_Example: ${prefix + command} hai_`, msg)
            }

            const text = args.join(' ')

            let wait = await sock.sendWait(jid, msg)

            const response = await nexray.get("/maker/nulis", {
                text: text
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