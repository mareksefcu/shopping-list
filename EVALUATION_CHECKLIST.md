# Evaluation Checklist - Frontend Homework

## ✅ 1. Implementované serverového volání (3 body)

### Načítání dat (GET)
- ✅ `listService.getLists()` - načítání všech seznamů
- ✅ `listService.getList(listId)` - načítání jednoho seznamu
- ✅ Implementováno v `src/services/apiService.js`

### Přidávání dat (POST)
- ✅ `listService.createList()` - vytvoření nového seznamu
- ✅ Přidávání položek do seznamu (updateList s novými items)
- ✅ `authService.register()` - registrace uživatele
- ✅ Implementováno v `src/services/apiService.js`

### Úprava dat (PUT/PATCH)
- ✅ `listService.updateList()` - úprava seznamu
- ✅ `listService.updateListItem()` - úprava položky v seznamu
- ✅ Implementováno v `src/services/apiService.js`

### Mazání dat (DELETE)
- ✅ `listService.deleteList()` - smazání seznamu
- ✅ Mazání položek z seznamu (updateList s upravenými items)
- ✅ Implementováno v `src/services/apiService.js`

**Status: ✅ KOMPLETNÍ (3/3 body)**

---

## ✅ 2. Dekompozice komponent (5 bodů)

### a) Vhodně použity vizuální vs. nevizuální komponenty

**Vizuální komponenty (UI):**
- ✅ `src/components/LoginForm.jsx` - vizuální komponenta pro přihlášení
- ✅ `src/components/ShoppingListDetailAPI.jsx` - vizuální komponenta pro detail seznamu
- ✅ `src/AppAPI.jsx` - obsahuje vizuální komponenty (ShoppingListEntry, ShoppingListOverview)
- ✅ Všechny komponenty renderují UI a používají React hooks

**Nevizuální komponenty (logika, služby):**
- ✅ `src/services/apiService.js` - služba pro API volání (nevizuální)
- ✅ `src/services/mockData.js` - mock data služba (nevizuální)
- ✅ `src/config/api.js` - konfigurace a utility funkce (nevizuální)
- ✅ `src/utils/errorHandler.js` - utility pro zpracování chyb (nevizuální)
- ✅ `src/hooks/useApiState.js` - custom hook pro správu stavů (nevizuální)

**Status: ✅ KOMPLETNÍ**

### b) Řádná práce s chybami v rámci serverového volání

- ✅ `src/utils/errorHandler.js` - centralizované zpracování chyb
- ✅ `handleApiError()` - formátuje chybové zprávy
- ✅ Try-catch bloky ve všech API voláních
- ✅ Zobrazení chybových zpráv v UI komponentách
- ✅ Error stavy v komponentách (ShoppingListDetailAPI, AppAPI, LoginForm)
- ✅ Zpracování různých typů chyb (network, auth, validation)

**Status: ✅ KOMPLETNÍ**

### c) Při načítání ošetřeny stavy (pending, error, ready)

**Pending (načítání) stavy:**
- ✅ `isLoading` v `AppAPI.jsx` - zobrazení loading screenu
- ✅ `isListLoading` v `ShoppingListDetailAPI.jsx` - zobrazení loading stavu
- ✅ `isLoading` v `LoginForm.jsx` - zobrazení loading při přihlášení
- ✅ Loading indikátory s animacemi (Loader2 komponenta)

**Error stavy:**
- ✅ `error` state v `AppAPI.jsx` - zobrazení error screenu
- ✅ `error` state v `ShoppingListDetailAPI.jsx` - zobrazení error zprávy
- ✅ `error` state v `LoginForm.jsx` - zobrazení error zprávy
- ✅ Error handling v `useApiState` hooku

**Ready (připraveno) stavy:**
- ✅ `isReady` v `useApiState` hooku
- ✅ Zobrazení dat po úspěšném načtení
- ✅ Automatické refresh dat každých 5 sekund
- ✅ Správné přepínání mezi stavy

**Status: ✅ KOMPLETNÍ**

**Celkem za dekompozici: ✅ KOMPLETNÍ (5/5 bodů)**

---

## ✅ 3. Aplikace je odevzdána se zapnutým mockováním serverových volání (1 bod)

- ✅ `src/config/api.js` - `USE_MOCK_DATA` defaultně `true`
- ✅ Mock data jsou aktivní, pokud není explicitně nastaveno `REACT_APP_USE_MOCK=false`
- ✅ Indikátor mock režimu zobrazen v UI (žlutý banner)
- ✅ Mock služby implementovány v `src/services/mockData.js`

**Status: ✅ KOMPLETNÍ (1/1 bod)**

---

## ✅ 4. Součástí odevzdání jsou mock data (1 bod)

- ✅ `src/services/mockData.js` - kompletní mock data implementace
- ✅ Mock uživatelé (jan@example.com, petra@example.com)
- ✅ Mock shopping listy s položkami
- ✅ Simulace network delay
- ✅ Mock služby pro auth a list operace

**Status: ✅ KOMPLETNÍ (1/1 bod)**

---

## 📊 Celkové hodnocení

| Kritérium | Body | Status |
|-----------|------|--------|
| Serverová volání (CRUD) | 3 | ✅ |
| Dekompozice komponent | 5 | ✅ |
| Mockování zapnuto | 1 | ✅ |
| Mock data součástí | 1 | ✅ |
| **CELKEM** | **10** | ✅ |

**Status: ✅ VŠECHNA KRITÉRIA SPLNĚNA (10/10 bodů)**

---

## 📁 Struktura souborů

```
src/
├── config/
│   └── api.js                    # Konfigurace API (nevizuální)
├── services/
│   ├── apiService.js             # API služba (nevizuální)
│   └── mockData.js               # Mock data (nevizuální)
├── utils/
│   └── errorHandler.js          # Error handling (nevizuální)
├── hooks/
│   └── useApiState.js            # State management hook (nevizuální)
├── components/
│   ├── LoginForm.jsx             # Vizuální komponenta
│   └── ShoppingListDetailAPI.jsx # Vizuální komponenta
└── AppAPI.jsx                    # Hlavní aplikace (vizuální)
```

---

## 🎯 Poznámky

- Všechny požadavky jsou splněny
- Mock data jsou aktivní ve výchozím nastavení
- Komponenty jsou správně rozděleny na vizuální a nevizuální
- Error handling je implementován konzistentně
- Loading stavy jsou ošetřeny ve všech komponentách
- Aplikace je připravena k odevzdání


