import { getRepository, Repository } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({ where: { name } });

    return product;
  }

  public async findAllById(products_ids: IFindProducts[]): Promise<Product[]> {
    const products = await this.ormRepository.findByIds(products_ids);

    return products;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const updatedProducts = await Promise.all(
      products.map(async product => {
        const foundProduct = (await this.ormRepository.findOne(
          product.id,
        )) as Product;
        if (foundProduct) {
          foundProduct.quantity -= product.quantity;
          await this.ormRepository.save(foundProduct);
        }
        return foundProduct;
      }),
    );

    return updatedProducts;
  }
}

export default ProductsRepository;
