const { App } = require('@slack/bolt');
const { createServer } = require('http');
const { SocketModeReceiver } = require('@slack/socket-mode');
const axios = require('axios');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

const receiver = new SocketModeReceiver({
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: 'debug',
});

app.event('app_mention', async ({ event, context, client }) => {
  try {
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/engines/davinci-codex/completions',
      {
        prompt: event.text,
        max_tokens: 100,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const reply = openaiResponse.data.choices[0].text;

    await client.chat.postMessage({
      channel: event.channel,
      text: reply,
    });
  } catch (error) {
    console.error(error);
  }
});

app.error((error) => {
  console.error(error);
});

(async () => {
  await app.start();
  console.log('⚡️ Bolt app is running!');

  const server = createServer(expressReceiver.app);
  receiver.start(server).then(() => {
    console.log('⚡️ Bolt app is running with Socket mode!');
  });
})();
