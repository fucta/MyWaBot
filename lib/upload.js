const axios = require("axios");
const FormData = require("form-data");

const termaiKey = "AIzaBj7z2z3xBjsk";
const termaiDomain = "https://c.termai.cc";

async function upload(buffer, filename = "file") {
    if (!Buffer.isBuffer(buffer)) {
        throw new Error("buffer harus Buffer");
    }

    const form = new FormData();

    form.append("file", buffer, {
        filename,
        contentType: "application/octet-stream"
    });

    const { data, status } = await axios.post(
        `${termaiDomain}/api/upload?key=${termaiKey}`,
        form,
        {
            headers: {
                ...form.getHeaders(),
                Accept: "application/json"
            },
            timeout: 60000,
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
            validateStatus: () => true
        }
    );

    if (status < 200 || status >= 300) {
        throw new Error(
            `Upload gagal (HTTP ${status}): ${
                typeof data === "string" ? data : JSON.stringify(data)
            }`
        );
    }

    if (data?.status && data?.path) {
        return data.path;
    }

    throw new Error("Response tidak valid.");
}

module.exports = upload;