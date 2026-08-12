const fs = require("fs");

const file = "./database/groups.json";

if (!fs.existsSync(file)) {
    fs.writeFileSync(file, "{}");
}

const db = JSON.parse(fs.readFileSync(file));

function save() {
    fs.writeFileSync(file, JSON.stringify(db, null, 2));
}

module.exports = {
    db,
    save
};