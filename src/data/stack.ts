import type { ProtocolRow, StackGroup } from '../types/content'

export const stackGroups: StackGroup[] = [
  {
    number: '01',
    title: 'Languages & frameworks',
    items: ['TypeScript', 'JavaScript', 'React', 'HTML & CSS', 'Node.js', 'Python'],
  },
  {
    number: '02',
    title: 'Data & integration',
    items: [
      'REST APIs',
      'JSON',
      'SQL databases',
      'Webhooks',
      'Authentication',
      'Reporting pipelines',
    ],
  },
  {
    number: '03',
    title: 'Platforms & systems',
    items: [
      'Windows',
      'Linux',
      'Microsoft 365',
      'Cloud hosting',
      'Virtualisation',
      'Backup & recovery',
    ],
  },
  {
    number: '04',
    title: 'Networks & control',
    items: [
      'TCP/IP',
      'VLANs & routing',
      'VPN',
      'Modbus',
      'BACnet',
      'MQTT',
      'SNMP',
      'SIP',
    ],
  },
]

/**
 * The readout panel shows how a signal actually travels from equipment to an
 * interface. It is illustrative of the architecture, not live telemetry.
 */
export const protocolChain: ProtocolRow[] = [
  { label: 'Field layer', value: 'Sensors · controllers · I/O' },
  { label: 'Transport', value: 'Modbus · BACnet · MQTT' },
  { label: 'Gateway', value: 'Normalise · buffer · authenticate' },
  { label: 'Application', value: 'REST · database · rules' },
  { label: 'Interface', value: 'Dashboard · alarms · history' },
]
