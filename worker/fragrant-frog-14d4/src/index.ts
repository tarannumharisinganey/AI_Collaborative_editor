import OpenAI from 'openai';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  OPEN_AI_KEY: string;
  AI: Ai;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  '/*',
  cors({
    origin: '*',
    allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests', 'Content-Type'],
    allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT'],
    exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
    maxAge: 600,
    credentials: true,
  })
);
app.post('/chatToDocument', async (c) => {
	const { documentData, question } = await c.req.json();
  
	const openai = new OpenAI({
	  apiKey: c.env.OPEN_AI_KEY,
	});
  
	const chatCompletion = await openai.chat.completions.create({
	  messages: [
		{
		  role: 'system',
		  content:
			'You are an assistant helping the user to chat with a document. The document content is provided below. Answer the user\'s question in the clearest way possible.\n\nDocument:\n' +
			documentData,
		},
		{
		  role: 'user',
		  content: 'My Question is: ' + question,
		},
	  ],
	  model: 'gpt-4',
	  temperature: 0.5,
	});
  
	const response = chatCompletion.choices[0].message.content;
  
	return c.json({ message: response });
  });

app.post('/translateDocument', async (c) => {
  const { documentData, targetLang } = await c.req.json();

  // Translate the text to another language
  const response = await c.env.AI.run('@cf/meta/m2m100-1.2b', {
    text: documentData,
    source_lang: 'english', // defaults to english
    target_lang: targetLang,
  });

  return c.json({ translated_text: response.translated_text });
});

export default app;