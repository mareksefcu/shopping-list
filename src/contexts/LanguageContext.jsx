// src/contexts/LanguageContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

const translations = {
    cs: {
        // Navigation
        'backToOverview': 'Zpět na přehled',
        'logout': 'Odhlásit',
        'lightMode': 'Světlý',
        'darkMode': 'Tmavý',
        'active': 'Aktivní',
        'archived': 'Archivované',

        // Lists
        'shoppingLists': 'Nákupní Seznamy',
        'activeLists': 'aktivní seznam|aktivní seznamy|aktivních seznamů',
        'archivedLists': 'archivovaný seznam|archivované seznamy|archivovaných seznamů',
        'createNewList': 'Vytvořit nový seznam',
        'create': 'Vytvořit',
        'createFirstList': 'Vytvořit první seznam',
        'noActiveLists': 'Žádné aktivní seznamy',
        'archiveEmpty': 'Archiv je prázdný',
        'startWithList': 'Začněte vytvořením vašeho prvního nákupního seznamu.',
        'archivedListsWillShow': 'Archivované seznamy se zobrazí zde.',

        // List details
        'loadingList': 'Načítám detaily seznamu...',
        'itemsRemaining': 'položka zbývá|položky zbývají|položek zbývá',
        'items': 'položka|položky|položek',
        'completed': 'dokončeno',
        'progress': 'Průběh',
        'addNewItem': 'Přidat novou položku...',
        'add': 'Přidat',
        'itemStatus': 'Stav položek',
        'listEmpty': 'Seznam je prázdný',
        'addFirstItem': 'Přidejte první položku výše a začněte nakupovat!',
        'archive': 'Archivovat',
        'restore': 'Obnovit z archivu',

        // Login
        'login': 'Přihlásit se',
        'register': 'Registrovat se',
        'email': 'Email',
        'password': 'Heslo',
        'loginButton': 'Přihlásit',
        'registerButton': 'Registrovat',
        'switchToLogin': 'Již máte účet? Přihlaste se',
        'switchToRegister': 'Nemáte účet? Registrujte se',
        'loginTitle': 'Vítejte zpět',
        'registerTitle': 'Vytvořte si účet',

        // Charts
        'itemsPerList': 'Položky v seznamech',
        'overallStatus': 'Celkový stav',
        'completedItems': 'Dokončeno',
        'remainingItems': 'Zbývá',

        // Mock data warning
        'mockDataWarning': 'Režim mock dat - pro reálná data nastavte REACT_APP_USE_MOCK=false',

        // Errors
        'loadListsError': 'Nepodařilo se načíst seznamy.',
        'addListError': 'Nepodařilo se přidat nový seznam.',
        'loadListError': 'Nepodařilo se načíst seznam.',
        'addItemError': 'Nepodařilo se přidat položku.',
        'updateItemError': 'Nepodařilo se aktualizovat položku.',
        'deleteItemError': 'Nepodařilo se smazat položku.',
        'archiveError': 'Nepodařilo se archivovat seznam.'
    },
    en: {
        // Navigation
        'backToOverview': 'Back to overview',
        'logout': 'Logout',
        'lightMode': 'Light',
        'darkMode': 'Dark',
        'active': 'Active',
        'archived': 'Archived',

        // Lists
        'shoppingLists': 'Shopping Lists',
        'activeLists': 'active list|active lists|active lists',
        'archivedLists': 'archived list|archived lists|archived lists',
        'createNewList': 'Create new list',
        'create': 'Create',
        'createFirstList': 'Create first list',
        'noActiveLists': 'No active lists',
        'archiveEmpty': 'Archive is empty',
        'startWithList': 'Start by creating your first shopping list.',
        'archivedListsWillShow': 'Archived lists will appear here.',

        // List details
        'loadingList': 'Loading list details...',
        'itemsRemaining': 'item remaining|items remaining|items remaining',
        'items': 'item|items|items',
        'completed': 'completed',
        'progress': 'Progress',
        'addNewItem': 'Add new item...',
        'add': 'Add',
        'itemStatus': 'Item Status',
        'listEmpty': 'List is empty',
        'addFirstItem': 'Add your first item above and start shopping!',
        'archive': 'Archive',
        'restore': 'Restore from archive',

        // Login
        'login': 'Login',
        'register': 'Register',
        'email': 'Email',
        'password': 'Password',
        'loginButton': 'Login',
        'registerButton': 'Register',
        'switchToLogin': 'Already have an account? Login',
        'switchToRegister': "Don't have an account? Register",
        'loginTitle': 'Welcome back',
        'registerTitle': 'Create an account',

        // Charts
        'itemsPerList': 'Items per list',
        'overallStatus': 'Overall status',
        'completedItems': 'Completed',
        'remainingItems': 'Remaining',

        // Mock data warning
        'mockDataWarning': 'Mock data mode - set REACT_APP_USE_MOCK=false for real data',

        // Errors
        'loadListsError': 'Failed to load lists.',
        'addListError': 'Failed to add new list.',
        'loadListError': 'Failed to load list.',
        'addItemError': 'Failed to add item.',
        'updateItemError': 'Failed to update item.',
        'deleteItemError': 'Failed to delete item.',
        'archiveError': 'Failed to archive list.'
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('cs');

    // Load language from localStorage on mount
    useEffect(() => {
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage && translations[savedLanguage]) {
            setLanguage(savedLanguage);
        }
    }, []);

    // Save language to localStorage
    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const t = (key, ...args) => {
        const translation = translations[language][key] || key;

        // Handle pluralization for Czech
        if (language === 'cs' && args.length > 0) {
            const count = args[0];
            const parts = translation.split('|');
            if (parts.length === 3) {
                if (count === 1) return parts[0];
                if (count >= 2 && count <= 4) return parts[1];
                return parts[2];
            }
        }

        return translation;
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'cs' ? 'en' : 'cs');
    };

    return (
        <LanguageContext.Provider value={{ language, t, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};