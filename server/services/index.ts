import { dataAccess } from '../data'
import AuditService from './auditService'
import SendMoneyToPrisonerService from './sendMoneyToPrisonerService'

export const services = () => {
  const { applicationInfo, hmppsAuditClient } = dataAccess()

  return {
    applicationInfo,
    auditService: new AuditService(hmppsAuditClient),
    sendMoneyToPrisonerService: new SendMoneyToPrisonerService(),
  }
}

export type Services = ReturnType<typeof services>
