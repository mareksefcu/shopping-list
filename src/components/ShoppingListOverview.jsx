import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Plus, PlusCircle } from 'lucide-react'; 
import ListCard from './ListCard'; 

const ShoppingListOverview = ({ allLists, currentUser, deleteList, createNewList }) => {
    const [listName, setListName] = useState('');
    const navigate = useNavigate();

    // Filtrování seznamů, kde je aktuální uživatel členem
    const userLists = Object.entries(allLists)
        .filter(([, list]) => list.members.some(m => m.id === currentUser.id))
        .map(([id, list]) => ({ id, ...list }));

    const ownedLists = userLists.filter(list => list.ownerId === currentUser.id);
    const memberLists = userLists.filter(list => list.ownerId !== currentUser.id);

    const handleCreate = () => {
        if (listName.trim() === '') return;

        const newId = `list-${Date.now()}`;
        
        createNewList(newId, listName.trim(), currentUser.id, currentUser.name);

        setListName('');
        // Navigace na nově vytvořený seznam
        navigate(`/list/${newId}`);
    };

    return (
        <div className="p-4 sm:p-8 max-w-4xl mx-auto min-h-screen bg-gray-50">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-6 flex items-center">
                <ShoppingBag size={30} className="mr-3 text-indigo-600" /> Moje nákupní seznamy
            </h1>
            
            {userLists.length === 0 ? (
                <div className="p-10 bg-white rounded-xl shadow-lg text-center">
                    <p className="text-gray-500 italic">Zatím nejste členem žádného seznamu. Vytvořte nový!</p>
                </div>
            ) : (
                <>
                    {/* Vlastní seznamy */}
                    <h2 className="text-2xl font-bold text-gray-700 mt-8 mb-4">Seznamy, které vlastním ({ownedLists.length})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ownedLists.map(list => (
                            <ListCard key={list.id} listId={list.id} list={list} isOwner={true} deleteList={deleteList} />
                        ))}
                    </div>

                    {/* Seznamy, kde jsem členem */}
                    {memberLists.length > 0 && (
                        <>
                            <h2 className="text-2xl font-bold text-gray-700 mt-8 mb-4">Seznamy, kde jsem členem ({memberLists.length})</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {memberLists.map(list => (
                                    <ListCard key={list.id} listId={list.id} list={list} isOwner={false} />
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}

            {/* Přidání nového seznamu */}
            <div className="mt-10 p-6 bg-indigo-100 rounded-xl shadow-inner border border-indigo-200">
                <h3 className="text-xl font-bold text-indigo-700 mb-4 flex items-center">
                    <PlusCircle size={22} className="mr-2" /> Vytvořit nový seznam
                </h3>
                <div className="flex space-x-3">
                    <input
                        type="text"
                        placeholder="Název nového seznamu (např. 'Párty jídlo')"
                        value={listName}
                        onChange={(e) => setListName(e.target.value)}
                        className="flex-grow p-3 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                    <button
                        onClick={handleCreate}
                        disabled={listName.trim() === ''}
                        className="p-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        title="Vytvořit"
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShoppingListOverview;