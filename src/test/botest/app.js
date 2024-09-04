const { ActivityHandler, BotFrameworkAdapter } = require('botbuilder');

const adapter = new BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Create bot handlers
const bot = new ActivityHandler();
bot.onMessage(async (context, next) => {
    await context.sendActivity(`You said: ${context.activity.text}`);
    await next();
});

bot.onMembersAdded(async (context, next) => {
    const membersAdded = context.activity.membersAdded;
    for (let member of membersAdded) {
        if (member.id !== context.activity.recipient.id) {
            await context.sendActivity('Hello and welcome!');
        }
    }
    await next();
});

// Listen for incoming requests 
const server = require('restify').createServer();
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route to main dialog.
        await bot.run(context);
    });
});

server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log(`\n${server.name} listening to ${server.url}`);
});
