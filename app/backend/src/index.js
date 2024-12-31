import { app } from './app.js';

const port = process.env.PORT || 3004;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 