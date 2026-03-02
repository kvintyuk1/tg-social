import express from 'express';
import dotenv from 'dotenv';
import walletRouter from './routes/wallet.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use('/api', walletRouter);

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on port ${PORT}`);
});

