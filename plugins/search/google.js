const axios = require('axios')

module.exports = {
  command: ["google"],
  tags: "search",
  async run({ sock, msg, jid, args, command, prefix }) {
    try {
      if (!args[0]) return sock.sendReply(msg, `_Example: ${prefix + command} who is billy_`)
      
      let wait = await sock.sendWait(jid, msg)
      const data = await neoxr('/google', {
        q: args[0]
      })
      
      if (!data.status) {
        return sock.sendError(jid, wait)
      }
      
      let resultText = ``
      
      if (data.data && data.data.length > 0) {
        const results = data.data.slice(0, 5)
        
        results.forEach((item, index) => {
          resultText += `*${index + 1}*. ${item.title || 'No Title'}\n`
          resultText += `${item.description || 'No Description'}\n`
          resultText += `${item.url || 'No URL'}\n\n`
        })
      } else {
        resultText += 'No results found.'
      }
      
      await sock.sendReply(msg, resultText)
      await sock.sendSuccess(jid, wait)
    } catch(err) {
      console.log(err)
      return sock.sendReply(msg, 'Failed Searching.')
    }
  }
}