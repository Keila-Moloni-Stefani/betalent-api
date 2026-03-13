import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected gatewaysTable = 'gateways'
  protected clientsTable = 'clients'
  protected productsTable = 'products'
  protected transactionsTable = 'transactions'
  protected transactionProductsTable = 'transaction_products'

  async up() {
    this.schema.createTable(this.gatewaysTable, (table) => {
      table.increments('id').notNullable()
      table.string('name').notNullable()
      table.boolean('is_active').notNullable().defaultTo(true)
      table.integer('priority').notNullable().defaultTo(1)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    this.schema.createTable(this.clientsTable, (table) => {
      table.increments('id').notNullable()
      table.string('name').notNullable()
      table.string('email', 254).notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    this.schema.createTable(this.productsTable, (table) => {
      table.increments('id').notNullable()
      table.string('name').notNullable()
      table.integer('amount').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    this.schema.createTable(this.transactionsTable, (table) => {
      table.increments('id').notNullable()
      table
        .integer('client_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable(this.clientsTable)
        .onDelete('CASCADE')

      table
        .integer('gateway_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable(this.gatewaysTable)
        .onDelete('RESTRICT')

      table.string('external_id').nullable()
      table.string('status').notNullable()
      table.integer('amount').notNullable()
      table.string('card_last_numbers').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    this.schema.createTable(this.transactionProductsTable, (table) => {
      table.increments('id').notNullable()

      table
        .integer('transaction_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable(this.transactionsTable)
        .onDelete('CASCADE')

      table
        .integer('product_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable(this.productsTable)
        .onDelete('CASCADE')

      table.integer('quantity').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.transactionProductsTable)
    this.schema.dropTable(this.transactionsTable)
    this.schema.dropTable(this.productsTable)
    this.schema.dropTable(this.clientsTable)
    this.schema.dropTable(this.gatewaysTable)
  }
}

