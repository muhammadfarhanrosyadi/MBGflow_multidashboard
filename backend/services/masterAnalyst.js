/**
 * masterAnalyst.js
 * Service: "Master SCM Analyst AI"
 * Panggil Gemini API jika GEMINI_API_KEY tersedia, fallback ke rule-based jika tidak.
 */

const SYSTEM_PROMPT = `Anda adalah "Master SCM Analyst AI" yang terintegrasi dalam platform SCM MBG. Tugas utama Anda adalah memberikan analisis instan, temuan masalah, dan solusi strategis berdasarkan data yang dikirimkan.

=== PROSEDUR ANALISIS (WAJIB DIPATUHI) ===
1. DATA BOUNDARY (BATASAN DATA): Anda HANYA diperbolehkan menganalisis data yang ada dalam payload JSON yang dikirimkan (tableData dan chartData). Dilarang keras mengarang data atau menggunakan informasi di luar konteks yang diberikan.
2. KONTEKSTUAL MODUL: Sesuaikan gaya analisis Anda dengan modul yang sedang dibuka (misal: Jika modul Logistik, fokus pada pengiriman. Jika Dashboard Utama, fokus pada ringkasan lintas modul).
3. IDENTIFIKASI ANOMALI: Cari angka yang tidak wajar, tren yang menurun pada grafik, atau status "Kritis/Habis" pada tabel data.

=== STRUKTUR OUTPUT (PENTING UNTUK UI) ===
Berikan jawaban HANYA dalam format JSON dengan struktur berikut (tidak ada teks di luar JSON):
{
  "kesimpulan": "teks singkat 2-3 kalimat tentang kondisi modul saat ini",
  "temuanMasalah": ["poin 1 spesifik dari data", "poin 2", "poin 3 (jika ada)"],
  "analisisAI": "paragraf analisis logis 2-3 kalimat tentang pola dan penyebab",
  "solusiStrategis": ["langkah konkret 1", "langkah konkret 2", "langkah konkret 3 (jika ada)"],
  "confidenceScore": 85
}

=== BAHASA & TONE ===
Gunakan bahasa Indonesia yang profesional, tegas, dan solutif. Gunakan istilah teknis SCM (seperti 'safety stock', 'lead time', 'bottleneck') secara tepat namun tetap mudah dimengerti.

=== JIKA DATA KOSONG ===
Jika payload data kosong, kembalikan JSON dengan kesimpulan: "Data tidak tersedia untuk dianalisis."`;

// ─── Gemini API Call ──────────────────────────────────────────────────────────
async function callGemini(userMessage) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('NO_API_KEY');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.3,
      maxOutputTokens: 1024,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return JSON.parse(rawText);
}

// ─── Rule-Based Fallback Analyzer ────────────────────────────────────────────
function ruleBasedAnalysis(moduleName, moduleLabel, tableData, chartData) {
  // Deteksi anomali dari tableData
  const anomalies = [];
  const solutions = [];

  if (tableData && tableData.length > 0) {
    tableData.forEach(row => {
      const vals = Object.values(row).map(v => String(v).toLowerCase());
      if (vals.some(v => /(kritis|critical|offline|habis)/i.test(v))) {
        const label = Object.values(row)[1] || Object.values(row)[0];
        anomalies.push(`⚠️ Item "${label}" berada dalam status KRITIS — membutuhkan tindakan segera.`);
      }
      if (vals.some(v => /(warning|rendah|delayed|terlambat)/i.test(v))) {
        const label = Object.values(row)[1] || Object.values(row)[0];
        anomalies.push(`⚡ Item "${label}" menunjukkan tanda peringatan — perlu dipantau.`);
      }
    });

    // Jika tidak ada anomali eksplisit, ambil nilai terendah dari field numerik
    if (anomalies.length === 0) {
      anomalies.push(`📊 Data ${tableData.length} record berhasil diidentifikasi pada modul ${moduleLabel}.`);
    }
  }

  // Deteksi tren dari chartData
  let trendNote = '';
  if (chartData && chartData.length >= 2) {
    const keys = Object.keys(chartData[0]).filter(k => typeof chartData[0][k] === 'number');
    if (keys.length > 0) {
      const key = keys[0];
      const first = chartData[0][key];
      const last = chartData[chartData.length - 1][key];
      const delta = last - first;
      const pct = first !== 0 ? Math.round((delta / first) * 100) : 0;
      trendNote = delta >= 0
        ? `Tren "${key}" dalam grafik menunjukkan kenaikan +${pct}% dari periode awal ke akhir.`
        : `Tren "${key}" dalam grafik menunjukkan penurunan ${pct}% — ini adalah sinyal perlu investigasi.`;
    }
  }

  // Build solusi berdasarkan modul
  const moduleSolutions = {
    produksi: [
      'Lakukan audit kapasitas dapur yang berada di bawah target dan identifikasi bottleneck peralatan.',
      'Redistribusikan order dari dapur dengan kapasitas rendah ke dapur dengan slack kapasitas tinggi.',
      'Jadwalkan maintenance preventif untuk mencegah downtime tidak terduga pada shift sibuk.',
    ],
    'bahan-baku': [
      'Terapkan sistem safety stock minimum 20% dari rata-rata konsumsi harian untuk bahan kritis.',
      'Aktifkan Purchase Order otomatis saat stok menyentuh reorder point untuk mempersingkat lead time.',
      'Diversifikasi pemasok untuk bahan baku kritis guna memitigasi risiko ketergantungan single-vendor.',
    ],
    'menu-planning': [
      'Gunakan data prediksi demand AI untuk pre-purchase bahan 3 hari sebelum tanggal produksi.',
      'Evaluasi margin menu dengan popularitas rendah dan pertimbangkan substitusi atau penghapusan dari roster.',
      'Sinkronisasi jadwal produksi dapur dengan forecast permintaan mingguan dari sistem AI.',
    ],
    logistik: [
      'Optimalkan waktu keberangkatan armada berdasarkan pola kemacetan historis di setiap rute.',
      'Aktifkan rute alternatif dinamis untuk armada yang memasuki area dengan traffic tinggi.',
      'Lakukan evaluasi SLA pengiriman mingguan dan berikan insentif driver untuk on-time delivery.',
    ],
    tracking: [
      'Wajibkan check-in GPS setiap 30 menit untuk semua armada aktif dan kirim alert jika offline >15 menit.',
      'Pastikan setiap armada dilengkapi power bank eksternal untuk menjamin uptime tracker selama shift penuh.',
      'Lakukan audit perangkat tracker bulanan dan ganti unit dengan baterai di bawah 30% kapasitas.',
    ],
    dashboard: [
      'Prioritaskan penanganan item berstatus KRITIS di semua modul dalam 24 jam ke depan.',
      'Lakukan sinkronisasi data lintas modul setiap 4 jam untuk memastikan akurasi KPI real-time.',
      'Jadwalkan review mingguan dengan kepala setiap modul berdasarkan temuan anomali dari laporan ini.',
    ],
    karyawan: [
      'Lakukan offboarding segera pada karyawan yang sudah tidak aktif (Terminated).',
      'Evaluasi beban kerja dan jadwalkan rekrutmen jika rasio Juru Masak per dapur tidak seimbang.',
      'Segera selesaikan pembayaran gaji untuk karyawan yang belum dibayar bulan ini.',
    ],
    keuangan: [
      'Prioritaskan approval permintaan dana yang berstatus Pending untuk kelancaran operasional.',
      'Lakukan audit pada dapur dengan pengeluaran terbesar untuk memitigasi over-budgeting.',
      'Seimbangkan cash flow dengan mengalokasikan pendapatan distribusi ke investasi alat dapur.',
    ],
  };

  solutions.push(...(moduleSolutions[moduleName] || moduleSolutions['dashboard']));

  const criticalCount = anomalies.filter(a => a.includes('KRITIS')).length;
  const warningCount = anomalies.filter(a => a.includes('peringatan')).length;
  const score = Math.max(65, 95 - (criticalCount * 12) - (warningCount * 5));

  return {
    kesimpulan: `Modul ${moduleLabel} menampilkan ${tableData?.length ?? 0} record data dengan ${criticalCount} item kritis dan ${warningCount} item peringatan. ${trendNote} Diperlukan tindakan segera pada item berstatus kritis untuk menjaga kelancaran operasional.`,
    temuanMasalah: anomalies.slice(0, 4),
    analisisAI: `Berdasarkan pola data yang teridentifikasi, ${criticalCount > 0 ? 'terdapat bottleneck operasional yang membutuhkan intervensi segera' : 'kondisi operasional masih dalam batas yang dapat dikelola'}. ${trendNote} Pola ini menunjukkan bahwa ${criticalCount > 0 ? 'sistem membutuhkan optimasi proses dan alokasi sumber daya yang lebih baik' : 'proses berjalan relatif stabil namun tetap memerlukan pemantauan rutin'}.`,
    solusiStrategis: solutions,
    confidenceScore: score,
    source: 'rule-based',
  };
}

// ─── Main Exported Function ───────────────────────────────────────────────────
async function analyzeModuleData({ moduleName, moduleLabel, tableData, chartData }) {
  // Validasi payload
  if (!tableData && !chartData) {
    return {
      kesimpulan: 'Data tidak tersedia untuk dianalisis.',
      temuanMasalah: [],
      analisisAI: 'Maaf Master Admin, data untuk modul ini belum tersedia atau tidak lengkap untuk dianalisis.',
      solusiStrategis: [],
      confidenceScore: 0,
      source: 'empty',
    };
  }

  const userMessage = `
Modul: ${moduleLabel} (ID: ${moduleName})
Tanggal analisis: ${new Date().toLocaleString('id-ID')}

=== DATA GRAFIK (chartData) ===
${JSON.stringify(chartData, null, 2)}

=== DATA TABEL (tableData) ===
${JSON.stringify(tableData, null, 2)}

Analisis data di atas sesuai prosedur yang telah ditetapkan.
  `.trim();

  try {
    console.log(`[AI Analyst] Mencoba Gemini API untuk modul: ${moduleName}`);
    const result = await callGemini(userMessage);
    return { ...result, source: 'gemini' };
  } catch (err) {
    if (err.message === 'NO_API_KEY') {
      console.log(`[AI Analyst] GEMINI_API_KEY tidak ditemukan — menggunakan rule-based fallback.`);
    } else {
      console.warn(`[AI Analyst] Gemini API gagal: ${err.message} — fallback ke rule-based.`);
    }
    return ruleBasedAnalysis(moduleName, moduleLabel, tableData, chartData);
  }
}

module.exports = { analyzeModuleData };
