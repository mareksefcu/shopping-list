import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ListDetailRoute from './components/ListDetailRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/list/:listId" element={<ListDetailRoute />} />
        <Route path="*" element={<h1>Přejděte na /list/aBc123</h1>} /> {/* Pro snazší testování */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
