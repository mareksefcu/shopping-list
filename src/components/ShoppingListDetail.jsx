import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Trash2, User, UserPlus, Save, Check, Filter, X, LogOut, ArrowLeft, Plus } from 'lucide-react'; 
import { SIMULATED_USERS } from '../data';

// ----------------------------------------------------
// KOMPONENTA: MODAL PRO POTVRZENÍ
// ----------------------------------------------------
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-center z-50 p-4 transition-opacity duration-300">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm transform transition-transform duration-300 scale-100">
          <div className="p-6">
            <h3 className="text-xl font-bold text-red-600 mb-4 border-b pb-2">{title}</h3>
            <p className="text-gray-700 mb-6">{message}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
              >
                Odmítnout
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white shadow-md hover:bg-red-700 transition-colors"
              >
                Potvrdit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  

// ----------------------------------------------------
// KOMPONENTA: DETAIL SEZNAMU
// ----------------------------------------------------
const ShoppingListDetail = ({ currentUser, allLists, setAllLists, setCurrentUser }) => {
  const { listId } = useParams();
  const navigate = useNavigate();
  
  // ZÍSKÁNÍ STAVU KONKRÉTNÍHO SEZNAMU Z MAPY
  const listState = allLists[listId];
  
  // --- FIX: VŠECHNY HOOKS JSOU PŘESUNUTY SEM, NA ZAČÁTEK KOMPONENTY ---
  const [editingName, setEditingName] = useState(false);
  // Bezpečná inicializace: pokud listState existuje, použije název, jinak prázdný řetězec
  const [newName, setNewName] = useState(listState ? listState.listName : ''); 
  const [newMemberName, setNewMemberName] = useState('');
  const [newItemText, setNewItemText] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'unresolved', 'resolved'
  const [modalData, setModalData] = useState({ isOpen: false, type: null, targetId: null, targetName: null });
  
  // Funkce, která umožňuje této komponentě modifikovat JEDEN konkrétní seznam
  const setListState = (updateFn) => {
    setAllLists(prevLists => ({
        ...prevLists,
        [listId]: updateFn(prevLists[listId])
    }));
  };

  // Filtrování položek (useMemo je také Hook a musí být zde)
  const filteredItems = useMemo(() => {
    // Bezpečná kontrola existence listState a listState.items
    const items = listState?.items || []; 
    
    switch (filter) {
      case 'unresolved':
        return items.filter(item => !item.resolved);
      case 'resolved':
        return items.filter(item => item.resolved);
      case 'all':
      default:
        return items;
    }
  }, [listState, filter]); // Změna závislosti na listState (který obsahuje .items) a filter

  // KONTROLA EXISTENCE/PŘÍSTUPU (EARLY RETURN JE NYNÍ BEZPEČNÝ)
  if (!listState) {
    return (
        <div className="p-8 max-w-lg mx-auto mt-12 bg-white rounded-xl shadow-2xl text-center">
            <h1 className="text-3xl font-extrabold text-red-600 mb-4">Seznam nenalezen</h1>
            <p className="text-gray-600 mb-6">Nákupní seznam s ID **{listId}** nebyl nalezen nebo k němu nemáte přístup.</p>
            <Link 
                to="/" 
                className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 transition-colors transform hover:scale-105"
            >
                <ArrowLeft size={18} /> <span>Zpět na přehled</span>
            </Link>
        </div>
    );
  }

  // Původní stavy komponenty
  // const [editingName, setEditingName] = useState(false); // PŘESUNUTO NAHORU
  // const [newName, setNewName] = useState(listState.listName); // PŘESUNUTO NAHORU
  // const [newMemberName, setNewMemberName] = useState(''); // PŘESUNUTO NAHORU
  // const [newItemText, setNewItemText] = useState(''); // PŘESUNUTO NAHORU
  // const [filter, setFilter] = useState('all'); // PŘESUNUTO NAHORU
  // const [modalData, setModalData] = useState({ isOpen: false, type: null, targetId: null, targetName: null }); // PŘESUNUTO NAHORU


  // Je aktuální uživatel VLASTNÍK?
  const isOwner = currentUser.id === listState.ownerId;

  // --- LOGIKA UPRAVY NÁZVU ---
  const handleSaveName = () => {
    if (isOwner && newName.trim() !== '') {
      // Důležité: Tím, že vracíme novou mapu, se celý komponent rerenderuje.
      // Aby se input správně aktualizoval, musíme po uložení resetovat stav newName na aktuální listName.
      setListState(prev => {
        const newState = { ...prev, listName: newName };
        setNewName(newName); // Aktualizace stavu inputu novým názvem po uložení
        return newState;
      });
      setEditingName(false);
    }
  };

  // --- LOGIKA ČLENŮ ---

  const openRemoveMemberModal = (memberId, memberName) => {
    // Vlastník nemůže odebrat sám sebe (jako vlastníka)
    if (memberId === listState.ownerId) return;

    setModalData({
      isOpen: true,
      type: 'removeMember',
      targetId: memberId,
      targetName: memberName,
      title: 'Potvrzení odebrání',
      message: `Opravdu chcete odebrat člena ${memberName} ze seznamu?`,
    });
  };

  const handleRemoveMember = (memberId) => {
    setListState(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== memberId),
    }));
    setModalData({ isOpen: false, type: null, targetId: null, targetName: null });
  };

  const handleAddMember = () => {
    if (isOwner && newMemberName.trim() !== '') {
      // Simulace ID
      const newId = `user-${Date.now()}`;
      setListState(prev => ({
        ...prev,
        members: [...prev.members, { id: newId, name: newMemberName.trim() }],
      }));
      setNewMemberName('');
    }
  };

  const handleLeaveList = () => {
    setModalData({
      isOpen: true,
      type: 'leaveList',
      targetId: currentUser.id,
      targetName: currentUser.name,
      title: 'Potvrzení odchodu',
      message: `Opravdu chcete opustit nákupní seznam "${listState.listName}"? Po potvrzení budete přesměrováni na přehled.`,
    });
  };

  const confirmLeaveList = () => {
    // Člen se odstraňuje ze seznamu members
    setListState(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== currentUser.id),
    }));
    setModalData({ isOpen: false, type: null, targetId: null, targetName: null });
    // Přesměrování na přehled seznamů
    navigate('/'); 
  };


  // --- LOGIKA POLOŽEK ---

  const handleAddItem = () => {
    if (newItemText.trim() !== '') {
      const newItem = {
        id: Date.now(),
        text: newItemText.trim(),
        resolved: false,
        date: Date.now(),
      };
      setListState(prev => ({
        ...prev,
        items: [...prev.items, newItem].sort((a, b) => a.date - b.date),
      }));
      setNewItemText('');
    }
  };

  const handleToggleResolved = (itemId) => {
    setListState(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, resolved: !item.resolved } : item
      ),
    }));
  };

  const handleRemoveItem = (itemId) => {
    setListState(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId),
    }));
  };

  // const filteredItems = useMemo(...) // PŘESUNUTO NAHORU

  const handleModalConfirm = () => {
    if (modalData.type === 'removeMember') {
      handleRemoveMember(modalData.targetId);
    } else if (modalData.type === 'leaveList') {
      confirmLeaveList();
    }
    setModalData({ isOpen: false, type: null, targetId: null, targetName: null });
  };

  const handleModalCancel = () => {
    setModalData({ isOpen: false, type: null, targetId: null, targetName: null });
  };


  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto min-h-screen bg-gray-50">
      {/* Modaly */}
      <ConfirmationModal
        isOpen={modalData.isOpen}
        title={modalData.title}
        message={modalData.message}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />

      {/* Tlačítko pro odchod (pro ne-vlastníky) */}
      {!isOwner && listState.members.some(m => m.id === currentUser.id) && ( // Zkontrolujeme, jestli je členem před zobrazením tlačítka "Opustit"
        <div className="flex justify-end mb-4">
          <button
            onClick={handleLeaveList}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors shadow-sm"
          >
            <LogOut size={16} />
            <span>Opustit seznam</span>
          </button>
        </div>
      )}

      {/* HLAVNÍ NÁZEV SEZNAMU */}
      <div className="mb-8 p-6 bg-white rounded-2xl shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-extrabold text-gray-800">
            Nákupní Seznam:
          </h2>
        </div>

        {/* ÚPRAVA NÁZVU */}
        <div className="mt-4 flex items-center space-x-3">
          {editingName && isOwner ? (
            <>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-grow p-3 border-2 border-indigo-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <button
                onClick={handleSaveName}
                className="p-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
                title="Uložit název"
              >
                <Save size={20} />
              </button>
              <button
                onClick={() => {
                  setNewName(listState.listName); // Resetování na původní název při zrušení
                  setEditingName(false);
                }}
                className="p-3 bg-gray-200 text-gray-700 rounded-lg shadow-md hover:bg-gray-300 transition-colors"
                title="Zrušit"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <>
              <span className="text-3xl font-bold text-indigo-700">
                {listState.listName}
              </span>
              {isOwner && (
                <button
                  onClick={() => setEditingName(true)}
                  className="p-2 ml-4 text-indigo-500 hover:text-indigo-700 transition-colors"
                  title="Upravit název"
                >
                  <Save size={20} />
                </button>
              )}
            </>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-500 flex items-center">
            <User size={14} className="mr-1" /> Vlastník seznamu: <span className="font-semibold ml-1 text-indigo-600">{listState.members.find(m => m.id === listState.ownerId)?.name || 'Neznámý'}</span>
        </p>
      </div>

      {/* ČLENOVÉ TÝMU */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-6 bg-white rounded-2xl shadow-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <User size={20} className="mr-2 text-indigo-500" />
            Členové týmu ({listState.members.length})
          </h3>
          <ul className="space-y-3">
            {listState.members.map(member => (
              <li key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm">
                <span className={`text-gray-700 ${member.id === listState.ownerId ? 'font-extrabold text-indigo-700' : ''}`}>
                  {member.name} {member.id === listState.ownerId && '(Vlastník)'}
                </span>
                {/* Vlastník může odebrat, ale ne sám sebe jako vlastníka */}
                {isOwner && member.id !== listState.ownerId && (
                  <button
                    onClick={() => openRemoveMemberModal(member.id, member.name)}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                    title={`Odebrat ${member.name}`}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </li>
            ))}
          </ul>

          {/* Přidat člena */}
          {isOwner && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h4 className="font-semibold text-gray-700 mb-2">Přidat nového člena:</h4>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Jméno člena k přidání"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
                <button
                  onClick={handleAddMember}
                  className="p-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
                  title="Přidat člena"
                >
                  <UserPlus size={20} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* POLOŽKY SEZNAMU A FILTROVÁNÍ */}
        <div className="lg:col-span-1 p-6 bg-white rounded-2xl shadow-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            Nákupní položky
          </h3>

          {/* Přidat položku */}
          <div className="mb-6 pb-4 border-b border-gray-100">
            <h4 className="font-semibold text-gray-700 mb-2">Nová položka:</h4>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Název položky..."
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()} // Přidáno pro rychlé přidání přes Enter
                className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              />
              <button
                onClick={handleAddItem}
                className="p-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors"
                title="Přidat položku"
              >
                <Plus size={20} /> 
              </button>
            </div>
          </div>

          {/* FILTROVÁNÍ */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="flex items-center text-sm font-semibold text-gray-600 mr-2">
              <Filter size={16} className="mr-1" /> Filtr:
            </span>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${filter === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Všechny
            </button>
            <button
              onClick={() => setFilter('unresolved')}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${filter === 'unresolved' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Nevyřešené
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${filter === 'resolved' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Vyřešené
            </button>
          </div>

          {/* SEZNAM POLOŽEK */}
          <ul className="space-y-3">
            {filteredItems.map(item => (
              <li key={item.id} className={`flex items-center justify-between p-3 rounded-lg shadow-sm transition-all duration-200 ${item.resolved ? 'bg-green-100 border-l-4 border-green-500' : 'bg-red-100 border-l-4 border-red-500'}`}>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={item.resolved}
                    onChange={() => handleToggleResolved(item.id)}
                    className={`h-5 w-5 rounded form-checkbox ${item.resolved ? 'text-green-600 focus:ring-green-500' : 'text-red-600 focus:ring-red-500'}`}
                  />
                  <span className={`text-gray-800 ${item.resolved ? 'line-through text-gray-500' : 'font-medium'}`}>
                    {item.text}
                  </span>
                </div>
                {/* Odebrat položku */}
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-2 text-gray-500 hover:text-red-600 rounded-full transition-colors"
                  title="Odebrat položku"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
            {filteredItems.length === 0 && (
              <li className="text-center p-4 text-gray-500 italic">Žádné položky pro zobrazení s aktuálním filtrem.</li>
            )}
          </ul>

        </div>
      </div>
    </div>
  );
};

export default ShoppingListDetail;