import { useState, useEffect } from "react";
import CartContext from "./CartContext";

// Provider do carrinho de compras. Gera e fornece o estado do carrinho a toda a aplicação.

const CartProvider = ({ children }) => {
  // Estado do carrinho: inicializa a partir do localStorage
  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  // Guardar carrinho no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Adicionar item ao carrinho
  const addToCart = (item) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === item.id);
      if (existing) {
        return prevCart.map((i) =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i,
        );
      }
      return [...prevCart, { ...item, quantity: item.quantity || 1 }];
    });
  };

  // Remover item do carrinho por id
  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  // Limpar carrinho
  const clearCart = () => {
    setCart([]);
  };

  // Calcular total do carrinho
  const getCartTotal = () => {
    return cart
      .reduce(
        (total, item) => total + Number(item.price) * (item.quantity || 1),
        0,
      )
      .toFixed(2);
  };

  // Obter número total de itens no carrinho
  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  // Valor do contexto
  const value = {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export { CartProvider };
