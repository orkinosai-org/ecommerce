import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create categories
  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and gadgets',
      imageUrl: 'https://example.com/images/electronics.jpg',
    },
  });

  const clothing = await prisma.category.upsert({
    where: { slug: 'clothing' },
    update: {},
    create: {
      name: 'Clothing',
      slug: 'clothing',
      description: 'Fashion and apparel',
      imageUrl: 'https://example.com/images/clothing.jpg',
    },
  });

  const books = await prisma.category.upsert({
    where: { slug: 'books' },
    update: {},
    create: {
      name: 'Books',
      slug: 'books',
      description: 'Books and literature',
      imageUrl: 'https://example.com/images/books.jpg',
    },
  });

  // Create products
  const products = [
    {
      name: 'Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 199.99,
      sku: 'WH-001',
      stockQuantity: 50,
      categoryId: electronics.id,
      images: [
        'https://example.com/images/headphones-1.jpg',
        'https://example.com/images/headphones-2.jpg',
      ],
    },
    {
      name: 'Smartphone',
      description: 'Latest model smartphone with advanced features',
      price: 699.99,
      sku: 'SP-001',
      stockQuantity: 25,
      categoryId: electronics.id,
      images: [
        'https://example.com/images/smartphone-1.jpg',
      ],
    },
    {
      name: 'Cotton T-Shirt',
      description: 'Comfortable cotton t-shirt in multiple colors',
      price: 29.99,
      sku: 'TS-001',
      stockQuantity: 100,
      categoryId: clothing.id,
      images: [
        'https://example.com/images/tshirt-1.jpg',
        'https://example.com/images/tshirt-2.jpg',
      ],
    },
    {
      name: 'Programming Book',
      description: 'Learn modern web development techniques',
      price: 49.99,
      sku: 'BK-001',
      stockQuantity: 30,
      categoryId: books.id,
      images: [
        'https://example.com/images/book-1.jpg',
      ],
    },
    {
      name: 'Laptop',
      description: 'High-performance laptop for professionals',
      price: 1299.99,
      sku: 'LP-001',
      stockQuantity: 15,
      categoryId: electronics.id,
      images: [
        'https://example.com/images/laptop-1.jpg',
        'https://example.com/images/laptop-2.jpg',
      ],
    },
  ];

  for (const productData of products) {
    const { images, ...productInfo } = productData;
    
    const product = await prisma.product.create({
      data: productInfo,
    });

    // Create product images
    for (let i = 0; i < images.length; i++) {
      await prisma.productImage.create({
        data: {
          url: images[i],
          altText: `${product.name} - Image ${i + 1}`,
          sortOrder: i,
          productId: product.id,
        },
      });
    }

    console.log(`Created product: ${product.name}`);
  }

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });