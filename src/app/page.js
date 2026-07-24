import Link from 'next/link';
import { getCategories, getProducts, getBanners } from '@/lib/db';
import HomeHeroCarousel from '@/components/HomeHeroCarousel';
import SareeCard from '@/components/SareeCard';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const categories = await getCategories();
  const allProducts = await getProducts();
  const allBanners = await getBanners();

  const newArrivals = allProducts
    .filter(p => p.isPublished && p.isNewArrival)
    .slice(0, 4);
  const featuredProducts = allProducts
    .filter(p => p.isPublished && p.isFeatured)
    .slice(0, 4);

  // Map homepage sections explicitly to specific active Banner IDs
  const heroBanner = allBanners.find(b => b.id === 'banner-hero' && b.isActive);
  const festivalBanner = allBanners.find(b => b.id === 'banner-festival' && b.isActive);
  const offersBanner = allBanners.find(b => b.id === 'banner-offers' && b.isActive);
  const ourStoryBanner = allBanners.find(b => b.id === 'our-story' && b.isActive);

  // Parse and flatten carousel slides from banner-hero
  const carouselSlides = [];
  if (heroBanner) {
    try {
      if (heroBanner.image.startsWith('[')) {
        const parsedImages = JSON.parse(heroBanner.image);
        for (const img of parsedImages) {
          carouselSlides.push({
            id: `hero-${img}`,
            title: heroBanner.title || '',
            subtitle: heroBanner.subtitle || '',
            image: img,
            link: heroBanner.link || '/collection',
            showTitle: heroBanner.showTitle !== false
          });
        }
      } else {
        carouselSlides.push({
          id: heroBanner.id,
          title: heroBanner.title || '',
          subtitle: heroBanner.subtitle || '',
          image: heroBanner.image,
          link: heroBanner.link || '/collection',
          showTitle: heroBanner.showTitle !== false
        });
      }
    } catch (e) {
      carouselSlides.push({
        id: heroBanner.id,
        title: heroBanner.title || '',
        subtitle: heroBanner.subtitle || '',
        image: heroBanner.image,
        link: heroBanner.link || '/collection',
        showTitle: heroBanner.showTitle !== false
      });
    }
  }

  const defaultBanners = [
    {
      id: 'default-1',
      title: "Heritage Elegance in Every Thread",
      subtitle: "Discover our handpicked collection of pure Kanchipuram silk and bridal sarees.",
      image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1600&q=80",
      link: "/collection?category=silk-sarees"
    },
    {
      id: 'default-2',
      title: "Artisanal Banarasi Brocades",
      subtitle: "Masterfully crafted heritage weaves directly from traditional Indian looms.",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&q=80",
      link: "/collection?category=banarasi"
    },
    {
      id: 'default-3',
      title: "Linen & Organza Summer Atelier",
      subtitle: "Experience lightweight elegance and breathy silhouettes for contemporary styling.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1600&q=80",
      link: "/collection?category=organza"
    }
  ];

  const displayBanners = carouselSlides.length > 0 ? carouselSlides : defaultBanners;

  const getFirstBannerImage = (banner, fallback) => {
    if (!banner) return fallback;
    try {
      if (banner.image.startsWith('[')) {
        const parsed = JSON.parse(banner.image);
        return parsed[0] || fallback;
      }
    } catch (e) {}
    return banner.image || fallback;
  };

  const festivalBannerImg = getFirstBannerImage(festivalBanner, null);
  const offersBannerImg = getFirstBannerImage(offersBanner, null);
  const ourStoryImg = getFirstBannerImage(ourStoryBanner, '/brand-intro.png');

  return (
    <div className="homepage-container">
      {/* Hero Slider Carousel Section */}
      <HomeHeroCarousel banners={displayBanners} />

      {/* Brand Intro Summary */}
      <section className="about-widget">
        <div className="about-widget-img-box">
          <img
            src={ourStoryImg}
            alt="Your Own Threads Handloom Craft"
          />
        </div>
        <div className="about-widget-content">
          <h2>Your Own Threads</h2>
          <p className="lead-text"><em>Where elegance meets authenticity.</em></p>
          <p>
            Welcome to Your Own Threads. We believe a saree is not just an outfit—it is an art form, a heritage, and a standard of grace. We bring you hand-selected, premium quality sarees that represent the pinnacle of Indian weaving traditions.
          </p>
          <p>
            From the heavy gold border Kanchipurams to the ethereal lightweight Organza drapes, each piece is selected to highlight the pure beauty of traditional craftsmanship. Explore our collections online and enquire directly for pricing and availability.
          </p>
          <Link href="/about" className="outline-btn">Our Story</Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section-container">
        <div className="section-header">
          <h2>Shop by Category</h2>
          <p>Explore our curated selections of fine textiles</p>
        </div>
        <div className="categories-grid">
          {categories.map((cat) => (
            <div key={cat.id} className="category-card">
              <img src={cat.image} alt={cat.name} className="category-img" />
              <div className="category-overlay">
                <h3 className="category-name">{cat.name}</h3>
                <p className="category-desc">{cat.description}</p>
                <Link href={`/collection?category=${cat.id}`} className="category-link-text">
                  Browse Category →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* New Arrivals Section */}
      {newArrivals.length > 0 && (
        <section className="section-container" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '5rem' }}>
          <div className="section-header">
            <h2>New Arrivals</h2>
            <p>Fresh additions to our exclusive saree collection</p>
          </div>
          <div className="saree-grid">
            {newArrivals.map((product) => (
              <SareeCard key={product.code} product={product} />
            ))}
          </div>
          <div className="view-all-container">
            <Link href="/collection?newArrival=true" className="outline-btn">
              View All New Arrivals
            </Link>
          </div>
        </section>
      )}

      {/* Offers Banner Section if active */}
      {offersBanner && offersBannerImg && (
        <section
          className="hero-slider"
          style={{
            backgroundImage: `url(${offersBannerImg})`,
            height: '40vh',
            minHeight: '280px',
            margin: '5rem 0'
          }}
        >
          <div className="hero-overlay" style={{ background: 'linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.55))' }}></div>
          <div className="hero-content" style={{ textAlign: 'center' }}>
            <h2 className="hero-title" style={{ fontSize: '2.5rem', margin: '0 auto 0.75rem', maxWidth: '850px' }}>
              {offersBanner.title}
            </h2>
            <p className="hero-subtitle" style={{ margin: '0 auto 1.5rem', maxWidth: '650px', fontSize: '1.05rem' }}>
              {offersBanner.subtitle}
            </p>
            <Link href={offersBanner.link || "/collection"} className="hero-btn" style={{ padding: '0.7rem 1.8rem' }}>
              Explore Offers
            </Link>
          </div>
        </section>
      )}

      {/* Festival Promo Banner if active */}
      {festivalBanner && festivalBannerImg && (
        <section
          className="hero-slider"
          style={{
            backgroundImage: `url(${festivalBannerImg})`,
            height: '45vh',
            minHeight: '300px',
            margin: '5rem 0'
          }}
        >
          <div className="hero-overlay" style={{ background: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.6))' }}></div>
          <div className="hero-content" style={{ textAlign: 'center' }}>
            <h2 className="hero-title" style={{ fontSize: '2.5rem', margin: '0 auto 1rem', maxWidth: '800px' }}>
              {festivalBanner.title}
            </h2>
            <p className="hero-subtitle" style={{ margin: '0 auto 1.5rem', maxWidth: '600px' }}>
              {festivalBanner.subtitle}
            </p>
            <Link href={festivalBanner.link || "/collection"} className="hero-btn">
              Explore Festival Wear
            </Link>
          </div>
        </section>
      )}

      {/* Featured Collection Section */}
      {featuredProducts.length > 0 && (
        <section className="section-container">
          <div className="section-header">
            <h2>Featured Collection</h2>
            <p>Our handpicked pieces of exceptional style and artistry</p>
          </div>
          <div className="saree-grid">
            {featuredProducts.map((product) => (
              <SareeCard key={product.code} product={product} />
            ))}
          </div>
          <div className="view-all-container">
            <Link href="/collection?featured=true" className="outline-btn">
              View Featured Collection
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
