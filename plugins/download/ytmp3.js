module.exports = {
  command: ["ytmp3"],
  tags: "download",
  async run({ sock, msg, args, jid, command, prefix }) {
    const text = args.join(" ");
    try {
      if (!text) return sock.sendReply(msg, `_Example: ${prefix + command} https://youtu.be/xxxxxxx_`.trim())
      const wait = await sock.sendWait(jid, msg);
      const data = await neoxr('/youtube', {
        url: text,
        type: "audio",
        quality: "128kbps"
      })
      
      if (!data.status) {
        return sock.sendError(jid, wait);
      }
      
      await sock.sendMessage(jid, { audio: { url: data.data.url }, mimetype: "audio/mpeg" }, { quoted: msg });
      /*
      await sock.sendMessage(jid, {
        audio: { url: data.data.url },
        mimetype: "audio/mpeg",
        ptt: false,
        contextInfo: {
          externalAdReply: {
            title: data.title,
            body: `${data.channel} • ${data.duration}`,
            thumbnailUrl: data.thumbnail,
            mediaType: 1,
            renderLargerThumbnail: true,
            showAdAttribution: false,
            sourceUrl: `https://youtu.be/${data.id}`
          }
        }
      }, {
        quoted: msg
      });
      */
      await sock.sendSuccess(jid, wait)
    } catch (error) {
      console.error(error);
      return sock.sendReply(msg, "Procces Failed")
    }
  }
}