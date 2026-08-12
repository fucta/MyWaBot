module.exports = {
    command: ["artinama", "namameaning"],
    tags: "primbon",
    async run({ sock, msg, jid, args, command, prefix }) {
        try {
            if (!args[0]) {
                return sock.sendReply(msg, `_Example: ${prefix + command} putu_`, msg)
            }

            const nama = args.join(' ')

            let wait = await sock.sendWait(jid, msg)

            const response = await siputzx("/primbon/artinama", {
                nama: nama
            })

            if (!response.status || !response.data) {
                await sock.sendReply(msg, 'No results found.', msg)
                await sock.sendSuccess(jid, wait)
                return
            }

            const data = response.data

            let resultText = ``
            
            if (data.nama) {
                resultText += `- _Name:_ ${data.nama}\n`
            }
            
            if (data.arti) {
                resultText += `- _Meaning:_ ${data.arti}\n`
            }
            
            if (data.catatan) {
                resultText += `- _Note:_ ${data.catatan}`
            }

            await sock.sendReply(msg, resultText.trim(), msg)
            await sock.sendSuccess(jid, wait)
        } catch(err) {
            console.log(err)
            return sock.sendReply(msg, 'Failed to check.', msg)
        }
    }
}