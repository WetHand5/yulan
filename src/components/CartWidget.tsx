import { useState, useEffect, useCallback } from 'react';
import { withBase } from '../utils/path';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const STORAGE_KEY = 'yulan-cart';

function readCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeCart(cart: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent('cart-updated'));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readCart());
    const handler = () => setItems(readCart());
    window.addEventListener('cart-updated', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('cart-updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const add = useCallback((id: string, name: string, price: number) => {
    const cart = readCart();
    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id, name, price, quantity: 1 });
    }
    writeCart(cart);
    setItems([...cart]);
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    const cart = readCart();
    const item = cart.find(i => i.id === id);
    if (item) {
      item.quantity = Math.max(1, quantity);
    }
    writeCart(cart);
    setItems([...cart]);
  }, []);

  const remove = useCallback((id: string) => {
    const cart = readCart().filter(i => i.id !== id);
    writeCart(cart);
    setItems([...cart]);
  }, []);

  const clear = useCallback(() => {
    writeCart([]);
    setItems([]);
  }, []);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, add, updateQuantity, remove, clear, total, count };
}

export default function CartWidget() {
  const { items, updateQuantity, remove, total, count } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🐣</div>
        <p className="text-brand-green/50 text-lg font-body">magie趴在空空的购物车里发呆...</p>
        <a href={withBase('/products')} className="inline-block mt-6 px-6 py-3 rounded-full bg-brand-green text-white hover:bg-brand-green/90 transition-colors">
          去逛逛
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-4 bg-white/60 rounded-2xl p-4">
            <div className="w-20 h-20 bg-brand-fresh-green/20 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl">
              🛍️
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-bold text-brand-green truncate">{item.name}</h3>
              <p className="text-brand-gold font-heading">&yen;{item.price}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="w-8 h-8 rounded-full bg-brand-fresh-green/30 text-brand-green flex items-center justify-center hover:bg-brand-fresh-green/50 transition-colors"
              >
                -
              </button>
              <span className="w-8 text-center font-body">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="w-8 h-8 rounded-full bg-brand-fresh-green/30 text-brand-green flex items-center justify-center hover:bg-brand-fresh-green/50 transition-colors"
              >
                +
              </button>
            </div>
            <div className="text-right">
              <p className="font-heading font-bold text-brand-green">&yen;{item.price * item.quantity}</p>
              <button
                onClick={() => remove(item.id)}
                className="text-xs text-brand-green/40 hover:text-red-400 transition-colors mt-1"
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white/60 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-brand-green/60">共 {count} 件商品</span>
          <span className="font-heading text-2xl font-bold text-brand-green">&yen;{total}</span>
        </div>
        {total < 99 && (
          <p className="text-sm text-brand-green/50 mb-4">再买 &yen;{99 - total} 即可包邮</p>
        )}
        {total >= 99 && (
          <p className="text-sm text-brand-fresh-green mb-4">🎉 已满99元，包邮！</p>
        )}
        <button className="w-full py-3 rounded-full bg-brand-gold text-white font-body font-bold hover:bg-brand-gold/90 transition-colors">
          去结算（展示按钮）
        </button>
      </div>
    </div>
  );
}
