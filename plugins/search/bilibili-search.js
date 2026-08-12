module.exports = {
  command: ["bilibili-search", "bili-search", "bilisearch"],
  tags: "search",
  async run({ sock, msg, jid, args, command, prefix }) {
    try {
      const query = args.join(' ')
      
      if (!query) {
        return sock.sendReply(msg, `_Example: ${prefix + command} naruto_`)
      }
      
      let wait = await sock.sendWait(jid, msg)
      const data = await neoxr('/bilibili-search', {
        q: query
      })
      
      if (!data.status || !data.data || data.data.length === 0) {
        await sock.sendReply(msg, 'No results found.')
        await sock.sendSuccess(jid, wait)
        return
      }
      
      let resultText = ``
      const results = data.data.slice(0, 5)
      
      results.forEach((item, index) => {
        resultText += `*${index + 1}. ${item.title || 'No Title'}*\n`
        resultText += `- _Type:_ ${item.season_type || 'Unknown'}\n`
        resultText += `- _ID:_ ${item.season_id || 'N/A'}\n`
        resultText += `- _Views:_ ${item.view || 'N/A'}\n`
        resultText += `- _Status:_ ${item.index_show || 'Unknown'}\n`
        
        if (item.styles && item.styles.length > 0) {
          const genres = item.styles.map(style => style.title).join(', ')
          resultText += `- _Genres:_ ${genres}\n`
        }
        
        if (item.description) {
          const desc = item.description.length > 100 
            ? item.description.substring(0, 100) + '...' 
            : item.description
          resultText += `- _Description:_ ${desc}\n`
        }
        
        if (item.cover) {
          resultText += `- _Cover:_ ${item.cover}\n`
        }
        
        resultText += `\n`
      })
      
      await sock.sendReply(msg, resultText.trim())
      await sock.sendSuccess(jid, wait)
    } catch(err) {
      console.log(err)
      return sock.sendReply(msg, 'Failed Searching.')
    }
  }
}