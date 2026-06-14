import type { Knex } from 'knex';

// ================================================================
// Migration: SCM MBG — Create ALL Tables
// Tanggal : 2026-05-19
// Penulis  : Database Architect
//
// Urutan pembuatan (dependency order):
//   Layer 0 — Master tanpa FK : users, sppg, suppliers
//   Layer 1 — Master ber-FK 1 : kitchens  → sppg
//                               raw_materials → suppliers
//   Layer 2 — Transaksional   : menus, productions, logistics,
//                               salary_payments, cashflow_transactions,
//                               employees, finance_requests
//   Layer 3 — Detail/Junction : production_details → productions + menus
//                               delivery_items     → logistics
//                               raw_material_stock → kitchens + raw_materials
//
// Fungsi down() membalik urutan ini (LIFO).
// ================================================================

export async function up(knex: Knex): Promise<void> {

  // ── Helper: gunakan CHAR(36) untuk UUID yang digenerate di aplikasi ──
  // ── Semua PK string UUID; kolom FK mengikuti tipe yang direferensi  ──

  // ================================================================
  // LAYER 0 — MASTER TABLES (tidak bergantung tabel lain)
  // ================================================================

  // ----------------------------------------------------------------
  // 1. users — Admin & operator sistem
  // ----------------------------------------------------------------
  await knex.schema.createTable('users', (t) => {
    t.string('id', 36).primary().comment('UUID v4');
    t.string('name', 150).notNullable();
    t.string('email', 255).notNullable().unique();
    t.string('password_hash', 255).notNullable().comment('bcrypt hash');
    t.enum('role', ['master_admin', 'admin_dapur', 'finance', 'viewer'])
      .notNullable()
      .defaultTo('admin_dapur');
    t.enum('status', ['active', 'inactive']).notNullable().defaultTo('active');
    t.timestamp('last_login_at').nullable();
    t.timestamps(true, true);

    t.index('email',  'idx_users_email');
    t.index('role',   'idx_users_role');
    t.index('status', 'idx_users_status');
  });

  // ----------------------------------------------------------------
  // 2. sppg — Satuan Pelayanan Pemenuhan Gizi (Pemilik/Operator Dapur)
  //    Entitas puncak yang membawahi satu atau beberapa dapur.
  // ----------------------------------------------------------------
  await knex.schema.createTable('sppg', (t) => {
    t.string('id', 36).primary().comment('UUID v4');
    t.string('name', 200).notNullable().comment('Nama SPPG / Perusahaan Pemilik');
    t.string('owner_name', 150).notNullable().comment('Nama Penanggung Jawab');
    t.string('owner_phone', 30).nullable();
    t.string('owner_email', 255).nullable();
    t.text('address').nullable();
    t.string('npwp', 30).nullable().comment('Nomor Pokok Wajib Pajak');
    t.string('nib', 30).nullable().comment('Nomor Induk Berusaha');
    t.enum('status', ['active', 'inactive', 'suspended']).notNullable().defaultTo('active');
    t.date('contract_start').nullable();
    t.date('contract_end').nullable();
    t.timestamps(true, true);

    t.index('status', 'idx_sppg_status');
  });

  // ----------------------------------------------------------------
  // 3. suppliers — Pemasok bahan baku
  // ----------------------------------------------------------------
  await knex.schema.createTable('suppliers', (t) => {
    t.string('id', 36).primary().comment('UUID v4');
    t.string('name', 200).notNullable();
    t.string('contact_person', 150).nullable();
    t.string('phone', 30).nullable();
    t.string('email', 255).nullable();
    t.text('address').nullable();
    t.string('city', 100).nullable();
    t.enum('status', ['active', 'inactive']).notNullable().defaultTo('active');
    t.decimal('rating', 3, 2).nullable().comment('Skor performa 0.00–5.00');
    t.timestamps(true, true);

    t.index('status', 'idx_suppliers_status');
  });

  // ================================================================
  // LAYER 1 — MASTER DENGAN FOREIGN KEY KE LAYER 0
  // ================================================================

  // ----------------------------------------------------------------
  // 4. kitchens (Dapur) — Milik SPPG
  // ----------------------------------------------------------------
  await knex.schema.createTable('kitchens', (t) => {
    t.string('id', 36).primary().comment('UUID v4 — contoh: K01 di sistem lama');
    t.string('sppg_id', 36).notNullable()
      .references('id').inTable('sppg')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
    t.string('name', 150).notNullable().comment('Nama dapur, misal: Dapur Jakarta Pusat');
    t.string('city', 100).nullable();
    t.text('address').nullable();
    t.string('region', 100).nullable().comment('Wilayah distribusi');
    t.integer('capacity').unsigned().nullable().comment('Kapasitas produksi harian (porsi)');
    t.enum('status', ['active', 'inactive', 'maintenance']).notNullable().defaultTo('active');
    t.timestamps(true, true);

    t.index('sppg_id', 'idx_kitchens_sppg_id');
    t.index('status',  'idx_kitchens_status');
  });

  // ----------------------------------------------------------------
  // 5. raw_materials — Katalog bahan baku (definisi, bukan stok)
  // ----------------------------------------------------------------
  await knex.schema.createTable('raw_materials', (t) => {
    t.string('id', 36).primary();
    t.string('supplier_id', 36).notNullable()
      .references('id').inTable('suppliers')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
    t.string('name', 150).notNullable().comment('Nama bahan baku');
    t.string('unit', 20).notNullable().comment('Satuan: kg, ltr, pcs, dll');
    t.decimal('price_per_unit', 15, 2).notNullable().defaultTo(0);
    t.enum('category', ['Bahan Pokok', 'Lauk Pauk', 'Sayuran', 'Bumbu', 'Minyak', 'Lainnya'])
      .notNullable()
      .defaultTo('Lainnya');
    t.timestamps(true, true);

    t.index('supplier_id', 'idx_raw_materials_supplier_id');
    t.index('category',    'idx_raw_materials_category');
  });

  // ================================================================
  // LAYER 2 — TABEL OPERASIONAL/TRANSAKSIONAL
  // ================================================================

  // ----------------------------------------------------------------
  // 6. menus — Daftar menu yang bisa diproduksi
  // ----------------------------------------------------------------
  await knex.schema.createTable('menus', (t) => {
    t.string('id', 36).primary();
    t.string('name', 150).notNullable();
    t.enum('category', ['Nasi', 'Mie', 'Lauk', 'Sayuran', 'Sup', 'Minuman', 'Lainnya'])
      .notNullable()
      .defaultTo('Lainnya');
    t.decimal('cost_per_portion', 15, 2).notNullable().defaultTo(0)
      .comment('Harga bahan baku per porsi');
    t.decimal('sell_price', 15, 2).notNullable().defaultTo(0);
    t.boolean('is_active').notNullable().defaultTo(true);
    t.text('description').nullable();
    t.timestamps(true, true);

    t.index('is_active', 'idx_menus_is_active');
    t.index('category',  'idx_menus_category');
  });

  // ----------------------------------------------------------------
  // 7. productions — Rekap produksi harian per dapur
  // ----------------------------------------------------------------
  await knex.schema.createTable('productions', (t) => {
    t.string('id', 36).primary();
    t.string('kitchen_id', 36).notNullable()
      .references('id').inTable('kitchens')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
    t.date('production_date').notNullable();
    t.enum('shift', ['Pagi', 'Siang', 'Malam']).notNullable().defaultTo('Pagi');
    t.integer('target_portions').unsigned().notNullable().defaultTo(0);
    t.integer('actual_portions').unsigned().notNullable().defaultTo(0);
    t.enum('status', ['Planned', 'In Progress', 'Completed', 'Cancelled'])
      .notNullable()
      .defaultTo('Planned');
    t.text('notes').nullable();
    t.timestamps(true, true);

    t.index('kitchen_id',      'idx_productions_kitchen_id');
    t.index('production_date', 'idx_productions_date');
    t.index('status',          'idx_productions_status');
  });

  // ----------------------------------------------------------------
  // 8. logistics — Pengiriman / Armada distribusi
  // ----------------------------------------------------------------
  await knex.schema.createTable('logistics', (t) => {
    t.string('id', 36).primary();
    t.string('kitchen_id', 36).notNullable()
      .references('id').inTable('kitchens')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
    t.string('fleet_code', 20).notNullable().comment('Kode armada, misal: JKT-A01');
    t.string('driver_name', 150).notNullable();
    t.string('driver_phone', 30).nullable();
    t.string('route', 255).notNullable().comment('Deskripsi rute: Asal → Tujuan');
    t.enum('status', ['Loading', 'On Route', 'Delivered', 'Delayed', 'Cancelled', 'Idle'])
      .notNullable()
      .defaultTo('Idle');
    t.timestamp('departure_at').nullable();
    t.timestamp('estimated_arrival_at').nullable();
    t.timestamp('actual_arrival_at').nullable();
    t.decimal('load_percentage', 5, 2).nullable().comment('Persentase muatan 0–100');
    t.decimal('vehicle_lat', 10, 7).nullable().comment('Latitude GPS terakhir');
    t.decimal('vehicle_lon', 10, 7).nullable().comment('Longitude GPS terakhir');
    t.integer('battery_level').unsigned().nullable().comment('Baterai tracker 0–100%');
    t.timestamp('last_gps_update').nullable();
    t.timestamps(true, true);

    t.index('kitchen_id',  'idx_logistics_kitchen_id');
    t.index('fleet_code',  'idx_logistics_fleet_code');
    t.index('status',      'idx_logistics_status');
  });

  // ----------------------------------------------------------------
  // 9. cashflow_transactions — Arus kas masuk/keluar
  // ----------------------------------------------------------------
  await knex.schema.createTable('cashflow_transactions', (t) => {
    t.string('id', 36).primary();
    t.string('kitchen_id', 36).nullable()
      .references('id').inTable('kitchens')
      .onDelete('SET NULL')
      .onUpdate('CASCADE')
      .comment('NULL = transaksi level korporat');
    t.enum('type', ['in', 'out']).notNullable();
    t.decimal('amount', 15, 2).notNullable();
    t.string('description', 500).notNullable();
    t.enum('category', [
      'Pendapatan Distribusi',
      'Pembelian Bahan Baku',
      'Biaya Operasional',
      'Gaji Karyawan',
      'Maintenance',
      'Lainnya',
    ]).notNullable().defaultTo('Lainnya');
    t.string('reference_id', 36).nullable()
      .comment('Referensi ke finance_requests.id atau salary_payments.id');
    t.date('transaction_date').notNullable();
    t.string('recorded_by', 36).nullable()
      .references('id').inTable('users')
      .onDelete('SET NULL')
      .onUpdate('CASCADE');
    t.timestamps(true, true);

    t.index('kitchen_id',        'idx_cashflow_kitchen_id');
    t.index('type',              'idx_cashflow_type');
    t.index('transaction_date',  'idx_cashflow_date');
    t.index('category',          'idx_cashflow_category');
  });

  // ----------------------------------------------------------------
  // 10. employees — Data karyawan per dapur
  // ----------------------------------------------------------------
  await knex.schema.createTable('employees', (t) => {
    t.string('id', 36).primary().comment('UUID v4');
    t.string('kitchen_id', 36).notNullable()
      .references('id').inTable('kitchens')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
    t.string('name', 150).notNullable();
    t.string('email', 255).nullable().unique();
    t.string('phone', 30).nullable();
    t.enum('role', ['Ahli Gizi', 'Driver', 'Juru Masak']).notNullable();
    t.decimal('salary', 15, 2).notNullable().defaultTo(0.00);
    // Status diperluas: 'On Leave' ditangkap sebagai inactive sementara
    t.enum('status', ['active', 'inactive', 'on_leave', 'terminated'])
      .notNullable()
      .defaultTo('active');
    t.boolean('paid_this_month').notNullable().defaultTo(false)
      .comment('Reset ke false setiap awal bulan via job scheduler');
    t.date('join_date').nullable();
    t.date('terminate_date').nullable();
    t.timestamps(true, true);

    t.index('kitchen_id', 'idx_employees_kitchen_id');
    t.index('role',       'idx_employees_role');
    t.index('status',     'idx_employees_status');
  });

  // ----------------------------------------------------------------
  // 11. salary_payments — Histori pembayaran gaji per karyawan
  // ----------------------------------------------------------------
  await knex.schema.createTable('salary_payments', (t) => {
    t.string('id', 36).primary();
    t.string('employee_id', 36).notNullable()
      .references('id').inTable('employees')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
    t.string('kitchen_id', 36).notNullable()
      .references('id').inTable('kitchens')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
    t.decimal('amount', 15, 2).notNullable();
    t.integer('period_month').unsigned().notNullable().comment('Bulan 1–12');
    t.integer('period_year').unsigned().notNullable().comment('Tahun, misal: 2026');
    t.enum('status', ['pending', 'paid', 'failed']).notNullable().defaultTo('pending');
    t.timestamp('paid_at').nullable();
    t.string('paid_by', 36).nullable()
      .references('id').inTable('users')
      .onDelete('SET NULL')
      .onUpdate('CASCADE');
    t.text('notes').nullable();
    t.timestamps(true, true);

    t.index('employee_id',  'idx_salary_payments_employee_id');
    t.index('kitchen_id',   'idx_salary_payments_kitchen_id');
    t.index(['period_year', 'period_month'], 'idx_salary_payments_period');
    t.index('status',       'idx_salary_payments_status');
  });

  // ----------------------------------------------------------------
  // 12. finance_requests — Pengajuan & Approval Keuangan
  // ----------------------------------------------------------------
  await knex.schema.createTable('finance_requests', (t) => {
    t.string('id', 36).primary().comment('UUID v4');
    t.string('kitchen_id', 36).notNullable()
      .references('id').inTable('kitchens')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
    t.string('requested_by', 36).notNullable()
      .references('id').inTable('users')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE')
      .comment('FK ke users — admin yang mengajukan request');
    t.decimal('amount', 15, 2).notNullable();
    t.text('description').notNullable().comment('Keperluan / tujuan pengajuan dana');
    t.enum('status', ['pending', 'approved', 'rejected'])
      .notNullable()
      .defaultTo('pending');
    // Reviewed by — siapa yang approve/reject
    t.string('reviewed_by', 36).nullable()
      .references('id').inTable('users')
      .onDelete('SET NULL')
      .onUpdate('CASCADE');
    t.timestamp('approved_at').nullable();
    t.text('review_notes').nullable();
    t.timestamps(true, true);

    t.index('kitchen_id',    'idx_finance_requests_kitchen_id');
    t.index('requested_by',  'idx_finance_requests_requested_by');
    t.index('status',        'idx_finance_requests_status');
  });

  // ================================================================
  // LAYER 3 — TABEL DETAIL / JUNCTION
  // ================================================================

  // ----------------------------------------------------------------
  // 13. production_details — Rincian porsi per menu dalam satu sesi produksi
  // ----------------------------------------------------------------
  await knex.schema.createTable('production_details', (t) => {
    t.string('id', 36).primary();
    t.string('production_id', 36).notNullable()
      .references('id').inTable('productions')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    t.string('menu_id', 36).notNullable()
      .references('id').inTable('menus')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
    t.integer('target_portions').unsigned().notNullable().defaultTo(0);
    t.integer('actual_portions').unsigned().notNullable().defaultTo(0);
    t.timestamps(true, true);

    t.index('production_id', 'idx_production_details_production_id');
    t.index('menu_id',       'idx_production_details_menu_id');
    // Satu produksi tidak boleh punya baris menu yang sama dua kali
    t.unique(['production_id', 'menu_id'], 'uq_production_menu');
  });

  // ----------------------------------------------------------------
  // 14. delivery_items — Isi pengiriman: menu + jumlah porsi per armada
  // ----------------------------------------------------------------
  await knex.schema.createTable('delivery_items', (t) => {
    t.string('id', 36).primary();
    t.string('logistics_id', 36).notNullable()
      .references('id').inTable('logistics')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    t.string('menu_id', 36).notNullable()
      .references('id').inTable('menus')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
    t.integer('quantity').unsigned().notNullable().defaultTo(0).comment('Jumlah porsi');
    t.timestamps(true, true);

    t.index('logistics_id', 'idx_delivery_items_logistics_id');
    t.index('menu_id',      'idx_delivery_items_menu_id');
  });

  // ----------------------------------------------------------------
  // 15. raw_material_stock — Stok aktual bahan baku per dapur
  //     (inventaris dapur, bukan katalog supplier)
  // ----------------------------------------------------------------
  await knex.schema.createTable('raw_material_stock', (t) => {
    t.string('id', 36).primary();
    t.string('kitchen_id', 36).notNullable()
      .references('id').inTable('kitchens')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
    t.string('raw_material_id', 36).notNullable()
      .references('id').inTable('raw_materials')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
    t.decimal('current_stock', 15, 3).notNullable().defaultTo(0)
      .comment('Stok tersedia dalam satuan bahan baku');
    t.decimal('minimum_stock', 15, 3).notNullable().defaultTo(0)
      .comment('Batas minimum sebelum trigger alert');
    t.timestamp('last_restocked_at').nullable();
    t.timestamps(true, true);

    // Satu dapur hanya punya satu baris per bahan baku
    t.unique(['kitchen_id', 'raw_material_id'], 'uq_stock_kitchen_material');
    t.index('kitchen_id',      'idx_rms_kitchen_id');
    t.index('raw_material_id', 'idx_rms_raw_material_id');
  });
}

// ================================================================
// DOWN — Rollback: drop semua tabel (urutan terbalik / LIFO)
// ================================================================
export async function down(knex: Knex): Promise<void> {
  // Layer 3 — junction & detail
  await knex.schema.dropTableIfExists('raw_material_stock');
  await knex.schema.dropTableIfExists('delivery_items');
  await knex.schema.dropTableIfExists('production_details');

  // Layer 2 — transaksional
  await knex.schema.dropTableIfExists('finance_requests');
  await knex.schema.dropTableIfExists('salary_payments');
  await knex.schema.dropTableIfExists('employees');
  await knex.schema.dropTableIfExists('cashflow_transactions');
  await knex.schema.dropTableIfExists('logistics');
  await knex.schema.dropTableIfExists('productions');
  await knex.schema.dropTableIfExists('menus');

  // Layer 1 — master dengan FK
  await knex.schema.dropTableIfExists('raw_materials');
  await knex.schema.dropTableIfExists('kitchens');

  // Layer 0 — master dasar
  await knex.schema.dropTableIfExists('suppliers');
  await knex.schema.dropTableIfExists('sppg');
  await knex.schema.dropTableIfExists('users');
}
