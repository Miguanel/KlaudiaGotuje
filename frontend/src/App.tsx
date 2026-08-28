import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import RecipeDetail from './pages/RecipeDetail';
import About from './pages/About'; // <-- IMPORT NOWEJ STRONY

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="przepis/:id" element={<RecipeDetail />} />
          <Route path="o-mnie" element={<About />} /> {/* <-- NOWA ŚCIEŻKA */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;