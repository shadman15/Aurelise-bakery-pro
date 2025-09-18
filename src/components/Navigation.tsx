import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Instagram, Search, ShoppingBag, User, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { AuthModal } from './AuthModal';
import { SearchDrawer } from './SearchDrawer';
import { CartDrawer } from './CartDrawer';
import logoImage from '@/assets/aurelise-logo.jpg';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSearchDrawer, setShowSearchDrawer] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { totalItems } = useCart();

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Menu', href: '/menu' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const getUserInitials = () => {
    if (!user?.user_metadata) return 'U';
    const firstName = user.user_metadata.first_name || '';
    const lastName = user.user_metadata.last_name || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U';
  };

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
                onClick={() => setShowSearchDrawer(true)}
                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              
              <button 
                onClick={() => setShowCartDrawer(true)}
                className="relative p-2 text-muted-foreground hover:text-primary transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {totalItems}
                  </span>
                )}
              </button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 w-10 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm font-medium">
                      {user.user_metadata?.first_name} {user.user_metadata?.last_name}
                    </div>
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                      {user.email}
                    </div>
                    <DropdownMenuSeparator />
                    <Link to="/account">
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        Account
                      </DropdownMenuItem>
                    </Link>
                    <Link to="/account/orders">
                      <DropdownMenuItem>
                        Orders
                      </DropdownMenuItem>
                    </Link>
                    <Link to="/account/favourites">
                      <DropdownMenuItem>
                        Favourites
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => setShowAuthModal(true)} variant="outline">
                  Sign In
                </Button>
              )}
              
              <Link to="/menu">
                <Button className="btn-hero">
                  Pre-Order Now
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-foreground hover:text-primary transition-colors"
              aria-label="Toggle menu"
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
                    <button 
                      onClick={() => setShowSearchDrawer(true)}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors w-full flex items-center space-x-2"
                    >
                      <Search className="h-4 w-4" />
                      <span>Search</span>
                    </button>
                    
                    <button 
                      onClick={() => setShowCartDrawer(true)}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors w-full flex items-center space-x-2"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>Cart {totalItems > 0 && `(${totalItems})`}</span>
                    </button>
                    
                    {user ? (
                      <Link to="/account" className="p-2 text-muted-foreground hover:text-primary transition-colors w-full flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Account</span>
                      </Link>
                    ) : (
                      <button 
                        onClick={() => setShowAuthModal(true)}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors w-full flex items-center space-x-2"
                      >
                        <User className="h-4 w-4" />
                        <span>Sign In</span>
                      </button>
                    )}
                  </div>
                  
                  <Link to="/menu">
                    <Button className="btn-hero w-full mx-4" style={{ width: 'calc(100% - 2rem)' }}>
                      Pre-Order Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Modals and Drawers */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <SearchDrawer isOpen={showSearchDrawer} onClose={() => setShowSearchDrawer(false)} />
      <CartDrawer isOpen={showCartDrawer} onClose={() => setShowCartDrawer(false)} />
    </>
  );
};

export default Navigation;