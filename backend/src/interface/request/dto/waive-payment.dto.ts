import { IsString, Length } from 'class-validator'

/**
 * Body of POST /requests/:id/payments/:paymentId/waive.
 *
 * The reason is required and has a floor on its length, for the same reason the
 * priority change does: a mandatory field that accepts "x" is mandatory in name
 * only, and this row is what an auditor reads when they ask why the institute
 * gave up money it was owed.
 */
export class WaivePaymentDto {
  @IsString()
  @Length(10, 500)
  reason!: string
}
