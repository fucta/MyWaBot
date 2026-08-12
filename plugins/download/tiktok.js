const axios = require("axios");

module.exports = {
  command: ["tiktok", "tt"],
  tags: "download",
  async run({ sock, msg, args, jid, command, prefix }) {
    const text = args.join(" ").trim();

    if (!text) {
      return sock.sendReply(
        msg,
        `_Example: ${prefix + command} https://tiktok.com/xxxx_ or _${prefix + command} funny cat_\n` +
        `_Opsi: --photo untuk mencari konten foto_`
      );
    }

    const wait = await sock.sendWait(jid, msg);
    const isPhotoMode = text.includes("--photo");

    try {
      const isTikTokUrl =
        /^(https?:\/\/)?(www\.)?(vm|vt|m)?\.?tiktok\.com\//i.test(text);

      if (isTikTokUrl) {
        const data = await neoxr("/tiktok", {
          url: text,
        });

        if (!data.status) {
          return sock.sendError(jid, wait);
        }

        const caption = data.data.caption || "";

        if (data.data.photo?.length) {
          for (const image of data.data.photo) {
            await sock.sendImage(jid, image, caption, msg);
          }
        } else if (data.data.video) {
          await sock.sendVideo(
            jid,
            { url: data.data.video },
            caption,
            msg
          );
        } else {
          return sock.sendReply(msg, "No downloadable media found.");
        }
      } else {
        let searchQuery = text;
        let isPhoto = false;

        if (text.includes("--photo")) {
          searchQuery = text.replace("--photo", "").trim();
          isPhoto = true;
        }

        if (isPhoto) {
          const data = await nexray.get("/search/tiktokphoto", {
            q: searchQuery,
          });

          if (!data.status || !data.result?.length) {
            return sock.sendReply(msg, "No photo results found.");
          }

          const photo = data.result[0];
          
          let capt = `- _Title:_ ${photo.title}\n`;
          capt += `- _Likes:_ ${photo.stats.likes}\n`;
          capt += `- _Comments:_ ${photo.stats.comment}\n`;
          capt += `- _Shares:_ ${photo.stats.share}`;
          await sock.sendImage(jid, photo.images[0], capt, msg);
          if (photo.images && photo.images.length > 0) {
            for (const image of photo.images) {
              await sock.sendImage(jid, image, msg);
            }
          } else {
            return sock.sendReply(msg, "No images found.");
          }

        } else {
          const { data } = await axios.get(
            "https://api-faa.my.id/faa/tiktok-search",
            {
              params: {
                q: searchQuery,
              },
            }
          );

          if (!data.status || !data.result?.length) {
            return sock.sendReply(msg, "No results found.");
          }

          const video = data.result[0];
          
          let capt = `- _Title:_ ${video.title}\n`;
          capt += `- _Likes:_ ${video.stats.likes}\n`;
          capt += `- _Comments:_ ${video.stats.comments}\n`;
          capt += `- _Shares:_ ${video.stats.shares}`;

          await sock.sendVideo(
            jid,
            { url: video.url_nowm },
            capt,
            msg
          );
        }
      }

      await sock.sendSuccess(jid, wait);
    } catch (err) {
      console.error(err);
      return sock.sendReply(msg, "Process failed.");
    }
  }
};