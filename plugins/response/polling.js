const {
    decryptPollVote,
    getKeyAuthor,
    jidNormalizedUser
} = require("@whiskeysockets/baileys");

const crypto = require("crypto");

const polls = new Map();

module.exports = {
    async run({ sock, msg }) {
        const message = msg?.message;

        if (!message) return;

        const pollCreation =
            message.pollCreationMessageV3 ||
            message.pollCreationMessage;

        if (pollCreation) {
            if (!msg.key?.fromMe) return;

            const pollId = msg.key.id;

            if (!pollId) return;

            const messageSecret =
                message.messageContextInfo?.messageSecret;

            if (!messageSecret) return;

            polls.set(pollId, {
                message: msg,
                messageSecret,
                options: pollCreation.options || [],
                name: pollCreation.name || "",
                jid: msg.key.remoteJid
            });

            return;
        }

        const pollUpdate =
            message.pollUpdateMessage;

        if (!pollUpdate) return;

        const creationKey =
            pollUpdate.pollCreationMessageKey;

        if (!creationKey?.id) return;

        if (!creationKey.fromMe) return;

        const cached =
            polls.get(creationKey.id);

        if (!cached) return;

        try {
            const meId =
                jidNormalizedUser(sock.user.id);

            const pollCreatorJid =
                getKeyAuthor(
                    creationKey,
                    meId
                );

            const voterJid =
                getKeyAuthor(
                    msg.key,
                    meId
                );

            const pollEncKey =
                cached.messageSecret;

            if (!pollEncKey) return;

            if (!pollCreatorJid) return;

            if (!voterJid) return;

            if (!pollUpdate.vote) return;

            const voteMsg =
                decryptPollVote(
                    pollUpdate.vote,
                    {
                        pollCreatorJid,
                        pollMsgId: creationKey.id,
                        pollEncKey,
                        voterJid
                    }
                );

            const selectedOptions =
                voteMsg.selectedOptions || [];

            if (!selectedOptions.length) return;

            for (const selectedHash of selectedOptions) {
                const hash =
                    Buffer.from(selectedHash);

                let selectedName = null;

                for (const option of cached.options) {
                    const optionName =
                        option?.optionName;

                    if (!optionName) continue;

                    const optionHash =
                        crypto
                            .createHash("sha256")
                            .update(optionName)
                            .digest();

                    if (
                        Buffer.compare(
                            hash,
                            optionHash
                        ) === 0
                    ) {
                        selectedName =
                            optionName;

                        break;
                    }
                }

                if (!selectedName) continue;

                const plugin =
                    global.plugins?.find(
                        p =>
                            Array.isArray(p.command) &&
                            p.command.some(
                                command =>
                                    String(command)
                                        .toLowerCase() ===
                                    String(selectedName)
                                        .toLowerCase()
                            )
                    );

                if (!plugin) continue;

                const jid =
                    msg.key.remoteJid;

                const sender =
                    getKeyAuthor(
                        msg.key,
                        meId
                    );

                const senderNumber =
                    sender
                        .split("@")[0]
                        .split(":")[0];

                const isOwner =
                    Array.isArray(global.owner) &&
                    global.owner.includes(
                        senderNumber
                    );

                const isGroup =
                    jid?.endsWith("@g.us");

                try {
                    await sock.sendMessage(jid, {
                        delete: {
                            remoteJid: jid,
                            fromMe: true,
                            id: creationKey.id
                        }
                    });
                } catch {}

                await plugin.run({
                    sock,
                    msg,
                    body: selectedName,
                    jid,
                    sender,
                    args: [],
                    command: selectedName,
                    prefix: "",
                    isOwner,
                    isGroup,
                    isAdmin: false,
                    isBotAdmin: false,
                    groupMetadata: null
                });

                break;
            }

            polls.delete(creationKey.id);

        } catch (error) {
            console.error(
                "POLL ERROR:",
                error
            );
        }
    }
};