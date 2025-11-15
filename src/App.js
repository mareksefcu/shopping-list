import React, { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, useParams, Link, useNavigate } from 'react-router-dom';
// Zde jsou ikonky, které používáme v aplikaci - Doplněno ShoppingBag, ClipboardList, List
import { Trash2, User, UserPlus, Save, Check, Filter, X, LogOut, ArrowLeft, ArrowRight, Plus, ShoppingBag, Users, ChevronRight, PlusCircle, ClipboardList, List, Archive, RotateCcw } from 'lucide-react'; 

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
    { id: 1, text: 'Mléko (polotučné)', purchased: false },
    { id: 2, text: 'Chléb (žitný)', purchased: true },
    { id: 3, text: 'Kuřecí maso', purchased: false },
    { id: 4, text: 'Jablka (1 kg)', purchased: false },
  ],
};

// =================================================================
// 2. DÍLČÍ KOMPONENTY (DEFINOVANÉ NA NEJVYŠŠÍ ÚROVNI)
// =================================================================

// Detail nákupního seznamu
const ListDetail = ({ list, currentUser, updateList }) => {
  // Hooky jsou volány bez podmínky
  const [newItemText, setNewItemText] = useState('');
  const navigate = useNavigate();

  if (!list) {
    // Vracíme na přehled, pokud seznam neexistuje
    navigate('/', { replace: true });
    return null;
  }

  const handleAddItem = (e) => {
    e.preventDefault();
    if (newItemText.trim() === '') return;
    
    const newItem = {
      id: Date.now(),
      text: newItemText.trim(),
      purchased: false,
    };
    updateList(list.id, { items: [...list.items, newItem] });
    setNewItemText('');
  };

  const handleToggleItem = (itemId) => {
    const updatedItems = list.items.map(item =>
      item.id === itemId ? { ...item, purchased: !item.purchased } : item
    );
    updateList(list.id, { items: updatedItems });
  };
  
  const handleDeleteItem = (itemId) => {
    const updatedItems = list.items.filter(item => item.id !== itemId);
    updateList(list.id, { items: updatedItems });
  };
  
  const remainingCount = list.items.filter(item => !item.purchased).length;
  const sortedItems = [...list.items].sort((a, b) => {
      // Seřadit nekoupené před koupené
      return a.purchased - b.purchased;
  });


  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-8 bg-white shadow-xl rounded-2xl">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
        <ClipboardList size={30} className="mr-3 text-indigo-600" />
        {list.listName}
      </h1>
      
      <div className="flex justify-between items-center mb-4 text-gray-600 border-b pb-3">
          <p className="font-semibold">{remainingCount} položek zbývá</p>
          <div className="flex items-center space-x-2 text-sm">
             <Users size={18} />
             <span>{list.members.length} Členů</span>
             <ChevronRight size={16} />
          </div>
      </div>


      {/* Formulář pro přidání položky */}
      <form onSubmit={handleAddItem} className="flex mb-6 shadow-md rounded-xl overflow-hidden">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Přidat novou položku..."
          className="flex-1 p-3 border-none focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-150"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white p-3 hover:bg-indigo-700 transition duration-150 flex items-center justify-center disabled:opacity-50"
          disabled={!newItemText.trim()}
          aria-label="Přidat položku"
        >
          <Plus size={24} />
        </button>
      </form>

      {/* Seznam položek */}
      <ul className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
        {sortedItems.length > 0 ? (
          sortedItems.map(item => (
            <li key={item.id} className={`flex items-center justify-between p-4 transition-colors ${item.purchased ? 'bg-green-50/70' : 'hover:bg-indigo-50'}`}>
              <div
                className="flex items-center flex-1 cursor-pointer"
                onClick={() => handleToggleItem(item.id)}
              >
                <input
                  type="checkbox"
                  checked={item.purchased}
                  onChange={() => handleToggleItem(item.id)}
                  className={`w-5 h-5 rounded transition-all mr-4 cursor-pointer ${item.purchased ? 'text-green-600 focus:ring-green-500' : 'text-indigo-600 focus:ring-indigo-500'}`}
                />
                <span className={`text-lg ${item.purchased ? 'line-through text-gray-500 italic' : 'text-gray-800'}`}>
                  {item.text}
                </span>
              </div>
              
              <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-1 text-red-500 hover:bg-red-200 rounded-full transition-colors ml-4"
                  aria-label="Smazat položku"
              >
                  <Trash2 size={20} />
              </button>
            </li>
          ))
        ) : (
          <li className="text-center text-gray-500 py-6 bg-white">
            Seznam je prázdný. Přidejte první položku!
          </li>
        )}
      </ul>
    </div>
  );
};

// Trasa pro zobrazení detailu (používá useParams)
const ListDetailRoute = ({ allLists, currentUser, updateList }) => {
  // Hooky jsou volány na nejvyšší úrovni těla komponenty ListDetailRoute
  const { listId } = useParams();
  const navigate = useNavigate();
  const list = useMemo(() => allLists.find(l => l.id === listId), [allLists, listId]);
  
  if (!list && listId !== INITIAL_LIST_ID) { // Opravená kontrola, aby se zabránilo zacyklení, pokud seznam zmizí
    // Vrátit se na hlavní stránku, pokud seznam neexistuje
    // Toto je zde redundantní, protože to řeší i ListDetail, ale je to dobré pro robustnost
    return (
        <div className="w-full max-w-2xl mx-auto p-10 text-center bg-white rounded-xl shadow-lg mt-10">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Seznam nebyl nalezen!</h2>
            <button 
              onClick={() => navigate('/', { replace: true })}
              className="flex items-center mx-auto text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
            >
                <ArrowLeft size={20} className="mr-2" /> Zpět na přehled
            </button>
        </div>
    );
  }

  // Zde se renderuje komponenta ListDetail
  return <ListDetail list={list} currentUser={currentUser} updateList={updateList} />;
};


// Komponenta přehledu všech seznamů
const ShoppingListOverview = ({ allLists, currentUser, deleteList, createNewList, toggleArchiveList }) => {
  // Hooky volané na nejvyšší úrovni
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const handleCreateAndNavigate = () => {
    const newListId = createNewList(`Nový seznam (${new Date().toLocaleDateString()})`);
    if (newListId) {
      navigate(`/list/${newListId}`);
    }
  };
  
  const navigateToDetail = (listId) => {
    navigate(`/list/${listId}`);
  };

  // Filtrování podle archivace
  const filteredLists = allLists.filter(list => {
    const isArchived = list.isArchived || false;
    if (filter === 'archived') {
      return isArchived; // Pouze archivované
    }
    return true; // Vše (all)
  });

  return (
    <div className="w-full max-w-xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center">
        <List size={30} className="mr-3 text-indigo-600" />
        Přehled seznamů
      </h1>

      <div className="flex justify-between items-center mb-6">
        <p className="text-lg font-medium text-gray-700">Ahoj, {currentUser.name} ({currentUser.role})</p>
        <button
          onClick={handleCreateAndNavigate}
          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center font-semibold active:scale-95"
        >
          <Plus size={20} className="mr-2" /> Nový seznam
        </button>
      </div>

      {/* Filtry */}
      <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl shadow-inner">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
            filter === 'all' 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105' 
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          Vše
        </button>
        <button
          onClick={() => setFilter('archived')}
          className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
            filter === 'archived' 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105' 
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          Pouze archivované
        </button>
      </div>

      <div className="space-y-4">
        {filteredLists.length === 0 ? (
          <p className="text-center text-gray-500 p-6 bg-white rounded-xl shadow-inner">
            {filter === 'archived' 
              ? 'V archivu nemáte žádné seznamy.'
              : 'Zatím nemáte žádné seznamy. Vytvořte si první!'
            }
          </p>
        ) : (
          filteredLists.map(list => {
            const isArchived = list.isArchived || false;
            return (
              <div key={list.id} className={`group relative flex items-center justify-between p-5 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${
                isArchived 
                  ? 'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200' 
                  : 'bg-white border border-gray-200 hover:-translate-y-1'
              }`}>
                {/* Accent border */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  isArchived 
                    ? 'bg-gradient-to-r from-gray-400 to-gray-500' 
                    : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500'
                }`} />
                
                <div className="flex-1 min-w-0 cursor-pointer pr-4" onClick={() => navigateToDetail(list.id)}>
                  <div className="flex items-center gap-3 mb-2">
                    <p className={`text-xl font-bold truncate transition-colors ${
                      isArchived ? 'text-gray-600' : 'text-gray-900 group-hover:text-indigo-600'
                    }`}>
                      {list.listName}
                    </p>
                    {isArchived && (
                      <span className="text-xs font-bold text-gray-700 bg-gray-300 px-3 py-1 rounded-full shadow-sm">
                        ARCHIV
                      </span>
                    )}
                  </div>
                  <p className={`text-sm font-medium ${
                    isArchived ? 'text-gray-500' : 'text-gray-600'
                  }`}>
                      Zbývá: {list.items.filter(item => !item.purchased).length} položek
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (toggleArchiveList) {
                          toggleArchiveList(list.id, !isArchived);
                        }
                      }}
                      className={`px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 font-semibold shadow-md hover:shadow-lg active:scale-95 ${
                        isArchived 
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600' 
                          : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600'
                      }`}
                      title={isArchived ? "Obnovit seznam" : "Archivovat seznam"}
                  >
                      {isArchived ? <RotateCcw size={18} /> : <Archive size={18} />}
                      <span className="text-sm">{isArchived ? 'Obnovit' : 'Archivovat'}</span>
                  </button>
                  <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteList(list.id);
                      }}
                      className="px-3 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 rounded-xl transition-all duration-200 flex items-center shadow-md hover:shadow-lg active:scale-95"
                      aria-label="Smazat seznam"
                      title="Smazat seznam"
                  >
                      <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};


// =================================================================
// 3. HLAVNÍ KOMPONENTA WRAPPER
// =================================================================

const AppWrapper = () => {
  // Hooky na nejvyšší úrovni
  const [currentUser, setCurrentUser] = useState(SIMULATED_USERS.OWNER);
  const [allLists, setAllLists] = useState([
    { id: INITIAL_LIST_ID, ...INITIAL_STATE }
  ]);
  
  const navigate = useNavigate(); // Hook je volán na nejvyšší úrovni AppWrapper

  // --- CRUD OPERACE NAD SIMULOVANÝMI DATY ---

  const handleLogin = (roleKey) => {
    setCurrentUser(SIMULATED_USERS[roleKey]);
    // Po změně uživatele navigujeme na přehled
    navigate('/', { replace: true }); 
  };
  
  const createNewList = (name) => {
    const newId = Date.now().toString();
    const newList = {
        id: newId,
        ownerId: currentUser.id,
        listName: name,
        members: [{ id: currentUser.id, name: currentUser.name }],
        items: [],
        isArchived: false,
    };
    setAllLists(prev => [newList, ...prev]);
    return newId; // Vracíme ID pro navigaci
  };
  
  const deleteList = (listId) => {
    setAllLists(prev => prev.filter(list => list.id !== listId));
    // Navigace na přehled, pokud smažeme aktuálně zobrazený seznam
    if (window.location.pathname.includes(listId)) {
        navigate('/', { replace: true });
    }
  };
  
  const updateList = (listId, updates) => {
    setAllLists(prev => 
        prev.map(list => 
            list.id === listId ? { ...list, ...updates } : list
        )
    );
  };

  const toggleArchiveList = (listId, isArchived) => {
    setAllLists(prev => 
        prev.map(list => 
            list.id === listId ? { ...list, isArchived } : list
        )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
          body { font-family: 'Inter', sans-serif; }
      `}</style>
      
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white p-4 shadow-xl sticky top-0 z-10 border-b border-indigo-700">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold flex items-center hover:opacity-90 transition-opacity no-underline">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3 backdrop-blur-sm">
                <ShoppingBag size={24} className="text-white" />
              </div>
              <span className="text-white">Nákupní Seznam</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1-5 rounded-xl backdrop-blur-sm">
              <User size={18} className="text-white" />
              <span className="text-sm font-semibold text-white">{currentUser.name}</span>
            </div>
            
            {/* Tlačítka pro simulaci přihlášení */}
            <button
              onClick={() => handleLogin('OWNER')}
              className={`px-4 py-2 text-sm rounded-xl transition-all duration-200 font-semibold shadow-lg flex items-center ${
                currentUser.id === SIMULATED_USERS.OWNER.id 
                  ? 'bg-white text-indigo-600 shadow-xl scale-105' 
                  : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
              }`}
            >
              Vlastník
            </button>
            <button
              onClick={() => handleLogin('MEMBER')}
              className={`px-4 py-2 text-sm rounded-xl transition-all duration-200 font-semibold shadow-lg flex items-center ${
                currentUser.id === SIMULATED_USERS.MEMBER.id 
                  ? 'bg-white text-indigo-600 shadow-xl scale-105' 
                  : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
              }`}
            >
              Člen
            </button>
            
            {/* Tlačítko pro návrat na přehled */}
            <Link 
              to="/" 
              className="px-4 py-2 text-sm rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all duration-200 font-semibold shadow-lg flex items-center backdrop-blur-sm hover:scale-105 no-underline"
            >
                <ArrowLeft size={16} className="mr-1" /> Přehled
            </Link>
          </div>
        </div>
      </header>

      {/* ROUTES */}
      <main className="py-10">
        <Routes>
          {/* 1. DETAIL SEZNAMU (Cesta: /list/:listId) */}
          <Route
            path="/list/:listId"
            element={<ListDetailRoute
              currentUser={currentUser}
              allLists={allLists} 
              updateList={updateList}
            />}
          />

          {/* 2. PŘEHLED SEZNAMŮ (Cesta: /) */}
          <Route
            path="/"
            element={
              <ShoppingListOverview
                  allLists={allLists}
                  currentUser={currentUser}
                  deleteList={deleteList}
                  createNewList={createNewList}
                  toggleArchiveList={toggleArchiveList}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
};

// Hlavní export s BrowserRouterem
const App = () => (
    <BrowserRouter>
        <AppWrapper />
    </BrowserRouter>
);

export default App;