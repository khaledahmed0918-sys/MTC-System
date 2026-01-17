const { hasPermission } = require("../handlers/permissionHandler");

module.exports = {
    name: "messageCreate",
    async execute(client, message) {
        if (message.author.bot) return;
        if (!message.content.startsWith(client.config.prefix)) return;

        const args = message.content.slice(client.config.prefix.length).trim().split(/ +/);
        const name = args.shift().toLowerCase();

        const cmd = [...client.commands.values()].find(c =>
            c.name === name || c.shortcuts?.includes(name)
        );
        if (!cmd) return;

        if (!hasPermission(message, cmd.name)) return;

        cmd.execute(client, message, args);
    }
};
