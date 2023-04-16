const { App, ExpressReceiver } = require('@slack/bolt');
const axios = require('axios');

const expressReceiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  processBeforeResponse: true,
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: expressReceiver,
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

module.exports = expressReceiver.app;