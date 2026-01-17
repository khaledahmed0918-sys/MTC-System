module.exports = {
    name: "help",
    description: "Show commands",
    enable: true,
    shortcuts: [],

    execute(client, message) {
        const owners = require("../data/owners.json");
        if (!owners.owners.includes(message.author.id) && message.author.id !== owners.owner) return;

        const cmds = [...client.commands.values()];
        const list = cmds.map(c =>
            `\`${client.config.prefix}${c.name}\`: [${c.shortcuts.join(", ")}]`
        );

        message.reply({
            embeds: [{
                title: "Commands",
                description: list.join("\n"),
                color: 0x5865F2
            }]
        });
    }
};
