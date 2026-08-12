const axios = require('axios')

module.exports = {
  command: ["iqc"],
  tags: "maker",
  async run({ sock, msg, args, jid, command, prefix }) {
    try {
      const text = args.join(" ").trim();
      if (!text) return sock.sendReply(msg, `_Example: ${prefix + command} donald trump_`)
      
      const now = new Date();
      const jakartaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
      
      const hours = String(jakartaTime.getHours()).padStart(2, '0');
      const minutes = String(jakartaTime.getMinutes()).padStart(2, '0');
      const currentTime = `${hours}:${minutes}`;
      
      const chatHours = String(jakartaTime.getHours()).padStart(2, '0');
      const chatMinutes = String(jakartaTime.getMinutes()).padStart(2, '0');
      const chatTime = `${chatHours}:${chatMinutes}`;
      
      let wait = await sock.sendWait(jid, msg)
      const data = await neoxr('/iqc', {
        text: text,
        time: currentTime,
        chat_time: chatTime
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