import Link from 'next/link';

export default function SareeCard({ product }) {
  const { code, name, category, fabric, color, price, thumbnail, isNewArrival, isFeatured } = product;

  return (
    <div className="saree-card">
      <Link href={`/product/${code.toLowerCase()}`} className="card-image-link">
        <div className="card-image-wrapper">
          {/* Badge overlays */}
          <div className="card-badges">
            {isNewArrival && <span className="badge badge-new">New Arrival</span>}
            {isFeatured && <span className="badge badge-featured">Featured</span>}
          </div>
          
          {/* Thumbnail Image */}
          <img
            src={thumbnail || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop'}
            alt={name}
            className="card-image"
            loading="lazy"
          />
          <div className="card-overlay">
            <span className="overlay-btn">View Details</span>
          </div>
        </div>
      </Link>

      <div className="card-details">
        <div className="card-meta">
          <span className="card-code">{code}</span>
          {fabric && <span className="card-fabric">{fabric}</span>}
        </div>
        
        <h3 className="card-name">
          <Link href={`/product/${code.toLowerCase()}`}>{name}</Link>
        </h3>

        <div className="card-footer-info">
          {price && <span className="card-price">₹{price.toLocaleString('en-IN')}</span>}
          {color && <span className="card-color-dot" title={`Color: ${color}`} style={{ backgroundColor: color.toLowerCase().includes('red') ? '#800020' : color.toLowerCase().includes('green') ? '#0B6623' : color.toLowerCase().includes('blue') ? '#0F52BA' : '#D4AF37' }}></span>}
        </div>
      </div>
    </div>
  );
}
