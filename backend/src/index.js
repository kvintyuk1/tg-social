import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import walletRouter from './routes/wallet.js';

dotenv.config();

const app = express();

// CORS: allow your Firebase Hosting domain(s) to call the API.
// For beta you can set CORS_ORIGIN="*" (not recommended long-term).
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(
  cors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(',').map((s) => s.trim()),
  })
);

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

