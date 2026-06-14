const { GoogleGenerativeAI } = require('@google/generative-ai');

// Inisialisasi Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ── Smart Fallback: Analisis approval request berdasarkan data ──
function smartAnalyzeApproval(requestData) {
  const nominal = Number(requestData.nominal);
  const keperluan = (requestData.keperluan || '').toLowerCase();
  const kitchenName = requestData.kitchenName || '';

  let score = 3;
  const reasons = [];

  // Analisis berdasarkan nominal
  if (nominal > 5000000) {
    score += 3;
    reasons.push(`Nominal cukup besar (Rp ${nominal.toLocaleString('id-ID')})`);
  } else if (nominal > 2000000) {
    score += 1;
    reasons.push(`Nominal dalam kisaran menengah`);
  } else {
    reasons.push(`Nominal relatif kecil dan wajar`);
  }

  // Analisis berdasarkan deskripsi keperluan
  const urgentKeywords = ['darurat', 'mendesak', 'segera', 'perbaikan besar', 'renovasi'];
  const normalKeywords = ['bulanan', 'rutin', 'pembelian bahan', 'gaji', 'operasional'];
  const riskyKeywords = ['besar', 'oven', 'steamer', 'renovasi', 'ventilasi'];

  if (urgentKeywords.some(k => keperluan.includes(k))) {
    score += 2;
    reasons.push('Mengandung indikasi kebutuhan darurat/mendesak');
  }
  if (normalKeywords.some(k => keperluan.includes(k))) {
    score -= 1;
    reasons.push('Termasuk kategori pengeluaran rutin');
  }
  if (riskyKeywords.some(k => keperluan.includes(k))) {
    score += 1;
    reasons.push('Mencakup item bernilai tinggi yang perlu verifikasi');
  }

  // Batasi skor 1-10
  score = Math.max(1, Math.min(10, score));

  const reason = reasons.length > 0
    ? reasons.join('. ') + `. Dapur: ${kitchenName}.`
    : `Permintaan dari ${kitchenName} dengan nominal Rp ${nominal.toLocaleString('id-ID')} terlihat wajar berdasarkan deskripsi.`;

  return { score, reason };
}

// ── Smart Fallback: Analisis cashflow berdasarkan data ──
function smartAnalyzeCashflow(summary, txns) {
  const totalIn = Number(summary.totalIn);
  const totalOut = Number(summary.totalOut);
  const balance = totalIn - totalOut;
  const ratio = totalOut / (totalIn || 1);

  // Analisis kebocoran
  let kebocoran = '';
  const highExpenses = txns
    .filter(t => t.type === 'out')
    .sort((a, b) => Number(b.nominal) - Number(a.nominal))
    .slice(0, 3);

  if (ratio > 0.85) {
    kebocoran = `Rasio pengeluaran terhadap pemasukan sangat tinggi (${(ratio * 100).toFixed(1)}%). `;
    kebocoran += `Pengeluaran terbesar: ${highExpenses.map(t => `${t.keterangan} (Rp ${Number(t.nominal).toLocaleString('id-ID')})`).join(', ')}. `;
    kebocoran += `Perlu diwaspadai agar tidak terjadi defisit anggaran.`;
  } else if (ratio > 0.65) {
    kebocoran = `Rasio pengeluaran terhadap pemasukan berada di level menengah (${(ratio * 100).toFixed(1)}%). `;
    kebocoran += `Tidak terdeteksi kebocoran signifikan, namun pengeluaran terbesar patut diperhatikan: ${highExpenses.slice(0, 2).map(t => t.keterangan).join(', ')}.`;
  } else {
    kebocoran = `Rasio pengeluaran terhadap pemasukan dalam batas sehat (${(ratio * 100).toFixed(1)}%). Tidak ditemukan indikasi kebocoran anggaran dari data transaksi yang ada.`;
  }

  // Analisis tren pengeluaran
  const categoryMap = {};
  txns.filter(t => t.type === 'out').forEach(t => {
    const cat = t.keterangan || 'Lainnya';
    categoryMap[cat] = (categoryMap[cat] || 0) + Number(t.nominal);
  });
  const topCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  let tren = `Total pengeluaran: Rp ${totalOut.toLocaleString('id-ID')}. `;
  if (topCategories.length > 0) {
    tren += `Pengeluaran tertinggi: ${topCategories.map(([k, v]) => `${k} (Rp ${Number(v).toLocaleString('id-ID')})`).join('; ')}. `;
  }
  tren += `Saldo bersih saat ini: Rp ${balance.toLocaleString('id-ID')}.`;

  // Saran
  let saran = '';
  if (ratio > 0.85) {
    saran = `Disarankan untuk mengurangi pengeluaran non-esensial dan meninjau ulang pos pengeluaran terbesar seperti ${topCategories[0]?.[0] || 'maintenance'}. Pertimbangkan negosiasi harga dengan vendor untuk pembelian bahan baku dalam jumlah besar. Prioritaskan pengeluaran yang berdampak langsung pada operasional produksi.`;
  } else if (ratio > 0.65) {
    saran = `Kondisi keuangan cukup stabil. Disarankan untuk menyisihkan dana cadangan (minimal 15% dari pemasukan) untuk kebutuhan darurat. Terus pantau pos pengeluaran tertinggi agar tidak membengkak.`;
  } else {
    saran = `Kondisi keuangan sehat dengan margin yang baik. Pertimbangkan alokasi surplus untuk pengembangan kapasitas produksi, peningkatan kualitas peralatan, atau investasi jangka panjang lainnya.`;
  }

  return { kebocoran_anggaran: kebocoran, tren_pengeluaran: tren, saran };
}

// ── Main Functions ──

async function analyzeApprovalRequest(requestData) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
      Anda adalah "AI Financial Auditor" untuk perusahaan katering MBG.
      Tugas Anda adalah menilai sebuah permintaan dana (approval request).
      
      DATA REQUEST:
      Nominal: Rp ${Number(requestData.nominal).toLocaleString('id-ID')}
      Keterangan/Deskripsi: "${requestData.keperluan}"
      Dapur: "${requestData.kitchenName}"
      Pemohon: "${requestData.requestedBy}"
      
      INSTRUKSI:
      Analisis apakah permintaan dana ini masuk akal dan wajar berdasarkan deskripsinya.
      Berikan Skor Urgensi dari 1 sampai 10 (1 = sangat aman/wajar, 10 = sangat tidak wajar/mencurigakan/butuh investigasi).
      Berikan juga alasan singkat (1-2 kalimat) mengapa Anda memberikan skor tersebut.
      
      PENTING:
      Keluarkan output HANYA dalam format JSON valid (tanpa backticks markdown atau teks lain).
      Contoh format:
      {
        "score": 5,
        "reason": "Alasan singkat di sini."
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Clean markdown blocks if present
    if (text.startsWith('```json')) text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    if (text.startsWith('```')) text = text.replace(/```/g, '').trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Error analyzing approval request:', error.message);
    // Smart fallback berbasis data
    return smartAnalyzeApproval(requestData);
  }
}

async function analyzeCashflow(summary, txns) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Siapkan data ringkas agar token tidak kelebihan
    const recentTxns = txns.slice(0, 15).map(t => 
      `[${t.tanggal}] ${t.type === 'in' ? 'MASUK' : 'KELUAR'} Rp ${Number(t.nominal).toLocaleString('id-ID')} - ${t.keterangan}`
    ).join('\n');

    const prompt = `
      Anda adalah "AI Financial Auditor" untuk perusahaan katering MBG.
      Tugas Anda adalah meninjau laporan arus kas (cashflow) sepekan terakhir.
      
      SUMMARY:
      Total Pemasukan: Rp ${Number(summary.totalIn).toLocaleString('id-ID')}
      Total Pengeluaran: Rp ${Number(summary.totalOut).toLocaleString('id-ID')}
      Saldo Bersih: Rp ${Number(summary.balance).toLocaleString('id-ID')}
      
      TRANSAKSI TERBARU (Maks 15):
      ${recentTxns}
      
      INSTRUKSI:
      Analisis KETAT berdasarkan data SUMMARY dan TRANSAKSI TERBARU di atas. 
      JANGAN menggunakan asumsi di luar data yang diberikan.
      Deteksi apakah ada kebocoran anggaran dari data transaksi yang ada, cari tren pengeluaran tertinggi berdasarkan transaksi di atas, dan berikan saran penghematan atau strategi keuangan ke depannya.
      Jawab dalam format narasi singkat, profesional, namun mudah dipahami.
      
      PENTING:
      Keluarkan output HANYA dalam format JSON valid (tanpa backticks markdown atau teks lain).
      Gunakan format persis seperti di bawah ini:
      {
        "kebocoran_anggaran": "Analisis Anda mengenai kebocoran anggaran...",
        "tren_pengeluaran": "Analisis Anda mengenai tren pengeluaran tertinggi...",
        "saran": "Saran penghematan Anda..."
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    if (text.startsWith('```json')) text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    if (text.startsWith('```')) text = text.replace(/```/g, '').trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Error analyzing cashflow:', error.message);
    // Smart fallback berbasis data
    return smartAnalyzeCashflow(summary, txns);
  }
}

module.exports = {
  analyzeApprovalRequest,
  analyzeCashflow
};
