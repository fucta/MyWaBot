const {
default: makeWASocket,
jidDecode,
Browsers,
DisconnectReason,
useMultiFileAuthState,
fetchLatestBaileysVersion,
delay,
prepareWAMessageMedia
} = require("@whiskeysockets/baileys");
const makeSender = require("./lib/sender");
const readline = require("readline");
const pino = require("pino");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const config = require("./config.json");
const blacklistPath = path.join(__dirname, "database/blacklist.json");
Object.assign(global, config);
require("./lib/APi/neoxr");
require("./lib/APi/nexray");
require("./lib/APi/siputzx");

const question = (text) => {
const rl = readline.createInterface({
input: process.stdin,
output: process.stdout
});
return new Promise((resolve) => {
rl.question(text, (answer) => {
resolve(answer.trim());
});
});
};

function loadPlugins(dir, plugins) {
if (!fs.existsSync(dir)) return;

const files = fs.readdirSync(dir);  
  
for (const file of files) {  
    const fullPath = path.join(dir, file);  
    const stat = fs.statSync(fullPath);  
      
    if (stat.isDirectory()) {  
        loadPlugins(fullPath, plugins);  
    } else if (file.endsWith(".js")) {  
        try {  
            const plugin = require(fullPath);  
            plugins.push(plugin);  
        } catch (e) {  
            console.error(`❌ Failed to load plugin ${fullPath}:`, e.message);  
        }  
    }  
}

}

async function System() {
try {
const { state, saveCreds } = await useMultiFileAuthState('sessions');
const { version } = await fetchLatestBaileysVersion();

const sock = makeWASocket({  
        version,  
        logger: pino({ level: "silent" }),  
        auth: state,  
        printQRInTerminal: false,  
        markOnlineOnConnect: false,  
        browser: Browsers.windows("Edge")  
    });  
      
    makeSender(sock);  
    global.plugins = [];  
    const pluginsDir = path.join(__dirname, "plugins");  
      
    loadPlugins(pluginsDir, global.plugins);  

    if (!sock.authState.creds.registered) {  
        console.log('Masukkan nomor WhatsApp Anda (contoh: 6281234567890)');  
        const phoneNumber = await question("Nomor: ");  

        try {  
            console.log('Meminta pairing code...');  
            await delay(3000);  
            let code = await sock.requestPairingCode(phoneNumber.trim());  
            code = code.match(/.{1,4}/g)?.join("-") || code;  
            console.log(`Pairing Code: ${code}`);  
            console.log('Masukkan kode ini di WhatsApp Anda');  
        } catch (error) {  
            console.log(error)  
            console.error('Gagal mendapatkan pairing code:', error.message);  
            console.log('Coba lagi...');  
            return System();  
        }  
    }  

    sock.ev.on('connection.update', async (update) => {  
        const { connection, lastDisconnect } = update;  

        if (connection === 'connecting') {  
            console.log('Menghubungkan...');  
        } else if (connection === 'close') {  
            const reason = lastDisconnect?.error?.output?.statusCode || 'Unknown';  
            console.log(`Koneksi terputus (${reason})`);  

            if (reason !== DisconnectReason.loggedOut && sock.authState.creds.registered) {  
                setTimeout(System, 5000);  
            }  
        } else if (connection === 'open') {  
            console.log('Koneksi berhasil!');  
            console.log(`Nama: ${sock.user?.name || 'Tidak diketahui'}`);  
            console.log(`ID: ${sock.user?.id || 'Tidak diketahui'}`);  
            console.log('Bot siap digunakan!');  
            console.log(`Total plugins: ${plugins.length}`);  
        }  
    });  

    sock.ev.on("group-participants.update", async (update) => {  
        try {  
            const { id, participants, action } = update;  

            for (const participant of participants) {  
                const user = participant.id || participant.lid || participant.phoneNumber || participant;  
                const number = user.split("@")[0];  
                
                let pp;  
                try {  
                    pp = await sock.profilePictureUrl(user, "image");  
                } catch (err) {  
                    pp = "https://i.img402.dev/0lpz85j01i.jpg";  
                }  

                const response = await fetch(pp);  
                const buffer = Buffer.from(await response.arrayBuffer());  
                
                const compressed = await sharp(buffer)  
                    .resize(1024, 576, {  
                        fit: "inside",  
                        withoutEnlargement: true  
                    })  
                    .jpeg({ quality: 90 })  
                    .toBuffer();  

                const { imageMessage: im } = await prepareWAMessageMedia(  
                    { image: compressed },  
                    {  
                        upload: sock.waUploadToServer,  
                        mediaTypeOverride: "thumbnail-link"  
                    }  
                );  

                const text = action === "add"   
                    ? `Welcome @${number} to the group! 🎉\n\nEnjoy your stay!`  
                    : `Goodbye @${number} 👋\n\nWe will miss you!`;  

                await sock.relayMessage(  
                    id,  
                    {  
                        extendedTextMessage: {  
                            text: `${global.groupUrl}\n\n${text}`,
                            matchedText: global.groupUrl,
                            title: action === "add" ? "👋 New Member" : "🚪 Member Left",  
                            description: `@${number} ${action === "add" ? "joined" : "left"} the group`,  
                            previewType: 0,  
                            renderLargerThumbnail: true,  
                            jpegThumbnail: im.jpegThumbnail,  
                            thumbnailDirectPath: im.directPath,  
                            thumbnailSha256: im.fileSha256,  
                            thumbnailEncSha256: im.fileEncSha256,  
                            mediaKey: im.mediaKey,  
                            mediaKeyTimestamp: im.mediaKeyTimestamp,  
                            thumbnailWidth: 1024,  
                            thumbnailHeight: 576,  
                            contextInfo: {  
                                mentionedJid: [user]  
                            }  
                        }  
                    },  
                    {}  
                );  
            }  
        } catch (err) {  
            console.error("Welcome/Leave Error:", err);  
        }  
    });  

    sock.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const msg = messages[0];
            const id = msg.key.id;
            if (!msg) return;
            if (!msg.message) return;
            if (!id.startsWith("AC") && id.length < 32) return;

            const isOwnPoll = !!msg.message.pollCreationMessageV3;
            if (msg.key.fromMe && !isOwnPoll) return;

            if (!global.isPublic) {
                const sender = msg.key.participantAlt ||
                              msg.key.participant ||
                              msg.participant ||
                              msg.key.remoteJid;
                const senderNumber = sender.split("@")[0];
                const isOwner = global.owners.some(owner => owner.id === senderNumber);
                if (!isOwner) return;
            }

            sock.decodeJid = (jid) => {
                if (!jid) return jid;
                if (/:\d+@/gi.test(jid)) {
                    const decode = jidDecode(jid) || {};
                    return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
                }
                return jid;
            };

            const timestamp = Date.now();
            const dateObject = new Date(timestamp);
            const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            const dayName = days[dateObject.getDay()];
            const date = dateObject.getDate();
            const month = dateObject.getMonth() + 1;
            const year = dateObject.getFullYear();

            console.log(`Pesan dari: ${msg.pushName || 'Tidak diketahui'}`);
            console.log(`Waktu: ${dayName}, ${date}/${month}/${year}`);

            let messageText = null;
            if (msg.message?.extendedTextMessage?.text) {
                messageText = msg.message.extendedTextMessage.text;
            } else if (msg.message?.conversation) {
                messageText = msg.message.conversation;
            } else if (msg.message?.imageMessage?.caption) {
                messageText = msg.message.imageMessage.caption;
            } else if (msg.message?.videoMessage?.caption) {
                messageText = msg.message.videoMessage.caption;
            }

            console.log(`Pesan: ${messageText || '[Media/Sticker]'}`);

            for (const plugin of global.plugins) {
                try {
                    if (plugin.command || !plugin.run) continue;

                    await plugin.run({
                        sock,
                        msg,
                        body: messageText || "",
                        jid: msg.key.remoteJid,
                        sender: msg.key.participantAlt ||
                                 msg.key.participant ||
                                 msg.participant ||
                                 msg.key.remoteJid
                    });
                } catch (e) {
                    console.error("Error listener plugin:", e);
                }
            }

            if (!messageText) return;

            const prefixes = [".", "!", "#", "/", ""];  

            let prefix = "";  
            let body = messageText.trim();  

            for (const p of prefixes) {  
                if (p === "") continue;  

                if (body.startsWith(p)) {  
                    prefix = p;  
                    body = body.slice(p.length).trim();  
                    break;  
                }  
            }  

            const parts = body.split(/\s+/);  
            const command = parts.shift()?.toLowerCase();  
            const args = parts;  

            const jid = msg.key.remoteJid;  
            const sender = msg.key.participantAlt ||
                           msg.key.participant ||
                           msg.participant ||
                           msg.key.remoteJid;

            const senderNumber = sender.split("@")[0];
            const isOwner = global.owners.some(owner => owner.id === senderNumber);

            const isGroup = jid.endsWith("@g.us");  

            let groupMetadata = null;  
            let isAdmin = false;  
            let isBotAdmin = false;  

            if (isGroup) {  
                try {  
                    groupMetadata = await sock.groupMetadata(jid);  

                    const senderJid = sock.decodeJid(sender);  

                    const senderParticipant = groupMetadata.participants.find(  
                        p =>  
                            p.id === senderJid ||  
                            p.phoneNumber === senderJid  
                    );  

                    const botNumber = sock.user.id.split(":")[0] + "@s.whatsapp.net";  

                    const botParticipant = groupMetadata.participants.find(  
                        p =>  
                            p.id === sock.decodeJid(sock.user.id) ||  
                            p.phoneNumber === botNumber  
                    );  

                    isAdmin = ["admin", "superadmin"].includes(senderParticipant?.admin);  
                    isBotAdmin = ["admin", "superadmin"].includes(botParticipant?.admin);  
                } catch (e) {  
                    console.error(e);  
                }  
            }  

            const dbPath = path.join(__dirname, "database/groups.json");  

            if (isGroup && isBotAdmin && fs.existsSync(dbPath)) {  
                const db = JSON.parse(fs.readFileSync(dbPath));  

                if (db[jid]?.nolink) {  
                    const text =  
                        msg.message?.conversation ||  
                        msg.message?.extendedTextMessage?.text ||  
                        msg.message?.imageMessage?.caption ||  
                        msg.message?.videoMessage?.caption ||  
                        "";  

                    const isLink = /https?:\/\/|www\.|chat\.whatsapp\.com/i.test(text);  

                    if (isLink && !isAdmin) {  
                        await sock.sendMessage(jid, {  
                            delete: msg.key  
                        });  

                        return;  
                    }  
                }  
            }  
              
            if (isGroup && isBotAdmin && fs.existsSync(blacklistPath)) {  
                const blacklistDb = JSON.parse(fs.readFileSync(blacklistPath));  
                  
                if (blacklistDb[jid]) {  
                    const senderJid = msg.key.participantAlt ||   
                                    msg.key.participant ||   
                                    msg.key.remoteJid;  
                      
                    if (senderJid) {  
                        const senderNumber = senderJid.split("@")[0];  
                          
                        if (blacklistDb[jid].includes(senderNumber)) {  
                            await sock.sendMessage(jid, {  
                                delete: msg.key  
                            });  
                            return;  
                        }  
                    }  
                }  
            }  

            let pluginFound = false;  

            for (const plugin of global.plugins) {  
                try {  
                    if (!plugin.command || !plugin.run) continue;  

                    if (plugin.command.includes(command)) {  

                        if (plugin.group && !isGroup)  
                            return sock.sendReply(msg, "This command can only be used in groups.");  

                        if (plugin.admin && !isAdmin)  
                            return sock.sendReply(msg, "Admin only.");  

                        if (plugin.botAdmin && !isBotAdmin)  
                            return sock.sendReply(msg, "Bot must be an admin.");  

                        if (plugin.owner && !isOwner)  
                            return sock.sendReply(msg, "Owner only.");  

                        await plugin.run({  
                            sock,  
                            msg,  
                            body: messageText,  
                            jid,  
                            sender,  
                            args,  
                            command,  
                            prefix, 
                            isOwner,
                            isGroup,  
                            isAdmin,  
                            isBotAdmin,  
                            groupMetadata  
                        });  

                        pluginFound = true;  
                        break;  
                    }  

                } catch (e) {  
                    console.error(  
                        `Error in plugin ${plugin.command?.join(",") || "listener"}:`,  
                        e  
                    );  
                }  
            }  

        } catch (error) {  
            console.error('Error pada messages.upsert:', error.message);  
            console.error(error.stack);  
        }  
    });  

    sock.ev.on('creds.update', saveCreds);  

    return sock;  

} catch (error) {  
    console.error('Error System:', error.message);  
    console.log('Mencoba ulang dalam 5 detik...');  
    setTimeout(System, 5000);  
}

}

console.log('Starting WhatsApp Bot...');
console.log('Pastikan nomor WhatsApp Anda aktif');

System().catch(error => {
console.error('Fatal Error:', error);
process.exit(1);
});

process.on('SIGINT', () => {
console.log('\nBot dihentikan');
process.exit(0);
});