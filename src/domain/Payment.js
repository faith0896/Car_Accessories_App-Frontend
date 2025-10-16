export default class Payment {
  constructor(id, paymentDate, paymentMethod, amount, status, order) {
    this.id = id;                      // Long
    this.paymentDate = paymentDate;    // LocalDate
    this.paymentMethod = paymentMethod;// String
    this.amount = amount;              // Double
    this.status = status;              // String
    this.order = order;                // Order object
  }
}