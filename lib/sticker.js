const sharp = require("sharp");
const { exec } = require("child_process");
const util = require("util");

const execPromise = util.promisify(exec);

async function image(input, output) {
    await sharp(input)
        .resize(512, 512, {
            fit: "contain",
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .webp({ quality: 80 })
        .toFile(output);
}

async function video(input, output) {
    const cmd = `ffmpeg -i "${input}" -t 8 -c:v libwebp_anim -filter_complex "[0:v] fps=60,scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000" -loop 0 -lossless 0 -qscale 40 -preset default -an -vsync 0 -y "${output}"`;

    await execPromise(cmd);
}

module.exports = {
    image,
    video
};