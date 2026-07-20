'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Catalog', path: '/collection' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  // Do not show main navbar in admin dashboard paths to keep dashboard clean
  const isAdminDashboard = pathname.startsWith('/admin/dashboard');

  if (isAdminDashboard) return null;

  return (
    <header className="navbar-container">
      <nav className="navbar-content">
        {/* Brand Name Logo */}
        <Link href="/" className="navbar-logo">
          <span className="logo-text">Vasthra Katha</span>
          <span className="logo-tagline">The Saree Atelier</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="nav-desktop-links">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                {link.name}
              </Link>
            );
          })}
          <Link
            href="/admin"
            className={`nav-link admin-nav-btn ${pathname.startsWith('/admin') ? 'active' : ''}`}
          >
            Admin Panel
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={toggleMenu}
          className="nav-mobile-toggle"
          aria-label="Toggle navigation menu"
        >
          <div className={`bar ${isOpen ? 'open' : ''}`}></div>
          <div className={`bar ${isOpen ? 'open' : ''}`}></div>
          <div className={`bar ${isOpen ? 'open' : ''}`}></div>
        </button>

        {/* Mobile Sidebar */}
        <div className={`nav-mobile-menu ${isOpen ? 'active' : ''}`}>
          <div className="mobile-menu-links">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              );
            })}
            <Link
              href="/admin"
              className="mobile-nav-link mobile-admin-btn"
              onClick={() => setIsOpen(false)}
            >
              Admin Panel
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
