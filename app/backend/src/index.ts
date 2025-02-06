import { createApp } from './app';
import { db } from './database/db';
import { defaultOpenAI } from './services/openai';

const port: number = parseInt(process.env.PORT || '3002');
const app = createApp({ db, openai: defaultOpenAI });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 