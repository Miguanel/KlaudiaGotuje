import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import RecipeDetail from './pages/RecipeDetail';
import Favorites from './pages/Favorites';
import ShoppingList from './pages/ShoppingList';
import Login from './pages/Login'; // <-- IMPORT STRONY LOGOWANIA
import About from './pages/About';
import AddRecipe from './pages/AddRecipe';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="przepis/:id" element={<RecipeDetail />} />
          <Route path="ulubione" element={<Favorites />} />
          <Route path="zakupy" element={<ShoppingList />} />
          <Route path="login" element={<Login />} />
          <Route path="dodaj-przepis" element={<AddRecipe />} />
          <Route path="o-mnie" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;