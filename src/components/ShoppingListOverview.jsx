import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Plus, PlusCircle, X, Archive, FolderOpen } from 'lucide-react'; 
import ListCard from './ListCard'; 

// --- KOMPONENTA: MODAL PRO VYTVOŘENÍ SEZNAMU (beze změn) ---
const CreateListModal = ({ isOpen, onClose, onCreate }) => {
    const [listName, setListName] = useState('');

    const handleSubmit = () => {
        if (listName.trim() === '') return;
        onCreate(listName.trim());
        setListName('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-transform duration-300 scale-100">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="text-xl font-bold text-indigo-700 flex items-center">
                            <PlusCircle size={22} className="mr-2" /> Vytvořit nový seznam
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <p className="text-gray-600 mb-4">Zadejte prosím název pro váš nový nákupní seznam.</p>
                    <input
                        type="text"
                        placeholder="Název seznamu (např. 'Párty jídlo')"
                        value={listName}
                        onChange={(e) => setListName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        className="w-full p-3 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all mb-6"
                    />
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
                        >
                            Zrušit
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={listName.trim() === ''}
                            className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                            Vytvořit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
// --- KONEC KOMPONENTY MODAL ---


// --- HLAVNÍ KOMPONENTA: PŘEHLED SEZNAMŮ ---
const ShoppingListOverview = ({ allLists, currentUser, deleteList, createNewList, toggleArchiveList }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState('active'); // STAV PRO FILTROVÁNÍ: 'active' nebo 'archived'
    const navigate = useNavigate();

    // 1. FILTROVÁNÍ seznamů, kde je aktuální uživatel členem
    const userLists = Object.entries(allLists)
        .filter(([, list]) => list.members.some(m => m.id === currentUser.id))
        .map(([id, list]) => ({ id, ...list }));

    // 2. KLÍČOVÉ FILTROVÁNÍ podle stavu ARCHIVACE
    const filteredLists = userLists.filter(list => 
        // Zobraz aktivní, pokud je filter 'active', jinak zobraz archivované
        filter === 'active' ? !list.isArchived : list.isArchived
    );

    const ownedLists = filteredLists.filter(list => list.ownerId === currentUser.id);
    const memberLists = filteredLists.filter(list => list.ownerId !== currentUser.id);

    const handleCreate = (listName) => {
        const newId = `list-${Date.now()}`;
        
        createNewList(newId, listName, currentUser.id, currentUser.name);

        // Po vytvoření resetujeme filtr na 'active' a navigujeme na detail
        setFilter('active');
        navigate(`/list/${newId}`);
    };

    return (
        <div className="p-4 sm:p-8 max-w-4xl mx-auto min-h-screen bg-gray-50">
            
            {/* Modal */}
            <CreateListModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreate}
            />

            <h1 className="text-3xl font-extrabold text-gray-800 mb-6 flex items-center">
                <ShoppingBag size={30} className="mr-3 text-indigo-600" /> Přehled nákupních seznamů
            </h1>

            {/* OVLÁDACÍ PRVKY: FILTR A TLAČÍTKO NOVÝ SEZNAM */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 p-4 bg-white rounded-xl shadow">
                
                {/* FILTRY */}
                <div className="flex space-x-2 mb-4 sm:mb-0">
                    <button
                        onClick={() => setFilter('active')}
                        className={`px-4 py-2 rounded-lg font-semibold flex items-center transition-colors ${filter === 'active' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        <FolderOpen size={18} className="mr-2" /> Aktivní seznamy
                    </button>
                    <button
                        onClick={() => setFilter('archived')}
                        className={`px-4 py-2 rounded-lg font-semibold flex items-center transition-colors ${filter === 'archived' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        <Archive size={18} className="mr-2" /> Archivované seznamy
                    </button>
                </div>
                
                {/* TLAČÍTKO PRO MODAL */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-colors flex items-center font-bold"
                >
                    <Plus size={20} className="mr-2" /> Nový seznam
                </button>
            </div>

            {/* ZOBRAZENÍ SEZNAMŮ - DLAŽDICE */}
            {filteredLists.length === 0 ? (
                <div className="p-10 bg-white rounded-xl shadow-lg text-center">
                    <p className="text-gray-500 italic">
                        {filter === 'active' 
                            ? 'V tuto chvíli nemáte žádné aktivní seznamy.'
                            : 'V archivu nemáte žádné seznamy.'
                        }
                    </p>
                </div>
            ) : (
                <>
                    {/* Vlastní seznamy */}
                    <h2 className="text-2xl font-bold text-gray-700 mt-8 mb-4">
                        Seznamy, které vlastním ({ownedLists.length})
                    </h2>
                    {/* ZDE JE DLAŽDICOVÉ ZOBRAZENÍ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ownedLists.map(list => (
                            <ListCard 
                                key={list.id} 
                                listId={list.id} 
                                list={list} 
                                isOwner={true} 
                                deleteList={deleteList} 
                                toggleArchiveList={toggleArchiveList} // Předání funkce
                            />
                        ))}
                    </div>

                    {/* Seznamy, kde jsem členem */}
                    {memberLists.length > 0 && (
                        <>
                            <h2 className="text-2xl font-bold text-gray-700 mt-8 mb-4">
                                Seznamy, kde jsem členem ({memberLists.length})
                            </h2>
                            {/* ZDE JE DLAŽDICOVÉ ZOBRAZENÍ */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {memberLists.map(list => (
                                    <ListCard 
                                        key={list.id} 
                                        listId={list.id} 
                                        list={list} 
                                        isOwner={false}
                                        deleteList={deleteList} 
                                        toggleArchiveList={toggleArchiveList} // Předání funkce
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default ShoppingListOverview;