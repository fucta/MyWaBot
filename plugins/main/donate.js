module.exports = {
  command: ["donate"],
  tags: "main",
  async run({ sock, msg }) {
    await sock.sendReply(msg, global.saweria)
  }
}