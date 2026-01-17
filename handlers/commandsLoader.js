const fs = require("fs");
const path = require("path");

async function loadCommands(client) {
    client.commands.clear();
    const files = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));

    for (const file of files) {
        const cmd = require(`../commands/${file}`);
        if (!cmd.enable) continue;
        client.commands.set(cmd.name, cmd);

        const cfgPath = `./data/configs/${cmd.name}.json`;
        if (!fs.existsSync(cfgPath)) {
            fs.writeFileSync(cfgPath, JSON.stringify({
                name: cmd.name,
                shortcuts: cmd.shortcuts || [],
                allowedUsers: [],
                allowedRoles: []
            }, null, 2));
        }
    }
}

module.exports = { loadCommands };
