import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Vasthra Katha | Handcrafted & Heritage Saree Atelier",
  description: "Browse the digital catalog of Vasthra Katha. Explore our curated collections of pure Kanchipuram silk, traditional Banarasi brocades, organza sarees, and linen classics. Call or WhatsApp us to enquire.",
  keywords: "Vasthra Katha, sarees, Kanchipuram silk, Banarasi, Organza sarees, designer sarees, Kerala boutique, Indian sarees catalog",
  openGraph: {
    title: "Vasthra Katha | Saree Catalog",
    description: "Browse our collections of pure Kanchipuram silks, Banarasi brocades, and daily wear cottons.",
    url: "https://vasthrakatha.com",
    siteName: "Vasthra Katha",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
