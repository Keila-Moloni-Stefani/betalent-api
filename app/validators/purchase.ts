import vine from '@vinejs/vine'

export const purchaseValidator = vine.create({
  clientName: vine.string(),
  clientEmail: vine.string().email(),
  productId: vine.number().optional(),
  quantity: vine.number().positive().optional(),
  amount: vine.number().positive(), // nível 1: valor vem direto na API
  cardNumber: vine.string().fixedLength(16),
  cvv: vine.string().fixedLength(3),
})

