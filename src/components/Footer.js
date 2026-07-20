'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const isAdminDashboard = pathname.startsWith('/admin/dashboard');

  if (isAdminDashboard) return null;

  return (
    <footer className="footer-container">
      <div className="footer-content">
        {/* Col 1: Brand Info */}
        <div className="footer-col brand-col">
          <Link href="/" className="footer-logo">
            Vasthra Katha
          </Link>
          <p className="brand-description">
            Weaving heritage and modern aesthetics to bring you the finest collection of handcrafted sarees. Every drape tells a unique story of tradition, craft, and elegance.
          </p>
          <div className="social-links">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              Instagram
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              Facebook
            </a>
            <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              WhatsApp
            </a>
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div className="footer-col">
          <h3 className="footer-title">Explore</h3>
          <ul className="footer-links">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/collection">Catalog</Link>
            </li>
            <li>
              <Link href="/about">About Us</Link>
            </li>
            <li>
              <Link href="/contact">Contact Us</Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Contact Details */}
        <div className="footer-col contact-col">
          <h3 className="footer-title">Contact Us</h3>
          <p className="contact-item">
            <strong>Address:</strong><br />
            Vasthra Kadtha Saree Atelier,<br />
            Kerala, India
          </p>
          <p className="contact-item">
            <strong>Phone:</strong> <a href="tel:+919961768565">+91 9961768565</a>
          </p>
          <p className="contact-item">
            <strong>WhatsApp:</strong> <a href="https://wa.me/919961768565" target="_blank" rel="noopener noreferrer">+91 9961768565</a>
          </p>
          <p className="contact-item">
            <strong>Email:</strong> <a href="mailto:info@vasthrakadtha.com">info@vasthrakadtha.com</a>
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Vasthra Katha. All Rights Reserved.</p>
        <p className="sub-tag">Curated Collections of Handcrafted Sarees</p>
      </div>
    </footer>
  );
}
