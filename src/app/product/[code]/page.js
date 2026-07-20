import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductByCode, getProducts } from '@/lib/db';
import MediaGallery from '@/components/MediaGallery';
import SareeCard from '@/components/SareeCard';
import ShareRow from '@/components/ShareRow';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({ params }) {
  const { code } = await params;
  const product = await getProductByCode(code);

  if (!product || !product.isPublished) {
    notFound();
  }

  // Fetch related products (same category, excluding current product, published only)
  const allProducts = await getProducts();
  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.code.toLowerCase() !== product.code.toLowerCase() && p.isPublished)
    .slice(0, 4);

  // WhatsApp Message Generation
  const storePhone = "919961768565"; // Indian country code prefix + 9961768565
  const waMessage = `Hello,

I'm interested in the following saree:

Product Code: ${product.code}
Product Name: ${product.name}

Please share the price and availability.

Thank you.`;

  const encodedMessage = encodeURIComponent(waMessage);
  const whatsappUrl = `https://wa.me/${storePhone}?text=${encodedMessage}`;
  const callUrl = `tel:+919961768565`;

  // Mock product URLs for share links (in real app, use site domain)
  const shareText = `Check out this beautiful saree: ${product.name} (${product.code})`;
  // We will build a client sharing block or simple links:
  // Using a client action or simple social links
  
  return (
    <div className="product-details-container">
      {/* Breadcrumbs */}
      <div className="breadcrumb">
        <Link href="/">Home</Link> &gt; <Link href="/collection">Catalog</Link> &gt; <Link href={`/collection?category=${product.category}`}>{product.category.replace('-', ' ')}</Link> &gt; <span>{product.code}</span>
      </div>

      {/* Grid: Media Gallery | Product info */}
      <div className="product-detail-grid">
        {/* Left: Media Gallery */}
        <div>
          <MediaGallery
            images={product.images || [product.thumbnail]}
            videos={product.videos || []}
            name={product.name}
          />
        </div>

        {/* Right: Info Panel */}
        <div className="product-info-panel">
          <span className="product-code">Code: {product.code}</span>
          <h1>{product.name}</h1>
          {product.price && (
            <p className="product-price">₹{product.price.toLocaleString('en-IN')}</p>
          )}

          <p className="product-description">{product.description}</p>

          {/* Specifications Table */}
          <table className="spec-table">
            <tbody>
              {product.fabric && (
                <tr>
                  <th>Fabric</th>
                  <td>{product.fabric}</td>
                </tr>
              )}
              {product.color && (
                <tr>
                  <th>Color</th>
                  <td>{product.color}</td>
                </tr>
              )}
              {product.work && (
                <tr>
                  <th>Work</th>
                  <td>{product.work}</td>
                </tr>
              )}
              {product.border && (
                <tr>
                  <th>Border</th>
                  <td>{product.border}</td>
                </tr>
              )}
              <tr>
                <th>Blouse Included</th>
                <td>{product.blouseIncluded ? 'Yes' : 'No'}</td>
              </tr>
              {product.length && (
                <tr>
                  <th>Length</th>
                  <td>{product.length}</td>
                </tr>
              )}
              {product.weight && (
                <tr>
                  <th>Weight</th>
                  <td>{product.weight}</td>
                </tr>
              )}
              {product.occasion && (
                <tr>
                  <th>Occasion</th>
                  <td>{product.occasion}</td>
                </tr>
              )}
              {product.care && (
                <tr>
                  <th>Care Instructions</th>
                  <td>{product.care}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Call to Actions */}
          <div className="action-buttons-group">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="primary-action-btn"
            >
              <svg style={{ width: '20px', height: '20px', fill: 'currentColor' }} viewBox="0 0 24 24">
                <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.333 4.982L2 22l5.233-1.371a9.994 9.994 0 004.779 1.206h.004c5.505 0 9.989-4.478 9.99-9.984A9.993 9.993 0 0012.012 2zm5.823 14.159c-.254.711-1.472 1.391-2.022 1.488-.5.088-1.154.161-3.354-.751-2.812-1.168-4.625-4.032-4.766-4.22-.14-.188-1.144-1.52-1.144-2.9 0-1.381.722-2.06.976-2.336.254-.276.564-.345.761-.345.198 0 .396.002.564.01.178.008.416-.067.65.498.254.614.869 2.122.946 2.279.076.158.127.342.02.553-.107.21-.162.342-.325.53-.162.188-.34.423-.487.567-.162.158-.33.33-.142.65.188.32.836 1.374 1.796 2.23.123.11.23.22.317.311 1.236 1.099 1.948 1.411 2.378 1.588.423.175.765.105 1.05-.219.284-.325 1.246-1.446 1.579-1.942.33-.497.66-.413 1.116-.245.457.168 2.9.136 3.4.388.502.251.836.376.92.522.083.146.083.847-.171 1.558z"/>
              </svg>
              Enquire on WhatsApp
            </a>
            
            <a href={callUrl} className="secondary-action-btn">
              <svg style={{ width: '18px', height: '18px', fill: 'currentColor' }} viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.82 3.76 5.14 6.62 6.62l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              Call Store
            </a>
          </div>

          {/* Share widget */}
          <ShareRow shareText={shareText} productCode={product.code} />
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="related-section">
          <h2 className="related-title">You May Also Like</h2>
          <div className="saree-grid">
            {relatedProducts.map(prod => (
              <SareeCard key={prod.code} product={prod} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
