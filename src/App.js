import React, { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
// Zde jsou ikonky, které používáme v aplikaci
import { Trash2, User, UserPlus, Save, Check, Filter, X, LogOut, ArrowLeft, ArrowRight } from 'lucide-react';

// --- DATA SIMULACE ---
// Jan Novák je VLASTNÍK (ownerId)
// Petra Svobodová je ČLEN (memberId)
const SIMULATED_USERS = {
  OWNER: { id: 'user-jan-novak', name: 'Jan Novák', role: 'VLASTNÍK' },
  MEMBER: { id: 'user-petra-svobodova', name: 'Petra Svobodová', role: 'ČLEN' },
};

const INITIAL_LIST_ID = 'aBc123';

const INITIAL_STATE = {
  // Simulace ID vlastníka
  ownerId: SIMULATED_USERS.OWNER.id,
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
};
// --- KONEC DAT SIMULACE ---

// ----------------------------------------------------
// KOMPONENTA 1: MODAL PRO POTVRZENÍ
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
// KOMPONENTA 2: LIST DETAIL ROUTE
// TATO KOMPONENTA OBSAHUJE VŠECHNU LOGIKU SEZNAMU
// ----------------------------------------------------
const ListDetailRoute = ({ currentUser, listState, setListState, setCurrentUser }) => {
  const { listId } = useParams();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(listState.listName);
  const [newMemberName, setNewMemberName] = useState('');
  const [newItemText, setNewItemText] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'unresolved', 'resolved'
  const [modalData, setModalData] = useState({ isOpen: false, type: null, targetId: null, targetName: null });

  // Je aktuální uživatel VLASTNÍK?
  const isOwner = currentUser.id === listState.ownerId;

  // --- LOGIKA UPRAVY NÁZVU (BUSINESS LOGIKA 1) ---
  const handleSaveName = () => {
    if (isOwner && newName.trim() !== '') {
      setListState(prev => ({ ...prev, listName: newName }));
      setEditingName(false);
    }
  };

  // --- LOGIKA ČLENŮ (BUSINESS LOGIKA 2 & 3) ---

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
      message: `Opravdu chcete opustit nákupní seznam "${listState.listName}"?`,
    });
  };

  const confirmLeaveList = () => {
    // Člen se odstraňuje ze seznamu members
    setListState(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== currentUser.id),
    }));
    // Zde by měla následovat navigace na jinou stránku (např. /list/mine),
    // ale pro tuto simulaci stačí uživatele "odhlašovat" na ČLENSKOU roli, aby se dostal ven.
    // Zde jen zavřeme modal a ponecháme stav (pro jednoduchost).
    setModalData({ isOpen: false, type: null, targetId: null, targetName: null });

    // Alternativně: Přepnout uživatele do simulované role ČLEN, který není v seznamu
    setCurrentUser(SIMULATED_USERS.MEMBER);
  };


  // --- LOGIKA POLOŽEK (BUSINESS LOGIKA 4, 5, 6, 7) ---

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

  // Filtrování položek (BUSINESS LOGIKA 7)
  const filteredItems = useMemo(() => {
    switch (filter) {
      case 'unresolved':
        return listState.items.filter(item => !item.resolved);
      case 'resolved':
        return listState.items.filter(item => item.resolved);
      case 'all':
      default:
        return listState.items;
    }
  }, [listState.items, filter]);

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


  // ----------------------------------------------------
  // RENDER SEZNAMU
  // ----------------------------------------------------
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
      {!isOwner && (
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

        {/* ÚPRAVA NÁZVU (BUSINESS LOGIKA 1) */}
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
                onClick={() => setEditingName(false)}
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

          {/* Přidat člena (BUSINESS LOGIKA 2) */}
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

          {/* Přidat položku (BUSINESS LOGIKA 5) */}
          <div className="mb-6 pb-4 border-b border-gray-100">
            <h4 className="font-semibold text-gray-700 mb-2">Nová položka:</h4>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Název položky..."
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              />
              <button
                onClick={handleAddItem}
                className="p-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors"
                title="Přidat položku"
              >
                <UserPlus size={20} /> {/* Použito pro Plus ikonu */}
              </button>
            </div>
          </div>

          {/* FILTROVÁNÍ (BUSINESS LOGIKA 7) */}
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

          {/* SEZNAM POLOŽEK (BUSINESS LOGIKA 4, 6) */}
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
                {/* Odebrat položku (BUSINESS LOGIKA 5) */}
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


// ----------------------------------------------------
// KOMPONENTA 3: HLAVNÍ KOMPONENTA (ROUTING A STAV)
// ----------------------------------------------------
const AppWrapper = () => {
  // --- GLOBÁLNÍ STAVY A SIMULACE PŘIHLÁŠENÍ ---
  const [listState, setListState] = useState(INITIAL_STATE);
  const [currentUser, setCurrentUser] = useState(SIMULATED_USERS.OWNER); // Defaultně VLASTNÍK

  // Změna uživatele pro simulaci (přihlášení)
  const handleLogin = (userRole) => {
    if (userRole === 'OWNER') {
      setCurrentUser(SIMULATED_USERS.OWNER);
    } else if (userRole === 'MEMBER') {
      setCurrentUser(SIMULATED_USERS.MEMBER);
    }
    // Po přihlášení resetujeme seznam pro čisté testování (volitelné)
    setListState(INITIAL_STATE);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* HEADER: SIMULACE PŘIHLÁŠENÍ */}
        <header className="p-4 sm:p-6 bg-gray-900 text-white shadow-lg flex justify-between items-center flex-wrap">
          <div className="text-xl font-bold text-indigo-400">Simulace Přihlášení</div>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <span className="text-sm">
              Přihlášen jako: <span className="font-semibold text-yellow-400">{currentUser.name} ({currentUser.role})</span>
            </span>
            <button
              onClick={() => handleLogin('OWNER')}
              className="px-3 py-1 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors font-medium shadow-md"
            >
              Přihlásit jako Vlastník
            </button>
            <button
              onClick={() => handleLogin('MEMBER')}
              className="px-3 py-1 text-sm rounded-lg bg-indigo-400 hover:bg-indigo-500 transition-colors font-medium shadow-md"
            >
              Přihlásit jako Člen
            </button>
          </div>
        </header>

        {/* ROUTES */}
        <main>
          <Routes>
            {/* Zobrazí se při zadání adresy /list/cokoliv */}
            <Route
              path="/list/:listId"
              element={<ListDetailRoute
                currentUser={currentUser}
                listState={listState}
                setListState={setListState}
                setCurrentUser={setCurrentUser}
              />}
            />

            {/* Úvodní stránka pro snadné testování */}
            <Route
              path="/"
              element={
                <div className="p-8 max-w-lg mx-auto mt-12 bg-white rounded-xl shadow-2xl text-center">
                  <h1 className="text-3xl font-extrabold text-gray-800 mb-4">Vítejte v aplikaci!</h1>
                  <p className="text-gray-600 mb-6">
                    Pro zobrazení detailu seznamu zadejte do adresního řádku:
                  </p>
                  <a
                    href={`/list/${INITIAL_LIST_ID}`}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 transition-colors transform hover:scale-105"
                  >
                    <span>/list/{INITIAL_LIST_ID}</span>
                    <ArrowRight size={18} />
                  </a>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default AppWrapper;
