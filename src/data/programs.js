// Industry-standard commercial building programs
// Sources: BOMA 2024, IBC 2024, ASHRAE, Gensler workplace surveys

export const PROGRAM_CATEGORIES = [
  {
    id: 'vertical',
    label: 'Vertical Circulation & Core',
    icon: '↕',
    programs: [
      { id: 'lobby', label: 'Grand Lobby', color: '#3b82f6', defaultSF: 1200, floorH: 20, sfPerPerson: null, desc: 'Entry lobby / reception atrium', category: 'vertical' },
      { id: 'elevator-core', label: 'Elevator Core', color: '#6366f1', defaultSF: 400, floorH: 14, sfPerPerson: null, desc: '4–6 elevators + waiting', category: 'vertical' },
      { id: 'fire-stair', label: 'Fire Stair / Egress', color: '#ef4444', defaultSF: 200, floorH: 14, sfPerPerson: null, desc: 'Code-required egress stairs', category: 'vertical' },
      { id: 'service-core', label: 'MEP / Service Core', color: '#64748b', defaultSF: 300, floorH: 14, sfPerPerson: null, desc: 'Mechanical, electrical, plumbing shafts', category: 'vertical' },
    ]
  },
  {
    id: 'workspace',
    label: 'Workspace',
    icon: '🖥',
    programs: [
      { id: 'open-office', label: 'Open Plan Office', color: '#0ea5e9', defaultSF: 4000, floorH: 13, sfPerPerson: 150, desc: '150 sf/person avg (BOMA 2024)', category: 'workspace' },
      { id: 'private-office', label: 'Private Offices', color: '#0284c7', defaultSF: 2000, floorH: 13, sfPerPerson: 300, desc: '150–350 sf per exec office', category: 'workspace' },
      { id: 'flex-workspace', label: 'Flexible Workspace', color: '#06b6d4', defaultSF: 3000, floorH: 13, sfPerPerson: 120, desc: 'Hot-desking, activity-based', category: 'workspace' },
      { id: 'hybrid-workspace', label: 'Hybrid / Co-working', color: '#0891b2', defaultSF: 2500, floorH: 13, sfPerPerson: 100, desc: 'Shared desks + phone booths', category: 'workspace' },
      { id: 'executive-suite', label: 'Executive Suite', color: '#7c3aed', defaultSF: 1500, floorH: 14, sfPerPerson: 450, desc: 'C-suite offices + PA stations', category: 'workspace' },
    ]
  },
  {
    id: 'meeting',
    label: 'Meeting & Collaboration',
    icon: '⬡',
    programs: [
      { id: 'conference-lg', label: 'Large Conference Room', color: '#8b5cf6', defaultSF: 800, floorH: 12, sfPerPerson: 25, desc: '20–40 person boardroom', category: 'meeting' },
      { id: 'conference-sm', label: 'Small Meeting Rooms', color: '#a78bfa', defaultSF: 400, floorH: 12, sfPerPerson: 25, desc: '6–10 person huddle rooms', category: 'meeting' },
      { id: 'training-room', label: 'Training / Event Room', color: '#c4b5fd', defaultSF: 1200, floorH: 14, sfPerPerson: 20, desc: 'Classroom + breakout config', category: 'meeting' },
      { id: 'phone-booth', label: 'Focus / Phone Booths', color: '#ddd6fe', defaultSF: 200, floorH: 10, sfPerPerson: 25, desc: 'Single-occupant pods', category: 'meeting' },
    ]
  },
  {
    id: 'amenity',
    label: 'Amenities & Wellness',
    icon: '◈',
    programs: [
      { id: 'cafe', label: 'Café / Coffee Bar', color: '#f59e0b', defaultSF: 800, floorH: 14, sfPerPerson: 15, desc: 'Barista counter + seating', category: 'amenity' },
      { id: 'restaurant', label: 'Restaurant / Food Hall', color: '#d97706', defaultSF: 2000, floorH: 16, sfPerPerson: 15, desc: 'Full-service dining', category: 'amenity' },
      { id: 'break-lounge', label: 'Break Room / Pantry', color: '#fbbf24', defaultSF: 600, floorH: 12, sfPerPerson: 25, desc: '75 sf base + 25 sf/seat (BOMA)', category: 'amenity' },
      { id: 'rooftop-lounge', label: 'Rooftop Lounge / Terrace', color: '#f97316', defaultSF: 2000, floorH: 10, sfPerPerson: 20, desc: 'BOMA 2024 unenclosed amenity', category: 'amenity' },
      { id: 'gym', label: 'Fitness Center / Gym', color: '#10b981', defaultSF: 2000, floorH: 14, sfPerPerson: 50, desc: 'Equipment + locker rooms', category: 'amenity' },
      { id: 'wellness', label: 'Wellness / Meditation', color: '#34d399', defaultSF: 400, floorH: 12, sfPerPerson: 40, desc: 'Quiet rooms, lactation rooms', category: 'amenity' },
    ]
  },
  {
    id: 'retail',
    label: 'Retail & Activation',
    icon: '◻',
    programs: [
      { id: 'storefront', label: 'Storefront / Ground Retail', color: '#ec4899', defaultSF: 1500, floorH: 16, sfPerPerson: null, desc: 'Min 50% ground floor frontage', category: 'retail' },
      { id: 'showroom', label: 'Showroom / Gallery', color: '#db2777', defaultSF: 2000, floorH: 18, sfPerPerson: null, desc: 'Double-height with street presence', category: 'retail' },
      { id: 'bank-branch', label: 'Bank / Financial Services', color: '#be185d', defaultSF: 1200, floorH: 14, sfPerPerson: null, desc: 'Teller counter + private offices', category: 'retail' },
    ]
  },
  {
    id: 'service',
    label: 'Building Services',
    icon: '⚙',
    programs: [
      { id: 'toilet', label: 'Restrooms / Toilets', color: '#94a3b8', defaultSF: 400, floorH: 12, sfPerPerson: null, desc: 'Per IBC: 1 WC per 25 occ.', category: 'service' },
      { id: 'janitor', label: 'Janitorial / Storage', color: '#64748b', defaultSF: 100, floorH: 10, sfPerPerson: null, desc: 'Per floor service closet', category: 'service' },
      { id: 'loading-dock', label: 'Loading Dock', color: '#475569', defaultSF: 800, floorH: 16, sfPerPerson: null, desc: 'Ground floor service access', category: 'service' },
      { id: 'parking', label: 'Parking / Bicycle', color: '#334155', defaultSF: 3000, floorH: 10, sfPerPerson: null, desc: '300–330 sf per parking stall', category: 'service' },
      { id: 'server-room', label: 'Server / IT Room', color: '#1e293b', defaultSF: 300, floorH: 12, sfPerPerson: null, desc: 'Data infrastructure + cooling', category: 'service' },
    ]
  },
  {
    id: 'specialty',
    label: 'Specialty & Future',
    icon: '◆',
    programs: [
      { id: 'lab', label: 'Lab / R&D Space', color: '#14b8a6', defaultSF: 3000, floorH: 14, sfPerPerson: 200, desc: 'BOMA 2024 life science standard', category: 'specialty' },
      { id: 'broadcast', label: 'Broadcast / Media Studio', color: '#0d9488', defaultSF: 1500, floorH: 18, sfPerPerson: null, desc: 'Soundproofed, double-height', category: 'specialty' },
      { id: 'event-space', label: 'Event Space / Auditorium', color: '#0f766e', defaultSF: 4000, floorH: 20, sfPerPerson: 10, desc: '10 sf/person standing event', category: 'specialty' },
      { id: 'childcare', label: 'Childcare / Nursery', color: '#5eead4', defaultSF: 1200, floorH: 12, sfPerPerson: 35, desc: 'Ground or 2nd floor amenity', category: 'specialty' },
    ]
  }
]

export const ALL_PROGRAMS = PROGRAM_CATEGORIES.flatMap(c => c.programs)

export const CIRCULATION_TYPES = [
  {
    id: 'double-loaded',
    label: 'Double-loaded Corridor',
    corridorWidth: 5,
    desc: 'Rooms on both sides — most efficient',
    efficiencyRatio: 0.82,
    color: '#3b82f6'
  },
  {
    id: 'single-loaded',
    label: 'Single-loaded Corridor',
    corridorWidth: 6,
    desc: 'Rooms one side, views opposite — premium',
    efficiencyRatio: 0.72,
    color: '#8b5cf6'
  },
  {
    id: 'open-plan',
    label: 'Open Plan / No Corridor',
    corridorWidth: 0,
    desc: 'Activity-based, no fixed circulation',
    efficiencyRatio: 0.90,
    color: '#10b981'
  },
  {
    id: 'atrium',
    label: 'Atrium / Central Void',
    corridorWidth: 8,
    desc: 'Central light well with perimeter offices',
    efficiencyRatio: 0.68,
    color: '#f59e0b'
  }
]

export const ELEVATOR_CONFIGS = [
  { id: 'e2', label: '2 Elevators', count: 2, sfRange: '0–50,000 sf', coreSize: 280 },
  { id: 'e4', label: '4 Elevators', count: 4, sfRange: '50,000–150,000 sf', coreSize: 480 },
  { id: 'e6', label: '6 Elevators', count: 6, sfRange: '150,000–400,000 sf', coreSize: 680 },
  { id: 'e8', label: '8 Elevators', count: 8, sfRange: '400,000+ sf', coreSize: 880 },
]

export const STAIR_CONFIGS = [
  { id: 's2', label: '2 Fire Stairs (min)', count: 2, ibc: 'IBC §1006 — min 2 egress paths', sfPerStair: 200 },
  { id: 's3', label: '3 Fire Stairs', count: 3, ibc: 'Recommended >150ft travel distance', sfPerStair: 200 },
  { id: 's4', label: '4 Fire Stairs', count: 4, ibc: 'High-rise / large floorplate', sfPerStair: 200 },
]
