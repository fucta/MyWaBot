const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { profileBanner } = require("../lib/canvas");
const {
  prepareWAMessageMedia
} = require("@whiskeysockets/baileys");

async function getBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function loadPlugins(dir) {
    const plugins = [];

    for (const file of fs.readdirSync(dir)) {
        const filePath = path.join(dir, file);

        if (fs.statSync(filePath).isDirectory()) {
            plugins.push(...loadPlugins(filePath));
            continue;
        }

        if (!file.endsWith(".js")) continue;

        try {
            delete require.cache[require.resolve(filePath)];
            const plugin = require(filePath);

            if (plugin.command) {
                plugins.push(plugin);
            }
        } catch (err) {
            console.log(`Failed to load ${file}:`, err.message);
        }
    }

    return plugins;
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

module.exports = {
    command: ["menu", "help"],
    tags: "main",

    async run({ sock, msg, args, prefix, isGroup, isOwner, jid }) {
        const plugins = loadPlugins(__dirname);
        const groups = {};
        const sourceUrl = global.sourceUrl;

        const now = new Date();
        const date = now.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        const time = now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).replace(":", ".");
        const description = `${date} ${time}`;

        for (const plugin of plugins) {
            const tag = (plugin.tags || "other").toLowerCase();

            if (!isGroup && tag === "group") continue;
            if (!isOwner && tag === "owner") continue;

            if (!groups[tag]) groups[tag] = [];

            const command = Array.isArray(plugin.command)
                ? plugin.command[0]
                : plugin.command;

            groups[tag].push({ command });
        }

        const userJid = msg.key.participantAlt || msg.key.participant || msg.participant || msg.key.remoteJid;
        const number = userJid.split("@")[0];

        if (args.length) {
            const tag = args.join(" ").toLowerCase();

            if (!groups[tag]) {
                return sock.sendReply(msg, "Menu not found.");
            }

            let text = `_Menu ${capitalize(tag)}_\n`;
            text += groups[tag]
                .map((v, i) => `${i + 1}. ${prefix}${v.command}`)
                .join("\n");

            return sock.sendReply(msg, text);
        }

        const pp = await sock
            .profilePictureUrl(userJid, "image")
            .catch(() => "https://i.img402.dev/0lpz85j01i.jpg");

        const image = await profileBanner({
            background: "https://i.img402.dev/ruj8ahrntb.jpg",
            profile: pp,
            size: 200,
            offsetY: 15,
            borderWidth: 2
        });

        let text = `Hello @${number}.\n\n`;

        const sections = [];
        let no = 1;

        for (const [tag, commands] of Object.entries(groups)) {
            sections.push(
                `_Menu ${capitalize(tag)}_\n` +
                commands
                    .map(v => `${no++}. ${prefix}${v.command}`)
                    .join("\n")
            );
        }

        const readMore = "\u200E".repeat(4000);
        text = `Hello @${number}.\n${readMore}\n${sections.join("\n\n")}`;

        const compressed = await sharp(image)
            .resize(1024, 576, {
                fit: "inside",
                withoutEnlargement: true
            })
            .jpeg({ quality: 90 })
            .toBuffer();

        const mediaMessage = await prepareWAMessageMedia(
            { image: compressed },
            {
                upload: sock.waUploadToServer,
                mediaTypeOverride: "thumbnail-link"
            }
        );

        let contextInfo = {};

        if (msg?.key) {
            const participant = msg.key.fromMe
                ? sock.user.id
                : (msg.key.participantAlt || msg.key.participant || msg.participant);

            let quotedMessage = msg.message || {};

            const type = Object.keys(quotedMessage)[0];
            if (type && quotedMessage[type]?.contextInfo) {
                quotedMessage = {
                    [type]: {
                        ...quotedMessage[type]
                    }
                };
                delete quotedMessage[type].contextInfo;
            }

            contextInfo = {
                stanzaId: msg.key.id,
                participant,
                quotedMessage,
                mentionedJid: [userJid]
            };

            if (jid !== msg.key.remoteJid) {
                contextInfo.remoteJid = msg.key.remoteJid;
            }
        }

        const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        await sock.relayMessage(
            jid || msg.key.remoteJid,
            {
                extendedTextMessage: {
                    text: `${sourceUrl}\n\n${text}`,
                    matchedText: sourceUrl,
                    title: `© ${global.botName} - v${global.version} (${global.isPublic ? 'Public' : 'Self'})`,
                    description: description,
                    previewType: 0,
                    renderLargerThumbnail: true,
                    jpegThumbnail: mediaMessage.imageMessage.jpegThumbnail,
                    thumbnailDirectPath: mediaMessage.imageMessage.directPath,
                    thumbnailSha256: mediaMessage.imageMessage.fileSha256,
                    thumbnailEncSha256: mediaMessage.imageMessage.fileEncSha256,
                    mediaKey: mediaMessage.imageMessage.mediaKey,
                    mediaKeyTimestamp: mediaMessage.imageMessage.mediaKeyTimestamp,
                    thumbnailWidth: 1024,
                    thumbnailHeight: 576,
                    contextInfo
                }
            },
            {
                messageId: messageId
            }
        );
    }
};