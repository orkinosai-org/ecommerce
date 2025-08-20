import { Router, Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { MockProductRepository } from '../repositories/mock-product.repository';
import { ProductFilters } from '../types/product';

// Define HTTP status codes locally for now
const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

const router = Router();

// Initialize service with mock repository for now
const productRepository = new MockProductRepository();
const productService = new ProductService(productRepository);

// GET /products - List products with pagination and filtering
router.get('/', async (req: Request, res: Response) => {
  try {
    const filters: ProductFilters = {};
    
    if (req.query.page) filters.page = parseInt(req.query.page as string);
    if (req.query.limit) filters.limit = parseInt(req.query.limit as string);
    if (req.query.category) filters.category = req.query.category as string;
    if (req.query.search) filters.search = req.query.search as string;
    if (req.query.minPrice) filters.minPrice = parseFloat(req.query.minPrice as string);
    if (req.query.maxPrice) filters.maxPrice = parseFloat(req.query.maxPrice as string);
    if (req.query.sort) filters.sort = req.query.sort as 'name' | 'price' | 'createdAt';
    if (req.query.order) filters.order = req.query.order as 'asc' | 'desc';

    const result = await productService.getProducts(filters);

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /products/search - Search products
router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    
    if (!query) {
      res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        success: false,
        error: 'Search query (q) is required',
      });
      return;
    }

    const filters: Omit<ProductFilters, 'search'> = {};
    
    if (req.query.page) filters.page = parseInt(req.query.page as string);
    if (req.query.limit) filters.limit = parseInt(req.query.limit as string);
    if (req.query.category) filters.category = req.query.category as string;
    if (req.query.minPrice) filters.minPrice = parseFloat(req.query.minPrice as string);
    if (req.query.maxPrice) filters.maxPrice = parseFloat(req.query.maxPrice as string);
    if (req.query.sort) filters.sort = req.query.sort as 'name' | 'price' | 'createdAt';
    if (req.query.order) filters.order = req.query.order as 'asc' | 'desc';

    const result = await productService.searchProducts(query, filters);

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /products/featured - Get featured products
router.get('/featured', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 8;
    const products = await productService.getFeaturedProducts(limit);

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /products/:id - Get product by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);

    if (!product) {
      res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        success: false,
        error: 'Product not found',
      });
      return;
    }

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// POST /products - Create new product (admin only - simplified for now)
router.post('/', async (req: Request, res: Response) => {
  try {
    const product = await productService.createProduct(req.body);

    res.status(HTTP_STATUS_CODES.CREATED).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// PUT /products/:id - Update product (admin only - simplified for now)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body);

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      data: product,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Product not found') {
      res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        success: false,
        error: error.message,
      });
      return;
    }

    res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// DELETE /products/:id - Delete product (admin only - simplified for now)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);

    res.status(HTTP_STATUS_CODES.NO_CONTENT).send();
  } catch (error) {
    if (error instanceof Error && error.message === 'Product not found') {
      res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        success: false,
        error: error.message,
      });
      return;
    }

    res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;