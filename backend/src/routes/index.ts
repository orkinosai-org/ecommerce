import { Router } from 'express';
import productsRouter from './products';

const router = Router();

// Mount product routes
router.use('/products', productsRouter);

// Health check for API
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;