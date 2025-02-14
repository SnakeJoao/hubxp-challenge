import mongoose, { Connection } from 'mongoose';
import { config } from 'dotenv';
import { CategorySchema } from 'src/modules/category/category.schema';
import { OrderSchema } from 'src/modules/order/order.schema';
import { ProductSchema } from 'src/modules/product/product.schema';

config();

const MONGO_URL =
  process.env.MONGO_URL || 'mongodb://root:root@localhost:27017/hubxp';

async function seedDatabase() {
  const connection: Connection = await mongoose
    .createConnection(MONGO_URL, {
      authSource: 'admin',
    })
    .asPromise();

  try {
    console.log('Seeding database...');

    const CategoryModel = connection.model('Category', CategorySchema);
    const ProductModel = connection.model('Product', ProductSchema);
    const OrderModel = connection.model('Order', OrderSchema);

    await CategoryModel.deleteMany({});
    await ProductModel.deleteMany({});
    await OrderModel.deleteMany({});

    const categories = [
      { name: 'Gaming & Accessories' },
      { name: 'Outdoor & Adventure' },
      { name: 'Pet Supplies' },
      { name: 'Smart Home Devices' },
      { name: 'Fitness & Wellness' },
    ];

    const savedCategories = await CategoryModel.insertMany(categories);
    console.log(`Created ${savedCategories.length} categories.`);

    const products = [
      {
        name: 'Mechanical Gaming Keyboard',
        description: 'RGB backlit mechanical keyboard with fast response time.',
        price: 129.99,
        categories: [savedCategories[0]._id], // Gaming & Accessories
        imageUrl: 'https://example.com/images/mechanical-keyboard.jpg',
      },
      {
        name: 'Camping Tent (4-Person)',
        description:
          'Water-resistant and durable camping tent for outdoor adventures.',
        price: 199.99,
        categories: [savedCategories[1]._id], // Outdoor & Adventure
        imageUrl: 'https://example.com/images/camping-tent.jpg',
      },
      {
        name: 'Automatic Pet Feeder',
        description:
          'Smart pet feeder with scheduled feeding times and portion control.',
        price: 89.99,
        categories: [savedCategories[2]._id], // Pet Supplies
        imageUrl: 'https://example.com/images/pet-feeder.jpg',
      },
      {
        name: 'Smart Thermostat',
        description: 'Wi-Fi enabled thermostat with energy-saving automation.',
        price: 249.99,
        categories: [savedCategories[3]._id], // Smart Home Devices
        imageUrl: 'https://example.com/images/smart-thermostat.jpg',
      },
      {
        name: 'Adjustable Dumbbells (Set)',
        description:
          'Pair of adjustable dumbbells with weight customization up to 50 lbs.',
        price: 179.99,
        categories: [savedCategories[4]._id], // Fitness & Wellness
        imageUrl: 'https://example.com/images/adjustable-dumbbells.jpg',
      },
    ];

    const savedProducts = await ProductModel.insertMany(products);
    console.log(`Created ${savedProducts.length} products.`);

    const orders = [
      {
        date: new Date('2025-03-05T12:30:00.000Z'),
        products: [savedProducts[0]._id, savedProducts[1]._id],
        total: savedProducts[0].price + savedProducts[1].price,
      },
      {
        date: new Date('2025-03-07T09:45:00.000Z'),
        products: [savedProducts[2]._id],
        total: savedProducts[2].price,
      },
      {
        date: new Date('2025-03-10T15:20:00.000Z'),
        products: [savedProducts[3]._id, savedProducts[4]._id],
        total: savedProducts[3].price + savedProducts[4].price,
      },
      {
        date: new Date('2025-03-12T10:00:00.000Z'),
        products: [savedProducts[0]._id],
        total: savedProducts[0].price,
      },
      {
        date: new Date('2025-03-15T14:15:00.000Z'),
        products: [savedProducts[1]._id, savedProducts[2]._id],
        total: savedProducts[1].price + savedProducts[2].price,
      },
      {
        date: new Date('2025-03-18T17:45:00.000Z'),
        products: [savedProducts[3]._id],
        total: savedProducts[3].price,
      },
      {
        date: new Date('2025-03-20T19:30:00.000Z'),
        products: [savedProducts[4]._id, savedProducts[0]._id],
        total: savedProducts[4].price + savedProducts[0].price,
      },
      {
        date: new Date('2025-03-22T08:00:00.000Z'),
        products: [savedProducts[1]._id, savedProducts[3]._id],
        total: savedProducts[1].price + savedProducts[3].price,
      },
      {
        date: new Date('2025-03-25T11:10:00.000Z'),
        products: [savedProducts[2]._id, savedProducts[4]._id],
        total: savedProducts[2].price + savedProducts[4].price,
      },
      {
        date: new Date('2025-03-28T14:45:00.000Z'),
        products: [savedProducts[0]._id, savedProducts[2]._id],
        total: savedProducts[0].price + savedProducts[2].price,
      },
    ];

    const savedOrders = await OrderModel.insertMany(orders);
    console.log(`Created ${savedOrders.length} orders.`);

    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await connection.close();
  }
}

seedDatabase();
