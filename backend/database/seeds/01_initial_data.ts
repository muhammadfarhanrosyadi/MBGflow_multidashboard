import type { Knex } from "knex";
import crypto from "crypto";

// ================================================================
// Seed: Comprehensive data for ALL tables
// Data seeder lengkap untuk integrasi dashboard ↔ database
// ================================================================

export async function seed(knex: Knex): Promise<void> {
  // ── Clear all tables in reverse dependency order ──
  await knex("delivery_items").del();
  await knex("production_details").del();
  await knex("raw_material_stock").del();
  await knex("finance_requests").del();
  await knex("salary_payments").del();
  await knex("cashflow_transactions").del();
  await knex("logistics").del();
  await knex("productions").del();
  await knex("menus").del();
  await knex("raw_materials").del();
  await knex("employees").del();
  await knex("kitchens").del();
  await knex("suppliers").del();
  await knex("sppg").del();
  await knex("users").del();

  // ── Helper: generate dates relative to today ──
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  const getWeekday = (offset: number): Date => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + offset);
    return d;
  };

  // ================================================================
  // LAYER 0: Master tables
  // ================================================================

  // ── 1. Users ──
  const adminId = crypto.randomUUID();
  const financeUserId = crypto.randomUUID();
  const normalUserId = crypto.randomUUID();
  await knex("users").insert([
    {
      id: adminId,
      name: "Master Admin SCM",
      email: "admin@mbg.id",
      password_hash: "admin123",
      role: "master_admin",
      status: "active",
    },
    {
      id: financeUserId,
      name: "Finance Manager",
      email: "finance@mbg.id",
      password_hash: "dummyhash",
      role: "finance",
      status: "active",
    },
    {
      id: normalUserId,
      name: "Pengguna Biasa",
      email: "user@mbg.id",
      password_hash: "user123",
      role: "user",
      status: "active",
    },
  ]);

  // ── 2. SPPG ──
  const sppgId = crypto.randomUUID();
  await knex("sppg").insert([
    {
      id: sppgId,
      name: "PT MBG Pusat",
      owner_name: "Direktur Utama",
      owner_phone: "081234567890",
      owner_email: "direktur@mbg.id",
      address: "Jl. Sudirman No. 1, Jakarta Pusat",
      status: "active",
      contract_start: "2026-01-01",
      contract_end: "2027-12-31",
    },
  ]);

  // ── 3. Suppliers ──
  const supplierId1 = crypto.randomUUID();
  const supplierId2 = crypto.randomUUID();
  const supplierId3 = crypto.randomUUID();
  const supplierId4 = crypto.randomUUID();
  const supplierId5 = crypto.randomUUID();
  const supplierId6 = crypto.randomUUID();

  await knex("suppliers").insert([
    { id: supplierId1, name: "CV Bumi Tani", contact_person: "Pak Hadi", phone: "081200001111", email: "bumitani@supplier.id", address: "Jl. Raya Subang No.12", city: "Subang", status: "active", rating: 4.50 },
    { id: supplierId2, name: "PT Sari Mas", contact_person: "Ibu Sari", phone: "081200002222", email: "sarimas@supplier.id", address: "Jl. Industri Blok A3", city: "Surabaya", status: "active", rating: 4.20 },
    { id: supplierId3, name: "CV Ternak Sehat", contact_person: "Pak Agus", phone: "081200003333", email: "ternaksehat@supplier.id", address: "Jl. Peternakan No.8", city: "Bogor", status: "active", rating: 4.70 },
    { id: supplierId4, name: "UD Tahu Jaya", contact_person: "Bu Yuni", phone: "081200004444", email: "tahujaya@supplier.id", address: "Jl. Tahu Sumedang No.5", city: "Sumedang", status: "active", rating: 3.90 },
    { id: supplierId5, name: "Pasar Induk JAKA", contact_person: "Pak Dedi", phone: "081200005555", email: "pasarjaka@supplier.id", address: "Jl. Pasar Induk Kramat Jati", city: "Jakarta", status: "active", rating: 4.10 },
    { id: supplierId6, name: "PT Bumbu Nusantara", contact_person: "Ibu Ratna", phone: "081200006666", email: "bumbunusantara@supplier.id", address: "Jl. Rempah No.22", city: "Bandung", status: "active", rating: 4.60 },
  ]);

  // ================================================================
  // LAYER 1: Tables with FK to Layer 0
  // ================================================================

  // ── 4. Kitchens ──
  const kitchens = [
    { id: "K01", sppg_id: sppgId, name: "Dapur Jakarta Pusat", city: "Jakarta", region: "DKI Jakarta", capacity: 500, status: "active" as const },
    { id: "K02", sppg_id: sppgId, name: "Dapur Bandung", city: "Bandung", region: "Jawa Barat", capacity: 500, status: "active" as const },
    { id: "K03", sppg_id: sppgId, name: "Dapur Surabaya", city: "Surabaya", region: "Jawa Timur", capacity: 400, status: "active" as const },
    { id: "K04", sppg_id: sppgId, name: "Dapur Yogyakarta", city: "Yogyakarta", region: "DIY", capacity: 400, status: "active" as const },
    { id: "K05", sppg_id: sppgId, name: "Dapur Semarang", city: "Semarang", region: "Jawa Tengah", capacity: 400, status: "active" as const },
    { id: "K06", sppg_id: sppgId, name: "Dapur Cimahi", city: "Cimahi", region: "Jawa Barat", capacity: 500, status: "maintenance" as const },
  ];
  await knex("kitchens").insert(kitchens);

  // ── 5. Raw Materials ──
  const rmBeras     = crypto.randomUUID();
  const rmMinyak    = crypto.randomUUID();
  const rmAyam      = crypto.randomUUID();
  const rmTahu      = crypto.randomUUID();
  const rmSayuran   = crypto.randomUUID();
  const rmBumbu     = crypto.randomUUID();
  const rmTelur     = crypto.randomUUID();
  const rmMie       = crypto.randomUUID();

  await knex("raw_materials").insert([
    { id: rmBeras,   supplier_id: supplierId1, name: "Beras Premium",     unit: "kg",  price_per_unit: 14000, category: "Bahan Pokok" },
    { id: rmMinyak,  supplier_id: supplierId2, name: "Minyak Goreng",     unit: "ltr", price_per_unit: 18000, category: "Minyak" },
    { id: rmAyam,    supplier_id: supplierId3, name: "Ayam Potong",       unit: "kg",  price_per_unit: 38000, category: "Lauk Pauk" },
    { id: rmTahu,    supplier_id: supplierId4, name: "Tahu",              unit: "pcs", price_per_unit: 1500,  category: "Lauk Pauk" },
    { id: rmSayuran, supplier_id: supplierId5, name: "Sayuran Segar",     unit: "kg",  price_per_unit: 12000, category: "Sayuran" },
    { id: rmBumbu,   supplier_id: supplierId6, name: "Bumbu Rempah",      unit: "kg",  price_per_unit: 45000, category: "Bumbu" },
    { id: rmTelur,   supplier_id: supplierId3, name: "Telur Ayam",        unit: "kg",  price_per_unit: 28000, category: "Lauk Pauk" },
    { id: rmMie,     supplier_id: supplierId2, name: "Mie Kering",        unit: "kg",  price_per_unit: 16000, category: "Bahan Pokok" },
  ]);

  // ================================================================
  // LAYER 2: Transactional tables
  // ================================================================

  // ── 6. Menus ──
  const menuNasiGoreng = crypto.randomUUID();
  const menuNasiKuning = crypto.randomUUID();
  const menuAyamBakar  = crypto.randomUUID();
  const menuMieGoreng  = crypto.randomUUID();
  const menuGadoGado   = crypto.randomUUID();
  const menuSotoAyam   = crypto.randomUUID();

  await knex("menus").insert([
    { id: menuNasiGoreng, name: "Nasi Goreng Spesial", category: "Nasi",    cost_per_portion: 8500,  sell_price: 18000, is_active: true,  description: "Nasi goreng dengan bumbu rahasia dan topping lengkap" },
    { id: menuNasiKuning, name: "Nasi Kuning",         category: "Nasi",    cost_per_portion: 7200,  sell_price: 15000, is_active: true,  description: "Nasi kuning dengan lauk ayam suwir dan sambal" },
    { id: menuAyamBakar,  name: "Ayam Bakar Madu",     category: "Lauk",    cost_per_portion: 12000, sell_price: 25000, is_active: true,  description: "Ayam bakar dengan olesan madu dan bumbu kecap" },
    { id: menuMieGoreng,  name: "Mie Goreng Jawa",     category: "Mie",     cost_per_portion: 6500,  sell_price: 14000, is_active: true,  description: "Mie goreng dengan bumbu Jawa tradisional" },
    { id: menuGadoGado,   name: "Gado-Gado Jakarta",   category: "Sayuran", cost_per_portion: 9000,  sell_price: 18000, is_active: true,  description: "Gado-gado khas Jakarta dengan bumbu kacang" },
    { id: menuSotoAyam,   name: "Soto Ayam Lamongan",  category: "Sup",     cost_per_portion: 8000,  sell_price: 16000, is_active: true,  description: "Soto ayam kuah bening ala Lamongan" },
  ]);

  // ── 7. Productions — 4 MINGGU HISTORIS, 2 SHIFT per dapur ──────────
  // Data mencakup semua 6 dapur × 7 hari × 2 shift = 84 baris per minggu
  // 4 minggu = 336 baris produksi + skenario kritis & normal
  const productionIds: string[] = [];
  const prodData: any[] = [];
  const kitchenIds = ["K01", "K02", "K03", "K04", "K05", "K06"];
  const targets = [500, 500, 400, 400, 400, 500];

  // ── Shift Pagi: 4 minggu × 7 hari × 6 dapur ──────────────────────
  // K06 sangat rendah (maintenance), K03 minggu-4 gangguan peralatan
  const pagiActuals: number[][][] = [
    // Minggu 1 (minggu ini)
    [
      [480, 490, 320, 410, 370, 200],
      [485, 495, 350, 400, 380, 210],
      [490, 480, 340, 420, 390, 220],
      [475, 500, 360, 415, 375, 230],
      [495, 485, 370, 410, 385, 240],
      [500, 490, 380, 425, 395, 250],
      [450, 460, 300, 380, 350, 180],
    ],
    // Minggu 2
    [
      [470, 485, 310, 405, 360, 195],
      [488, 498, 345, 415, 385, 205],
      [482, 478, 355, 418, 378, 215],
      [478, 502, 348, 408, 368, 225],
      [490, 488, 365, 412, 388, 235],
      [505, 492, 375, 422, 392, 245],
      [442, 455, 295, 378, 348, 175],
    ],
    // Minggu 3
    [
      [465, 480, 305, 400, 355, 190],
      [483, 493, 340, 410, 380, 200],
      [488, 475, 350, 415, 375, 210],
      [472, 498, 344, 405, 364, 220],
      [492, 482, 362, 408, 382, 230],
      [498, 488, 372, 420, 390, 240],
      [438, 452, 290, 374, 344, 170],
    ],
    // Minggu 4 (bulan lalu — ada insiden)
    [
      [455, 470, 280, 395, 340, 170],
      [478, 485, 330, 405, 375, 190],
      [460, 470, 185, 410, 365, 180], // K03 sangat rendah — gangguan kompor
      [468, 490, 335, 400, 360, 200],
      [485, 482, 355, 406, 378, 210],
      [492, 485, 368, 418, 388, 220],
      [432, 448, 288, 370, 340, 165],
    ],
  ];

  // ── Shift Siang: target 60% dari shift pagi ──────────────────────
  const siangActuals: number[][][] = [
    [
      [280, 275, 195, 240, 215, 110],
      [285, 280, 205, 245, 220, 115],
      [290, 270, 200, 250, 225, 120],
      [275, 285, 210, 243, 218, 125],
      [288, 278, 215, 242, 222, 130],
      [295, 282, 220, 250, 228, 135],
      [260, 262, 178, 225, 205, 100],
    ],
    [
      [275, 270, 190, 238, 212, 108],
      [282, 278, 200, 243, 218, 113],
      [287, 268, 198, 248, 222, 118],
      [272, 282, 208, 240, 215, 123],
      [285, 275, 212, 240, 220, 128],
      [292, 280, 218, 248, 225, 133],
      [255, 258, 175, 222, 202, 98],
    ],
    [
      [272, 268, 188, 236, 210, 106],
      [280, 275, 198, 240, 215, 110],
      [285, 265, 196, 245, 218, 115],
      [270, 280, 205, 238, 212, 120],
      [282, 272, 210, 238, 218, 125],
      [288, 277, 216, 246, 222, 130],
      [252, 255, 172, 220, 200, 96],
    ],
    [
      [268, 264, 165, 233, 200, 100],
      [276, 272, 195, 238, 212, 108],
      [265, 268, 110, 240, 215, 110], // K03 drop besar
      [270, 278, 198, 236, 210, 118],
      [280, 270, 208, 238, 215, 122],
      [285, 274, 215, 244, 220, 128],
      [248, 252, 170, 218, 198, 94],
    ],
  ];

  const siangTargets = targets.map(t => Math.floor(t * 0.6));

  // Generate for 12 weeks instead of 4 to provide deeper historical data
  for (let week = 0; week < 12; week++) {
    for (let day = 0; day < 7; day++) {
      // Hitung tanggal: mundur dari senin minggu ini
      const prodDate = new Date(monday);
      prodDate.setDate(monday.getDate() - week * 7 + day);

      for (let k = 0; k < 6; k++) {
        // Reuse the 4-week pattern for the 12 weeks
        const patternWeek = week % 4;
        const pagiActual = pagiActuals[patternWeek][day][k];
        const pagiTarget = targets[k];
        const isCurrentWeek = week === 0;
        const isTodayOrFuture = isCurrentWeek && day >= (today.getDay() === 0 ? 6 : today.getDay() - 1);
        const isPagiKritis = pagiActual / pagiTarget < 0.5;

        // Shift Pagi
        const pagiId = crypto.randomUUID();
        productionIds.push(pagiId);
        prodData.push({
          id: pagiId,
          kitchen_id: kitchenIds[k],
          production_date: prodDate,
          shift: "Pagi",
          target_portions: pagiTarget,
          actual_portions: pagiActual,
          status: isTodayOrFuture && k === 5 ? "In Progress"
            : isTodayOrFuture ? "Planned"
            : "Completed",
          notes:
            k === 5
              ? "Dapur dalam pemeliharaan — kapasitas terbatas"
              : (week === 3 && k === 2 && day === 2)
              ? "Gangguan kompor utama — produksi terhenti sementara. Tim teknisi diterjunkan."
              : isPagiKritis
              ? "Efisiensi sangat rendah — investigasi segera diperlukan"
              : null,
        });

        // Shift Siang
        const siangActual = siangActuals[patternWeek][day][k];
        const siangTarget = siangTargets[k];
        const siangId = crypto.randomUUID();
        productionIds.push(siangId);
        prodData.push({
          id: siangId,
          kitchen_id: kitchenIds[k],
          production_date: prodDate,
          shift: "Siang",
          target_portions: siangTarget,
          actual_portions: siangActual,
          status: isTodayOrFuture ? "Planned" : "Completed",
          notes:
            k === 5
              ? "Shift siang dibatasi akibat maintenance"
              : (week === 3 && k === 2 && day === 2)
              ? "Shift siang terdampak gangguan kompor"
              : siangActual < siangTarget * 0.7
              ? "Efisiensi siang di bawah target"
              : null,
        });
      }
    }
  }

  await knex("productions").insert(prodData);

  // ── 8. Logistics (dengan waktu realistis) ──
  const logIds: string[] = [];
  const now = new Date();
  const logData = [
    {
      kitchen_id: "K01", fleet_code: "JKT-A01", driver_name: "Budi Santoso",   driver_phone: "081300001111",
      route: "Jakarta → Depok",        status: "On Route",
      load_percentage: 95, vehicle_lat: -6.2088, vehicle_lon: 106.8456, battery_level: 82,
      departure_at: new Date(now.getTime() - 2 * 3600000),
      estimated_arrival_at: new Date(now.getTime() + 1 * 3600000),
      actual_arrival_at: null,
      last_gps_update: new Date(now.getTime() - 2 * 60000),
    },
    {
      kitchen_id: "K02", fleet_code: "BDG-B02", driver_name: "Dani Wijaya",    driver_phone: "081300002222",
      route: "Bandung → Cimahi",       status: "Delivered",
      load_percentage: 100, vehicle_lat: -6.9175, vehicle_lon: 107.6191, battery_level: 61,
      departure_at: new Date(now.getTime() - 5 * 3600000),
      estimated_arrival_at: new Date(now.getTime() - 3 * 3600000),
      actual_arrival_at: new Date(now.getTime() - 2.5 * 3600000),
      last_gps_update: new Date(now.getTime() - 5 * 60000),
    },
    {
      kitchen_id: "K03", fleet_code: "SBY-C01", driver_name: "Anton Setiawan", driver_phone: "081300003333",
      route: "Surabaya → Malang",      status: "Delayed",
      load_percentage: 88, vehicle_lat: -7.2575, vehicle_lon: 112.7521, battery_level: 45,
      departure_at: new Date(now.getTime() - 4 * 3600000),
      estimated_arrival_at: new Date(now.getTime() + 2 * 3600000),
      actual_arrival_at: null,
      last_gps_update: new Date(now.getTime() - 1 * 60000),
    },
    {
      kitchen_id: "K01", fleet_code: "JKT-A03", driver_name: "Rudi Hartono",   driver_phone: "081300004444",
      route: "Jakarta → Bekasi",       status: "Loading",
      load_percentage: 60, vehicle_lat: -6.2350, vehicle_lon: 106.9900, battery_level: 12,
      departure_at: null,
      estimated_arrival_at: new Date(now.getTime() + 3 * 3600000),
      actual_arrival_at: null,
      last_gps_update: new Date(now.getTime() - 120 * 60000),
    },
    {
      kitchen_id: "K04", fleet_code: "YGY-D01", driver_name: "Siti Rahayu",    driver_phone: "081300005555",
      route: "Yogyakarta → Klaten",    status: "On Route",
      load_percentage: 100, vehicle_lat: -7.7972, vehicle_lon: 110.3688, battery_level: 73,
      departure_at: new Date(now.getTime() - 1.5 * 3600000),
      estimated_arrival_at: new Date(now.getTime() + 0.5 * 3600000),
      actual_arrival_at: null,
      last_gps_update: new Date(now.getTime() - 30000),
    },
    {
      kitchen_id: "K05", fleet_code: "SMG-E02", driver_name: "Hendra Kurnia",  driver_phone: "081300006666",
      route: "Semarang → Kudus",       status: "Idle",
      load_percentage: 0, vehicle_lat: -6.9932, vehicle_lon: 110.4203, battery_level: 90,
      departure_at: null,
      estimated_arrival_at: null,
      actual_arrival_at: null,
      last_gps_update: new Date(now.getTime() - 18 * 60000),
    },
    {
      kitchen_id: "K02", fleet_code: "BDG-B03", driver_name: "Eko Prasetyo",   driver_phone: "081300007777",
      route: "Bandung → Garut",        status: "On Route",
      load_percentage: 92, vehicle_lat: -7.0500, vehicle_lon: 107.7500, battery_level: 55,
      departure_at: new Date(now.getTime() - 3 * 3600000),
      estimated_arrival_at: new Date(now.getTime() + 1.5 * 3600000),
      actual_arrival_at: null,
      last_gps_update: new Date(now.getTime() - 3 * 60000),
    },
    {
      kitchen_id: "K04", fleet_code: "YGY-D02", driver_name: "Maya Sari",      driver_phone: "081300008888",
      route: "Yogyakarta → Solo",      status: "Delivered",
      load_percentage: 100, vehicle_lat: -7.5755, vehicle_lon: 110.8243, battery_level: 38,
      departure_at: new Date(now.getTime() - 6 * 3600000),
      estimated_arrival_at: new Date(now.getTime() - 4 * 3600000),
      actual_arrival_at: new Date(now.getTime() - 3.5 * 3600000),
      last_gps_update: new Date(now.getTime() - 10 * 60000),
    },
  ];

  // Duplikasi logData untuk memberikan riwayat yang lebih panjang
  for (let i = 0; i < 30; i++) {
    for (const l of logData) {
      const id = crypto.randomUUID();
      logIds.push(id);
      
      const dayOffset = Math.floor(Math.random() * 90); // Sebar di 90 hari terakhir
      const timeOffset = dayOffset * 24 * 3600 * 1000;
      
      await knex("logistics").insert({
        id,
        kitchen_id: l.kitchen_id,
        fleet_code: l.fleet_code,
        driver_name: l.driver_name,
        driver_phone: l.driver_phone,
        route: l.route,
        status: dayOffset > 0 ? "Delivered" : l.status, // Data lampau selalu delivered
        load_percentage: l.load_percentage,
        vehicle_lat: l.vehicle_lat,
        vehicle_lon: l.vehicle_lon,
        battery_level: l.battery_level,
        departure_at: l.departure_at ? new Date(l.departure_at.getTime() - timeOffset) : null,
        estimated_arrival_at: l.estimated_arrival_at ? new Date(l.estimated_arrival_at.getTime() - timeOffset) : null,
        actual_arrival_at: (dayOffset > 0 && l.departure_at) ? new Date(l.departure_at.getTime() - timeOffset + 2 * 3600 * 1000) : l.actual_arrival_at,
        last_gps_update: l.last_gps_update ? new Date(l.last_gps_update.getTime() - timeOffset) : null,
      });
    }
  }

  // ── 9. Employees (14 karyawan di 6 dapur) ──
  const empIds: string[] = [];
  const employeeData = [
    { kitchen_id: "K01", name: "Sari Indah",       email: "sari@mbg.id",    role: "Ahli Gizi",  salary: 5500000, status: "active",   paid_this_month: false },
    { kitchen_id: "K01", name: "Budi Santoso",     email: "budi@mbg.id",    role: "Driver",      salary: 4200000, status: "active",   paid_this_month: true },
    { kitchen_id: "K01", name: "Dewi Kusuma",      email: "dewi@mbg.id",    role: "Juru Masak",  salary: 4800000, status: "active",   paid_this_month: false },
    { kitchen_id: "K02", name: "Asep Nugraha",     email: "asep@mbg.id",    role: "Juru Masak",  salary: 4800000, status: "on_leave", paid_this_month: false },
    { kitchen_id: "K02", name: "Rina Marlina",     email: "rina@mbg.id",    role: "Ahli Gizi",  salary: 5500000, status: "active",   paid_this_month: true },
    { kitchen_id: "K02", name: "Dani Wijaya",      email: "dani@mbg.id",    role: "Driver",      salary: 4200000, status: "active",   paid_this_month: false },
    { kitchen_id: "K03", name: "Agus Pratama",     email: "agus@mbg.id",    role: "Juru Masak",  salary: 4800000, status: "active",   paid_this_month: false },
    { kitchen_id: "K03", name: "Lina Suryani",     email: "lina@mbg.id",    role: "Driver",      salary: 4200000, status: "active",   paid_this_month: true },
    { kitchen_id: "K04", name: "Wahyu Hidayat",    email: "wahyu@mbg.id",   role: "Juru Masak",  salary: 4800000, status: "active",   paid_this_month: false },
    { kitchen_id: "K04", name: "Nurul Aisyah",     email: "nurul@mbg.id",   role: "Ahli Gizi",  salary: 5500000, status: "active",   paid_this_month: false },
    { kitchen_id: "K05", name: "Hendra Kurnia",    email: "hendra@mbg.id",  role: "Driver",      salary: 4200000, status: "active",   paid_this_month: false },
    { kitchen_id: "K05", name: "Fitri Handayani",  email: "fitri@mbg.id",   role: "Juru Masak",  salary: 4800000, status: "active",   paid_this_month: true },
    { kitchen_id: "K06", name: "Joko Susilo",      email: "joko@mbg.id",    role: "Juru Masak",  salary: 4800000, status: "active",   paid_this_month: false },
    { kitchen_id: "K06", name: "Mega Putri",       email: "mega@mbg.id",    role: "Ahli Gizi",  salary: 5500000, status: "active",   paid_this_month: false },
  ];

  for (const emp of employeeData) {
    const id = crypto.randomUUID();
    empIds.push(id);
    const joinDate = new Date(Date.now() - Math.floor(Math.random() * 365 * 86400000));
    await knex("employees").insert({ id, ...emp, created_at: joinDate, updated_at: joinDate });
  }

  await knex("finance_requests").insert([
    { id: crypto.randomUUID(), kitchen_id: "K01", requested_by: adminId, amount: 2500000, description: "Pembelian bahan baku darurat (beras & minyak)", status: "pending", created_at: new Date(Date.now() - 2 * 86400000) },
    { id: crypto.randomUUID(), kitchen_id: "K02", requested_by: adminId, amount: 1800000, description: "Perbaikan kompor dan peralatan masak", status: "pending", created_at: new Date(Date.now() - 5 * 86400000) },
    { id: crypto.randomUUID(), kitchen_id: "K03", requested_by: adminId, amount: 3200000, description: "Pengadaan alat pengemas baru", status: "approved", approved_at: new Date(Date.now() - 10 * 86400000), created_at: new Date(Date.now() - 15 * 86400000) },
    { id: crypto.randomUUID(), kitchen_id: "K04", requested_by: financeUserId, amount: 1500000, description: "Pembelian bahan bumbu rempah bulanan", status: "approved", approved_at: new Date(Date.now() - 20 * 86400000), created_at: new Date(Date.now() - 22 * 86400000) },
    { id: crypto.randomUUID(), kitchen_id: "K05", requested_by: adminId, amount: 4200000, description: "Renovasi dapur dan perbaikan ventilasi", status: "pending", created_at: new Date(Date.now() - 30 * 86400000) },
    { id: crypto.randomUUID(), kitchen_id: "K06", requested_by: financeUserId, amount: 8500000, description: "Perbaikan peralatan dapur besar (oven, steamer)", status: "rejected", created_at: new Date(Date.now() - 40 * 86400000) },
  ]);

  // ── 11. Cashflow Transactions ──
  const cashflowData = [
    { kitchen_id: "K01", type: "in",  amount: 18000000, description: "Pendapatan distribusi Region Jakarta",          category: "Pendapatan Distribusi",   transaction_date: getWeekday(0) },
    { kitchen_id: "K01", type: "out", amount: 9800000,  description: "Pembelian bahan baku bulanan Jakarta",          category: "Pembelian Bahan Baku",    transaction_date: getWeekday(0) },
    { kitchen_id: "K02", type: "in",  amount: 15500000, description: "Pendapatan distribusi Region Bandung",          category: "Pendapatan Distribusi",   transaction_date: getWeekday(1) },
    { kitchen_id: "K02", type: "out", amount: 7200000,  description: "Pembelian bahan baku bulanan Bandung",          category: "Pembelian Bahan Baku",    transaction_date: getWeekday(1) },
    { kitchen_id: "K03", type: "in",  amount: 12800000, description: "Pendapatan distribusi Region Surabaya",         category: "Pendapatan Distribusi",   transaction_date: getWeekday(2) },
    { kitchen_id: "K03", type: "out", amount: 6500000,  description: "Biaya operasional dan maintenance Surabaya",    category: "Biaya Operasional",       transaction_date: getWeekday(2) },
    { kitchen_id: "K04", type: "in",  amount: 11200000, description: "Pendapatan distribusi Region Yogyakarta",       category: "Pendapatan Distribusi",   transaction_date: getWeekday(3) },
    { kitchen_id: "K04", type: "out", amount: 5400000,  description: "Gaji karyawan Yogyakarta bulan ini",            category: "Gaji Karyawan",           transaction_date: getWeekday(3) },
    { kitchen_id: "K05", type: "in",  amount: 10500000, description: "Pendapatan distribusi Region Semarang",         category: "Pendapatan Distribusi",   transaction_date: getWeekday(4) },
    { kitchen_id: "K05", type: "out", amount: 4800000,  description: "Pembelian bahan baku Semarang",                 category: "Pembelian Bahan Baku",    transaction_date: getWeekday(4) },
    { kitchen_id: "K01", type: "out", amount: 3200000,  description: "Maintenance peralatan dapur Jakarta",           category: "Maintenance",             transaction_date: getWeekday(5) },
    { kitchen_id: "K06", type: "out", amount: 8500000,  description: "Perbaikan besar peralatan Cimahi",              category: "Maintenance",             transaction_date: getWeekday(2) },
    // Extra transactions untuk data yang lebih kaya
    { kitchen_id: "K01", type: "in",  amount: 5200000,  description: "Pendapatan catering event Jakarta",             category: "Pendapatan Distribusi",   transaction_date: getWeekday(3) },
    { kitchen_id: "K03", type: "out", amount: 2300000,  description: "Gaji karyawan Surabaya bulan ini",              category: "Gaji Karyawan",           transaction_date: getWeekday(4) },
    { kitchen_id: "K05", type: "in",  amount: 3800000,  description: "Pendapatan pesanan khusus Semarang",            category: "Pendapatan Distribusi",   transaction_date: getWeekday(5) },
  ];

  for (let i = 0; i < 12; i++) { // Duplikasi untuk 12 minggu
    const weekOffset = i * 7;
    for (const cf of cashflowData) {
      const txDate = new Date(cf.transaction_date);
      txDate.setDate(txDate.getDate() - weekOffset);
      
      await knex("cashflow_transactions").insert({
        id: crypto.randomUUID(),
        ...cf,
        transaction_date: txDate,
        recorded_by: adminId,
      });
    }
  }

  // ── 12. Salary Payments ──
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const paidEmpIndices = [1, 4, 7, 11];
  for (const idx of paidEmpIndices) {
    await knex("salary_payments").insert({
      id: crypto.randomUUID(),
      employee_id: empIds[idx],
      kitchen_id: employeeData[idx].kitchen_id,
      amount: employeeData[idx].salary,
      period_month: currentMonth,
      period_year: currentYear,
      status: "paid",
      paid_at: new Date(),
      paid_by: adminId,
    });
  }

  // ================================================================
  // LAYER 3: Detail / Junction tables
  // ================================================================

  // ── 13. Production Details (link productions to menus) ──
  const menuIds = [menuNasiGoreng, menuNasiKuning, menuAyamBakar, menuMieGoreng, menuGadoGado, menuSotoAyam];
  for (let i = 0; i < productionIds.length; i++) {
    // Each production has 3 menu items
    const menuSubset = [menuIds[i % 6], menuIds[(i + 1) % 6], menuIds[(i + 2) % 6]];
    const prodRow = prodData[i];
    const baseTarget = Math.floor(prodRow.target_portions / 3);
    const baseActual = Math.floor(prodRow.actual_portions / 3);
    for (let j = 0; j < menuSubset.length; j++) {
      await knex("production_details").insert({
        id: crypto.randomUUID(),
        production_id: productionIds[i],
        menu_id: menuSubset[j],
        target_portions: baseTarget + (j === 0 ? prodRow.target_portions % 3 : 0),
        actual_portions: baseActual + (j === 0 ? prodRow.actual_portions % 3 : 0),
      });
    }
  }

  // ── 14. Delivery Items (link logistics to menus) ──
  for (let i = 0; i < logIds.length; i++) {
    if (logData[i].status === "Idle") continue;
    const menuSubset = [menuIds[i % 6], menuIds[(i + 1) % 6]];
    for (const menuId of menuSubset) {
      await knex("delivery_items").insert({
        id: crypto.randomUUID(),
        logistics_id: logIds[i],
        menu_id: menuId,
        quantity: 50 + Math.floor(Math.random() * 100),
      });
    }
  }

  // ── 15. Raw Material Stock (stock per kitchen, some critical) ──
  const stockData = [
    // K01 — Jakarta Pusat
    { kitchen_id: "K01", raw_material_id: rmBeras,   current_stock: 320,  minimum_stock: 500 }, // KRITIS
    { kitchen_id: "K01", raw_material_id: rmMinyak,  current_stock: 180,  minimum_stock: 150 },
    { kitchen_id: "K01", raw_material_id: rmAyam,    current_stock: 95,   minimum_stock: 100 }, // WARNING
    { kitchen_id: "K01", raw_material_id: rmTahu,    current_stock: 250,  minimum_stock: 200 },
    { kitchen_id: "K01", raw_material_id: rmSayuran, current_stock: 80,   minimum_stock: 120 }, // KRITIS
    { kitchen_id: "K01", raw_material_id: rmBumbu,   current_stock: 45,   minimum_stock: 30 },
    { kitchen_id: "K01", raw_material_id: rmTelur,   current_stock: 60,   minimum_stock: 50 },
    { kitchen_id: "K01", raw_material_id: rmMie,     current_stock: 75,   minimum_stock: 40 },
    // K02 — Bandung
    { kitchen_id: "K02", raw_material_id: rmBeras,   current_stock: 480,  minimum_stock: 400 },
    { kitchen_id: "K02", raw_material_id: rmMinyak,  current_stock: 120,  minimum_stock: 100 },
    { kitchen_id: "K02", raw_material_id: rmAyam,    current_stock: 150,  minimum_stock: 100 },
    { kitchen_id: "K02", raw_material_id: rmSayuran, current_stock: 200,  minimum_stock: 120 },
    // K03 — Surabaya
    { kitchen_id: "K03", raw_material_id: rmBeras,   current_stock: 350,  minimum_stock: 300 },
    { kitchen_id: "K03", raw_material_id: rmMinyak,  current_stock: 60,   minimum_stock: 80 },  // WARNING
    { kitchen_id: "K03", raw_material_id: rmAyam,    current_stock: 40,   minimum_stock: 80 },  // KRITIS
    { kitchen_id: "K03", raw_material_id: rmTelur,   current_stock: 30,   minimum_stock: 40 },  // WARNING
    // K04 — Yogyakarta
    { kitchen_id: "K04", raw_material_id: rmBeras,   current_stock: 400,  minimum_stock: 300 },
    { kitchen_id: "K04", raw_material_id: rmAyam,    current_stock: 120,  minimum_stock: 80 },
    { kitchen_id: "K04", raw_material_id: rmBumbu,   current_stock: 55,   minimum_stock: 30 },
    // K05 — Semarang
    { kitchen_id: "K05", raw_material_id: rmBeras,   current_stock: 280,  minimum_stock: 300 }, // WARNING
    { kitchen_id: "K05", raw_material_id: rmMinyak,  current_stock: 90,   minimum_stock: 80 },
    { kitchen_id: "K05", raw_material_id: rmSayuran, current_stock: 50,   minimum_stock: 100 }, // KRITIS
    // K06 — Cimahi
    { kitchen_id: "K06", raw_material_id: rmBeras,   current_stock: 100,  minimum_stock: 400 }, // KRITIS (low due to maintenance)
    { kitchen_id: "K06", raw_material_id: rmMinyak,  current_stock: 30,   minimum_stock: 100 }, // KRITIS
  ];

  for (const stock of stockData) {
    await knex("raw_material_stock").insert({
      id: crypto.randomUUID(),
      ...stock,
      last_restocked_at: new Date(Date.now() - Math.floor(Math.random() * 90 * 86400000)),
    });
  }
}
