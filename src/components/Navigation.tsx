import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, Instagram, Search, ShoppingBag, User } from 'lucide-react';
import { Button } from './ui/button';
import logoImage from '@/assets/aurelise-logo.jpg';
import Modal from './Modal';
import Sidebar from './Sidebar';
import Drawer from './Drawer';
import Toast from './Toast';

const dummyProducts = [
  { id: 1, name: "Chocolate Croissant", price: 3.5 },
  { id: 2, name: "Almond Tart", price: 4.0 },
  { id: 3, name: "Baguette", price: 2.0 },
  { id: 4, name: "Eclair", price: 3.0 },
  { id: 5, name: "Chocolate Cake", price: 6.0 },
  { id: 6, name: "Vanilla Cake", price: 5.5 },
  { id: 7, name: "Red Velvet Cake", price: 7.0 },
];

interface NavigationProps {
  cartItems: any[];
  setCartItems: React.Dispatch<React.SetStateAction<any[]>>;
  onAddToCart: (product: any) => void;
}

const Navigation = ({ cartItems, setCartItems, onAddToCart }: NavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (href: string) => location.pathname === href;

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Menu', href: '/menu' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [signupMode, setSignupMode] = useState(false);

  // Search filter (simulate)
  const filteredProducts = dummyProducts.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers
  const handleSearchClick = () => setSearchOpen(true);
  const handleCartClick = () => setCartOpen(true);
  const handleLoginClick = () => setLoginOpen(true);
  const handlePreOrderClick = () => {
    navigate("/catalog");
  };
  const handleAddToCart = (product: {id:number, name:string, price:number}) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setToastMsg("Product added to cart");
    setToastOpen(true);
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Close search drawer on route change
  useEffect(() => {
    setSearchOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Allergen Notice Banner */}
      <div className="bg-secondary border-b border-border py-2 px-4 text-center">
        <p className="text-sm text-secondary-foreground font-medium">
          <span className="font-semibold">Allergen Notice:</span> Our kitchen handles milk, eggs, gluten, tree nuts, and other allergens. 
          Please inform us of severe allergies before ordering. 
          <Link to="/allergens" className="underline ml-1 hover:text-primary">Learn more</Link>
        </p>
      </div>

      {/* Main Navigation */}
      <header className="bg-background/95 backdrop-blur-sm sticky top-0 z-50 border-b border-border">
        <nav className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <img 
                src={logoImage} 
                alt="Aurélise Logo" 
                className="h-14 w-auto object-contain rounded-lg group-hover:scale-105 transition-transform duration-300 shadow-md"
              />
              <div className="hidden sm:block">
                <p className="text-sm text-muted-foreground italic font-medium">Where Every Bite Tells a Story</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`font-medium transition-colors duration-200 hover:text-primary ${
                    isActive(item.href) 
                      ? 'text-primary border-b-2 border-primary pb-1' 
                      : 'text-foreground'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <button
                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                onClick={handleSearchClick}
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                className="relative p-2 text-muted-foreground hover:text-primary transition-colors"
                onClick={handleCartClick}
              >
                <ShoppingBag className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {cartItems.reduce((sum, item) => sum + item.qty, 0)}
                  </span>
                )}
              </button>
              <button
                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                onClick={handleLoginClick}
              >
                <User className="h-5 w-5" />
              </button>
              <Button className="btn-hero" onClick={handlePreOrderClick}>
                Pre-Order Now
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-foreground hover:text-primary transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="lg:hidden py-4 border-t border-border bg-background">
              <div className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`font-medium py-2 px-4 rounded-md transition-colors duration-200 ${
                      isActive(item.href) 
                        ? 'text-primary bg-secondary' 
                        : 'text-foreground hover:text-primary hover:bg-secondary'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                  <div className="pt-4 border-t border-border space-y-4">
                    <div className="flex items-center justify-between px-4">
                      <a 
                        href="https://wa.me/447440645831" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-muted-foreground"
                      >
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">WhatsApp</span>
                      </a>
                      <a 
                        href="https://instagram.com/aurelise.uk" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-muted-foreground"
                      >
                        <Instagram className="h-4 w-4" />
                        <span className="text-sm">Instagram</span>
                      </a>
                    </div>
                    <div className="px-4 space-y-2">
                      <button className="p-2 text-muted-foreground hover:text-primary transition-colors w-full flex items-center space-x-2">
                        <Search className="h-4 w-4" />
                        <span>Search</span>
                      </button>
                      <Link to="/cart" className="p-2 text-muted-foreground hover:text-primary transition-colors w-full flex items-center space-x-2">
                        <ShoppingBag className="h-4 w-4" />
                        <span>Cart {cartCount > 0 && `(${cartCount})`}</span>
                      </Link>
                      <Link to="/account" className="p-2 text-muted-foreground hover:text-primary transition-colors w-full flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Account</span>
                      </Link>
                    </div>
                    <Button className="btn-hero w-full mx-4" style={{ width: 'calc(100% - 2rem)' }}>
                      Pre-Order Now
                    </Button>
                  </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Modals and Sidebar */}
      <Drawer open={searchOpen} onClose={() => setSearchOpen(false)} position="top" title="Search Products">
  <form
    onSubmit={e => {
      e.preventDefault();
      if (searchTerm.trim()) {
        setSearchOpen(false);
        navigate(`/catalog?search=${encodeURIComponent(searchTerm.trim())}`);
      }
    }}
  >
    <input
      className="w-full border rounded px-3 py-2 mb-4"
      placeholder="Type to search..."
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
      autoFocus
    />
    <button
      type="submit"
      className="w-full bg-primary text-white py-2 rounded hover:bg-primary/90 transition"
      disabled={!searchTerm.trim()}
    >
      Search
    </button>
  </form>
</Drawer>

      <Sidebar open={cartOpen} onClose={() => setCartOpen(false)} title="Your Cart">
        {cartItems.length === 0 ? (
          <div className="text-gray-500">Your cart is empty.</div>
        ) : (
          <>
            <ul>
              {cartItems.map((item) => (
                <li key={item.id} className="flex justify-between py-2 border-b">
                  <span>
                    {item.name} <span className="text-xs text-gray-400">x{item.qty}</span>
                  </span>
                  <span>£{(item.price * item.qty).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between font-bold">
              <span>Total:</span>
              <span>£{total.toFixed(2)}</span>
            </div>
            <button
              className="mt-6 w-full bg-primary text-white py-2 rounded hover:bg-primary/90"
              onClick={() => { setCartOpen(false); navigate("/checkout"); }}
            >
              Go to Checkout
            </button>
          </>
        )}
      </Sidebar>

      <Modal open={loginOpen} onClose={() => setLoginOpen(false)} title={signupMode ? "Sign Up" : "Login"}>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            // @ts-ignore
            const email = e.target.email.value;
            // @ts-ignore
            const password = e.target.password.value;
            if (signupMode) {
              // @ts-ignore
              const name = e.target.name.value;
              console.log("Signup:", { name, email, password });
            } else {
              console.log("Login:", { email, password });
            }
            setLoginOpen(false);
          }}
        >
          {signupMode && (
            <input
              name="name"
              type="text"
              required
              placeholder="Name"
              className="w-full border rounded px-3 py-2"
            />
          )}
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="w-full border rounded px-3 py-2"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Password"
            className="w-full border rounded px-3 py-2"
          />
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded hover:bg-primary/90"
          >
            {signupMode ? "Sign Up" : "Login"}
          </button>
        </form>
        <div className="mt-2 text-center">
          <button
            className="text-primary underline text-sm"
            onClick={() => setSignupMode((v) => !v)}
          >
            {signupMode ? "Already have an account? Login" : "Don't have an account? Sign Up"}
          </button>
        </div>
      </Modal>

      <Toast message={toastMsg} open={toastOpen} onClose={() => setToastOpen(false)} />
    </>
  );
};

export default Navigation;