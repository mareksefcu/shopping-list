// components/ShoppingListDetailAPI.jsx
// Shopping list detail component using API service

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, ArrowLeft, Loader2, ClipboardList, Archive, RotateCcw } from 'lucide-react';
import { listService } from '../services/apiService';
import { handleApiError } from '../utils/errorHandler';

const ShoppingListDetail = ({ listId, onBack, archiveList, refreshLists }) => {
    const [listData, setListData] = useState(null);
    const [newItemName, setNewItemName] = useState('');
    const [isListLoading, setIsListLoading] = useState(true);
    const [error, setError] = useState('');

    // Load list data
    useEffect(() => {
        const loadList = async () => {
            setIsListLoading(true);
            setError('');
            try {
                const data = await listService.getList(listId);
                setListData(data);
            } catch (err) {
                setError(handleApiError(err, 'Nepodařilo se načíst seznam.'));
            } finally {
                setIsListLoading(false);
            }
        };

        if (listId) {
            loadList();
            // Refresh every 5 seconds
            const interval = setInterval(loadList, 5000);
            return () => clearInterval(interval);
        }
    }, [listId]);

    const addItem = async () => {
        if (!newItemName.trim() || !listData) return;
        
        try {
            const currentItems = listData.items || [];
            // Generate unique ID for item
            const itemId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const newItem = {
                itemId: itemId,
                name: newItemName.trim(),
                quantity: 1,
                unit: 'ks',
                done: false
            };
            
            const updatedItems = [...currentItems, newItem];
            
            // Update the entire items array
            await listService.updateList(listId, { items: updatedItems });
            setNewItemName('');
            // Reload list data
            const refreshed = await listService.getList(listId);
            setListData(refreshed);
            refreshLists();
        } catch (err) {
            setError(handleApiError(err, 'Nepodařilo se přidat položku.'));
        }
    };

    const toggleItemPurchased = async (itemId) => {
        if (!listData) return;

        try {
            const item = listData.items.find(i => i.itemId === itemId);
            if (!item) return;

            await listService.updateListItem(listId, itemId, {
                done: !item.done
            });
            
            // Reload list data
            const updated = await listService.getList(listId);
            setListData(updated);
            refreshLists();
        } catch (err) {
            setError(handleApiError(err, 'Nepodařilo se aktualizovat položku.'));
        }
    };

    const deleteItem = async (itemId) => {
        if (!listData) return;

        try {
            const updatedItems = listData.items.filter(item => item.itemId !== itemId);
            await listService.updateList(listId, { items: updatedItems });
            
            // Reload list data
            const updated = await listService.getList(listId);
            setListData(updated);
            refreshLists();
        } catch (err) {
            setError(handleApiError(err, 'Nepodařilo se smazat položku.'));
        }
    };

    const handleArchiveToggle = async () => {
        if (!listData) return;
        const newArchiveStatus = !(listData.isArchived || false);
        
        try {
            await listService.updateList(listId, { isArchived: newArchiveStatus });
            archiveList(listId);
            // Reload list data
            const updated = await listService.getList(listId);
            setListData(updated);
            refreshLists();
        } catch (err) {
            setError(handleApiError(err, 'Nepodařilo se archivovat seznam.'));
        }
    };

    if (isListLoading || !listData) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                    <Loader2 className="animate-spin text-white" size={32} />
                </div>
                <p className="text-gray-600 font-medium">Načítám detaily seznamu...</p>
            </div>
        );
    }

    const items = listData.items || [];
    const sortedItems = [...items].sort((a, b) => {
        if (a.done !== b.done) {
            return a.done ? 1 : -1;
        }
        return 0;
    });

    const purchasedCount = sortedItems.filter(item => item.done).length;
    const totalItems = sortedItems.length;
    const completionPercentage = totalItems > 0 ? (purchasedCount / totalItems) * 100 : 0;
    const isArchived = listData.isArchived || false;

    return (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {error}
                </div>
            )}

            {/* Back Button and Archive Button */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={onBack}
                    className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors font-medium group"
                >
                    <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Zpět na přehled
                </button>
                
                <button
                    onClick={handleArchiveToggle}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                        isArchived
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700'
                    }`}
                    title={isArchived ? "Obnovit seznam z archivu" : "Archivovat seznam"}
                >
                    {isArchived ? (
                        <>
                            <RotateCcw size={18} />
                            <span>Obnovit z archivu</span>
                        </>
                    ) : (
                        <>
                            <Archive size={18} />
                            <span>Archivovat</span>
                        </>
                    )}
                </button>
            </div>

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                        isArchived 
                            ? 'bg-gradient-to-br from-gray-400 to-gray-500' 
                            : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                    }`}>
                        <ClipboardList size={32} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className={`text-4xl font-bold mb-2 ${
                                isArchived ? 'text-gray-600' : 'text-gray-900'
                            }`}>
                                {listData.name}
                            </h1>
                            {isArchived && (
                                <span className="text-xs font-bold text-gray-700 bg-gray-200 px-3 py-1 rounded-full uppercase tracking-wide">
                                    Archiv
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{totalItems} {totalItems === 1 ? 'položka' : totalItems < 5 ? 'položky' : 'položek'}</span>
                            {totalItems > 0 && (
                                <>
                                    <span>•</span>
                                    <span className="font-semibold text-indigo-600">{purchasedCount} dokončeno</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Progress Bar */}
                {totalItems > 0 && (
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">Průběh</span>
                            <span className="text-sm font-semibold text-indigo-600">{Math.round(completionPercentage)}%</span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 rounded-full"
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Add Item Form */}
            <div className="bg-white p-2 rounded-2xl shadow-lg border border-gray-200 mb-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center">
                    <input
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addItem();
                            }
                        }}
                        placeholder="Přidat novou položku..."
                        className="flex-1 px-5 py-4 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400 text-lg font-medium"
                    />
                    <button
                        onClick={addItem}
                        className="ml-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 font-semibold"
                        disabled={!newItemName.trim()}
                        aria-label="Přidat položku"
                    >
                        <Plus size={22} className="mr-2" /> Přidat
                    </button>
                </div>
            </div>

            {/* Items List */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                {sortedItems.length > 0 ? (
                    <ul className="divide-y divide-gray-100">
                        {sortedItems.map((item, index) => (
                            <li 
                                key={item.itemId} 
                                className={`flex items-center justify-between px-6 py-4 transition-all duration-200 ${
                                    item.done 
                                        ? 'bg-gradient-to-r from-emerald-50 to-green-50' 
                                        : 'hover:bg-gray-50'
                                }`}
                                style={{ animationDelay: `${index * 30}ms` }}
                            >
                                <div
                                    className="flex items-center flex-1 cursor-pointer group"
                                    onClick={() => toggleItemPurchased(item.itemId)}
                                >
                                    <button
                                        className={`w-7 h-7 rounded-xl border-2 mr-4 flex items-center justify-center transition-all duration-200 ${
                                            item.done
                                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                                                : 'border-gray-300 text-transparent hover:border-indigo-400 hover:bg-indigo-50 group-hover:scale-110'
                                        }`}
                                        aria-label={item.done ? "Odznačit jako koupené" : "Označit jako koupené"}
                                    >
                                        {item.done && <CheckCircle2 size={18} />}
                                    </button>
                                    <span className={`text-lg font-medium transition-all ${
                                        item.done 
                                            ? 'line-through text-gray-400' 
                                            : 'text-gray-900 group-hover:text-indigo-600'
                                    }`}>
                                        {item.name} {item.quantity > 1 && `(${item.quantity} ${item.unit})`}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteItem(item.itemId);
                                    }}
                                    className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 active:scale-95"
                                    aria-label="Smazat položku"
                                    title="Smazat položku"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center p-16">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <ClipboardList size={40} className="text-indigo-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Seznam je prázdný</h3>
                        <p className="text-gray-500">Přidejte první položku výše a začněte nakupovat!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShoppingListDetail;

