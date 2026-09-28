import type { UserRole } from '@cndt/contracts'

export type RequestActor = {
  id: string
  role: UserRole
}

export type LeadAccessTarget = {
  assignedSpecialistId: string | null
}

export function canAssignLead(actor: RequestActor): boolean {
  return actor.role === 'MANAGER' || actor.role === 'ADMIN'
}

export function canReadLead(actor: RequestActor, lead: LeadAccessTarget): boolean {
  if (actor.role === 'MANAGER' || actor.role === 'ADMIN') {
    return true
  }

  return actor.role === 'SPECIALIST' && lead.assignedSpecialistId === actor.id
}
