module.exports = {
    command: ["ceksakit", "potensipenyakit", "cekpenyakit"],
    tags: "primbon",
    async run({ sock, msg, jid, args, command, prefix }) {
        try {
            if (!args[0]) {
                return sock.sendReply(msg, `_Example: ${prefix + command} 12 5 1998_`, msg)
            }

            const input = args.join(' ')
            const parts = input.split(' ')
            
            if (parts.length < 3) {
                return sock.sendReply(msg, `_Format: ${prefix + command} date month year_\n_Example: ${prefix + command} 12 5 1998_`, msg)
            }

            const tgl = parts[0]
            const bln = parts[1]
            const thn = parts[2]

            if (isNaN(tgl) || isNaN(bln) || isNaN(thn)) {
                return sock.sendReply(msg, `_Format: ${prefix + command} date month year_\n_Example: ${prefix + command} 12 5 1998_`, msg)
            }

            let wait = await sock.sendWait(jid, msg)

            const response = await siputzx("/primbon/cek_potensi_penyakit", {
                tgl: tgl,
                bln: bln,
                thn: thn
            })

            if (!response.status || !response.data) {
                await sock.sendReply(msg, 'No results found.', msg)
                await sock.sendSuccess(jid, wait)
                return
            }

            const data = response.data

            let resultText = ``
            
            if (data.analisa) {
                resultText += `- _Analysis:_ ${data.analisa}\n`
            }
            
            if (data.sektor) {
                resultText += `- _Sector:_ ${data.sektor}\n`
            }
            
            if (data.elemen) {
                resultText += `- _Element:_ ${data.elemen}\n`
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