export const metadata = {
  title: "About Us | Vasthra Katha Saree Atelier",
  description: "Learn about the heritage, craftsmanship, and story of Vasthra Katha - Curating the finest heritage sarees.",
};

export default function AboutPage() {
  return (
    <div className="static-page-container">
      <h1 className="static-page-title">Our Brand Story</h1>
      
      <div className="static-content">
        <p>
          Founded on a deep-rooted passion for Indian textiles and heritage weaves, <strong>Vasthra Katha</strong> was created to celebrate and sustain the art of fine saree weaving. Based in Kerala, India, we work closely with master artisans across traditional weaving clusters to bring you a hand-curated collection of timeless sarees.
        </p>

        <div className="craftsmanship-callout">
          <h3>The Spirit of Craftsmanship</h3>
          <p>
            Every single saree in our catalog represents weeks, sometimes months, of painstaking manual work. From selecting the finest silk yarns to dyeing, drafting borders, and hand-weaving zari threads, our sarees are individual masterpieces.
          </p>
        </div>

        <p>
          The name <em>Vasthra Katha</em> translates loosely to "the story of premium fabrics"—which is exactly what we do. Our team handpicks individual sarees based on strict standards of quality, authenticity of materials, and uniqueness of design.
        </p>

        <h2 style={{ marginTop: '3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)', color: 'var(--primary)' }}>Our Vision</h2>
        <p>
          Our vision is to build an accessible bridge between heritage weavers and modern saree connoisseurs. In an era of rapid fast-fashion, we stand as advocates for slow fashion, promoting pieces that carry cultural weight, look exceptionally elegant, and can be passed down through generations.
        </p>

        <h2 style={{ marginTop: '3rem', marginBottom: '1rem', fontFamily: 'var(--font-serif)', color: 'var(--primary)' }}>Why Choose Vasthra Katha?</h2>
        <p>
          We differentiate ourselves by refusing duplicates and powerloom imitations in our premium ranges. When you browse our catalog, you are looking at pure mulberry silk, genuine silver/gold plated zari thread, and hand-loomed textures.
        </p>
        <p>
          Although we showcase our catalog digitally for global accessibility, we keep our customer relationship personal. We encourage you to reach out via phone or WhatsApp, allowing us to assist you individually, share close-up details, verify pricing, and guide your selection.
        </p>
      </div>
    </div>
  );
}
