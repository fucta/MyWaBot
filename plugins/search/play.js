const axios = require('axios');

module.exports = {
  command: ["play"],
  tags: "search",
  async run({ sock, msg, args, jid, command, prefix }) {
    const text = args.join(" ");
    try {
      if (!text) return sock.sendReply(msg, `_Example: ${prefix + command} soulmate_`.trim())
      
      const wait = await sock.sendWait(jid, msg);
      const data = await neoxr('/play', {
        q: text
      })
      
      if (!data.status) {
        return sock.sendError(jid, wait);
      }
      
      let capt = `- _Title:_ ${data.title}\n`
      capt += `- _Duration:_ ${data.duration}\n`
      capt += `- _Views:_ ${data.views}\n`
      capt += `- _Channel:_ ${data.channel}`
      
      await sock.sendImage(jid, data.thumbnail, capt, msg);
      await sock.sendMessage(jid, { audio: { url: data.data.url }, mimetype: "audio/mpeg" }, { quoted: msg });
      await sock.sendSuccess(jid, wait);
    } catch (err) {
      console.error(err);
      return sock.sendReply(msg, "Procces Failed")
    }
  }
}