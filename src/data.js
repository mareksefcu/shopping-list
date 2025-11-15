// --- DATA SIMULACE ---
// Jan Novák je VLASTNÍK (ownerId)
// Petra Svobodová je ČLEN (memberId)
export const SIMULATED_USERS = {
  OWNER: { id: 'user-jan-novak', name: 'Jan Novák', role: 'VLASTNÍK' },
  MEMBER: { id: 'user-petra-svobodova', name: 'Petra Svobodová', role: 'ČLEN' },
};

const INITIAL_LIST_ID = 'aBc123';

const INITIAL_STATE_1 = {
  ownerId: SIMULATED_USERS.OWNER.id, // Jan Novák je VLASTNÍK tohoto seznamu
  listName: 'Týdenní nákup',
  members: [
    { id: SIMULATED_USERS.OWNER.id, name: SIMULATED_USERS.OWNER.name },
    { id: 'user-karel-dvorak', name: 'Karel Dvořák' },
    { id: SIMULATED_USERS.MEMBER.id, name: SIMULATED_USERS.MEMBER.name },
  ],
  items: [
    { id: 1, text: 'Mléko', resolved: false, date: Date.now() - 3000 },
    { id: 2, text: 'Chléb', resolved: true, date: Date.now() - 2000 },
    { id: 3, text: 'Jablka', resolved: false, date: Date.now() - 1000 },
    { id: 4, text: 'Vejce', resolved: false, date: Date.now() },
  ],
  isArchived: false, // KLÍČOVÉ: Aktivní
};

const INITIAL_STATE_2 = {
  ownerId: SIMULATED_USERS.MEMBER.id, // Petra Svobodová je vlastník druhého seznamu
  listName: 'Potřeby pro psa (Archiv)',
  members: [
    { id: SIMULATED_USERS.MEMBER.id, name: SIMULATED_USERS.MEMBER.name },
    { id: SIMULATED_USERS.OWNER.id, name: SIMULATED_USERS.OWNER.name } 
  ],
  items: [
    { id: 10, text: 'Granule', resolved: false, date: Date.now() - 1500 },
    { id: 11, text: 'Hračka', resolved: true, date: Date.now() - 500 }
  ],
  isArchived: true, // KLÍČOVÉ: Archivováno
};


export const initialShoppingLists = {
  [INITIAL_LIST_ID]: INITIAL_STATE_1,
  'xyz987': INITIAL_STATE_2,
};