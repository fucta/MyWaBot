module.exports = {
  command: ["spotify", "spotify-search"],
  tags: "search",
  async run({ sock, msg, jid, args, command, prefix }) {
    try {
      const query = args.join(' ')
      
      if (!query) {
        return sock.sendReply(msg, `_Example: ${prefix + command} komang_`, msg)
      }
      
      let wait = await sock.sendWait(jid, msg)
      const data = await neoxr('/spotify-search', {
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
        resultText += `- _Duration:_ ${item.duration}\n`
        resultText += `- _Popularity:_ ${item.popularity}\n`
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