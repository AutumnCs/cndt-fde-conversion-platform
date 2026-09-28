import { describe, expect, it } from 'vitest'

import { canAssignLead, canReadLead, type RequestActor } from '../src/common/auth/lead-access-policy.js'

const manager: RequestActor = { id: 'manager-1', role: 'MANAGER' }
const specialist: RequestActor = { id: 'specialist-1', role: 'SPECIALIST' }
const anotherSpecialist: RequestActor = { id: 'specialist-2', role: 'SPECIALIST' }

describe('lead access policy', () => {
  it('allows only managers and administrators to assign a lead', () => {
    expect(canAssignLead(manager)).toBe(true)
    expect(canAssignLead(specialist)).toBe(false)
  })

  it('allows an assigned specialist to read a lead but rejects another specialist', () => {
    expect(canReadLead(specialist, { assignedSpecialistId: specialist.id })).toBe(true)
    expect(canReadLead(anotherSpecialist, { assignedSpecialistId: specialist.id })).toBe(false)
  })
})
