import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError(`Customer with id:${customer_id} don't exists`);
    }

    const products_complete = await this.productsRepository.findAllById(
      products,
    );

    if (!products_complete.length) {
      throw new AppError('Invailid Products');
    }

    const existent_products_ids = products_complete.map(product => product.id);

    const unvailables_products = products.filter(
      product => !existent_products_ids.includes(product.id),
    );

    if (unvailables_products.length) {
      throw new AppError(`Product with id ${unvailables_products[0].id}`);
    }

    const quantity_unaavailable = products.filter(
      product =>
        !!products_complete.filter(
          p => p.id === product.id && p.quantity < product.quantity,
        ).length,
    );

    if (quantity_unaavailable.length) {
      throw new AppError(
        `Product with id ${quantity_unaavailable[0].id} have insuficiente quantity`,
      );
    }

    const products_serialized = products_complete.map(product => {
      return {
        product_id: product.id,
        price: product.price,
        quantity: products.filter(p => p.id === product.id)[0].quantity,
      };
    });

    const order = await this.ordersRepository.create({
      customer,
      products: products_serialized,
    });

    await this.productsRepository.updateQuantity(products);

    return order;
  }
}

export default CreateOrderService;
