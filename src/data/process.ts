import type { ProcessStep } from '../types/content'

export const processSteps: ProcessStep[] = [
  {
    number: '01',
    title: 'Discover',
    summary: 'Understand the actual problem',
    detail:
      'Walk the process, see the current system, and find out where time is really being lost.',
  },
  {
    number: '02',
    title: 'Design',
    summary: 'Decide the shape before building',
    detail:
      'Agree the structure, the interface, and the boundaries of the work while changes are still cheap.',
  },
  {
    number: '03',
    title: 'Build',
    summary: 'Write it properly the first time',
    detail:
      'Small, reviewable increments with something usable to look at early rather than a reveal at the end.',
  },
  {
    number: '04',
    title: 'Integrate',
    summary: 'Connect it to what exists',
    detail:
      'Make the new system exchange data with current equipment, accounts, and tooling.',
  },
  {
    number: '05',
    title: 'Deploy',
    summary: 'Put it into real conditions',
    detail:
      'Release carefully, with access, backups, and a way back if something behaves unexpectedly.',
  },
  {
    number: '06',
    title: 'Support',
    summary: 'Stay responsible for it',
    detail:
      'Monitor, maintain, and keep improving it once real use starts revealing the edges.',
  },
]
