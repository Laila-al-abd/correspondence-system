import { Repository } from "../../shared/repository"
import { Identifier } from "../../shared/identifier"
import { Payment } from "../payment"

export interface PaymentRepository extends Repository<Payment> {
  listByRequest(requestId: Identifier): Promise<Payment[]>
}
