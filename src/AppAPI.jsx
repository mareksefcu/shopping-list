// AppAPI.jsx
// Main App component using API service instead of Firebase

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Loader2, List, Archive, RotateCcw, FolderOpen, LogOut } from 'lucide-react';
import { authService, listService } from './services/apiService';
import { setAuthToken, setUserId, getUserId, clearAuth, USE_MOCK_DATA } from './config/api';
import { handleApiError } from './utils/errorHandler';
import LoginForm from './components/LoginForm';
import ShoppingListDetail from './components/ShoppingListDetailAPI';

// Shopping List Entry Component
const ShoppingListEntry = ({ list, onDelete, onSelect, onArchive }) => {
    const remainingCount = list.items?.filter(item => !item.done).length || 0;
    const totalCount = list.items?.length || 0;
    const progressPercentage = totalCount > 0 ? ((totalCount - remainingCount) / totalCount) * 100 : 0;
    
    return (
        <div 
            className={`group relative flex flex-col p-6 rounded-2xl mb-4 cursor-pointer transition-all duration-300 overflow-hidden ${
                list.isArchived 
                    ? 'bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 border border-gray-200 shadow-sm hover:shadow-md' 
                    : 'bg-white border border-gray-200 shadow-md hover:shadow-xl hover:-translate-y-1'
            }`} 
            onClick={() => onSelect(list._id || list.listId)}
        >
            <div className={`absolute top-0 left-0 right-0 h-1 ${
                list.isArchived ? 'bg-gray-400' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500'
            }`} />
            
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-xl font-bold truncate transition-colors ${
                            list.isArchived ? 'text-gray-600' : 'text-gray-900 group-hover:text-indigo-600'
                        }`}>
                            {list.name}
                        </h3>
                        {list.isArchived && (
                            <span className="text-xs font-semibold text-gray-700 bg-gray-200 px-3 py-1 rounded-full flex-shrink-0 uppercase tracking-wide">
                                Archiv
                            </span>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                                remainingCount > 0 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'
                            }`} />
                            <span className={`text-sm font-medium ${
                                list.isArchived ? 'text-gray-500' : 'text-gray-600'
                            }`}>
                                {remainingCount} {remainingCount === 1 ? 'položka zbývá' : remainingCount < 5 ? 'položky zbývají' : 'položek zbývá'}
                            </span>
                        </div>
                        {totalCount > 0 && (
                            <span className="text-xs text-gray-400">
                                {totalCount - remainingCount} / {totalCount} dokončeno
                            </span>
                        )}
                    </div>
                    
                    {totalCount > 0 && !list.isArchived && (
                        <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 rounded-full"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    )}
                </div>
                
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onArchive(list._id || list.listId);
                        }}
                        className={`px-3 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 ${
                            list.isArchived 
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:text-emerald-800 active:scale-95' 
                                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 hover:text-indigo-800 active:scale-95'
                        }`}
                        aria-label={list.isArchived ? "Obnovit seznam" : "Archivovat seznam"}
                        title={list.isArchived ? "Obnovit seznam" : "Archivovat seznam"}
                    >
                        {list.isArchived ? <RotateCcw size={18} /> : <Archive size={18} />}
                        <span className="text-sm font-semibold hidden sm:inline">
                            {list.isArchived ? 'Obnovit' : 'Archivovat'}
                        </span>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(list._id || list.listId);
                        }}
                        className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-xl transition-all duration-200 active:scale-95"
                        aria-label="Smazat seznam"
                        title="Smazat seznam"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Shopping List Overview Component
const ShoppingListOverview = ({ shoppingLists, addList, deleteList, navigateToDetail, archiveList, onLogout }) => {
    const [newListInput, setNewListInput] = useState('');
    const [filter, setFilter] = useState('active');

    const handleAddList = (e) => {
        e.preventDefault();
        addList(newListInput);
        setNewListInput('');
    };

    const filteredLists = shoppingLists.filter(list => {
        const isArchived = list.isArchived || false;
        return filter === 'active' ? !isArchived : isArchived;
    });

    const activeCount = shoppingLists.filter(list => !(list.isArchived || false)).length;
    const archivedCount = shoppingLists.filter(list => list.isArchived || false).length;

    return (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                                        <List size={24} className="text-white" />
                                    </div>
                                    Nákupní Seznamy
                                </h1>
                                <p className="text-gray-500 ml-16">
                                    {filter === 'active' 
                                        ? `${activeCount} ${activeCount === 1 ? 'aktivní seznam' : activeCount < 5 ? 'aktivní seznamy' : 'aktivních seznamů'}`
                                        : `${archivedCount} ${archivedCount === 1 ? 'archivovaný seznam' : archivedCount < 5 ? 'archivované seznamy' : 'archivovaných seznamů'}`
                                    }
                                </p>
                            </div>
                            <button
                                onClick={onLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                                title="Odhlásit se"
                            >
                                <LogOut size={18} />
                                <span className="hidden sm:inline">Odhlásit</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="inline-flex gap-2 p-1.5 bg-gray-100 rounded-2xl shadow-inner">
                    <button
                        onClick={() => setFilter('active')}
                        className={`px-6 py-3 rounded-xl font-semibold flex items-center justify-center transition-all duration-300 ${
                            filter === 'active' 
                                ? 'bg-white text-indigo-600 shadow-md scale-105' 
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        <FolderOpen size={18} className="mr-2" /> Aktivní
                    </button>
                    <button
                        onClick={() => setFilter('archived')}
                        className={`px-6 py-3 rounded-xl font-semibold flex items-center justify-center transition-all duration-300 ${
                            filter === 'archived' 
                                ? 'bg-white text-indigo-600 shadow-md scale-105' 
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        <Archive size={18} className="mr-2" /> Archivované
                    </button>
                </div>
            </div>

            {/* Create New List Form */}
            <form onSubmit={handleAddList} className="mb-8 bg-white p-2 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center">
                    <input
                        type="text"
                        value={newListInput}
                        onChange={(e) => setNewListInput(e.target.value)}
                        placeholder="Vytvořit nový seznam..."
                        className="flex-1 px-5 py-4 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400 text-lg font-medium"
                        required
                    />
                    <button
                        type="submit"
                        className="ml-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 font-semibold"
                        disabled={!newListInput.trim()}
                        aria-label="Přidat seznam"
                    >
                        <Plus size={22} className="mr-2" /> Vytvořit
                    </button>
                </div>
            </form>

            {/* Lists Grid */}
            <div className="space-y-4">
                {filteredLists.length > 0 ? (
                    filteredLists.map((list, index) => (
                        <div 
                            key={list._id || list.listId}
                            style={{ animationDelay: `${index * 50}ms` }}
                            className="animate-fade-in"
                        >
                            <ShoppingListEntry
                                list={list}
                                onDelete={deleteList}
                                onSelect={navigateToDetail}
                                onArchive={archiveList}
                            />
                        </div>
                    ))
                ) : (
                    <div className="text-center p-16 bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-200">
                        <div className="mb-6">
                            {filter === 'active' ? (
                                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto">
                                    <FolderOpen size={40} className="text-indigo-500" />
                                </div>
                            ) : (
                                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto">
                                    <Archive size={40} className="text-gray-500" />
                                </div>
                            )}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            {filter === 'active' 
                                ? 'Žádné aktivní seznamy'
                                : 'Archiv je prázdný'
                            }
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {filter === 'active' 
                                ? 'Začněte vytvořením vašeho prvního nákupního seznamu.'
                                : 'Archivované seznamy se zobrazí zde.'
                            }
                        </p>
                        {filter === 'active' && (
                            <button
                                onClick={() => document.querySelector('input[type="text"]')?.focus()}
                                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold shadow-md"
                            >
                                <Plus size={20} className="mr-2" /> Vytvořit první seznam
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Main App Component
const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [shoppingLists, setShoppingLists] = useState([]);
    const [currentPage, setCurrentPage] = useState('list');
    const [selectedListId, setSelectedListId] = useState(null);
    const [error, setError] = useState('');

    // Check if user is already logged in
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const userId = getUserId();
        if (token && userId) {
            setIsAuthenticated(true);
            loadLists();
        } else {
            setIsLoading(false);
        }
    }, []);

    // Load lists periodically when authenticated
    useEffect(() => {
        if (!isAuthenticated) return;

        const loadLists = async () => {
            try {
                const lists = await listService.getLists();
                setShoppingLists(lists);
        } catch (err) {
            setError(handleApiError(err, 'Nepodařilo se načíst seznamy.'));
        }
        };

        loadLists();
        const interval = setInterval(loadLists, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    const loadLists = async () => {
        try {
            const lists = await listService.getLists();
            setShoppingLists(lists);
        } catch (err) {
            console.error('Error loading lists:', err);
            setError('Nepodařilo se načíst seznamy.');
        }
    };

    const handleLogin = async (email, password) => {
        try {
            const response = await authService.login(email, password);
            setAuthToken(response.token);
            setUserId(response.userId);
            setIsAuthenticated(true);
            await loadLists();
        } catch (err) {
            throw err;
        }
    };

    const handleRegister = async (email, password, name) => {
        try {
            await authService.register(email, password, name);
            // After registration, automatically login
            const loginResponse = await authService.login(email, password);
            setAuthToken(loginResponse.token);
            setUserId(loginResponse.userId);
            setIsAuthenticated(true);
            await loadLists();
        } catch (err) {
            throw err;
        }
    };

    const handleLogout = () => {
        clearAuth();
        setIsAuthenticated(false);
        setShoppingLists([]);
        setCurrentPage('list');
        setSelectedListId(null);
    };

    const navigateToDetail = useCallback((listId) => {
        setSelectedListId(listId);
        setCurrentPage('detail');
    }, []);

    const navigateToList = useCallback(() => {
        setSelectedListId(null);
        setCurrentPage('list');
    }, []);

    const addList = async (listName) => {
        if (!listName.trim()) return;

        try {
            await listService.createList({
                name: listName.trim(),
                items: []
            });
            await loadLists();
        } catch (err) {
            setError(handleApiError(err, 'Nepodařilo se přidat nový seznam.'));
        }
    };

    const deleteList = async (listId) => {
        try {
            await listService.deleteList(listId);
            await loadLists();
            if (selectedListId === listId) {
                navigateToList();
            }
        } catch (err) {
            setError(handleApiError(err, 'Nepodařilo se smazat seznam.'));
        }
    };

    const archiveList = async (listId) => {
        try {
            const list = shoppingLists.find(l => (l._id || l.listId) === listId);
            const newArchiveStatus = !(list?.isArchived || false);
            await listService.updateList(listId, { isArchived: newArchiveStatus });
            await loadLists();
        } catch (err) {
            setError(handleApiError(err, 'Nepodařilo se archivovat seznam.'));
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
                    <Loader2 className="animate-spin text-white" size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Připravuji aplikaci...</h2>
                <p className="text-gray-500">Načítám vaše nákupní seznamy</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <LoginForm 
                onLogin={handleLogin} 
                onRegister={handleRegister}
                isLoading={false}
            />
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-4">
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-red-100 max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">⚠️</span>
                    </div>
                    <h2 className="text-2xl font-bold text-red-600 mb-3">Došlo k chybě</h2>
                    <p className="text-red-500 mb-6">{error}</p>
                    <button
                        onClick={() => setError('')}
                        className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold shadow-md"
                    >
                        Zavřít
                    </button>
                </div>
            </div>
        );
    }

    let content;
    switch (currentPage) {
        case 'detail':
            content = (
                <ShoppingListDetail 
                    listId={selectedListId} 
                    onBack={navigateToList} 
                    archiveList={archiveList}
                    refreshLists={loadLists}
                />
            );
            break;
        case 'list':
        default:
            content = (
                <ShoppingListOverview
                    shoppingLists={shoppingLists}
                    addList={addList}
                    deleteList={deleteList}
                    navigateToDetail={navigateToDetail}
                    archiveList={archiveList}
                    onLogout={handleLogout}
                />
            );
            break;
    }

    return (
        <div className="min-h-screen font-sans bg-gradient-to-br from-gray-50 to-gray-100">
            {USE_MOCK_DATA && (
                <div className="bg-yellow-100 border-b border-yellow-400 text-yellow-800 text-center py-2 text-sm font-medium">
                    ⚠️ Režim mock dat - pro reálná data nastavte REACT_APP_USE_MOCK=false
                </div>
            )}
            <div className="pt-8 pb-16">
                {content}
            </div>
        </div>
    );
};

export default App;

