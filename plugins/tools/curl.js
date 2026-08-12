const axios = require("axios");

module.exports = {
  command: ["curl"],
  tags: "tools",
  async run({ sock, msg, args, prefix, command }) {
    const url = args[0];

    if (!url) {
      return sock.sendReply(msg, `_Example: ${prefix + command} https://example.com_`);
    }

    try {
      const { data, status, headers } = await axios.get(url, {
        timeout: 10000,
        validateStatus: () => true
      });

      let result = typeof data === "string"
        ? data
        : JSON.stringify(data, null, 2);

      if (result.length > 3500) {
        result = result.slice(0, 3500) + "\n\n...truncated";
      }

      await sock.sendReply(
        msg,
        `\`\`\`${result}\`\`\``
      );
    } catch (e) {
      sock.sendReply(msg, e.message);
    }
  }
};