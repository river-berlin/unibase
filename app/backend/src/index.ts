import { app } from './app';

const port: number = parseInt(process.env.PORT || '3002');

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 