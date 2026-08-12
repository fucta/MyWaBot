const axios = require('axios')

module.exports = {
  command: ["anime"],
  tags: "ai",
  async run({ sock, msg, jid, args, prefix, command }) {
    try {
      const text = args.join(" ");
      if (!text) return sock.sendReply(msg, `_Example: ${prefix + command} duck_`)
      
      let wait = await sock.sendWait(jid, msg)
      const data = await neoxr('/ai-anime', {
        q: text
      })
      const image = data.data.url
      const id = data.data.id
      if (!data.status) {
        return sock.sendError(jid, wait)
      }
      
      await sock.sendImage(jid, image, id, msg);
      await sock.sendSuccess(jid, wait);
    } catch(err) {
      console.log(err)
      return sock.sendReply(msg, 'Failed Generate.')
    }
  }
}