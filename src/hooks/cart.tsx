import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cart = await AsyncStorage.getItem('@GoMarketPlace:cart');

      if (cart) {
        setProducts(JSON.parse(cart) as Product[]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      product.quantity = 1;
      const newCart: Product[] = [...products, product];

      await AsyncStorage.setItem(
        '@GoMarketPlace:cart',
        JSON.stringify(newCart),
      );

      setProducts(newCart);
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productsIncrementIndex = products.findIndex(
        product => product.id === id,
      );
      const newProducts = products;

      newProducts[productsIncrementIndex].quantity += 1;

      setProducts([...newProducts]);

      await AsyncStorage.setItem(
        '@GoMarketPlace:cart',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productsIncrementIndex = products.findIndex(
        product => product.id === id,
      );
      const newProducts = products;

      newProducts[productsIncrementIndex].quantity -= 1;

      setProducts([...newProducts]);

      await AsyncStorage.setItem(
        '@GoMarketPlace:cart',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
