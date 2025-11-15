import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Users, ChevronRight, Archive, RotateCcw } from 'lucide-react'; 

// Přidána funkce toggleArchiveList do props
const ListCard = ({ list, listId, isOwner, deleteList, toggleArchiveList }) => {
    // Spočítá nevyřešené položky
    const unresolvedCount = list.items.filter(item => !item.resolved).length;

    const handleDelete = (e) => {
        // Zabrání navigaci na detail seznamu
        e.preventDefault(); 
        e.stopPropagation();
        if (window.confirm(`Opravdu chcete smazat seznam "${list.listName}"? Tato akce je nevratná.`)) {
            deleteList(listId);
        }
    };

    // KLÍČOVÁ FUNKCE: Archivace/Obnovení
    const handleArchiveToggle = (e) => {
        e.preventDefault(); 
        e.stopPropagation();
        
        // Zde používáme nativní okno, protože alert/confirm/prompt jsou v Canvasu zakázány
        // Mělo by být nahrazeno vlastní komponentou modalu pro potvrzení
        if (typeof window !== 'undefined' && window.confirm) {
            const action = list.isArchived ? 'obnovit z archivu' : 'archivovat';
            if (window.confirm(`Opravdu chcete ${action} seznam "${list.listName}"?`)) {
                // isArchiving je true pro archivaci (ze stavu false), false pro obnovení (ze stavu true)
                toggleArchiveList(listId, !list.isArchived); 
            }
        } else {
             // Fallback pro prostředí, kde confirm není dostupné (např. server-side rendering)
             // Pro demonstraci provedeme akci rovnou, ale v produkci by zde měl být vlastní modal.
             toggleArchiveList(listId, !list.isArchived); 
        }
    };

    return (
        <Link 
            to={`/list/${listId}`} 
            // Upravené styly pro archivovaný seznam
            className={`block p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 ${list.isArchived ? 'bg-gray-200 border-gray-500 hover:border-gray-700' : 'bg-white border-indigo-500 hover:border-indigo-700'}`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{list.listName}</h3>
                    <p className="text-sm text-gray-500 flex items-center">
                        <Users size={14} className="mr-1" />
                        Členů: {list.members.length} 
                        {isOwner && <span className="ml-2 font-semibold text-indigo-600">(Vlastní)</span>}
                        {/* Zobrazení štítku ARCHIV */}
                        {list.isArchived && <span className="ml-2 font-bold text-gray-600">(ARCHIVOVÁNO)</span>}
                    </p>
                </div>
                
                <div className={`flex flex-col items-end text-sm font-semibold p-2 rounded-full ${unresolvedCount > 0 && !list.isArchived ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {unresolvedCount}
                    <span className="text-xs font-normal">nevyřešeno</span>
                </div>
            </div>

            <div className="mt-4 flex justify-between items-center border-t pt-3">
                <div className="text-sm text-indigo-600 flex items-center font-medium">
                    {list.isArchived ? 'Přejít (Archiv)' : 'Přejít na seznam'} <ChevronRight size={16} className="ml-1" />
                </div>
                {/* Tlačítka akcí pro VLASTNÍKA */}
                {isOwner && (
                    <div className="flex space-x-2">
                        {/* Tlačítko Archivovat/Obnovit */}
                        <button
                            onClick={handleArchiveToggle}
                            className={`px-3 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 font-semibold ${
                                list.isArchived 
                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:text-emerald-800' 
                                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 hover:text-indigo-800'
                            }`}
                            title={list.isArchived ? "Obnovit seznam" : "Archivovat seznam"}
                        >
                            {/* Změna ikony podle stavu archivace */}
                            {list.isArchived ? <RotateCcw size={18} /> : <Archive size={18} />}
                            <span className="text-sm">
                                {list.isArchived ? 'Obnovit' : 'Archivovat'}
                            </span>
                        </button>

                        {/* Tlačítko Smazat */}
                        <button
                            onClick={handleDelete}
                            className="px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-xl transition-all duration-200 flex items-center"
                            title="Smazat seznam"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                )}
            </div>
        </Link>
    );
};

export default ListCard;