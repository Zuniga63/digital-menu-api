import mongoose from 'mongoose';

// eslint-disable-next-line import/no-mutable-exports
export let connection: mongoose.Connection;

// enabled virtuals for all documents.
mongoose.set('toJSON', { virtuals: true });
mongoose.set('toObject', { virtuals: true });

const connectionSussessFully = (uri?: string): void => {
  if (process.env.APP_ENV === 'local' && uri) {
    const message = `Connection with mongoDB into url:${uri}`;
    // eslint-disable-next-line no-console
    console.log(message);
  }
};

const getMongoUri = (): string => {
  const env: string = process.env.APP_ENV || 'local';
  let uri: string = process.env.DB_URL || '';

  if (env === 'local') {
    const host: string | undefined = process.env.DB_HOST;
    const port: string | undefined = process.env.DB_PORT;
    const db: string | undefined = process.env.DB_DATABASE;
    uri = `${host}:${port}/${db}`;
  }

  return uri;
};

export async function connect(): Promise<void> {
  const mongoUri = getMongoUri();

  if (connection) {
    connectionSussessFully(mongoUri);
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    connection = mongoose.connection;
    connectionSussessFully(mongoUri);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Something went wrong!', error);
  }
}

export async function disconect(): Promise<void> {
  if (!connection) return;

  await mongoose.disconnect();
}

export async function cleanup() {
  const deletes: Promise<any>[] = [];
  const { collections } = connection;

  // eslint-disable-next-line no-restricted-syntax
  for (const index in collections) {
    if (Object.prototype.hasOwnProperty.call(collections, index)) {
      const collection = collections[index];
      deletes.push(collection.deleteMany({}));
    }
  }

  await Promise.all(deletes);
}

export default { connect, disconect, cleanup };
