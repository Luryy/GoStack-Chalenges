import csvParse from 'csv-parse';
import fs from 'fs';
import Transaction from '../models/Transaction';
import CreateTransactionService, {
  RequestDTO as RequestDTOCreateTransactionService,
} from './CreateTransactionService';

interface RequestDTO {
  filePath: string;
}

class ImportTransactionsService {
  async execute({ filePath }: RequestDTO): Promise<Transaction[]> {
    const createTransactionService = new CreateTransactionService();

    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const transactionsFromCsv: RequestDTOCreateTransactionService[] = [];

    const parseCSV = readCSVStream.pipe(parseStream);

    parseCSV.on(
      'data',
      (transaction: [string, 'outcome' | 'income', number, string]) => {
        transactionsFromCsv.push({
          title: transaction[0],
          type: transaction[1],
          value: transaction[2],
          category: transaction[3],
        });
      },
    );

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const transactions: Transaction[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for await (const transaction of transactionsFromCsv) {
      const insertedTransaction = await createTransactionService.execute({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: transaction.category,
      });
      transactions.push(insertedTransaction);
    }

    return transactions;
  }
}

export default ImportTransactionsService;
