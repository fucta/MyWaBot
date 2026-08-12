const axios = require('axios')

module.exports = {
  command: ["gpt3"],
  tags: "ai",
  async run({ sock, msg, jid, args, prefix, command }) {
    try {
      const text = args.join(" ");
      if (!text) return sock.sendReply(msg, `_Example: ${prefix + command} duck_`)
      
      let wait = await sock.sendWait(jid, msg)
      const data = await neoxr('/gpt-pro', {
        q: text
      })
      
      const message = data.data.message
      if (!data.status) {
        return sock.sendError(jid, wait)
      }
      
      await sock.sendReply(msg, message);
      await sock.sendSuccess(jid, wait);
    } catch(err) {
      console.log(err)
      return sock.sendReply(msg, 'Failed Generate.')
    }
  }
}