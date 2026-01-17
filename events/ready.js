module.exports = {
    name: "ready",
    execute(client) {
        const bot = require("../data/bot.json");
        client.user.setActivity(bot.status.text, { type: bot.status.type });
        console.log(`✅ Logged in as ${client.user.tag}`);
    }
};
