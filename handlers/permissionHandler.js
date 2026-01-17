const owners = require("../data/owners.json");
const fs = require("fs");

function hasPermission(message, commandName) {
    if (message.author.id === owners.owner) return true;
    if (owners.owners.includes(message.author.id)) return true;

    const data = JSON.parse(fs.readFileSync(`./data/configs/${commandName}.json`));
    if (data.allowedUsers.includes(message.author.id)) return true;

    return message.member.roles.cache.some(r => data.allowedRoles.includes(r.id));
}

module.exports = { hasPermission };
