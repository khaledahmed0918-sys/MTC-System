const { hasPermission } = require("../handlers/permissionHandler");

module.exports = {
    name: "messageCreate",
    async execute(client, message) {
        if (message.author.bot) return;

        const prefix = client.config.prefix;
        const content = message.content.trim();

        let args, name;

        // مع prefix
        if (content.startsWith(prefix)) {
            args = content.slice(prefix.length).trim().split(/ +/);
            name = args.shift().toLowerCase();
        } 
        // بدون prefix (اختصارات فقط)
        else {
            const word = content.split(/ +/)[0].toLowerCase();
            const cmd = [...client.commands.values()]
                .find(c => c.shortcuts?.includes(word));

            if (!cmd) return;

            name = cmd.name;
            args = content.split(/ +/).slice(1);
        }

        const command = [...client.commands.values()].find(c =>
            c.name === name || c.shortcuts?.includes(name)
        );

        if (!command) return;
        if (!hasPermission(message, command.name)) return;

        command.execute(client, message, args);
    }
};
