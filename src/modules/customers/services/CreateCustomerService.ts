import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Customer from '../infra/typeorm/entities/Customer';
import ICustomersRepository from '../repositories/ICustomersRepository';

interface IRequest {
  name: string;
  email: string;
}

@injectable()
class CreateCustomerService {
  constructor(
    @inject('CustomerRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ name, email }: IRequest): Promise<Customer> {
    const emailAlreadyInUse = this.customersRepository.findByEmail(email);

    if (emailAlreadyInUse) {
      throw new AppError('Email already in use');
    }

    const customer = this.customersRepository.create({ email, name });

    return customer;
  }
}

export default CreateCustomerService;
