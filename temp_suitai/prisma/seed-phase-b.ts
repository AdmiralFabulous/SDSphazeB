/**
 * Phase B Seed Script
 *
 * Seeds the database with test data for Phase B logistics:
 * - 20 tailors in Amritsar zones
 * - 5 QC stations
 * - 3 vans in UAE
 * - 1 sample flight
 * - 2 sample Track B orders with items
 *
 * Run with: npx ts-node prisma/seed-phase-b.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Amritsar zone definitions
const ZONES = [
  { id: 'ZONE_A', name: 'Zone A - Central', nearestQC: 5 },
  { id: 'ZONE_B', name: 'Zone B - North', nearestQC: 8 },
  { id: 'ZONE_C', name: 'Zone C - South', nearestQC: 6 },
  { id: 'ZONE_D', name: 'Zone D - East', nearestQC: 10 },
];

// Tailor data
const TAILORS = [
  { name: 'राजा सिंह (Raja Singh)', phone: '+91 98765 43201', zone: 'ZONE_A', skill: 'master', qcRate: 0.98 },
  { name: 'गुरप्रीत कौर (Gurpreet Kaur)', phone: '+91 98765 43202', zone: 'ZONE_A', skill: 'master', qcRate: 0.97 },
  { name: 'हरजीत सिंह (Harjeet Singh)', phone: '+91 98765 43203', zone: 'ZONE_A', skill: 'senior', qcRate: 0.95 },
  { name: 'अमनदीप सिंह (Amandeep Singh)', phone: '+91 98765 43204', zone: 'ZONE_B', skill: 'senior', qcRate: 0.94 },
  { name: 'जसप्रीत कौर (Jaspreet Kaur)', phone: '+91 98765 43205', zone: 'ZONE_B', skill: 'senior', qcRate: 0.93 },
  { name: 'मनप्रीत सिंह (Manpreet Singh)', phone: '+91 98765 43206', zone: 'ZONE_B', skill: 'senior', qcRate: 0.92 },
  { name: 'सुखविंदर सिंह (Sukhvinder Singh)', phone: '+91 98765 43207', zone: 'ZONE_C', skill: 'senior', qcRate: 0.96 },
  { name: 'कुलदीप कौर (Kuldeep Kaur)', phone: '+91 98765 43208', zone: 'ZONE_C', skill: 'senior', qcRate: 0.91 },
  { name: 'बलजीत सिंह (Baljeet Singh)', phone: '+91 98765 43209', zone: 'ZONE_C', skill: 'junior', qcRate: 0.88 },
  { name: 'रविंदर सिंह (Ravinder Singh)', phone: '+91 98765 43210', zone: 'ZONE_D', skill: 'senior', qcRate: 0.94 },
  { name: 'परमजीत कौर (Paramjeet Kaur)', phone: '+91 98765 43211', zone: 'ZONE_D', skill: 'senior', qcRate: 0.93 },
  { name: 'दलजीत सिंह (Daljeet Singh)', phone: '+91 98765 43212', zone: 'ZONE_D', skill: 'junior', qcRate: 0.87 },
  { name: 'जगदीप सिंह (Jagdeep Singh)', phone: '+91 98765 43213', zone: 'ZONE_A', skill: 'senior', qcRate: 0.95 },
  { name: 'सतनाम कौर (Satnam Kaur)', phone: '+91 98765 43214', zone: 'ZONE_A', skill: 'junior', qcRate: 0.86 },
  { name: 'हरमीत सिंह (Harmeet Singh)', phone: '+91 98765 43215', zone: 'ZONE_B', skill: 'master', qcRate: 0.97 },
  { name: 'नवजोत कौर (Navjot Kaur)', phone: '+91 98765 43216', zone: 'ZONE_B', skill: 'senior', qcRate: 0.92 },
  { name: 'गुरदीप सिंह (Gurdeep Singh)', phone: '+91 98765 43217', zone: 'ZONE_C', skill: 'senior', qcRate: 0.94 },
  { name: 'किरनजीत कौर (Kiranjeet Kaur)', phone: '+91 98765 43218', zone: 'ZONE_C', skill: 'junior', qcRate: 0.85 },
  { name: 'लखविंदर सिंह (Lakhvinder Singh)', phone: '+91 98765 43219', zone: 'ZONE_D', skill: 'senior', qcRate: 0.93 },
  { name: 'जसविंदर कौर (Jasvinder Kaur)', phone: '+91 98765 43220', zone: 'ZONE_D', skill: 'junior', qcRate: 0.84 },
];

// QC Station data
const QC_STATIONS = [
  { name: 'QC Station Central', address: 'GT Road, Amritsar', zone: 'ZONE_A', capacity: 50 },
  { name: 'QC Station North', address: 'Ranjit Avenue, Amritsar', zone: 'ZONE_B', capacity: 40 },
  { name: 'QC Station South', address: 'Lawrence Road, Amritsar', zone: 'ZONE_C', capacity: 35 },
  { name: 'QC Station East', address: 'Mall Road, Amritsar', zone: 'ZONE_D', capacity: 30 },
  { name: 'QC Station Airport', address: 'Airport Road, Amritsar', zone: 'ZONE_A', capacity: 60 },
];

// UAE Van data
const VANS = [
  { licensePlate: 'DXB-1234', driverName: 'Ahmed Al-Rashid', phone: '+971 50 123 4567', capacity: 20 },
  { licensePlate: 'DXB-5678', driverName: 'Mohammed Hassan', phone: '+971 50 234 5678', capacity: 20 },
  { licensePlate: 'SHJ-9012', driverName: 'Khalid Omar', phone: '+971 50 345 6789', capacity: 15 },
];

async function main() {
  console.log('🌱 Starting Phase B seed...\n');

  // Create tailors
  console.log('👔 Creating 20 tailors...');
  for (const tailor of TAILORS) {
    await prisma.tailor.upsert({
      where: { phone: tailor.phone },
      update: {},
      create: {
        name: tailor.name,
        phone: tailor.phone,
        zoneId: tailor.zone,
        skillLevel: tailor.skill,
        qcPassRate: tailor.qcRate,
        maxConcurrentJobs: tailor.skill === 'master' ? 3 : tailor.skill === 'senior' ? 2 : 1,
        avgProductionMinutes: tailor.skill === 'master' ? 240 : tailor.skill === 'senior' ? 300 : 360,
        isActive: true,
      },
    });
  }
  console.log('✅ Tailors created\n');

  // Create QC stations
  console.log('🔍 Creating 5 QC stations...');
  for (const station of QC_STATIONS) {
    await prisma.qcStation.upsert({
      where: { name: station.name },
      update: {},
      create: {
        name: station.name,
        address: station.address,
        zoneId: station.zone,
        capacity: station.capacity,
        avgProcessingMinutes: 15,
        isActive: true,
      },
    });
  }
  console.log('✅ QC stations created\n');

  // Create vans
  console.log('🚐 Creating 3 UAE vans...');
  for (const van of VANS) {
    await prisma.van.upsert({
      where: { licensePlate: van.licensePlate },
      update: {},
      create: {
        licensePlate: van.licensePlate,
        driverName: van.driverName,
        driverPhone: van.phone,
        capacity: van.capacity,
        status: 'AVAILABLE',
      },
    });
  }
  console.log('✅ Vans created\n');

  // Create sample flight
  console.log('✈️ Creating sample flight...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(22, 0, 0, 0);

  const flight = await prisma.flight.upsert({
    where: { id: 'flight-sample-001' },
    update: {},
    create: {
      id: 'flight-sample-001',
      flightNumber: 'SDS-2024-001',
      aircraftType: 'Saab340F',
      departureAirport: 'ATQ',
      arrivalAirport: 'SHJ',
      scheduledDeparture: tomorrow,
      status: 'SCHEDULED',
      costGbp: 4500,
    },
  });
  console.log(`✅ Flight created: ${flight.flightNumber}\n`);

  // Create sample Track B orders
  console.log('📦 Creating 2 sample Track B orders...');

  // Order 1 - in progress
  const order1 = await prisma.order.create({
    data: {
      status: 'S15_QC_PASSED',
      track: 'B',
      totalAmount: 599,
      currency: 'GBP',
      shippingAddress: 'Dubai Marina, Tower 3, Apt 1204, Dubai, UAE',
      deadline: new Date(Date.now() + 20 * 60 * 60 * 1000), // 20 hours from now
      riskScore: 0.35,
      riskFactors: JSON.stringify({ deadline: 0.2, complexity: 0.15 }),
      flightId: flight.id,
      items: {
        create: [
          {
            quantity: 1,
            price: 599,
            currentState: 'S15_QC_PASSED',
          },
        ],
      },
    },
  });
  console.log(`  Order 1: ${order1.id} (S15_QC_PASSED)`);

  // Order 2 - earlier in process
  const order2 = await prisma.order.create({
    data: {
      status: 'S12_STITCHING_IN_PROGRESS',
      track: 'B',
      totalAmount: 799,
      currency: 'GBP',
      shippingAddress: 'JBR Beach Residence, Tower 5, Apt 2301, Dubai, UAE',
      deadline: new Date(Date.now() + 22 * 60 * 60 * 1000), // 22 hours from now
      riskScore: 0.55,
      riskFactors: JSON.stringify({ deadline: 0.3, complexity: 0.25 }),
      items: {
        create: [
          {
            quantity: 1,
            price: 399,
            currentState: 'S12_STITCHING_IN_PROGRESS',
          },
          {
            quantity: 1,
            price: 400,
            currentState: 'S11_CUTTING_COMPLETE',
            isBackupSuit: true,
          },
        ],
      },
    },
  });
  console.log(`  Order 2: ${order2.id} (S12_STITCHING_IN_PROGRESS)`);
  console.log('✅ Orders created\n');

  // Summary
  const tailorCount = await prisma.tailor.count();
  const qcCount = await prisma.qcStation.count();
  const vanCount = await prisma.van.count();
  const flightCount = await prisma.flight.count();
  const trackBOrderCount = await prisma.order.count({ where: { track: 'B' } });

  console.log('═══════════════════════════════════════');
  console.log('📊 Phase B Seed Summary');
  console.log('═══════════════════════════════════════');
  console.log(`  Tailors:     ${tailorCount}`);
  console.log(`  QC Stations: ${qcCount}`);
  console.log(`  Vans:        ${vanCount}`);
  console.log(`  Flights:     ${flightCount}`);
  console.log(`  Track B Orders: ${trackBOrderCount}`);
  console.log('═══════════════════════════════════════');
  console.log('\n✅ Phase B seed complete!');
  console.log('💡 Run `npx prisma studio` to view the data\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
