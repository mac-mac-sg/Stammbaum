export type Gender = 'm' | 'f'

export interface Partner {
  name: string
  birth?: string
  birthPlace?: string
  death?: string
  deathPlace?: string
  relationship: 'Ehe' | 'Partnerschaft' | 'Verlobung'
  status?: 'annulliert' | 'geschieden'
  notes?: string
}

export interface Person {
  id: string
  number: number
  name: string
  generation: 1 | 2 | 3 | 4 | 5
  gender?: Gender
  birth?: string
  birthPlace?: string
  death?: string
  deathPlace?: string
  notes?: string
  source: number
  parentId?: string
  childIds: string[]
  partners: Partner[]
}
