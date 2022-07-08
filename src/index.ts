import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

// add express instance
const app = express();

// add midlewares
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

const port: string = '8080';
const host: string = 'http://localhost';

// start server
app.listen(port, (): void => {
  const url = `${host}:${port}`;
  // eslint-disable-next-line no-console
  console.log(`Server is running in: ${url}`);
});
