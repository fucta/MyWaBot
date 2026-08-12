module.exports = {
  command: ["youtube-search", "yts", "ytsearch"],
  tags: "search",
  async run({ sock, msg, jid, args, command, prefix }) {
    try {
      const query = args.join(' ')
      
      if (!query) {
        return sock.sendReply(msg, `_Example: ${prefix + command} komang_`, msg)
      }
      
      let wait = await sock.sendWait(jid, msg)
      const data = await neoxr('/yts', {
        q: query
      })
      
      if (!data.status || !data.data || data.data.length === 0) {
        await sock.sendReply(msg, 'No results found.', msg)
        await sock.sendSuccess(jid, wait)
        return
      }
      
      let resultText = ``
      const results = data.data.slice(0, 5)
      
      results.forEach((item, index) => {
        resultText += `*${index + 1}. ${item.title}*\n`
        resultText += `- _Duration:_ ${item.timestamp}\n`
        resultText += `- _Views:_ ${item.views.toLocaleString()}\n`
        resultText += `- _Upload:_ ${item.ago}\n`
        resultText += `- _Channel:_ ${item.author.name}\n`
        resultText += `- _URL:_ ${item.url}\n\n`
      })
      
      await sock.sendImage(jid, data.data[0].thumbnail, resultText.trim(), msg)
      await sock.sendSuccess(jid, wait)
    } catch(err) {
      console.log(err)
      return sock.sendReply(msg, 'Failed Searching.', msg)
    }
  }
}