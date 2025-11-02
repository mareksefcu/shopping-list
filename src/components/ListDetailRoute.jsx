import React, { useState, useMemo } from 'react';

// Ikony (předpokládáme, že jsou dostupné, např. přes lucide-react, 
// zde je simulujeme pomocí Tailwindu a emoji pro jednoduchost)
const ICON_EDIT = '✏️';
const ICON_SAVE = '💾';
const ICON_REMOVE = '🗑️';
const ICON_ADD = '➕';
const ICON_LEAVE = '🚪';
const ICON_CHECK = '✅';

// --- SIMULACE DAT A UŽIVATELSKÝCH ROLÍ ---
const SIMULATED_USERS = {
  OWNER: { name: 'Jan Novák', isOwner: true },
  MEMBER: { name: 'Petra Svobodová', isOwner: false },
  OTHER: { name: 'Nový Uživatel', isOwner: false },
};

const INITIAL_LIST_DATA = {
  id: 'aBc123',
  name: 'Týdenní nákup',
  owner: SIMULATED_USERS.OWNER.name, // Vlastník je pevně nastaven
  members: [SIMULATED_USERS.MEMBER.name, SIMULATED_USERS.OWNER.name, 'Karel Dvořák'],
  items: [
    { id: 1, text: 'Mléko', isDone: false },
    { id: 2, text: 'Chléb', isDone: true },
    { id: 3, text: 'Jablka', isDone: false },
  ],
};

// --- NOVÁ KOMPONENTA: POTVRZOVACÍ MODAL (ZLEPŠENÍ UX MÍSTO alert()) ---
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm transform transition-all duration-300 scale-100 opacity-100 border border-gray-100">
        <h3 className="text-2xl font-extrabold text-red-700 mb-3">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-100 transition duration-200 font-medium"
          >
            Zrušit
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-red-600 text-white font-semibold rounded-xl shadow-lg hover:bg-red-700 transition duration-200 transform hover:scale-[1.02]"
          >
            Potvrdit {ICON_REMOVE}
          </button>
        </div>
      </div>
    </div>
  );
};

function ListDetailRoute() {
  const [listData, setListData] = useState(INITIAL_LIST_DATA);
  const [filter, setFilter] = useState('all'); // 'all', 'open', 'done'
  const [newItemText, setNewItemText] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  
  // *** ZAVÁDÍME SIMULACI PŘIHLÁŠENÍ ***
  const [loginUser, setLoginUser] = useState(SIMULATED_USERS.OWNER); // Defaultně přihlášen jako Vlastník
  
  // *** STAV PRO MODAL ***
  const [modalState, setModalState] = useState({
    isOpen: false,
    memberToRemove: null,
  });

  // Dynamická data z přihlášení a seznamu
  const isOwner = loginUser.name === listData.owner;
  const currentUser = loginUser.name;
  
  // --- Implementovaná Business Logika ---

  // Simulace přihlášení / přepnutí uživatele
  const handleLoginChange = (user) => {
    setLoginUser(user);
    // Používáme setTimeout, aby byl alert vidět, než se renderuje nový stav
    setTimeout(() => {
        alert(`Úspěšně přihlášen jako: ${user.name} (Role: ${user.isOwner ? 'VLASTNÍK' : 'ČLEN'})`);
    }, 10);
  };

  // 1. úprava názvu nákupního seznamu
  const handleNameChange = (newName) => {
    if (isOwner) {
      setListData(prevData => ({ ...prevData, name: newName }));
      alert(`Název změněn na: ${newName}`); 
    } else {
      alert("Nemáte oprávnění ke změně názvu.");
    }
  };

  // Zobrazit modal pro potvrzení odebrání
  const handleRemoveMemberClick = (member) => {
    setModalState({
        isOpen: true,
        memberToRemove: member,
    });
  };

  // 2. vlastník může přidávat/odebírat členy (Finalizace odebrání z Modalu)
  const handleMemberChange = (memberName, action) => {
    if (!isOwner) {
      setModalState({ isOpen: false, memberToRemove: null }); // Zavřít modal, pokud by se náhodou otevřel
      return alert("Pouze vlastník může spravovat členy.");
    }

    setListData(prevData => {
      let newMembers = [...prevData.members];
      
      if (action === 'add' && memberName.trim() && !newMembers.includes(memberName.trim())) {
        newMembers.push(memberName.trim());
        setNewMemberName('');
        alert(`Přidán člen: ${memberName}`);
      } else if (action === 'remove') {
        if (memberName === prevData.owner) {
             alert("Vlastníka nelze odebrat!");
             setModalState({ isOpen: false, memberToRemove: null });
             return prevData;
        }
        newMembers = newMembers.filter(m => m !== memberName);
        alert(`Odebrán člen: ${memberName}`);
        setModalState({ isOpen: false, memberToRemove: null }); // Zavřít po úspěšném odebrání
      }
      return { ...prevData, members: newMembers };
    });
  };

  // 3. člen může "odejít" z nákupního seznamu
  const handleLeaveList = () => {
    if (isOwner) return alert("Vlastník nemůže opustit seznam, může ho jen smazat.");

    setListData(prevData => ({
      ...prevData,
      members: prevData.members.filter(m => m !== currentUser),
    }));
    alert(`Opustili jste seznam "${listData.name}".`);
    // Zde by měla následovat navigace
  };

  // 5. přidání položky nákupního seznamu
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const newItem = {
      id: Date.now(),
      text: newItemText.trim(),
      isDone: false
    };
    setListData(prevData => ({
      ...prevData,
      items: [...prevData.items, newItem],
    }));
    setNewItemText('');
  };

  // 5. / 6. odebrání a nastavení položky jako vyřešené
  const handleItemAction = (itemId, action) => {
    setListData(prevData => ({
      ...prevData,
      items: prevData.items
        .filter(item => action !== 'delete' || item.id !== itemId) // Odebrání
        .map(item =>
          action === 'toggle' && item.id === itemId
            ? { ...item, isDone: !item.isDone } // Nastavit vyřešenou (toggle)
            : item
        ),
    }));
  };

  // 4. / 7. zobrazení položek nákupního seznamu & filtrování položek
  const filteredItems = useMemo(() => {
    return listData.items.filter(item => {
      if (filter === 'done') return item.isDone;
      if (filter === 'open') return !item.isDone;
      return true; // 'all' - zobrazit včetně vyřešených
    });
  }, [listData.items, filter]);

  
  return (
    // HLAVNÍ KONTEJNER: Gradientní pozadí, ostrý box shadow
    <div className="min-h-screen p-4 bg-gray-100 flex items-start justify-center font-sans">
      <div className="w-full max-w-lg mx-auto my-10 bg-white shadow-2xl shadow-indigo-200 rounded-3xl p-6 md:p-8 transform transition-all duration-300">
        
        {/* MODAL PRO POTVRZENÍ ODEBRÁNÍ ČLENA */}
        <ConfirmationModal
          isOpen={modalState.isOpen}
          title="Potvrzení odebrání člena"
          message={`Opravdu chcete odebrat člena "${modalState.memberToRemove}" ze seznamu? Tuto akci nelze vzít zpět.`}
          onConfirm={() => handleMemberChange(modalState.memberToRemove, 'remove')}
          onClose={() => setModalState({ isOpen: false, memberToRemove: null })}
        />

        {/* --- BLOK SIMULACE PŘIHLÁŠENÍ --- */}
        <div className="mb-8 p-4 bg-blue-50 rounded-2xl border border-blue-200 shadow-inner">
          <h3 className="font-extrabold text-lg text-blue-800 mb-2 border-b border-blue-300 pb-1">Simulace Přihlášení</h3>
          <p className="text-sm mb-3 text-blue-700">
            Přihlášen jako: <strong className="font-bold text-blue-900">{loginUser.name}</strong> 
            {isOwner ? ' (VLASTNÍK)' : ' (ČLEN)'}
          </p>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => handleLoginChange(SIMULATED_USERS.OWNER)}
              className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-md hover:bg-blue-700 transition duration-200 transform hover:scale-[1.02]"
            >
              Přihlásit jako Vlastník
            </button>
            <button 
              onClick={() => handleLoginChange(SIMULATED_USERS.MEMBER)}
              className="bg-purple-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-md hover:bg-purple-700 transition duration-200 transform hover:scale-[1.02]"
            >
              Přihlásit jako Člen
            </button>
          </div>
        </div>
        {/* --- KONEC SIMULACE --- */}

        {/* Nadpis a úprava (Body 1) */}
        <h2 className="text-5xl font-extrabold mb-8 text-gray-900 leading-tight">
          {listData.name}
        </h2>
        
        <div className="mb-8 p-4 bg-white rounded-xl border border-gray-100 shadow-md">
          <p className="text-base text-gray-500 mb-3">Vlastník seznamu: <strong className="text-gray-800 font-semibold">{listData.owner}</strong></p>
          
          {isOwner ? (
            <div className="flex items-center space-x-2">
              <input 
                type="text" 
                value={listData.name} 
                onChange={(e) => setListData(p => ({...p, name: e.target.value}))}
                className="border border-gray-300 p-2.5 rounded-xl w-full text-lg focus:ring-green-500 focus:border-green-500 transition duration-150 shadow-sm"
              />
              <button 
                onClick={() => handleNameChange(listData.name)}
                className="bg-green-600 text-white p-2.5 rounded-xl shadow-lg hover:bg-green-700 transition duration-200 flex items-center whitespace-nowrap font-semibold transform hover:scale-[1.02]"
                title="Uložit název seznamu"
              >
                {ICON_SAVE}
              </button>
            </div>
          ) : (
            // Prázdný kontejner pro vyrovnání mezery
            <div className="h-10"></div> 
          )}
        </div>

        {/* Správa členů (Body 2, 3) */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8 border border-gray-100">
          <h4 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Členové týmu</h4>
          <ul className="space-y-3 mb-4">
            {listData.members.map((member, index) => (
              <li key={index} className="flex justify-between items-center text-base p-3 bg-gray-50 rounded-xl border border-gray-200 transition duration-150 hover:bg-gray-100">
                <span className={member === listData.owner ? 'font-extrabold text-indigo-700' : 'text-gray-700 font-medium'}>
                  {member} {member === listData.owner && '(Vlastník)'} {member === currentUser && '(Vy)'}
                </span>
                {/* Odebrání: Pouze vlastník a ne-vlastník -> Zobrazíme modal */}
                {isOwner && member !== listData.owner && (
                  <button 
                    onClick={() => handleRemoveMemberClick(member)} 
                    className="text-red-600 p-2 rounded-full hover:bg-red-200 transition duration-150 transform hover:scale-110"
                    title="Odebrat člena"
                  >
                    {ICON_REMOVE}
                  </button>
                )}
              </li>
            ))}
          </ul>
          
          {/* Opustit seznam: Pouze člen (ne vlastník) a jen pokud je aktuálně členem */}
          {!isOwner && listData.members.includes(currentUser) && (
            <button 
              onClick={handleLeaveList} 
              className="w-full mt-5 bg-red-500 text-white p-3 rounded-xl shadow-md hover:bg-red-600 transition duration-150 text-base font-semibold flex items-center justify-center space-x-2 transform hover:scale-[0.99]"
            >
              {ICON_LEAVE} <span>Opustit seznam (jako {currentUser})</span>
            </button>
          )}

          {/* Přidání člena: Pouze vlastník */}
          {isOwner && (
            <form onSubmit={(e) => { e.preventDefault(); handleMemberChange(newMemberName, 'add'); }} className="flex space-x-3 mt-5 pt-4 border-t border-gray-200">
              <input 
                type="text" 
                placeholder="Jméno člena k přidání" 
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="border border-gray-300 p-2.5 rounded-xl w-full text-base focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm" 
              />
              <button type="submit" className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg hover:bg-blue-700 transition duration-150 text-base font-semibold whitespace-nowrap flex items-center transform hover:scale-[1.02]">
                {ICON_ADD} Přidat
              </button>
            </form>
          )}
        </div>

        
        {/* Formulář pro přidání položky (Body 5) */}
        <form onSubmit={handleAddItem} className="flex space-x-3 mb-8 p-5 bg-indigo-50 rounded-2xl border border-indigo-200 shadow-inner">
          <input 
            type="text" 
            placeholder="Nová položka..." 
            value={newItemText} 
            onChange={(e) => setNewItemText(e.target.value)} 
            className="p-3 border border-indigo-300 rounded-xl w-full text-base focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm"
          />
          <button type="submit" className="bg-indigo-600 text-white p-3 rounded-xl shadow-lg hover:bg-indigo-700 transition duration-200 whitespace-nowrap font-semibold transform hover:scale-[1.02]">
            {ICON_ADD} Přidat
          </button>
        </form>
        
        {/* Filtrování (Body 7) */}
        <div className="flex justify-around mb-8 p-3 bg-white rounded-xl shadow-md border border-gray-100">
          <button onClick={() => setFilter('all')} className={`p-2.5 rounded-xl text-sm font-semibold transition duration-150 transform hover:scale-105 ${filter === 'all' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100'}`}>Všechny</button>
          <button onClick={() => setFilter('open')} className={`p-2.5 rounded-xl text-sm font-semibold transition duration-150 transform hover:scale-105 ${filter === 'open' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100'}`}>Nevyřešené</button>
          <button onClick={() => setFilter('done')} className={`p-2.5 rounded-xl text-sm font-semibold transition duration-150 transform hover:scale-105 ${filter === 'done' ? 'bg-indigo-500 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100'}`}>Vyřešené</button>
        </div>

        {/* Seznam položek (Body 4, 6) */}
        <div className="rounded-2xl p-4 bg-white shadow-inner shadow-gray-200 border border-gray-200">
          {filteredItems.length === 0 ? (
            <p className="text-center text-gray-500 italic p-4 text-base">Žádné položky k zobrazení v tomto filtru.</p>
          ) : (
            <ul className="space-y-4">
              {filteredItems.map(item => (
                <li key={item.id} className={`flex justify-between items-center p-3 bg-gray-50 rounded-xl shadow-sm border border-gray-200 transition duration-200 ${item.isDone ? 'opacity-70 bg-green-50' : 'hover:bg-gray-100'}`}>
                  <div className="flex items-center flex-grow">
                    <input 
                      type="checkbox" 
                      checked={item.isDone} 
                      onChange={() => handleItemAction(item.id, 'toggle')} // Body 6
                      className="h-6 w-6 text-indigo-600 border-gray-300 rounded-lg focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className={`ml-3 text-lg ${item.isDone ? 'line-through italic text-gray-500' : 'font-medium text-gray-800'}`}>
                      {item.text}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleItemAction(item.id, 'delete')} // Body 5 (odebrání)
                    className="ml-4 text-red-600 p-2 rounded-full hover:bg-red-200 transition duration-150 transform hover:scale-110"
                    title="Odstranit položku"
                  >
                    {ICON_REMOVE}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default ListDetailRoute;
