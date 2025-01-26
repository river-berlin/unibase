import { createApp } from './app';
import { db } from './database/db';

const port: number = parseInt(process.env.PORT || '3002');
const app = createApp(db);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 