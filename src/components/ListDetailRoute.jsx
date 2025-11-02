import React, { useState, useMemo } from 'react';
// import { useParams } from 'react-router-dom'; // Pro získání listId z URL

// Fiktivní počáteční data (pro splnění požadavku "Initial data se uloží v konstantě")
const INITIAL_LIST_DATA = {
  id: 'aBc123',
  name: 'Týdenní nákup',
  owner: 'Jan Novák',
  isOwner: true, // Zjednodušení pro zobrazení práv
  members: ['Petra Svobodová', 'Karel Dvořák'],
  items: [
    { id: 1, text: 'Mléko', isDone: false },
    { id: 2, text: 'Chléb', isDone: true },
    { id: 3, text: 'Jablka', isDone: false },
    { id: 4, text: 'Vajíčka', isDone: false },
  ],
};

function ListDetailRoute() {
  // const { listId } = useParams(); // Potřebné pro reálnou aplikaci
  const [listData, setListData] = useState(INITIAL_LIST_DATA);
  const [filter, setFilter] = useState('all'); // 'all', 'open', 'done'

  // --- BUSINESS LOGIC FUNCTIONS ---

  // Logika 1: Úprava názvu seznamu
  const handleNameChange = (newName) => {
    setListData(prevData => ({ ...prevData, name: newName }));
  };

  // Logika 2: Přidání/Odebrání člena
  const handleMemberChange = (memberName, action) => {
    setListData(prevData => {
      const newMembers = 
        action === 'add' && memberName && !prevData.members.includes(memberName)
          ? [...prevData.members, memberName]
          : action === 'remove'
          ? prevData.members.filter(m => m !== memberName)
          : prevData.members;
      return { ...prevData, members: newMembers };
    });
  };

  // Logika 3: Nastavit položku hotovou (toggle)
  const handleItemToggle = (itemId) => {
    setListData(prevData => ({
      ...prevData,
      items: prevData.items.map(item =>
        item.id === itemId ? { ...item, isDone: !item.isDone } : item
      ),
    }));
  };

  // Logika 4: Přidání položky
  const handleAddItem = (itemText) => {
    if (!itemText) return;
    const newItem = {
      id: Date.now(), // Unikátní ID
      text: itemText,
      isDone: false
    };
    setListData(prevData => ({
      ...prevData,
      items: [...prevData.items, newItem],
    }));
  };
  
  // Logika 5: Filtrování (Používá seMemo pro efektivitu)
  const filteredItems = useMemo(() => {
    return listData.items.filter(item => {
      if (filter === 'done') return item.isDone;
      if (filter === 'open') return !item.isDone;
      return true;
    });
  }, [listData.items, filter]);


  // --- RENDER (Předání props do podkomponent) ---
  return (
    <div className="list-detail-page">
      <h1>Detail nákupního seznamu</h1>
      
      {/* 1. Název, úprava (owner-only) */}
      <ListName 
        name={listData.name} 
        onNameChange={handleNameChange} 
        isOwner={listData.isOwner} 
      />
      
      {/* 2. Správa členů (owner-only) */}
      {listData.isOwner && (
        <MemberManagement 
          members={listData.members} 
          onMemberChange={handleMemberChange}
        />
      )}
      
      <hr />
      
      {/* 3. Formulář pro přidání položky (owner/member) */}
      <ItemForm onAddItem={handleAddItem} />

      {/* 4. Tlačítka pro filtrování */}
      <FilterButtons 
        currentFilter={filter} 
        onFilterChange={setFilter} 
      />
      
      {/* 5. Seznam položek */}
      <ItemList 
        items={filteredItems} 
        onItemToggle={handleItemToggle} 
      />

    </div>
  );
}

export default ListDetailRoute;