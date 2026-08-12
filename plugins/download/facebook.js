module.exports = {
  command: ["facebook", "fb", "fbdl"],
  tags: "download",
  async run({ sock, msg, jid, args, command, prefix }) {
    try {
      if (!args[0]) {
        return sock.sendReply(msg, `_Example: ${prefix + command} https://www.facebook.com/share/r/176Gd2Y3F5/_`, msg)
      }
      
      let wait = await sock.sendWait(jid, msg)
      const data = await neoxr('/fb', {
        url: args[0]
      })
      
      if (!data.status || !data.data || data.data.length === 0) {
        await sock.sendReply(msg, 'No results found.', msg)
        await sock.sendSuccess(jid, wait)
        return
      }
      
      const hd = data.data.find(item => item.quality === 'HD')
      const videoUrl = hd ? hd.url : data.data[0].url
      
      await sock.sendVideo(jid, videoUrl, '', msg)
      await sock.sendSuccess(jid, wait)
    } catch(err) {
      console.log(err)
      return sock.sendReply(msg, 'Failed Downloading.', msg)
    }
  }
}