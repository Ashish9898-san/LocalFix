/**
 * Sample report data for LocalFix (Phase 2)
 *
 * Schema:
 * - id: Unique string identifier (e.g., 'REP-101')
 * - title: Concise summary of the issue
 * - description: Detailed context and description
 * - category: 'Roads' | 'Garbage' | 'Streetlights' | 'Water Leakage' | 'Public Property'
 * - location: Landmark or street address
 * - status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'
 * - createdAt: ISO 8601 timestamp string
 * - priority: 'Low' | 'Medium' | 'High'
 * - imageUrl: (optional) URL or base64 image data string
 */

export const INITIAL_SAMPLE_REPORTS = [
  {
    id: 'REP-101',
    title: 'Deep Pothole on Main Street near Bakery',
    description: 'There is a dangerous, deep pothole in the right lane right outside the Sunshine Bakery. Multiple two-wheelers have nearly lost control, especially after evening rain.',
    category: 'Roads',
    location: '142 Main Street, near Sunshine Bakery',
    status: 'IN_PROGRESS',
    createdAt: '2026-10-18T09:15:00Z',
    priority: 'High',
    imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'REP-102',
    title: 'Overflowing Municipal Garbage Bin',
    description: 'The community garbage dumpster has not been emptied for four days. Waste is spilling onto the pedestrian walkway and attracting stray animals and pests.',
    category: 'Garbage',
    location: 'Corner of 4th Avenue and Oak Lane, Block B',
    status: 'PENDING',
    createdAt: '2026-10-19T14:40:00Z',
    priority: 'Medium',
    imageUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'REP-103',
    title: 'Flickering Streetlight in School Zone',
    description: 'The streetlight directly opposite the primary school entrance is either completely dead or constantly flickering, making the crossing unsafe at night.',
    category: 'Streetlights',
    location: 'Greenwood Primary School Gate, Park Road',
    status: 'RESOLVED',
    createdAt: '2026-10-14T18:20:00Z',
    priority: 'Medium',
    imageUrl: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'REP-104',
    title: 'Major Water Pipe Burst Flooding Crossroad',
    description: 'A pressurized underground clean water pipe ruptured this morning. Clean drinking water is gushing out rapidly and flooding the intersection, causing traffic slowdowns and water wastage.',
    category: 'Water Leakage',
    location: 'Intersection of River Road and Market Cross',
    status: 'IN_PROGRESS',
    createdAt: '2026-10-20T07:50:00Z',
    priority: 'High',
    imageUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'REP-105',
    title: 'Broken Park Bench with Exposed Nails',
    description: 'One of the wooden park benches near the children play area has collapsed wooden planks with rusted nails sticking out, presenting a hazard for visitors.',
    category: 'Public Property',
    location: 'City Central Park, Children Play Zone South',
    status: 'PENDING',
    createdAt: '2026-10-20T16:10:00Z',
    priority: 'Low',
    imageUrl: null,
  },
  {
    id: 'REP-106',
    title: 'Damaged Guardrail on Overpass',
    description: 'A 10-foot section of the safety guardrail on the western ramp was broken after a recent collision and requires immediate replacement for vehicle safety.',
    category: 'Roads',
    location: 'West Ring Road Flyover, Ramp 2',
    status: 'PENDING',
    createdAt: '2026-10-21T08:00:00Z',
    priority: 'High',
    imageUrl: null,
  },
  {
    id: 'REP-107',
    title: 'Non-functioning Streetlights on Pedestrian Walkway',
    description: 'A sequence of three consecutive streetlights along the canal promenade are out, leaving a 200-meter stretch completely dark for evening joggers and walkers.',
    category: 'Streetlights',
    location: 'Canal Promenade, between bridges 3 and 4',
    status: 'IN_PROGRESS',
    createdAt: '2026-10-17T19:05:00Z',
    priority: 'Medium',
    imageUrl: null,
  },
  {
    id: 'REP-108',
    title: 'Clogged Storm Drain Causing Stagnant Water',
    description: 'The stormwater drain is blocked by solid debris and leaf buildup, causing a pool of stagnant water to accumulate on the road shoulder.',
    category: 'Water Leakage',
    location: '77 Silver Crescent, North Enclave',
    status: 'RESOLVED',
    createdAt: '2026-10-15T11:30:00Z',
    priority: 'Low',
    imageUrl: null,
  }
];

export const CATEGORIES = [
  'All',
  'Roads',
  'Garbage',
  'Streetlights',
  'Water Leakage',
  'Public Property'
];

export const STATUSES = [
  'All',
  'PENDING',
  'IN_PROGRESS',
  'RESOLVED'
];
