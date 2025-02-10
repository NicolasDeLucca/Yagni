import { Product } from '../models/product';
import emmiter from '../../cqrs-sync/event-emitter';
import logger from '../../../../logging/src/logger';

const productsData = [
    {
      name: 'Product1',
      description: 'Description for Product1',
      ingredients: ['ingredient1', 'ingredient2', 'ingredient3'],
      listPrice: 100
    },
    {
      name: 'Product2',
      description: 'Description for Product2',
      ingredients: ['ingredient1', 'ingredient4', 'ingredient5'],
      listPrice: 200
    },
    {
      name: 'Product3',
      description: 'Description for Product3',
      ingredients: ['ingredient2', 'ingredient6', 'ingredient7'],
      listPrice: 300
    },
    {
      name: 'Product4',
      description: 'Description for Product4',
      ingredients: ['ingredient3', 'ingredient8', 'ingredient9'],
      listPrice: 400
    },
    {
      name: 'Product5',
      description: 'Description for Product5',
      ingredients: ['ingredient4', 'ingredient10', 'ingredient11'],
      listPrice: 500
    },
    {
      name: 'Product6',
      description: 'Description for Product6',
      ingredients: ['ingredient5', 'ingredient12', 'ingredient13'],
      listPrice: 600
    },
    {
      name: 'Product7',
      description: 'Description for Product7',
      ingredients: ['ingredient6', 'ingredient14', 'ingredient15'],
      listPrice: 700
    },
    {
      name: 'Product8',
      description: 'Description for Product8',
      ingredients: ['ingredient7', 'ingredient16', 'ingredient17'],
      listPrice: 800
    },
    {
      name: 'Product9',
      description: 'Description for Product9',
      ingredients: ['ingredient8', 'ingredient18', 'ingredient19'],
      listPrice: 900
    },
    {
      name: 'Product10',
      description: 'Description for Product10',
      ingredients: ['ingredient9', 'ingredient20', 'ingredient21'],
      listPrice: 1000
    },
  ];

export default async () => {
    try {
        await Product.bulkCreate(productsData);
        const productsId = (await Product.findAll()).map((product) => product.dataValues.id);
        for (const id of productsId) {
          emmiter.emit('productCreated', id);
        }
        logger.info('Product data populated.');
        console.log('Product data populated.');
    } catch (error) {
        logger.error('Error populating Product data:', error);
        console.error('Error populating Product data:', error);
    }
};
