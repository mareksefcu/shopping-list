import React, { useState, useMemo } from 'react';
// Zde bychom normálně importovali 'useParams' z 'react-router-dom', ale pro cvičení stačí fiktivní data.

// Fiktivní data pro simulaci, jak je požadováno v zadání
const INITIAL_LIST_DATA = {
  id: 'aBc123',
  name: 'Týdenní nákup',
  owner: 'Jan Novák',
  isOwner: true, // Změňte na false pro simulaci role člena
  currentUser: 'Jan Novák', // Simulace aktuálně přihlášeného uživatele
  members: ['Petra Svobodová', 'Karel Dvořák'],
  items: [
    { id: 1, text: 'Mléko', isDone: false },
    { id: 2, text: 'Chléb', isDone: true },
    { id: 3, text: 'Jablka', isDone: false },
  ],
};

function ListDetailRoute() {
  const [listData, setListData] = useState(INITIAL_LIST_DATA);
  const [filter, setFilter] = useState('all'); // 'all', 'open', 'done'
  const [newItemText, setNewItemText] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  
  const { isOwner, currentUser } = listData; 

  // --- Implementovaná Business Logika ---

  // 1. úprava názvu nákupního seznamu
  const handleNameChange = (newName) => {
    if (isOwner) {
      setListData(prevData => ({ ...prevData, name: newName }));
      // Poznámka: Používáme alert místo console.log pro interaktivní feedback
      alert(`Název změněn na: ${newName}`); 
    } else {
      alert("Nemáte oprávnění ke změně názvu.");
    }
  };

  // 2. vlastník může přidávat/odebírat členy
  const handleMemberChange = (memberName, action) => {
    if (!isOwner) return alert("Pouze vlastník může spravovat členy.");

    setListData(prevData => {
      let newMembers = [...prevData.members];
      
      if (action === 'add' && memberName.trim() && !newMembers.includes(memberName.trim())) {
        newMembers.push(memberName.trim());
        setNewMemberName(''); // Vyčištění inputu po přidání
        alert(`Přidán člen: ${memberName}`);
      } else if (action === 'remove') {
        if (memberName === prevData.owner) {
             alert("Vlastníka nelze odebrat!");
             return prevData;
        }
        newMembers = newMembers.filter(m => m !== memberName);
        alert(`Odebrán člen: ${memberName}`);
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
    <div className="p-5 max-w-xl mx-auto my-10 bg-white shadow-xl rounded-xl font-sans">
      
      {/* Nadpis a úprava (Body 1) */}
      <h2 className="text-3xl font-bold mb-4 text-gray-800 flex items-center">
        🛒 {listData.name}
      </h2>
      
      <div className="mb-4 p-3 border-b border-gray-200">
        {isOwner ? (
          <div className="flex items-center space-x-2">
            <input 
              type="text" 
              value={listData.name} 
              onChange={(e) => setListData(p => ({...p, name: e.target.value}))}
              className="border p-2 rounded w-full focus:ring-blue-500 focus:border-blue-500"
            />
            <button 
              onClick={() => handleNameChange(listData.name)}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-150"
            >
              Uložit
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-600">Vlastník: <strong className="text-gray-800">{listData.owner}</strong></p>
        )}
      </div>

      {/* Správa členů (Body 2, 3) */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h4 className="text-lg font-semibold mb-2 text-gray-700">Členové</h4>
        <ul className="space-y-2 mb-3">
          {listData.members.map((member, index) => (
            <li key={index} className="flex justify-between items-center text-sm">
              <span className={member === listData.owner ? 'font-bold text-green-700' : 'text-gray-700'}>
                {member} {member === listData.owner && '(Vlastník)'}
              </span>
              {/* Odebírání: Pouze vlastník a ne-vlastník */}
              {isOwner && member !== listData.owner && (
                <button 
                  onClick={() => handleMemberChange(member, 'remove')} 
                  className="text-red-500 hover:text-red-700 text-xs p-1 rounded transition duration-150"
                >
                  Odebrat
                </button>
              )}
            </li>
          ))}
        </ul>
        
        {/* Opustit seznam: Pouze člen (ne vlastník) */}
        {!isOwner && listData.members.includes(currentUser) && (
          <button 
            onClick={handleLeaveList} 
            className="w-full mt-4 bg-red-400 text-white p-2 rounded hover:bg-red-500 transition duration-150 text-sm"
          >
            Opustit seznam (jako {currentUser})
          </button>
        )}

        {/* Přidání člena: Pouze vlastník */}
        {isOwner && (
          <form onSubmit={(e) => { e.preventDefault(); handleMemberChange(newMemberName, 'add'); }} className="flex space-x-2 mt-4">
            <input 
              type="text" 
              placeholder="Přidat člena (Jméno)" 
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              className="border p-2 rounded w-full text-sm" 
            />
            <button type="submit" className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition duration-150 text-sm">
              Přidat
            </button>
          </form>
        )}
      </div>

      
      {/* Formulář pro přidání položky (Body 5) */}
      <form onSubmit={handleAddItem} className="flex space-x-2 mb-6">
        <input 
          type="text" 
          placeholder="Nová položka..." 
          value={newItemText} 
          onChange={(e) => setNewItemText(e.target.value)} 
          className="p-3 border rounded w-full focus:ring-blue-500 focus:border-blue-500"
        />
        <button type="submit" className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition duration-150 whitespace-nowrap">
          Přidat položku
        </button>
      </form>
      
      {/* Filtrování (Body 7) */}
      <div className="flex justify-around mb-6 bg-yellow-100 p-2 rounded-lg">
        <button onClick={() => setFilter('all')} className={`p-1 rounded text-sm ${filter === 'all' ? 'font-bold bg-white shadow' : 'hover:bg-yellow-200'}`}>Zobrazit všechny</button>
        <button onClick={() => setFilter('open')} className={`p-1 rounded text-sm ${filter === 'open' ? 'font-bold bg-white shadow' : 'hover:bg-yellow-200'}`}>Jen nevyřešené</button>
        <button onClick={() => setFilter('done')} className={`p-1 rounded text-sm ${filter === 'done' ? 'font-bold bg-white shadow' : 'hover:bg-yellow-200'}`}>Jen vyřešené</button>
      </div>

      {/* Seznam položek (Body 4, 6) */}
      <div className="border border-gray-300 rounded-lg p-3">
        {filteredItems.length === 0 ? (
          <p className="text-center text-gray-500 italic">Žádné položky k zobrazení v tomto filtru.</p>
        ) : (
          <ul className="space-y-3">
            {filteredItems.map(item => (
              <li key={item.id} className="flex justify-between items-center p-2 bg-white rounded shadow-sm border border-gray-100">
                <div className="flex items-center flex-grow">
                  <input 
                    type="checkbox" 
                    checked={item.isDone} 
                    onChange={() => handleItemAction(item.id, 'toggle')} // Body 6
                    className="h-5 w-5 text-blue-600 rounded mr-3"
                  />
                  <span className={`text-gray-700 ${item.isDone ? 'line-through italic text-gray-500' : 'font-medium'}`}>
                    {item.text}
                  </span>
                </div>
                <button 
                  onClick={() => handleItemAction(item.id, 'delete')} // Body 5 (odebrání)
                  className="ml-4 bg-red-100 text-red-700 p-1 rounded-full hover:bg-red-200 transition duration-150 text-xs font-semibold"
                >
                  Smazat
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default ListDetailRoute;
