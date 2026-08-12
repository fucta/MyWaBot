module.exports = {
    command: ["fakebank", "jago", "bankjago"],
    tags: "canvas",
    async run({ sock, msg, jid, args, command, prefix }) {
        try {
            if (!args[0]) {
                return sock.sendReply(msg, `_Example: ${prefix + command} billy istono|100000000_`, msg)
            }

            const input = args.join(' ').split('|')
            const nama = input[0]?.trim()
            const saldo = input[1]?.trim() || "0"

            if (!nama) {
                return sock.sendReply(msg, `_Format: ${prefix + command} nama|saldo_\n_Example: ${prefix + command} billy istono|100000000_`, msg)
            }

            let wait = await sock.sendWait(jid, msg)

            const response = await nexray.get("/maker/fakebank-jago", {
                nama: nama,
                saldo: saldo
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