import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Your Own Threads | Handcrafted & Heritage Saree Atelier",
  description: "Browse the digital catalog of Your Own Threads. Explore our curated collections of pure Kanchipuram silk, traditional Banarasi brocades, organza sarees, and linen classics. Call or WhatsApp us to enquire.",
  keywords: "Your Own Threads, sarees, Kanchipuram silk, Banarasi, Organza sarees, designer sarees, Kerala boutique, Indian sarees catalog",
  openGraph: {
    title: "Your Own Threads | Saree Catalog",
    description: "Browse our collections of pure Kanchipuram silks, Banarasi brocades, and daily wear cottons.",
    url: "https://vasthrakatha.com",
    siteName: "Your Own Threads",
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
