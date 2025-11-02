import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ListDetailRoute from './components/ListDetailRoute'; // Cesta se může lišit

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Zobrazí se při zadání adresy /list/cokoliv, např. /list/aBc123 */}
        <Route path="/list/:listId" element={<ListDetailRoute />} /> 
        
        {/* Přesměrování nebo úvodní stránka pro snadné testování */}
        <Route path="/" element={
          <div style={{padding: '50px'}}>
            <h1>Vítejte!</h1>
            <p>Pro zobrazení detailu seznamu zadejte do adresního řádku: 
            <a href="/list/aBc123"> /list/aBc123 </a></p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;