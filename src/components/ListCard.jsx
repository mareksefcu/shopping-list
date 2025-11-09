import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Users, ChevronRight } from 'lucide-react'; 

const ListCard = ({ list, listId, isOwner, deleteList }) => {
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

    return (
        <Link 
            to={`/list/${listId}`} 
            className="block p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-indigo-500 hover:border-indigo-700"
        >
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{list.listName}</h3>
                    <p className="text-sm text-gray-500 flex items-center">
                        <Users size={14} className="mr-1" />
                        Členů: {list.members.length} 
                        {isOwner && <span className="ml-2 font-semibold text-indigo-600">(Vlastní)</span>}
                    </p>
                </div>
                
                <div className={`flex flex-col items-end text-sm font-semibold p-2 rounded-full ${unresolvedCount > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {unresolvedCount}
                    <span className="text-xs font-normal">nevyřešeno</span>
                </div>
            </div>

            <div className="mt-4 flex justify-between items-center border-t pt-3">
                <div className="text-sm text-indigo-600 flex items-center font-medium">
                    Přejít na seznam <ChevronRight size={16} className="ml-1" />
                </div>
                {isOwner && (
                    <button
                        onClick={handleDelete}
                        className="p-1 text-gray-400 hover:text-red-600 rounded-full transition-colors"
                        title="Smazat seznam"
                    >
                        <Trash2 size={18} />
                    </button>
                )}
            </div>
        </Link>
    );
};

export default ListCard;