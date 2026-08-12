module.exports = {
    command: ["fakedana", "dana", "fakedana"],
    tags: "canvas",
    async run({ sock, msg, jid, args, command, prefix }) {
        try {
            if (!args[0]) {
                return sock.sendReply(msg, `_Example: ${prefix + command} 100000_`, msg)
            }

            const nominal = args[0]?.trim()

            if (!nominal || isNaN(nominal)) {
                return sock.sendReply(msg, `_Format: ${prefix + command} nominal_\n_Example: ${prefix + command} 100000_`, msg)
            }

            let wait = await sock.sendWait(jid, msg)

            const response = await nexray.get("/maker/fakedana", {
                nominal: nominal
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