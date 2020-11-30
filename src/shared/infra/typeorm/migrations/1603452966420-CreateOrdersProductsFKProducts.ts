import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export default class CreateOrdersProductsFKProducts1603452966420
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      'orders_products',
      new TableForeignKey({
        name: 'ProductsFK',
        columnNames: ['product_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'products',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('orders_products', 'ProductsFK');
  }
}
