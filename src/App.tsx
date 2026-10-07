import { useEffect, useState } from "react";
import CompanySection from "./components/CompanySection";
import HeroSection from "./components/HeroSection";
import QuoteBlock from "./components/QuoteBlock";
import RequestDialog from "./components/RequestDialog";
import SiteFooter from "./components/SiteFooter";
import SiteHeader from "./components/SiteHeader";
import SolutionsSection from "./components/SolutionsSection";
import { products, segments } from "./data/catalog";
import { usePath, navigate } from "./lib/router";
import AccountPage from "./pages/AccountPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ShopPage from "./pages/ShopPage";
import SupportPage from "./pages/SupportPage";
import type { CartLine, Services, User } from "./services/types";

const CUSTOM_PART = "Peça técnica personalizada";
const CART_KEY = "gramanse.cart";

interface AppProps { services: Services }

export default function App({ services }: AppProps) {
  const path = usePath();
  const [user, setUser] = useState<User | null>(() => services.account.current());
  const [cart, setCart] = useState<CartLine[]>(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]") as CartLine[]; } catch { return []; }
  });
  const [selectedSegment, setSelectedSegment] = useState(segments[0].id);
  const [requestProduct, setRequestProduct] = useState(CUSTOM_PART);
  const [requestOpen, setRequestOpen] = useState(false);

  useEffect(() => localStorage.setItem(CART_KEY, JSON.stringify(cart)), [cart]);
  useEffect(() => {
    if (path === "/empresa") document.getElementById("empresa")?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [path]);

  const openRequest = (productName = CUSTOM_PART) => { setRequestProduct(productName); setRequestOpen(true); };
  const addToCart = (productId: number) =>
    setCart((lines) => lines.some((l) => l.productId === productId)
      ? lines.map((l) => (l.productId === productId ? { ...l, qty: l.qty + 1 } : l))
      : [...lines, { productId, qty: 1 }]);
  const setQty = (productId: number, qty: number) =>
    setCart((lines) => (qty <= 0 ? lines.filter((l) => l.productId !== productId) : lines.map((l) => (l.productId === productId ? { ...l, qty } : l))));
  const logout = () => { services.account.logout(); setUser(null); navigate("/"); };

  const cartCount = cart.reduce((sum, line) => sum + line.qty, 0);
  const authProps = { account: services.account, hasCart: cart.length > 0, onAuth: setUser };

  let page;
  switch (path) {
    case "/loja":
      page = <ShopPage segments={segments} products={products} cart={cart} user={user} orders={services.orders} onAdd={addToCart} onSetQty={setQty} onClear={() => setCart([])} onQuote={openRequest} />;
      break;
    case "/entrar": page = <LoginPage {...authProps} />; break;
    case "/cadastro": page = <RegisterPage {...authProps} />; break;
    case "/conta": page = <AccountPage user={user} orders={services.orders} support={services.support} onLogout={logout} />; break;
    case "/suporte": page = <SupportPage user={user} orders={services.orders} support={services.support} />; break;
    default:
      page = (
        <>
          <HeroSection onRequest={() => openRequest()} />
          <SolutionsSection segments={segments} products={products} selectedSegment={selectedSegment} onSelectSegment={setSelectedSegment} onAdd={addToCart} onQuote={openRequest} />
          <CompanySection />
          <QuoteBlock onRequest={() => openRequest()} />
        </>
      );
  }

  return (
    <div className="min-h-screen overflow-x-clip">
      <SiteHeader path={path} user={user} cartCount={cartCount} onRequest={() => openRequest()} />
      <main>{page}</main>
      <SiteFooter />
      {requestOpen && <RequestDialog initialProduct={requestProduct} onClose={() => setRequestOpen(false)} />}
    </div>
  );
}