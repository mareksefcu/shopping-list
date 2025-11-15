import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, collection, query, addDoc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Plus, Trash2, CheckCircle2, ArrowLeft, Loader2, List, ClipboardList, Archive, RotateCcw, FolderOpen } from 'lucide-react';

// --- Nastavení Firestore a cesty ---
// Tyto globální proměnné musí být dostupné v tomto prostředí
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-shopping-list-app';

// Pomocné funkce pro Firestore cesty
const getShoppingListsCollectionPath = (userId) => `/artifacts/${appId}/users/${userId}/shoppingLists`;
const getShoppingListDocumentPath = (userId, listId) => `/artifacts/${appId}/users/${userId}/shoppingLists/${listId}`;


// =================================================================
// DÍLČÍ KOMPONENTY (DEFINOVANÉ NA NEJVYŠŠÍ ÚROVNI)
// =================================================================

// Pomocná komponenta pro zobrazení jednoho seznamu
const ShoppingListEntry = ({ list, onDelete, onSelect, onArchive }) => {
    const remainingCount = list.items.filter(item => !item.purchased).length;
    const totalCount = list.items.length;
    const progressPercentage = totalCount > 0 ? ((totalCount - remainingCount) / totalCount) * 100 : 0;
    
    return (
        <div 
            className={`group relative flex flex-col p-6 rounded-2xl mb-4 cursor-pointer transition-all duration-300 overflow-hidden ${
                list.isArchived 
                    ? 'bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 border border-gray-200 shadow-sm hover:shadow-md' 
                    : 'bg-white border border-gray-200 shadow-md hover:shadow-xl hover:-translate-y-1'
            }`} 
            onClick={() => onSelect(list.id)}
        >
            {/* Accent border */}
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
                    
                    {/* Progress bar */}
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
                            onArchive(list.id);
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
                            onDelete(list.id);
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


// 1. KOMPONENTA PŘEHLEDU SEZNAMŮ
const ShoppingListOverview = ({ userId, shoppingLists, addList, deleteList, navigateToDetail, archiveList }) => {
    // Hooky jsou volány na nejvyšší úrovni komponenty
    const [newListInput, setNewListInput] = useState('');
    const [filter, setFilter] = useState('active'); // 'active' nebo 'archived'

    const handleAddList = (e) => {
        e.preventDefault();
        addList(newListInput);
        setNewListInput('');
    };

    // Filtrování seznamů podle stavu archivace
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
                </div>

                {/* Filtry pro aktivní/archivované seznamy */}
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
                            key={list.id}
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


// 2. KOMPONENTA DETAILU SEZNAMU
const ShoppingListDetail = ({ db, userId, listId, onBack, archiveList }) => {
    // Hooky jsou volány na nejvyšší úrovni komponenty, bez podmínek
    const [listData, setListData] = useState(null);
    const [newItemName, setNewItemName] = useState('');
    const [isListLoading, setIsListLoading] = useState(true);

    const listRef = useMemo(() => {
        // useMemo je hook, který se volá vždy. Jeho výpočet je podmíněný, ne volání.
        if (!db || !userId || !listId) return null;
        return doc(db, getShoppingListDocumentPath(userId, listId));
    }, [db, userId, listId]);

    // Načítání detailu seznamu v reálném čase
    useEffect(() => {
        if (!listRef) {
            setIsListLoading(false);
            return;
        }

        setIsListLoading(true);
        const unsubscribe = onSnapshot(listRef, (docSnap) => {
            if (docSnap.exists()) {
                setListData({ id: docSnap.id, ...docSnap.data() });
            } else {
                console.error('Seznam nebyl nalezen.');
                onBack(); // Návrat, pokud seznam zmizel
            }
            setIsListLoading(false);
        }, (e) => {
            console.error('Chyba při načítání detailu seznamu:', e);
            setIsListLoading(false);
        });

        return () => unsubscribe();
    }, [listRef, onBack]);


    const addItem = async () => {
        if (!listRef || !newItemName.trim() || !listData) return;
        const newItem = {
            id: Date.now().toString(),
            name: newItemName.trim(),
            purchased: false,
            timestamp: serverTimestamp()
        };
        try {
            await updateDoc(listRef, {
                items: [...listData.items, newItem]
            });
            setNewItemName('');
        } catch (e) {
            console.error('Chyba při přidávání položky:', e);
        }
    };

    const toggleItemPurchased = async (itemId) => {
        if (!listRef || !listData) return;

        const updatedItems = listData.items.map(item =>
            item.id === itemId ? { ...item, purchased: !item.purchased } : item
        );

        try {
            await updateDoc(listRef, { items: updatedItems });
        } catch (e) {
            console.error('Chyba při aktualizaci položky:', e);
        }
    };

    const deleteItem = async (itemId) => {
        if (!listRef || !listData) return;

        const updatedItems = listData.items.filter(item => item.id !== itemId);

        try {
            await updateDoc(listRef, { items: updatedItems });
        } catch (e) {
            console.error('Chyba při mazání položky:', e);
        }
    };

    const handleArchiveToggle = async () => {
        if (!listRef || !listData) return;
        const newArchiveStatus = !(listData.isArchived || false);
        
        try {
            await updateDoc(listRef, {
                isArchived: newArchiveStatus
            });
        } catch (e) {
            console.error('Chyba při archivaci seznamu:', e);
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
        // Seřadit nekoupené před koupené
        if (a.purchased !== b.purchased) {
            return a.purchased ? 1 : -1;
        }
        return (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0);
    });


    const purchasedCount = sortedItems.filter(item => item.purchased).length;
    const totalItems = sortedItems.length;
    const completionPercentage = totalItems > 0 ? (purchasedCount / totalItems) * 100 : 0;
    const isArchived = listData.isArchived || false;

    return (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back Button and Archive Button */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={onBack}
                    className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors font-medium group"
                >
                    <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Zpět na přehled
                </button>
                
                {/* Archive/Unarchive Button */}
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
                                key={item.id} 
                                className={`flex items-center justify-between px-6 py-4 transition-all duration-200 ${
                                    item.purchased 
                                        ? 'bg-gradient-to-r from-emerald-50 to-green-50' 
                                        : 'hover:bg-gray-50'
                                }`}
                                style={{ animationDelay: `${index * 30}ms` }}
                            >
                                <div
                                    className="flex items-center flex-1 cursor-pointer group"
                                    onClick={() => toggleItemPurchased(item.id)}
                                >
                                    <button
                                        className={`w-7 h-7 rounded-xl border-2 mr-4 flex items-center justify-center transition-all duration-200 ${
                                            item.purchased
                                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                                                : 'border-gray-300 text-transparent hover:border-indigo-400 hover:bg-indigo-50 group-hover:scale-110'
                                        }`}
                                        aria-label={item.purchased ? "Odznačit jako koupené" : "Označit jako koupené"}
                                    >
                                        {item.purchased && <CheckCircle2 size={18} />}
                                    </button>
                                    <span className={`text-lg font-medium transition-all ${
                                        item.purchased 
                                            ? 'line-through text-gray-400' 
                                            : 'text-gray-900 group-hover:text-indigo-600'
                                    }`}>
                                        {item.name}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteItem(item.id);
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


// =================================================================
// 3. HLAVNÍ KOMPONENTA APP
// =================================================================

const App = () => {
    // Všechny hooky zde na nejvyšší úrovni
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [shoppingLists, setShoppingLists] = useState([]);
    const [currentPage, setCurrentPage] = useState('list');
    const [selectedListId, setSelectedListId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // 1. Inicializace Firebase a autentizace
    useEffect(() => {
        try {
            const app = initializeApp(firebaseConfig);
            const firestore = getFirestore(app);
            const authInstance = getAuth(app);

            setDb(firestore);
            setAuth(authInstance);

            const unsubscribeAuth = onAuthStateChanged(authInstance, async (user) => {
                if (user) {
                    setUserId(user.uid);
                } else {
                    if (typeof __initial_auth_token === 'undefined') {
                        const anonUser = await signInAnonymously(authInstance);
                        setUserId(anonUser.user.uid);
                    }
                }
                setIsAuthReady(true);
                setIsLoading(false);
            });

            if (typeof __initial_auth_token !== 'undefined') {
                signInWithCustomToken(authInstance, __initial_auth_token).catch(e => {
                    console.error("Chyba při přihlašování vlastním tokenem:", e);
                    setError("Chyba při přihlašování.");
                    setIsAuthReady(true);
                    setIsLoading(false);
                });
            }

            return () => unsubscribeAuth();
        } catch (e) {
            console.error('Chyba při inicializaci Firebase:', e);
            setError('Nepodařilo se inicializovat databázi.');
            setIsLoading(false);
        }
    }, []);


    // 2. Načítání seznamů z Firestore v reálném čase
    useEffect(() => {
        if (!isAuthReady || !db || !userId) return;

        const listsRef = collection(db, getShoppingListsCollectionPath(userId));
        const q = query(listsRef); 

        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
            const listsData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    isArchived: data.isArchived || false // Zajištění, že isArchived má výchozí hodnotu
                };
            });
            listsData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
            setShoppingLists(listsData);
        }, (e) => {
            console.error('Chyba při načítání seznamů:', e);
            setError('Chyba při načítání nákupních seznamů.');
        });

        return () => unsubscribeSnapshot();
    }, [db, userId, isAuthReady]);
    
    // Funkce pro navigaci
    const navigateToDetail = useCallback((listId) => {
        setSelectedListId(listId);
        setCurrentPage('detail');
    }, []);

    const navigateToList = useCallback(() => {
        setSelectedListId(null);
        setCurrentPage('list');
    }, []);

    // --- CRUD Operace ---

    const addList = async (listName) => {
        if (!db || !userId) {
            setError('Aplikace není připravena. Zkuste to prosím znovu.');
            return;
        }
        if (!listName.trim()) return;

        try {
            const listsRef = collection(db, getShoppingListsCollectionPath(userId));
            await addDoc(listsRef, {
                name: listName.trim(),
                items: [],
                isArchived: false,
                createdAt: serverTimestamp(),
            });
        } catch (e) {
            console.error('Chyba při přidávání seznamu:', e);
            setError('Nepodařilo se přidat nový seznam.');
        }
    };

    const deleteList = async (listId) => {
        if (!db || !userId) return;
        try {
            const listRef = doc(db, getShoppingListDocumentPath(userId, listId));
            await deleteDoc(listRef);
        } catch (e) {
            console.error('Chyba při mazání seznamu:', e);
            setError('Nepodařilo se smazat seznam.');
        }
    };

    const archiveList = async (listId) => {
        if (!db || !userId) return;
        try {
            const listRef = doc(db, getShoppingListDocumentPath(userId, listId));
            // Najdeme aktuální stav seznamu
            const currentList = shoppingLists.find(list => list.id === listId);
            const newArchiveStatus = !(currentList?.isArchived || false);
            
            await updateDoc(listRef, {
                isArchived: newArchiveStatus
            });
        } catch (e) {
            console.error('Chyba při archivaci seznamu:', e);
            setError('Nepodařilo se archivovat seznam.');
        }
    };


    // --- Renderování Hlavní Aplikace ---

    if (isLoading || !isAuthReady) {
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
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold shadow-md"
                    >
                        Obnovit stránku
                    </button>
                </div>
            </div>
        );
    }
    
    // Podmíněné vykreslování
    let content;
    switch (currentPage) {
        case 'detail':
            // Předání Firebase instancí do podřízené komponenty
            content = <ShoppingListDetail db={db} userId={userId} listId={selectedListId} onBack={navigateToList} archiveList={archiveList} />;
            break;
        case 'list':
        default:
            // Předání dat a funkcí do podřízené komponenty
            content = (
                <ShoppingListOverview
                    userId={userId}
                    shoppingLists={shoppingLists}
                    addList={addList}
                    deleteList={deleteList}
                    navigateToDetail={navigateToDetail}
                    archiveList={archiveList}
                />
            );
            break;
    }

    return (
        <div className="min-h-screen font-sans">
            <div className="pt-8 pb-16">
                {content}
            </div>
        </div>
    );
};

export default App;