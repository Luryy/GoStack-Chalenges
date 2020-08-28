/* eslint-disable no-param-reassign */
import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const allTransactions = await this.find();

    const { income, outcome } = allTransactions.reduce(
      (current, transaction) => {
        switch (transaction.type) {
          case 'income':
            current.income += transaction.value;
            break;
          case 'outcome':
            current.outcome += transaction.value;
            break;

          default:
            break;
        }
        return current;
      },
      {
        income: 0,
        outcome: 0,
      },
    );

    const balance: Balance = {
      income,
      outcome,
      total: income - outcome,
    };

    return balance;
  }
}

export default TransactionsRepository;
