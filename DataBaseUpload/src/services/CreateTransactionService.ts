import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Category from '../models/Category';
import Transaction from '../models/Transaction';

import TransactionRepository from '../repositories/TransactionsRepository';

export interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionRepository);

    const { total } = await transactionRepository.getBalance();

    if (total < value && type === 'outcome') {
      throw new AppError('Invalid Balance');
    }

    let category_id: string;

    const checkCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (checkCategory) {
      category_id = checkCategory.id;
    } else {
      const createCategory = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(createCategory);
      category_id = createCategory.id;
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
