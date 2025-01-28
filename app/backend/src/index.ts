import { createApp } from './app';
import { db } from './database/db';
import { defaultGemini } from './services/gemini';

const port: number = parseInt(process.env.PORT || '3002');
const app = createApp({ db, gemini: defaultGemini });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 