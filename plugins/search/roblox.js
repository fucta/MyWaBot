const axios = require('axios')

module.exports = {
  command: ["roblox-search"],
  tags: "search",
  async run({ sock, msg, jid, args, command, prefix }) {
    try {
      if (!args[0]) return sock.sendReply(msg, `_Example: ${prefix + command} yaewaed_`)
      
      let wait = await sock.sendWait(jid, msg)
      const data = await neoxr('/roblox-search', {
        q: args[0]
      })
      
      if (!data.status) {
        return sock.sendError(jid, wait)
      }
      
      let resultText = ``
      
      if (data.data && data.data.length > 0) {
        const results = data.data.slice(0, 5)
        
        results.forEach((item, index) => {
          resultText += `*${index + 1}*. ${item.name}\n`
          resultText += `- _Display Name:_ ${item.displayName}\n`
          resultText += `- _ID:_ ${item.id}\n`
          resultText += `- _Verified:_ ${item.hasVerifiedBadge ? "Yes" : "No"}\n\n`
        })
      } else {
        resultText += 'No results found.'
      }
      
      await sock.sendReply(msg, resultText.trim())
      await sock.sendSuccess(jid, wait)
    } catch(err) {
      console.log(err)
      return sock.sendReply(msg, 'Failed Searching.')
    }
  }
}