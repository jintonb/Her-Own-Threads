export const metadata = {
  title: "Contact Us | Your Own Threads Saree Atelier",
  description: "Get in touch with Your Own Threads. View our phone number, email, store address, or send an enquiry.",
};

export default function ContactPage() {
  const storePhone = "+91 9961768565";
  const storeEmail = "info@yourownthreads.com";
  
  return (
    <div className="static-page-container" style={{ maxWidth: '1100px' }}>
      <h1 className="static-page-title">Connect With Us</h1>

      <div className="contact-layout">
        {/* Left Col: Contact Details */}
        <div className="contact-info-section">
          <h2>Your Own Threads Atelier</h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            We'd love to help you find your perfect saree. Visit our store or get in touch through any of the channels below.
          </p>

          <h3>Location Address</h3>
          <p>
            Your Own Threads Atelier,<br />
            Chittoor Road, Ernakulam,<br />
            Kochi, Kerala - 682011<br />
            India
          </p>

          <h3>Call Store directly</h3>
          <p>
            For phone queries, material check, and video calls:<br />
            <strong>Phone:</strong> <a href={`tel:${storePhone}`} style={{ color: 'var(--primary)', fontWeight: '600' }}>{storePhone}</a>
          </p>

          <h3>WhatsApp Chat</h3>
          <p>
            Connect instantly with our shopping assistants:<br />
            <strong>WhatsApp:</strong> <a href="https://wa.me/919961768565" target="_blank" rel="noopener noreferrer" style={{ color: '#25d366', fontWeight: '600' }}>+91 9961768565</a>
          </p>

          <h3>Email</h3>
          <p>
            For corporate bookings or design collaboration enquiries:<br />
            <strong>Email:</strong> <a href={`mailto:${storeEmail}`} style={{ color: 'var(--primary)' }}>{storeEmail}</a>
          </p>

          <h3>Social Channels</h3>
          <p>
            Follow our new arrivals on Instagram and Facebook:<br />
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ marginRight: '1rem', textDecoration: 'underline' }}>Instagram</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>Facebook</a>
          </p>
        </div>

        {/* Right Col: Styled Maps placeholder */}
        <div className="map-panel">
          <a
            href="https://maps.google.com/?q=Chittoor+Road,Ernakulam,Kochi,Kerala"
            target="_blank"
            rel="noopener noreferrer"
            title="Click to open in Google Maps"
          >
            <div className="map-placeholder">
              <span className="map-icon">📍</span>
              <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Find Us on Google Maps</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '1.5rem' }}>
                Your Own Threads Saree Atelier<br />
                Chittoor Road, Kochi, Kerala
              </p>
              <span className="outline-btn" style={{ padding: '0.5rem 1.5rem', fontSize: '0.8rem', background: 'white' }}>
                Get Directions ↗
              </span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
