import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ShoppingListOverview from './components/ShoppingListOverview'; 
import ShoppingListDetail from './components/ShoppingListDetail'; 
import { initialShoppingLists, SIMULATED_USERS } from './data';
import { ArrowLeft } from 'lucide-react';

function App() {
  // --- GLOBÁLNÍ STAVY ---
  const [allLists, setAllLists] = useState(initialShoppingLists);
  const [currentUser, setCurrentUser] = useState(SIMULATED_USERS.OWNER); // Defaultně VLASTNÍK

  // --- FUNKCE PRO ZMĚNU STAVU ---
  
  // Změna uživatele pro simulaci (přihlášení)
  const handleLogin = (userRole) => {
    if (userRole === 'OWNER') {
      setCurrentUser(SIMULATED_USERS.OWNER);
    } else if (userRole === 'MEMBER') {
      setCurrentUser(SIMULATED_USERS.MEMBER);
    }
    // Pro čistou simulaci resetujeme seznamy na původní stav
    setAllLists(initialShoppingLists);
  };

  // Funkce pro vytvoření nového seznamu
  const createNewList = (listId, listName, ownerId, ownerName) => {
      const newList = {
          ownerId: ownerId,
          listName: listName,
          members: [{ id: ownerId, name: ownerName }],
          items: [],
      };
      setAllLists(prevLists => ({
          ...prevLists,
          [listId]: newList,
      }));
  };

  // Funkce pro smazání seznamu
  const deleteList = (listIdToDelete) => {
      setAllLists(prevLists => {
          const newLists = { ...prevLists };
          delete newLists[listIdToDelete];
          return newLists;
      });
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* HEADER: SIMULACE PŘIHLÁŠENÍ */}
        <header className="p-4 sm:p-6 bg-gray-900 text-white shadow-lg flex justify-between items-center flex-wrap">
          <div className="text-xl font-bold text-indigo-400">
            <Link to="/">Nákupní Seznamy</Link>
          </div>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <span className="text-sm">
              Přihlášen jako: <span className="font-semibold text-yellow-400">{currentUser.name} ({currentUser.role})</span>
            </span>
            <button
              onClick={() => handleLogin('OWNER')}
              className="px-3 py-1 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors font-medium shadow-md"
            >
              Vlastník
            </button>
            <button
              onClick={() => handleLogin('MEMBER')}
              className="px-3 py-1 text-sm rounded-lg bg-indigo-400 hover:bg-indigo-500 transition-colors font-medium shadow-md"
            >
              Člen
            </button>
            <Link to="/" className="px-3 py-1 text-sm rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors font-medium shadow-md flex items-center">
                <ArrowLeft size={16} className="mr-1" /> Přehled
            </Link>
          </div>
        </header>

        {/* ROUTES */}
        <main>
          <Routes>
            {/* Trasa pro přehled seznamů */}
            <Route 
              path="/" 
              element={
                <ShoppingListOverview 
                  allLists={allLists}
                  currentUser={currentUser}
                  deleteList={deleteList}
                  createNewList={createNewList}
                />
              } 
            />
            {/* Trasa pro detail seznamu */}
            <Route 
              path="/list/:listId" 
              element={
                <ShoppingListDetail 
                  currentUser={currentUser}
                  allLists={allLists}
                  setAllLists={setAllLists} // Tato funkce se používá pro všechny CRUD operace v detailu
                  setCurrentUser={setCurrentUser} // Pouze pro simulaci odhlášení při "Opustit seznam"
                />
              } 
            />
            {/* Přidání trasy pro 404/Not Found (nepovinné) */}
            <Route path="*" element={<div className="p-8 max-w-lg mx-auto mt-12 text-center text-red-600"><h2>Chyba 404: Stránka nenalezena</h2></div>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;