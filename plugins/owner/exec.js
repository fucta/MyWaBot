const { exec } = require("child_process");
const util = require("util");

const execute = util.promisify(exec);

module.exports = {
    command: [">", "exec"],
    tags: "owner",
    owner: true,

    async run({ sock, msg, args }) {
        let command = args.join(" ");

        const quoted =
            msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!command && quoted) {
            command =
                quoted.conversation ||
                quoted.extendedTextMessage?.text ||
                quoted.imageMessage?.caption ||
                quoted.videoMessage?.caption ||
                "";
        }

        if (!command) {
            return sock.sendReply(
                msg,
                "Please provide a shell command."
            );
        }

        try {
            const { stdout, stderr } = await execute(command, {
                cwd: process.cwd(),
                maxBuffer: 20 * 1024 * 1024
            });

            const output = [
                stdout?.trim(),
                stderr?.trim()
            ]
                .filter(Boolean)
                .join("\n");

            await sock.sendReply(
                msg,
                output || "Command executed successfully with no output."
            );

        } catch (err) {
            const output = [
                err.stdout?.trim(),
                err.stderr?.trim(),
                err.message
            ]
                .filter(Boolean)
                .join("\n");

            await sock.sendReply(
                msg,
                output || "An unknown error occurred."
            );
        }
    }
};