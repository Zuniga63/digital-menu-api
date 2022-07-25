import app from './app';
import { verify } from './utils/mailer';

// start server
app.listen(app.get('port'), async (): Promise<void> => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on: ${app.get('host')}`);
  if (await verify()) {
    // eslint-disable-next-line no-console
    console.log('Mail server is running');
  }
});
