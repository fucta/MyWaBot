const path = require("path");

module.exports = {
    command: ["refresh", "reload"],
    tags: "owner",
    owner: true,
    async run({ sock, msg }) {
        try {
            const pluginsDir = path.join(process.cwd(), "plugins");

            global.plugins.length = 0;

            function load(dir) {
                const fs = require("fs");
                const path = require("path");

                for (const file of fs.readdirSync(dir)) {
                    const full = path.join(dir, file);

                    if (fs.statSync(full).isDirectory()) {
                        load(full);
                        continue;
                    }

                    if (!file.endsWith(".js")) continue;

                    delete require.cache[require.resolve(full)];

                    try {
                        const plugin = require(full);
                        global.plugins.push(plugin);
                    } catch (e) {
                        console.log(e);
                    }
                }
            }

            load(pluginsDir);

            sock.sendReply(msg, `✅ Reloaded ${global.plugins.length} plugins.`);
        } catch (e) {
            console.log(e);
            sock.sendReply(msg, "Failed to reload plugins.");
        }
    }
};