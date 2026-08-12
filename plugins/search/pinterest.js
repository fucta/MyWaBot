module.exports = {
  command: ["pinterest", "pin"],
  tags: "search",
  async run({ sock, msg, jid, args, command, prefix }) {
    try {
      const query = args.join(' ')
      
      if (!query) {
        return sock.sendReply(msg, `_Example: ${prefix + command} cat_`)
      }
      
      let wait = await sock.sendWait(jid, msg)
      const data = await neoxr('/pinterest', {
        q: query
      })
      
      if (!data.status || !data.data || data.data.length === 0) {
        await sock.sendReply(msg, 'No results found.', msg)
        await sock.sendSuccess(jid, wait)
        return
      }
      
      const imageUrl = data.data[0]
      
      await sock.sendImage(jid, imageUrl, msg)
      await sock.sendSuccess(jid, wait)
    } catch(err) {
      console.log(err)
      return sock.sendReply(msg, 'Failed Searching.', msg)
    }
  }
}