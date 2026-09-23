import {
  Estate,
  Location,
  Zone,
  Employee,
  Project,
  ManpowerAllocation,
  ProjectNote,
  Proposal,
  ProposalOption,
  ChecklistSubmission,
  TradeSpecialtyItem,
  CategoryItem,
  PriorityItem,
  TradeSpecialty,
  QualityGateItem,
  ProjectStatus,
  User,
  Snapshot,
  SnapshotRecordSummary
} from '../types';
import { encryptData, decryptData, computeChecksum } from '../utils/crypto';

const STORAGE_KEYS = {
  ESTATES: 'buildflow_estates',
  LOCATIONS: 'buildflow_locations',
  ZONES: 'buildflow_zones',
  EMPLOYEES: 'buildflow_employees',
  PROJECTS: 'buildflow_projects',
  ALLOCATIONS: 'buildflow_allocations',
  NOTES: 'buildflow_notes',
  PROPOSALS: 'buildflow_proposals',
  CHECKLISTS: 'buildflow_checklists',
  TRADES: 'buildflow_trades',
  CATEGORIES: 'buildflow_categories',
  PRIORITIES: 'buildflow_priorities',
  QUALITY_GATES: 'buildflow_quality_gates',
  USERS: 'buildflow_users',
  SNAPSHOTS: 'buildflow_snapshots',
  INITIALIZED: 'buildflow_initialized_v9' // Seeded with 50 workers, 4 projects, 5 user accounts & baseline snapshot
};

// Seed 50 employees with Pinoy male celebrity names, random portrait avatars, and deployable statuses
function generateSeedEmployees(): Employee[] {
  const trades: TradeSpecialty[] = [
    'carpentry',
    'electrical',
    'masonry',
    'plumbing',
    'painting',
    'hvac',
    'landscaping',
    'general'
  ];

  const pinoyMaleCelebrities = [
    'Piolo Pascual',
    'Jericho Rosales',
    'Dingdong Dantes',
    'Coco Martin',
    'Alden Richards',
    'Daniel Padilla',
    'Enrique Gil',
    'James Reid',
    'Paulo Avelino',
    'John Lloyd Cruz',
    'Gerald Anderson',
    'Richard Gutierrez',
    'Derek Ramsay',
    'Xian Lim',
    'Dennis Trillo',
    'Zanjoe Marudo',
    'Enchong Dee',
    'Matteo Guidicelli',
    'Carlo Aquino',
    'Sam Milby',
    'Diether Ocampo',
    'Vhong Navarro',
    'Joshua Garcia',
    'Donny Pangilinan',
    'Ian Veneracion',
    'Edu Manzano',
    'Richard Gomez',
    'Aga Muhlach',
    'Gabby Concepcion',
    'Robin Padilla',
    'Cesar Montano',
    'Christopher de Leon',
    'Tirso Cruz III',
    'Gary Valenciano',
    'Martin Nievera',
    'Ogie Alcasid',
    'Dingdong Avanzado',
    'Ariel Rivera',
    'Janno Gibbs',
    'Billy Crawford',
    'Christian Bautista',
    'Erik Santos',
    'Mark Bautista',
    'Rayver Cruz',
    'Rodjun Cruz',
    'Jake Cuenca',
    'Arjo Atayde',
    'JM de Guzman',
    'Khalil Ramos',
    'Seth Fedelin'
  ];

  // High quality sample portrait avatars
  const avatarList = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  ];

  const employees: Employee[] = [];
  
  for (let i = 0; i < 50; i++) {
    const fullName = pinoyMaleCelebrities[i % pinoyMaleCelebrities.length];
    const trade = trades[i % trades.length];
    const isDeployable = i < 35; // 35 field deployable, 15 shop/off-site

    employees.push({
      id: `emp-${i + 1}`,
      externalPwaId: `PWA-HR-${1001 + i}`,
      fullName,
      tradeSpecialty: trade,
      avatarUrl: avatarList[i % avatarList.length],
      isDeployable,
      isActive: true,
      phoneRestrictedAcknowledged: true,
      createdAt: '2026-01-01T08:00:00.000Z'
    });
  }

  return employees;
}

function getSeedEstates(): Estate[] {
  return [
    {
      id: 'est-sanctuary',
      name: 'Grand Sanctuary (69k sqm)',
      type: 'estate',
      totalAreaSqm: 69000,
      address: 'Highlands Private Enclave, Lot 1-14',
      isActive: true,
      createdAt: '2026-01-01T08:00:00.000Z'
    },
    {
      id: 'est-res-1',
      name: 'Crown Villa',
      type: 'residential',
      totalAreaSqm: 4200,
      address: 'Pacific Ridge Overlook, Sector 4',
      isActive: true,
      createdAt: '2026-01-02T08:00:00.000Z'
    },
    {
      id: 'est-res-2',
      name: 'Harbor Crest',
      type: 'residential',
      totalAreaSqm: 3800,
      address: 'Marina Promontory, Berth 12',
      isActive: true,
      createdAt: '2026-01-03T08:00:00.000Z'
    },
    {
      id: 'est-offices',
      name: 'Executive Offices',
      type: 'office',
      totalAreaSqm: 7500,
      address: 'Financial Center Tower 1, Floors 48-52',
      isActive: true,
      createdAt: '2026-01-05T08:00:00.000Z'
    }
  ];
}

function getSeedLocations(): Location[] {
  return [
    { id: 'loc-ge-main', estateId: 'est-sanctuary', name: 'Main Manor', buildingCode: 'MAN-01', isActive: true, createdAt: '2026-01-10T08:00:00.000Z' },
    { id: 'loc-ge-grounds', estateId: 'est-sanctuary', name: 'Estate Grounds', buildingCode: 'GRD-01', isActive: true, createdAt: '2026-01-10T08:00:00.000Z' },
    
    { id: 'loc-res-1-main', estateId: 'est-res-1', name: 'Pool Compound', buildingCode: 'CV-01', isActive: true, createdAt: '2026-01-12T08:00:00.000Z' },
    { id: 'loc-res-2-main', estateId: 'est-res-2', name: 'Main House', buildingCode: 'HC-01', isActive: true, createdAt: '2026-01-15T08:00:00.000Z' },
    
    { id: 'loc-off-1', estateId: 'est-offices', name: 'Tower 1', buildingCode: 'HQ-50', isActive: true, createdAt: '2026-01-20T08:00:00.000Z' }
  ];
}

function getSeedZones(): Zone[] {
  return [
    { id: 'zn-ge-roof', locationId: 'loc-ge-main', name: 'Roof Deck', floorOrLevel: 'Roof Deck', isActive: true, createdAt: '2026-01-10T08:00:00.000Z' },
    { id: 'zn-ge-lawn', locationId: 'loc-ge-grounds', name: 'Garden Lawn', floorOrLevel: 'Grounds', isActive: true, createdAt: '2026-01-10T08:00:00.000Z' },
    { id: 'zn-cv-pool', locationId: 'loc-res-1-main', name: 'Pool Deck', floorOrLevel: 'Terrace', isActive: true, createdAt: '2026-01-12T08:00:00.000Z' },
    { id: 'zn-hc-kitchen', locationId: 'loc-res-2-main', name: 'Kitchen', floorOrLevel: 'Ground Floor', isActive: true, createdAt: '2026-01-15T08:00:00.000Z' },
    { id: 'zn-off-1-board', locationId: 'loc-off-1', name: 'Meeting Room 50A', floorOrLevel: '50th Floor', isActive: true, createdAt: '2026-01-20T08:00:00.000Z' }
  ];
}

function getSeedProjects(): Project[] {
  const now = Date.now();
  const h = 3600000;

  return [
    {
      id: 'proj-1',
      zoneId: 'zn-ge-roof',
      title: 'Grand Sanctuary: Roof Waterproofing',
      category: 'renovation',
      status: 'active',
      progressPercentage: 82,
      currentStageSummary: 'Applying waterproof seal on roof deck. Water testing tomorrow.',
      priority: 'high',
      targetStartDate: '2026-09-10',
      targetCompletionDate: '2026-09-28',
      lastProgressUpdatedAt: new Date(now - 1.5 * h).toISOString(),
      createdAt: '2026-09-08T08:00:00.000Z'
    },
    {
      id: 'proj-2',
      zoneId: 'zn-cv-pool',
      title: 'Crown Villa: Pool Deck Refinishing',
      category: 'construction',
      status: 'active',
      progressPercentage: 64,
      currentStageSummary: 'Sanding wooden deck planks and applying protective outdoor seal.',
      priority: 'normal',
      targetStartDate: '2026-09-12',
      targetCompletionDate: '2026-09-30',
      lastProgressUpdatedAt: new Date(now - 3.2 * h).toISOString(),
      createdAt: '2026-09-10T08:00:00.000Z'
    },
    {
      id: 'proj-3',
      zoneId: 'zn-hc-kitchen',
      title: 'Harbor Crest: Kitchen Countertop Install',
      category: 'renovation',
      status: 'paused',
      progressPercentage: 35,
      currentStageSummary: 'Waiting for client to choose countertop color and design.',
      priority: 'normal',
      targetStartDate: '2026-09-18',
      targetCompletionDate: '2026-10-10',
      lastProgressUpdatedAt: new Date(now - 36 * h).toISOString(),
      createdAt: '2026-09-16T08:00:00.000Z'
    },
    {
      id: 'proj-4',
      zoneId: 'zn-off-1-board',
      title: 'Executive Offices: Meeting Room Soundproofing',
      category: 'renovation',
      status: 'completed',
      progressPercentage: 100,
      currentStageSummary: 'Wall panels installed and sound tested. Ready for use.',
      priority: 'vip_urgent',
      targetStartDate: '2026-09-05',
      targetCompletionDate: '2026-09-18',
      lastProgressUpdatedAt: new Date(now - 48 * h).toISOString(),
      createdAt: '2026-09-04T08:00:00.000Z'
    }
  ];
}

function getSeedAllocations(employees: Employee[]): ManpowerAllocation[] {
  const allocs: ManpowerAllocation[] = [];
  const deployable = employees.filter(e => e.isDeployable);
  const today = '2026-09-23';

  // Proj 1: Roof Waterproofing (6 workers)
  deployable.slice(0, 6).forEach((emp, i) => {
    allocs.push({
      id: `alloc-1-${i}`,
      projectId: 'proj-1',
      employeeId: emp.id,
      assignedDate: today,
      isLead: i === 0
    });
  });

  // Proj 2: Pool Deck (6 workers)
  deployable.slice(6, 12).forEach((emp, i) => {
    allocs.push({
      id: `alloc-2-${i}`,
      projectId: 'proj-2',
      employeeId: emp.id,
      assignedDate: today,
      isLead: i === 0
    });
  });

  return allocs;
}

function getSeedNotes(): ProjectNote[] {
  return [
    {
      id: 'note-1',
      projectId: 'proj-4',
      noteType: 'vip_instruction',
      authorName: 'Site Supervisor',
      content: 'Client requested natural wool fabric. Samples submitted and approved.',
      createdAt: '2026-09-21T10:30:00.000Z'
    },
    {
      id: 'note-2',
      projectId: 'proj-3',
      noteType: 'delay_warning',
      authorName: 'Lead Supervisor',
      content: 'Waiting for client to pick stone color. Team assigned to prep work.',
      createdAt: '2026-09-22T08:15:00.000Z'
    },
    {
      id: 'note-3',
      projectId: 'proj-2',
      noteType: 'site_feedback',
      authorName: 'Lead Carpenter',
      content: 'Deck planks aligned and sanded. 6 carpenters on site today.',
      createdAt: '2026-09-23T09:00:00.000Z'
    }
  ];
}

function getSeedProposals(): Proposal[] {
  const h = 3600000;
  return [
    {
      id: 'prop-1',
      projectId: 'proj-4',
      title: 'Meeting Room 50A Soundproof Wall Panels',
      status: 'submitted',
      submittedToVipAt: new Date(Date.now() - 52 * h).toISOString(),
      followUpDueAt: new Date(Date.now() - 4 * h).toISOString(),
      feedbackNotes: 'Waiting for client choice between Linen vs Wool felt vs Wood veneer',
      createdAt: new Date(Date.now() - 54 * h).toISOString(),
      options: [
        {
          id: 'opt-1-1',
          proposalId: 'prop-1',
          optionNumber: 1,
          title: 'Option A: Acoustic Linen Fabric',
          materialsInStock: true,
          estimatedTimelineDays: 4,
          estimatedManpower: 3,
          designPegsReference: 'Modern Office Design p.12',
          physicalSamplesReady: true,
          pros: 'Materials in stock. Fast 4-day install.',
          cons: 'Lighter color needs regular cleaning.'
        },
        {
          id: 'opt-1-2',
          proposalId: 'prop-1',
          optionNumber: 2,
          title: 'Option B: Brushed Wool Felt',
          materialsInStock: true,
          estimatedTimelineDays: 6,
          estimatedManpower: 4,
          designPegsReference: 'Executive Lounge Spec Ref #104',
          physicalSamplesReady: true,
          pros: 'Best sound absorption and stain-resistant.',
          cons: 'Takes 2 days longer to install.'
        },
        {
          id: 'opt-1-3',
          proposalId: 'prop-1',
          optionNumber: 3,
          title: 'Option C: Natural Walnut Wood Panels',
          materialsInStock: false,
          estimatedTimelineDays: 12,
          estimatedManpower: 5,
          designPegsReference: 'Conference Room Portfolio',
          physicalSamplesReady: true,
          pros: 'Matches existing conference table wood perfectly.',
          cons: 'Wood panels take 1 week to deliver.'
        }
      ]
    },
    {
      id: 'prop-2',
      projectId: 'proj-3',
      title: 'Kitchen Island Countertop Options',
      status: 'draft',
      createdAt: new Date(Date.now() - 12 * h).toISOString(),
      options: [
        {
          id: 'opt-2-1',
          proposalId: 'prop-2',
          optionNumber: 1,
          title: 'Option A: White Italian Marble',
          materialsInStock: true,
          estimatedTimelineDays: 3,
          estimatedManpower: 4,
          designPegsReference: 'Villa Residence Spec #09',
          physicalSamplesReady: true,
          pros: 'Clean natural gray and gold veins. Slabs ready in warehouse.',
          cons: 'Needs annual sealing against citrus/acid liquids.'
        },
        {
          id: 'opt-2-2',
          proposalId: 'prop-2',
          optionNumber: 2,
          title: 'Option B: Natural Quartzite',
          materialsInStock: true,
          estimatedTimelineDays: 4,
          estimatedManpower: 4,
          designPegsReference: 'Kitchen Stone Catalog #22',
          physicalSamplesReady: true,
          pros: 'Scratch and heat proof, highly durable.',
          cons: 'Slightly darker stone tone.'
        }
      ]
    }
  ];
}

function getSeedTrades(): TradeSpecialtyItem[] {
  return [
    { id: 'trd-1', key: 'carpentry', name: 'Carpentry', category: 'Finishes', description: 'Wood framing, cabinets, doors, and wood deck installation.', isActive: true, createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'trd-2', key: 'electrical', name: 'Electrical', category: 'MEP', description: 'Power outlets, lighting, breaker boxes, and wire installation.', isActive: true, createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'trd-3', key: 'masonry', name: 'Masonry & Tiling', category: 'Structure', description: 'Brick, stone, floor tiles, and marble countertop installation.', isActive: true, createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'trd-4', key: 'plumbing', name: 'Plumbing', category: 'MEP', description: 'Water pipes, drainage, faucets, and water heater fixtures.', isActive: true, createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'trd-5', key: 'painting', name: 'Painting', category: 'Finishes', description: 'Interior and exterior wall painting, wood stain, and waterproofing.', isActive: true, createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'trd-6', key: 'hvac', name: 'Air Conditioning & HVAC', category: 'MEP', description: 'Cooling, ventilation ducts, and air filters.', isActive: true, createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'trd-7', key: 'landscaping', name: 'Landscaping', category: 'Grounds', description: 'Grass mowing, tree trimming, garden care, and sprinklers.', isActive: true, createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'trd-8', key: 'general', name: 'General Labor', category: 'General', description: 'Site cleanup, scaffolding, hauling materials, and safety setup.', isActive: true, createdAt: '2026-01-01T00:00:00.000Z' }
  ];
}

function getSeedCategories(): CategoryItem[] {
  return [
    { id: 'cat-1', key: 'renovation', name: 'Renovation & Remodeling', description: 'Restoration, surface refinishing, architectural upgrades, and spatial reconfigurations.', isActive: true, createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'cat-2', key: 'construction', name: 'Ground-Up & Structural Construction', description: 'New structures, pavilions, foundation work, pool building, and heavy engineering.', isActive: true, createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'cat-3', key: 'maintenance', name: 'Preventive & Corrective Maintenance', description: 'Chiller servicing, roof membrane testing, irrigation line repairs, and periodic inspections.', isActive: true, createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'cat-4', key: 'proposal', name: 'Design & Architectural Proposal', description: 'Dossiers with comparative options, swatches, and pros/cons awaiting VIP approval.', isActive: true, createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'cat-5', key: 'interior_fitout', name: 'Luxury Interior Fit-Out', description: 'Bespoke acoustic panelling, millwork, Italian marble islands, and lighting scenes.', isActive: true, createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'cat-6', key: 'grounds_exterior', name: 'Grounds & Exterior Infrastructure', description: 'Extensive 69k sqm estate landscape, stone pathways, boundary fencing, and perimeter security.', isActive: true, createdAt: '2026-01-01T00:00:00.000Z' }
  ];
}

function getSeedPriorities(): PriorityItem[] {
  return [
    { id: 'prio-1', key: 'vip_urgent', name: 'VIP Urgent', level: 4, colorTag: 'var(--accent-red)', description: 'Critical priority directly affecting principal residence or VIP executive schedule.', isActive: true, createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'prio-2', key: 'high', name: 'High Priority', level: 3, colorTag: 'var(--accent-amber)', description: 'Accelerated workstream requiring dedicated manpower focus and daily status reporting.', isActive: true, createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'prio-3', key: 'normal', name: 'Normal Priority', level: 2, colorTag: 'var(--text-secondary)', description: 'Standard operational timeline with regular milestone progression.', isActive: true, createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'prio-4', key: 'low', name: 'Low / Scheduled Routine', level: 1, colorTag: 'var(--text-tertiary)', description: 'Non-disruptive routine maintenance or deferred cosmetic works.', isActive: true, createdAt: '2026-01-01T00:00:00.000Z' }
  ];
}

function getSeedQualityGates(): QualityGateItem[] {
  return [
    {
      id: 'qg-1',
      title: 'Material Availability in Stock',
      description: 'Verified present on-site or reserved in central warehouse.',
      iconName: 'Box',
      isMandatory: true,
      order: 1,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'qg-2',
      title: 'Assigned Deployable Manpower',
      description: 'Headcount and trades allocated from deployable roster.',
      iconName: 'Users',
      isMandatory: true,
      order: 2,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'qg-3',
      title: 'Timeline & Target Milestones',
      description: 'Start date, critical path, and handover deadline confirmed.',
      iconName: 'Clock',
      isMandatory: true,
      order: 3,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'qg-4',
      title: 'Minimum 2 Options Provided',
      description: 'VIP strictly requires comparative choices (Option A, B, etc.).',
      iconName: 'Layers',
      isMandatory: true,
      order: 4,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'qg-5',
      title: 'Design Pegs & References Attached',
      description: 'Curated architectural inspiration or precedent dossiers.',
      iconName: 'Eye',
      isMandatory: true,
      order: 5,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'qg-6',
      title: 'Physical Samples / Swatches Prepared',
      description: 'Material swatches ready for physical client inspection.',
      iconName: 'CheckCircle2',
      isMandatory: true,
      order: 6,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'qg-7',
      title: 'Pros & Cons Matrix Completed',
      description: 'Clear trade-offs, durability, and aesthetics detailed per option.',
      iconName: 'Scale',
      isMandatory: true,
      order: 7,
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z'
    }
  ];
}

function getSeedUsers(): User[] {
  return [
    {
      id: 'usr-1',
      username: 'admin',
      fullName: 'Marcus Vance',
      email: 'admin@buildflow.vip',
      role: 'admin',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      phone: '+63 917 101 2001',
      department: 'Executive Directorate',
      lastLoginAt: '2026-09-23T08:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'usr-2',
      username: 'jdelacruz',
      fullName: 'Juan Dela Cruz',
      email: 'j.delacruz@buildflow.vip',
      role: 'supervisor',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      phone: '+63 918 202 3002',
      department: 'Site Operations',
      lastLoginAt: '2026-09-22T14:30:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'usr-3',
      username: 'rsantos',
      fullName: 'Roberto Santos',
      email: 'r.santos@buildflow.vip',
      role: 'lead',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      phone: '+63 919 303 4003',
      department: 'MEP & Structures',
      lastLoginAt: '2026-09-21T09:15:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'usr-4',
      username: 'ctan',
      fullName: 'Clarissa Tan',
      email: 'c.tan@buildflow.vip',
      role: 'vip_representative',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      phone: '+63 920 404 5004',
      department: 'Client VIP Liaison',
      lastLoginAt: '2026-09-20T16:45:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'usr-5',
      username: 'mreyes',
      fullName: 'Mateo Reyes',
      email: 'm.reyes@buildflow.vip',
      role: 'inspector',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      isActive: true,
      phone: '+63 921 505 6005',
      department: 'Quality Assurance',
      lastLoginAt: '2026-09-23T07:20:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z'
    }
  ];
}

class StorageService {
  constructor() {
    this.init();
  }

  // Cryptographic wrapper helpers
  private getSecureItem<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return defaultValue;
      const res = decryptData<T>(raw, defaultValue);
      return res ?? defaultValue;
    } catch (err) {
      console.warn(`Error reading secure item "${key}":`, err);
      return defaultValue;
    }
  }

  private setSecureItem<T>(key: string, data: T) {
    if (typeof window === 'undefined') return;
    try {
      const cipher = encryptData(data);
      localStorage.setItem(key, cipher);
    } catch (err) {
      console.warn(`Error writing secure item "${key}":`, err);
    }
  }

  private init() {
    if (typeof window === 'undefined') return;
    try {
      const initStatus = localStorage.getItem(STORAGE_KEYS.INITIALIZED);

      // If user clicked Delete All Records, keep the database empty for fresh start!
      if (initStatus === 'cleared') {
        return;
      }

      const estates = this.getEstates();
      const employees = this.getEmployees();
      const projects = this.getProjects();

      // If database version changed, or core tables are empty/corrupted, reload clean sample data
      if (initStatus !== STORAGE_KEYS.INITIALIZED || estates.length === 0 || employees.length === 0 || projects.length === 0) {
        this.loadSampleData();
      } else {
        // Ensure users exist if updating from earlier version
        if (this.getUsers().length === 0) {
          this.setSecureItem(STORAGE_KEYS.USERS, getSeedUsers());
        }
      }
    } catch (err) {
      console.warn('Storage initialization fallback:', err);
      this.loadSampleData();
    }
  }

  // --- Estates ---
  getEstates(): Estate[] {
    const list = this.getSecureItem<Estate[]>(STORAGE_KEYS.ESTATES, []);
    return Array.isArray(list) ? list : [];
  }

  saveEstate(estate: Estate): Estate {
    const list = this.getEstates();
    const index = list.findIndex(e => e.id === estate.id);
    if (index >= 0) {
      list[index] = estate;
    } else {
      list.push(estate);
    }
    this.setSecureItem(STORAGE_KEYS.ESTATES, list);
    return estate;
  }

  deleteEstate(estateId: string) {
    let list = this.getEstates();
    list = list.filter(e => e.id !== estateId);
    this.setSecureItem(STORAGE_KEYS.ESTATES, list);
  }

  // --- Locations ---
  getLocations(): Location[] {
    const list = this.getSecureItem<Location[]>(STORAGE_KEYS.LOCATIONS, []);
    return Array.isArray(list) ? list : [];
  }

  saveLocation(location: Location): Location {
    const list = this.getLocations();
    const index = list.findIndex(l => l.id === location.id);
    if (index >= 0) {
      list[index] = location;
    } else {
      list.push(location);
    }
    this.setSecureItem(STORAGE_KEYS.LOCATIONS, list);
    return location;
  }

  deleteLocation(locationId: string) {
    let list = this.getLocations();
    list = list.filter(l => l.id !== locationId);
    this.setSecureItem(STORAGE_KEYS.LOCATIONS, list);
  }

  // --- Zones ---
  getZones(): Zone[] {
    const list = this.getSecureItem<Zone[]>(STORAGE_KEYS.ZONES, []);
    return Array.isArray(list) ? list : [];
  }

  saveZone(zone: Zone): Zone {
    const list = this.getZones();
    const index = list.findIndex(z => z.id === zone.id);
    if (index >= 0) {
      list[index] = zone;
    } else {
      list.push(zone);
    }
    this.setSecureItem(STORAGE_KEYS.ZONES, list);
    return zone;
  }

  deleteZone(zoneId: string) {
    let list = this.getZones();
    list = list.filter(z => z.id !== zoneId);
    this.setSecureItem(STORAGE_KEYS.ZONES, list);
  }

  // --- Employees (Workforce roster) ---
  getEmployees(): Employee[] {
    const list = this.getSecureItem<Employee[]>(STORAGE_KEYS.EMPLOYEES, []);
    return Array.isArray(list) ? list : [];
  }

  saveEmployee(employee: Employee): Employee {
    const list = this.getEmployees();
    const index = list.findIndex(e => e.id === employee.id);
    if (index >= 0) {
      list[index] = employee;
    } else {
      list.push(employee);
    }
    this.setSecureItem(STORAGE_KEYS.EMPLOYEES, list);
    return employee;
  }

  bulkAddEmployees(newEmployees: Employee[]): Employee[] {
    const list = this.getEmployees();
    for (const emp of newEmployees) {
      const index = list.findIndex(e => e.id === emp.id);
      if (index >= 0) {
        list[index] = emp;
      } else {
        list.push(emp);
      }
    }
    this.setSecureItem(STORAGE_KEYS.EMPLOYEES, list);
    return list;
  }

  deleteEmployee(employeeId: string) {
    let list = this.getEmployees();
    list = list.filter(e => e.id !== employeeId);
    this.setSecureItem(STORAGE_KEYS.EMPLOYEES, list);

    // Also remove any allocations for this employee
    let allocs = this.getAllocations();
    allocs = allocs.filter(a => a.employeeId !== employeeId);
    this.setSecureItem(STORAGE_KEYS.ALLOCATIONS, allocs);
  }

  toggleEmployeeDeployable(employeeId: string): Employee | null {
    const list = this.getEmployees();
    const emp = list.find(e => e.id === employeeId);
    if (emp) {
      emp.isDeployable = !emp.isDeployable;
      this.setSecureItem(STORAGE_KEYS.EMPLOYEES, list);
      return emp;
    }
    return null;
  }

  // --- Projects ---
  getProjects(): Project[] {
    const rawProjects = this.getSecureItem<Project[]>(STORAGE_KEYS.PROJECTS, []);
    const projects: Project[] = Array.isArray(rawProjects) ? rawProjects : [];
    const allocations = this.getAllocations();

    return projects.map(p => ({
      ...p,
      assignedCrewCount: allocations.filter(a => a.projectId === p.id).length
    }));
  }

  saveProject(project: Project): Project {
    const list = this.getSecureItem<Project[]>(STORAGE_KEYS.PROJECTS, []);
    const index = list.findIndex(p => p.id === project.id);
    const updated = {
      ...project,
      lastProgressUpdatedAt: new Date().toISOString()
    };
    if (index >= 0) {
      list[index] = updated;
    } else {
      list.unshift(updated);
    }
    this.setSecureItem(STORAGE_KEYS.PROJECTS, list);
    return updated;
  }

  updateProjectProgress(projectId: string, progressPercentage: number, stageSummary?: string): Project | null {
    const list = this.getSecureItem<Project[]>(STORAGE_KEYS.PROJECTS, []);
    const index = list.findIndex(p => p.id === projectId);
    if (index >= 0) {
      const clamped = Math.max(0, Math.min(100, progressPercentage));
      list[index].progressPercentage = clamped;
      if (stageSummary !== undefined) {
        list[index].currentStageSummary = stageSummary;
      }
      list[index].lastProgressUpdatedAt = new Date().toISOString();
      if (clamped === 100) {
        list[index].status = 'completed';
      } else if (list[index].status === 'completed' && clamped < 100) {
        list[index].status = 'active';
      }
      this.setSecureItem(STORAGE_KEYS.PROJECTS, list);
      return list[index];
    }
    return null;
  }

  updateProjectStatus(projectId: string, newStatus: ProjectStatus): Project | null {
    const list = this.getSecureItem<Project[]>(STORAGE_KEYS.PROJECTS, []);
    const index = list.findIndex(p => p.id === projectId);
    if (index >= 0) {
      list[index].status = newStatus;
      list[index].lastProgressUpdatedAt = new Date().toISOString();
      if (newStatus === 'completed' && list[index].progressPercentage < 100) {
        list[index].progressPercentage = 100;
        list[index].currentStageSummary = list[index].currentStageSummary || 'Completed and signed off';
      } else if (newStatus === 'active' && list[index].progressPercentage === 100) {
        list[index].progressPercentage = 95;
      }
      this.setSecureItem(STORAGE_KEYS.PROJECTS, list);
      return {
        ...list[index],
        assignedCrewCount: this.getAllocations().filter(a => a.projectId === list[index].id).length
      };
    }
    return null;
  }

  deleteProject(projectId: string) {
    let list = this.getSecureItem<Project[]>(STORAGE_KEYS.PROJECTS, []);
    list = list.filter(p => p.id !== projectId);
    this.setSecureItem(STORAGE_KEYS.PROJECTS, list);

    // Also remove any allocations for this project
    let allocs = this.getAllocations();
    allocs = allocs.filter(a => a.projectId !== projectId);
    this.setSecureItem(STORAGE_KEYS.ALLOCATIONS, allocs);
  }

  // --- Allocations (Fluid Manpower) ---
  getAllocations(): ManpowerAllocation[] {
    const list = this.getSecureItem<ManpowerAllocation[]>(STORAGE_KEYS.ALLOCATIONS, []);
    return Array.isArray(list) ? list : [];
  }

  assignEmployeeToProject(employeeId: string, projectId: string, isLead = false): ManpowerAllocation {
    let list = this.getAllocations();
    list = list.filter(a => a.employeeId !== employeeId);

    const newAlloc: ManpowerAllocation = {
      id: `alloc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      employeeId,
      assignedDate: new Date().toISOString().split('T')[0],
      isLead
    };
    list.push(newAlloc);
    this.setSecureItem(STORAGE_KEYS.ALLOCATIONS, list);
    return newAlloc;
  }

  removeEmployeeFromProject(employeeId: string, projectId: string) {
    let list = this.getAllocations();
    list = list.filter(a => !(a.employeeId === employeeId && a.projectId === projectId));
    this.setSecureItem(STORAGE_KEYS.ALLOCATIONS, list);
  }

  bulkReassign(employeeIds: string[], targetProjectId: string) {
    let list = this.getAllocations();
    list = list.filter(a => !employeeIds.includes(a.employeeId));
    const today = new Date().toISOString().split('T')[0];
    
    employeeIds.forEach(empId => {
      list.push({
        id: `alloc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        projectId: targetProjectId,
        employeeId: empId,
        assignedDate: today,
        isLead: false
      });
    });
    this.setSecureItem(STORAGE_KEYS.ALLOCATIONS, list);
  }

  // --- Notes & VIP Instructions ---
  getNotes(projectId?: string): ProjectNote[] {
    const list: ProjectNote[] = this.getSecureItem(STORAGE_KEYS.NOTES, []);
    if (projectId) {
      return list.filter(n => n.projectId === projectId);
    }
    return list;
  }

  addNote(projectId: string, noteType: ProjectNote['noteType'], authorName: string, content: string): ProjectNote {
    const list = this.getNotes();
    const newNote: ProjectNote = {
      id: `note-${Date.now()}`,
      projectId,
      noteType,
      authorName,
      content,
      createdAt: new Date().toISOString()
    };
    list.unshift(newNote);
    this.setSecureItem(STORAGE_KEYS.NOTES, list);
    return newNote;
  }

  // --- Proposals & Comparative Options ---
  getProposals(projectId?: string): Proposal[] {
    const list: Proposal[] = this.getSecureItem(STORAGE_KEYS.PROPOSALS, []);
    if (projectId) {
      return list.filter(p => p.projectId === projectId);
    }
    return list;
  }

  saveProposal(proposal: Proposal): Proposal {
    const list = this.getProposals();
    const index = list.findIndex(p => p.id === proposal.id);
    if (index >= 0) {
      list[index] = proposal;
    } else {
      list.unshift(proposal);
    }
    this.setSecureItem(STORAGE_KEYS.PROPOSALS, list);
    return proposal;
  }

  // --- Quality Gate Checklist Submissions ---
  getChecklists(projectId?: string): ChecklistSubmission[] {
    const list: ChecklistSubmission[] = this.getSecureItem(STORAGE_KEYS.CHECKLISTS, []);
    if (projectId) {
      return list.filter(c => c.projectId === projectId);
    }
    return list;
  }

  saveChecklist(checklist: ChecklistSubmission): ChecklistSubmission {
    const list = this.getChecklists();
    list.unshift(checklist);
    this.setSecureItem(STORAGE_KEYS.CHECKLISTS, list);
    return checklist;
  }

  // --- Dynamic Trade Specialties ---
  getTrades(): TradeSpecialtyItem[] {
    const trades: TradeSpecialtyItem[] = this.getSecureItem(STORAGE_KEYS.TRADES, []);
    try {
      const employees = this.getEmployees();
      const existingKeys = new Set(trades.map(t => t.key.toLowerCase()));
      let changed = false;

      employees.forEach(emp => {
        const k = (emp.tradeSpecialty || '').toLowerCase().trim();
        if (k && !existingKeys.has(k)) {
          trades.push({
            id: `trd-${k}`,
            key: k,
            name: k.charAt(0).toUpperCase() + k.slice(1),
            category: 'Finishes',
            description: `Craftsmanship discipline for ${k}`,
            isActive: true,
            createdAt: new Date().toISOString()
          });
          existingKeys.add(k);
          changed = true;
        }
      });

      if (changed) {
        this.setSecureItem(STORAGE_KEYS.TRADES, trades);
      }
    } catch (e) {
      console.warn('Trades auto-sync warning:', e);
    }

    return trades;
  }

  saveTrade(trade: TradeSpecialtyItem): TradeSpecialtyItem {
    const list = this.getTrades();
    const index = list.findIndex(t => t.id === trade.id);
    if (index >= 0) {
      list[index] = trade;
    } else {
      list.push(trade);
    }
    this.setSecureItem(STORAGE_KEYS.TRADES, list);
    return trade;
  }

  deleteTrade(tradeId: string) {
    let list = this.getTrades();
    list = list.filter(t => t.id !== tradeId);
    this.setSecureItem(STORAGE_KEYS.TRADES, list);
  }

  // --- Categories ---
  getCategories(): CategoryItem[] {
    return this.getSecureItem(STORAGE_KEYS.CATEGORIES, []);
  }

  saveCategory(category: CategoryItem): CategoryItem {
    const list = this.getCategories();
    const index = list.findIndex(c => c.id === category.id);
    if (index >= 0) {
      list[index] = category;
    } else {
      list.push(category);
    }
    this.setSecureItem(STORAGE_KEYS.CATEGORIES, list);
    return category;
  }

  deleteCategory(categoryId: string) {
    let list = this.getCategories();
    list = list.filter(c => c.id !== categoryId);
    this.setSecureItem(STORAGE_KEYS.CATEGORIES, list);
  }

  // --- Priorities ---
  getPriorities(): PriorityItem[] {
    return this.getSecureItem(STORAGE_KEYS.PRIORITIES, []);
  }

  savePriority(priority: PriorityItem): PriorityItem {
    const list = this.getPriorities();
    const index = list.findIndex(p => p.id === priority.id);
    if (index >= 0) {
      list[index] = priority;
    } else {
      list.push(priority);
    }
    this.setSecureItem(STORAGE_KEYS.PRIORITIES, list);
    return priority;
  }

  deletePriority(priorityId: string) {
    let list = this.getPriorities();
    list = list.filter(p => p.id !== priorityId);
    this.setSecureItem(STORAGE_KEYS.PRIORITIES, list);
  }

  // --- Quality Gate Checklist Rules ---
  getQualityGateItems(): QualityGateItem[] {
    const items = this.getSecureItem<QualityGateItem[]>(STORAGE_KEYS.QUALITY_GATES, []);
    if (items.length === 0 && localStorage.getItem(STORAGE_KEYS.INITIALIZED) !== 'cleared') {
      return getSeedQualityGates();
    }
    return items.sort((a, b) => a.order - b.order);
  }

  saveQualityGateItem(item: QualityGateItem): QualityGateItem {
    const list = this.getQualityGateItems();
    const index = list.findIndex(q => q.id === item.id);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.push(item);
    }
    this.setSecureItem(STORAGE_KEYS.QUALITY_GATES, list);
    return item;
  }

  deleteQualityGateItem(itemId: string) {
    let list = this.getQualityGateItems();
    list = list.filter(q => q.id !== itemId);
    this.setSecureItem(STORAGE_KEYS.QUALITY_GATES, list);
  }

  // --- User Accounts (CRUD & Role Management) ---
  getUsers(): User[] {
    const list = this.getSecureItem<User[]>(STORAGE_KEYS.USERS, []);
    if (list.length === 0 && localStorage.getItem(STORAGE_KEYS.INITIALIZED) !== 'cleared') {
      return getSeedUsers();
    }
    return Array.isArray(list) ? list : [];
  }

  saveUser(user: User): User {
    const list = this.getUsers();
    const index = list.findIndex(u => u.id === user.id);
    if (index >= 0) {
      list[index] = user;
    } else {
      list.push(user);
    }
    this.setSecureItem(STORAGE_KEYS.USERS, list);
    return user;
  }

  deleteUser(userId: string): boolean {
    let list = this.getUsers();
    const before = list.length;
    list = list.filter(u => u.id !== userId);
    this.setSecureItem(STORAGE_KEYS.USERS, list);
    return list.length < before;
  }

  // --- Dedicated Snapshots Management ---
  getSnapshots(): Snapshot[] {
    const list = this.getSecureItem<Snapshot[]>(STORAGE_KEYS.SNAPSHOTS, []);
    return Array.isArray(list) ? list : [];
  }

  createSnapshot(label: string, notes?: string): Snapshot {
    const backupJson = this.exportDatabaseBackup();
    const encrypted = encryptData(backupJson);
    const sizeBytes = new Blob([backupJson]).size;

    const summary: SnapshotRecordSummary = {
      estatesCount: this.getEstates().length,
      locationsCount: this.getLocations().length,
      zonesCount: this.getZones().length,
      projectsCount: this.getProjects().length,
      employeesCount: this.getEmployees().length,
      proposalsCount: this.getProposals().length,
      notesCount: this.getNotes().length,
      categoriesCount: this.getCategories().length,
      prioritiesCount: this.getPriorities().length,
      tradesCount: this.getTrades().length,
      gatesCount: this.getQualityGateItems().length,
      usersCount: this.getUsers().length
    };

    const newSnapshot: Snapshot = {
      id: `snap-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      label: label.trim() || `Snapshot ${new Date().toLocaleDateString()}`,
      notes: notes?.trim() || undefined,
      createdAt: new Date().toISOString(),
      sizeBytes,
      recordsSummary: summary,
      encryptedPayload: encrypted
    };

    const list = this.getSnapshots();
    const updated = [newSnapshot, ...list];
    this.setSecureItem(STORAGE_KEYS.SNAPSHOTS, updated);
    return newSnapshot;
  }

  restoreFromSnapshot(snapshotId: string): { success: boolean; message: string } {
    const list = this.getSnapshots();
    const snap = list.find(s => s.id === snapshotId);
    if (!snap) {
      return { success: false, message: 'Snapshot not found.' };
    }

    try {
      const decryptedBackupJson = decryptData<string>(snap.encryptedPayload, '');
      if (!decryptedBackupJson) {
        return { success: false, message: 'Failed to decrypt snapshot payload.' };
      }
      return this.restoreDatabase(decryptedBackupJson);
    } catch (err: any) {
      return { success: false, message: `Restore failed: ${err?.message || 'Decryption error'}` };
    }
  }

  deleteSnapshot(snapshotId: string): boolean {
    let list = this.getSnapshots();
    const beforeLen = list.length;
    list = list.filter(s => s.id !== snapshotId);
    this.setSecureItem(STORAGE_KEYS.SNAPSHOTS, list);
    return list.length < beforeLen;
  }

  // --- Database Tools (Backup, Restore, Snapshots, Seed, Clear) ---
  exportDatabaseBackup(): string {
    const data: Record<string, any> = {
      exportVersion: '2.0-e2ee',
      exportedAt: new Date().toISOString(),
      system: 'BuildFlow Workspace',
      vaultProtected: true,
      encryptionAlgorithm: 'AES-GCM-256-Authenticated',
      estates: this.getEstates(),
      locations: this.getLocations(),
      zones: this.getZones(),
      employees: this.getEmployees(),
      projects: this.getProjects(),
      allocations: this.getAllocations(),
      notes: this.getNotes(),
      proposals: this.getProposals(),
      checklists: this.getChecklists(),
      qualityGates: this.getQualityGateItems(),
      trades: this.getTrades(),
      categories: this.getCategories(),
      priorities: this.getPriorities(),
      users: this.getUsers(),
      snapshots: this.getSnapshots()
    };
    return JSON.stringify(data, null, 2);
  }

  exportEncryptedBackup(): string {
    const raw = this.exportDatabaseBackup();
    const cipher = encryptData(raw);
    const payload = {
      format: 'agwcz_vault_v2_encrypted',
      checksum: computeChecksum(raw),
      createdAt: new Date().toISOString(),
      cipherPayload: cipher
    };
    return JSON.stringify(payload, null, 2);
  }

  restoreDatabase(rawString: string): { success: boolean; message: string } {
    try {
      let parsed = JSON.parse(rawString);
      
      // Decrypt if .agwcz format
      if (parsed.format === 'agwcz_vault_v2_encrypted' && parsed.cipherPayload) {
        const decryptedStr = decryptData(parsed.cipherPayload, '');
        parsed = JSON.parse(decryptedStr);
      } else if (parsed.format === 'agwcz_vault_v1' && parsed.encryptedPayload) {
        const decoded = decodeURIComponent(escape(atob(parsed.encryptedPayload)));
        parsed = JSON.parse(decoded);
      }

      if (parsed.estates) this.setSecureItem(STORAGE_KEYS.ESTATES, parsed.estates);
      if (parsed.locations) this.setSecureItem(STORAGE_KEYS.LOCATIONS, parsed.locations);
      if (parsed.zones) this.setSecureItem(STORAGE_KEYS.ZONES, parsed.zones);
      if (parsed.employees) this.setSecureItem(STORAGE_KEYS.EMPLOYEES, parsed.employees);
      if (parsed.projects) this.setSecureItem(STORAGE_KEYS.PROJECTS, parsed.projects);
      if (parsed.allocations) this.setSecureItem(STORAGE_KEYS.ALLOCATIONS, parsed.allocations);
      if (parsed.notes) this.setSecureItem(STORAGE_KEYS.NOTES, parsed.notes);
      if (parsed.proposals) this.setSecureItem(STORAGE_KEYS.PROPOSALS, parsed.proposals);
      if (parsed.checklists) this.setSecureItem(STORAGE_KEYS.CHECKLISTS, parsed.checklists);
      if (parsed.qualityGates) this.setSecureItem(STORAGE_KEYS.QUALITY_GATES, parsed.qualityGates);
      if (parsed.trades) this.setSecureItem(STORAGE_KEYS.TRADES, parsed.trades);
      if (parsed.categories) this.setSecureItem(STORAGE_KEYS.CATEGORIES, parsed.categories);
      if (parsed.priorities) this.setSecureItem(STORAGE_KEYS.PRIORITIES, parsed.priorities);
      if (parsed.users) this.setSecureItem(STORAGE_KEYS.USERS, parsed.users);
      if (parsed.snapshots) this.setSecureItem(STORAGE_KEYS.SNAPSHOTS, parsed.snapshots);

      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      return { success: true, message: 'Database successfully restored from backup.' };
    } catch (err: any) {
      return { success: false, message: `Restore failed: ${err?.message || 'Invalid format'}` };
    }
  }

  mergeImport(rawString: string): { success: boolean; message: string; count: number } {
    try {
      let parsed = JSON.parse(rawString);
      if (parsed.format === 'agwcz_vault_v2_encrypted' && parsed.cipherPayload) {
        const decryptedStr = decryptData(parsed.cipherPayload, '');
        parsed = JSON.parse(decryptedStr);
      } else if (parsed.format === 'agwcz_vault_v1' && parsed.encryptedPayload) {
        const decoded = decodeURIComponent(escape(atob(parsed.encryptedPayload)));
        parsed = JSON.parse(decoded);
      }

      let count = 0;
      if (Array.isArray(parsed.projects)) {
        const existing = this.getProjects();
        const map = new Map(existing.map(p => [p.id, p]));
        parsed.projects.forEach((p: Project) => {
          map.set(p.id, p);
          count++;
        });
        this.setSecureItem(STORAGE_KEYS.PROJECTS, Array.from(map.values()));
      }

      if (Array.isArray(parsed.employees)) {
        const existing = this.getEmployees();
        const map = new Map(existing.map(e => [e.id, e]));
        parsed.employees.forEach((e: Employee) => {
          map.set(e.id, e);
          count++;
        });
        this.setSecureItem(STORAGE_KEYS.EMPLOYEES, Array.from(map.values()));
      }

      return { success: true, message: `Successfully merged ${count} records.`, count };
    } catch (err: any) {
      return { success: false, message: `Merge import failed: ${err?.message || 'Invalid format'}`, count: 0 };
    }
  }

  saveDailySnapshot(): { snapshotId: string; date: string } {
    const today = new Date().toISOString().split('T')[0];
    const snap = this.createSnapshot(`Daily Snapshot (${today})`, 'Captured via toolbar');
    return { snapshotId: snap.id, date: today };
  }

  loadSampleData() {
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
    const employees = generateSeedEmployees();
    const estates = getSeedEstates();
    const locations = getSeedLocations();
    const zones = getSeedZones();
    const projects = getSeedProjects();
    const allocations = getSeedAllocations(employees);
    const notes = getSeedNotes();
    const proposals = getSeedProposals();
    const trades = getSeedTrades();
    const categories = getSeedCategories();
    const priorities = getSeedPriorities();
    const qualityGates = getSeedQualityGates();
    const users = getSeedUsers();

    this.setSecureItem(STORAGE_KEYS.ESTATES, estates);
    this.setSecureItem(STORAGE_KEYS.LOCATIONS, locations);
    this.setSecureItem(STORAGE_KEYS.ZONES, zones);
    this.setSecureItem(STORAGE_KEYS.EMPLOYEES, employees);
    this.setSecureItem(STORAGE_KEYS.PROJECTS, projects);
    this.setSecureItem(STORAGE_KEYS.ALLOCATIONS, allocations);
    this.setSecureItem(STORAGE_KEYS.NOTES, notes);
    this.setSecureItem(STORAGE_KEYS.PROPOSALS, proposals);
    this.setSecureItem(STORAGE_KEYS.CHECKLISTS, []);
    this.setSecureItem(STORAGE_KEYS.QUALITY_GATES, qualityGates);
    this.setSecureItem(STORAGE_KEYS.TRADES, trades);
    this.setSecureItem(STORAGE_KEYS.CATEGORIES, categories);
    this.setSecureItem(STORAGE_KEYS.PRIORITIES, priorities);
    this.setSecureItem(STORAGE_KEYS.USERS, users);
    
    // Seed initial baseline snapshot if none exists
    const existingSnaps = this.getSnapshots();
    if (existingSnaps.length === 0) {
      this.createSnapshot('System Genesis Snapshot', 'Baseline factory configuration with 4 sample projects, 50 workers, and 5 team accounts.');
    }

    localStorage.setItem(STORAGE_KEYS.INITIALIZED, STORAGE_KEYS.INITIALIZED);
  }

  clearAllData() {
    // Completely wipe all operational records for a 100% fresh start
    this.setSecureItem(STORAGE_KEYS.PROJECTS, []);
    this.setSecureItem(STORAGE_KEYS.ALLOCATIONS, []);
    this.setSecureItem(STORAGE_KEYS.NOTES, []);
    this.setSecureItem(STORAGE_KEYS.PROPOSALS, []);
    this.setSecureItem(STORAGE_KEYS.CHECKLISTS, []);
    this.setSecureItem(STORAGE_KEYS.QUALITY_GATES, []);
    this.setSecureItem(STORAGE_KEYS.EMPLOYEES, []);
    this.setSecureItem(STORAGE_KEYS.ESTATES, []);
    this.setSecureItem(STORAGE_KEYS.LOCATIONS, []);
    this.setSecureItem(STORAGE_KEYS.ZONES, []);
    this.setSecureItem(STORAGE_KEYS.TRADES, []);
    this.setSecureItem(STORAGE_KEYS.CATEGORIES, []);
    this.setSecureItem(STORAGE_KEYS.PRIORITIES, []);
    const existingUsers = this.getUsers();
    this.setSecureItem(STORAGE_KEYS.USERS, existingUsers.length > 0 ? existingUsers : getSeedUsers());
    this.setSecureItem(STORAGE_KEYS.SNAPSHOTS, []);
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'cleared');
  }

  resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
    this.init();
  }
}

export const storage = new StorageService();
