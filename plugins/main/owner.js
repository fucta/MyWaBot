module.exports = {
    command: ["owner", "creator"],
    tags: "main",
    description: "Menampilkan kontak owner",

    async run({ sock, msg }) {
        const jid = msg.key.remoteJid;

        const number = global.owners[0].id;

        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${global.name}
TEL;type=CELL;type=VOICE;waid=${number}:${number}
END:VCARD`;

        await sock.sendMessage(
            jid,
            {
                contacts: {
                    displayName: "Billy Istono",
                    contacts: [{ vcard }]
                }
            },
            { quoted: msg }
        );
    }
};