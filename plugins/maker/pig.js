const axios = require('axios')

module.exports = {
  command: ["pig"],
  tags: "Maker",
  async run({ sock, msg, args, jid, command, prefix }) {
    try {
      if (!args[0]) return sock.sendReply(msg, `_Example: ${prefix + command} Billy Istono_`)
      
      let wait = await sock.sendWait(jid, msg)
      const data = await neoxr('/pig', {
        text: args[0]
      })
      
      const image = data.data.url
      
      if (!data.status) {
        return sock.sendError(jid, wait)
      }
      await sock.sendImage(jid, image, msg)
      await sock.sendSuccess(jid, wait)
    } catch(err) {
      console.log(err)
      return sock.sendReply(msg, 'Failed Generate Image!')
    }
  }
}