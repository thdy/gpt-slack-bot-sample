const { App, ExpressReceiver } = require('@slack/bolt');

const receiver = new ExpressReceiver({ signingSecret: process.env.SLACK_SIGNING_SECRET });
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: receiver,
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

// ポート3000番でアプリを起動
receiver.router.get('/', (req, res) => {
  const challenge = req.query.challenge;
  res.send({ challenge });
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();
