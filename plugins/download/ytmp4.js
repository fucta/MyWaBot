module.exports = {
  command: ["ytmp4"],
  tags: "download",
  async run({ sock, msg, args, jid, command, prefix }) {
    const text = args.join(" ");
    try {
      if (!text) return sock.sendReply(msg, `_Example: ${prefix + command} https://youtu.be/xxxxxxx_`.trim())
      const wait = await sock.sendWait(jid, msg);
      const data = await neoxr('/youtube', {
        url: text,
        type: "video",
        quality: "720p"
      })
      
      if (!data.status) {
        return sock.sendError(jid, wait);
      }
      
      await sock.sendVideo(jid, data.data.url, data.title, msg);
      await sock.sendSuccess(jid, wait)
    } catch (error) {
      console.error(error);
      return sock.sendReply(msg, "Procces Failed")
    }
  }
}