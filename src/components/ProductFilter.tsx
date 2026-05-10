import { useState, useMemo } from 'react';
import { fixPublicPath, withBase } from '../utils/path';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cover: string;
  tagline: string;
  tags: string[];
}

interface Props {
  products: Product[];
}

const CATEGORIES = ['全部', '精致饰品', '日常通勤', '家居装饰', '限定礼盒'];

export default function ProductFilter({ products }: Props) {
  const [active, setActive] = useState('全部');

  const filtered = useMemo(() => {
    if (active === '全部') return products;
    return products.filter(p => p.category === active);
  }, [products, active]);

  function addToCart(id: string, name: string, price: number) {
    let cart: Array<{ id: string; name: string; price: number; quantity: number }> = [];
    try {
      cart = JSON.parse(localStorage.getItem('yulan-cart') || '[]');
    } catch {}
    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id, name, price, quantity: 1 });
    }
    localStorage.setItem('yulan-cart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cart-updated'));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-4 py-2 rounded-full text-sm font-body transition-colors ${
              active === cat
                ? 'bg-brand-green text-white'
                : 'bg-white/60 text-brand-green/70 hover:bg-white/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(p => (
          <article key={p.id} className="group bg-white/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            <a href={withBase(`/products/${p.id}`)} className="block">
              <div className="aspect-square overflow-hidden bg-brand-fresh-green/20">
                <img
                  src={fixPublicPath(p.cover)}
                  alt={p.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </a>
            <div className="p-4">
              <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-brand-fresh-green/40 text-brand-green/70 mb-2">{p.category}</span>
              <h3 className="font-heading text-lg font-bold text-brand-green">{p.name}</h3>
              <p className="text-sm text-brand-green/60 mt-1 line-clamp-2">{p.tagline}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-heading text-xl font-bold text-brand-gold">&yen;{p.price}</span>
                <button
                  onClick={() => addToCart(p.id, p.name, p.price)}
                  className="text-sm px-4 py-2 rounded-full bg-brand-green text-white hover:bg-brand-green/90 transition-colors"
                >
                  加入购物车
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-brand-green/50 py-12">暂无该分类商品</p>
      )}
    </div>
  );
}
