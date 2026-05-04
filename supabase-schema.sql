-- =============================================
-- AYAM.CRM — Supabase Schema
-- Jalankan ini di Supabase > SQL Editor
-- =============================================

create table suppliers (
  id uuid default gen_random_uuid() primary key,
  nama text not null,
  kota text,
  kontak text,
  jenis_ayam text default 'Broiler',
  harga_per_kg integer,
  volume_maks integer,
  status text default 'Aktif',
  catatan text,
  created_at timestamp with time zone default now()
);

create table buyers (
  id uuid default gen_random_uuid() primary key,
  nama text not null,
  tipe text,
  kota text,
  kebutuhan_kg integer,
  jenis_ayam text default 'Broiler',
  harga_deal integer,
  pic text,
  kontak text,
  status text default 'Prospek',
  catatan text,
  created_at timestamp with time zone default now()
);

create table deals (
  id uuid default gen_random_uuid() primary key,
  buyer_id uuid references buyers(id) on delete cascade,
  buyer_nama text,
  volume_kg integer,
  stage text default 'Prospek',
  harga_deal integer,
  tanggal_followup date,
  catatan text,
  created_at timestamp with time zone default now()
);

create table price_history (
  id uuid default gen_random_uuid() primary key,
  supplier_id uuid references suppliers(id) on delete cascade,
  supplier_nama text,
  harga integer not null,
  catatan text,
  created_at timestamp with time zone default now()
);

create table activities (
  id uuid default gen_random_uuid() primary key,
  tipe text,
  entity_nama text,
  catatan text,
  tanggal date,
  followup_date date,
  created_at timestamp with time zone default now()
);

-- Seed data awal
insert into suppliers (nama, kota, kontak, jenis_ayam, harga_per_kg, volume_maks, status) values
  ('Pak Hendra Farm', 'Bogor', '08111000001', 'Broiler', 38500, 2000, 'Aktif'),
  ('UD Maju Jaya', 'Bekasi', '08111000002', 'Broiler', 37800, 3500, 'Aktif'),
  ('Farm Bu Siti', 'Depok', '08111000003', 'Kampung', 52000, 800, 'Aktif'),
  ('PT Cipta Poultry', 'Tangerang', '08111000004', 'Broiler', 39200, 5000, 'Negosiasi');

insert into buyers (nama, tipe, kota, kebutuhan_kg, jenis_ayam, pic, status) values
  ('Resto Sari Laut', 'Restoran', 'Jakarta Selatan', 700, 'Broiler', 'Pak Dodi', 'Aktif'),
  ('RM Padang Jaya', 'Restoran', 'Jakarta Barat', 1000, 'Broiler', 'Chef Anton', 'Negosiasi'),
  ('Hotel Sari Pacific', 'Hotel', 'Jakarta Pusat', 1200, 'Broiler', 'Pak Irwan', 'Prospek');

-- Enable RLS (Row Level Security) — bisa dikonfigurasi nanti
alter table suppliers enable row level security;
alter table buyers enable row level security;
alter table deals enable row level security;
alter table price_history enable row level security;
alter table activities enable row level security;

-- Policy: allow all untuk sementara (ubah kalau mau multi-user)
create policy "allow all" on suppliers for all using (true) with check (true);
create policy "allow all" on buyers for all using (true) with check (true);
create policy "allow all" on deals for all using (true) with check (true);
create policy "allow all" on price_history for all using (true) with check (true);
create policy "allow all" on activities for all using (true) with check (true);
