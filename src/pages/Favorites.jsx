import { Star, Download, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';

export default function Favorites({ favorites, onRemove }) {
  const exportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const maxWidth = pageWidth - margin * 2;

    doc.setFontSize(16);
    doc.text('JoSAA Insight — My Favorites', margin, 20);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 28);
    doc.setTextColor(0);

    let y = 38;

    favorites.forEach((d, i) => {
      if (y > 265) { doc.addPage(); y = 20; }

      // Institute name
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42); // --text
      doc.text(`${i + 1}. ${d.institute}`, margin, y);
      y += 6;

      // Program — wrap if long
      doc.setFontSize(9);
      doc.setTextColor(80);
      const programLines = doc.splitTextToSize(`   ${d.program}`, maxWidth);
      doc.text(programLines, margin, y);
      y += programLines.length * 4.5;

      // Stats line
      doc.text(
        `   Category: ${d.category} · Gender: ${d.gender} · Opening: ${d.openingRank} · Closing: ${d.closingRank} · Round: ${d.round}`,
        margin, y
      );
      doc.setTextColor(0);
      y += 10;

      // Divider
      doc.setDrawColor(220);
      doc.line(margin, y - 3, pageWidth - margin, y - 3);
    });

    doc.save('josaa-favorites.pdf');
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: 6 }}>
            My Favorites
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{favorites.length} saved programs</p>
        </div>
        {favorites.length > 0 && (
          <button className="btn-primary" onClick={exportPDF} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={14} /> Export PDF
          </button>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="card" style={{ padding: '64px 24px', textAlign: 'center' }}>
          <Star size={40} style={{ color: 'var(--border)', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>No favorites yet</p>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>Bookmark colleges from the Dashboard by clicking the star icon</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {favorites.map((d, i) => (
            <div key={i} className="card" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>
                  {i + 1}. {d.institute}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {d.program} · {d.category} · OR: {d.openingRank?.toLocaleString()} · CR: {d.closingRank?.toLocaleString()}
                </div>
              </div>
              <button onClick={() => onRemove(d)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--muted)', padding: 6,
              }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}