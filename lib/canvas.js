const { createCanvas, loadImage } = require("canvas");

async function profileBanner({
  background,
  profile,
  size = 200,
  offsetX = 0,
  offsetY = 15,
  borderWidth = 2,
  borderColor = "#ffffff",
  shadowColor = "#78d7ff",
  shadowBlur = 70,
  format = "image/jpeg"
}) {
  const bg = await loadImage(background);
  const pp = await loadImage(profile);

  const canvas = createCanvas(bg.width, bg.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(bg, 0, 0, bg.width, bg.height);

  const x = (bg.width - size) / 2 + offsetX;
  const y = (bg.height - size) / 2 + offsetY;

  ctx.save();

  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = shadowBlur;

  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(pp, x, y, size, size);

  ctx.restore();

  if (borderWidth > 0) {
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = borderColor;
    ctx.stroke();
  }

  return canvas.toBuffer(format);
}

module.exports = {
  profileBanner
};