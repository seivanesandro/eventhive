import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Importar páginas principais
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EventsPage from "./pages/EventsPage";
import EventDetailPage from "./pages/EventDetailPage";
import CartPage from "./pages/CartPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import NotFoundPage from "./pages/NotFoundPage";

// Importar componentes de layout
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Importar Providers de contexto
import { AuthProvider } from "./context/AuthProvider";
import { CartProvider } from "./context/CartProvider";

function App() {
  //  Componente principal da aplicação. Define o routing e envolve com Providers globais.
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <main className="container main-hero py-4" style={{ flex: "1" }}>
            <Routes>
              {/* Rotas principais da aplicação */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/event/:id" element={<EventDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
