const axios = require('axios');

module.exports = {
  command: ["instagram", "ig"],
  tags: "download",
  async run({ sock, msg, args, jid, command, prefix }) {
    const text = args.join(" ");
    try {
      if (!text) return sock.sendReply(msg, `_Example: ${prefix + command} https://www.instagram.com/xxxxxxx_`.trim())
      
      const wait = await sock.sendWait(jid, msg);
      const data = await neoxr('/ig', {
        url: text
      })
      
      const media = data.data[0].url;
      
      if (!data.status) {
        return sock.sendError(jid, wait);
      }

      if (data.data[0].type === "jpg") {
        await sock.sendImage(jid, media, msg);
      } else {
        await sock.sendVideo(jid, media, "", msg);
      }

      await sock.sendSuccess(jid, wait);
    } catch (err) {
      console.error(err);
      return sock.sendReply(msg, "Procces Failed")
    }
  }
}