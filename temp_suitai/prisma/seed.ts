import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.buttonOption.deleteMany();
  await prisma.ventStyle.deleteMany();
  await prisma.lapelStyle.deleteMany();

  // Seed Lapel Styles
  const lapels = await prisma.lapelStyle.createMany({
    data: [
      {
        name: 'Notch Lapel',
        description: 'Classic notch lapel with a clean, modern look. Perfect for business and casual wear.',
        imageUrl: '/images/styles/lapel-notch.jpg',
        category: 'notch',
        inStock: true,
      },
      {
        name: 'Peak Lapel',
        description: 'Distinguished peak lapel that angles upward. Ideal for formal occasions and double-breasted suits.',
        imageUrl: '/images/styles/lapel-peak.jpg',
        category: 'peak',
        inStock: true,
      },
      {
        name: 'Shawl Lapel',
        description: 'Elegant shawl collar that wraps smoothly. Commonly seen in tuxedos and evening wear.',
        imageUrl: '/images/styles/lapel-shawl.jpg',
        category: 'shawl',
        inStock: true,
      },
    ],
  });

  // Seed Vent Styles
  const vents = await prisma.ventStyle.createMany({
    data: [
      {
        name: 'Center Vent',
        description: 'Single centered vent providing comfort and freedom of movement.',
        category: 'single',
        inStock: true,
      },
      {
        name: 'Side Vents',
        description: 'Two side vents offering a sleek, European aesthetic.',
        category: 'double',
        inStock: true,
      },
      {
        name: 'Ventless',
        description: 'No vents for a more formal, streamlined appearance.',
        category: 'ventless',
        inStock: true,
      },
    ],
  });

  // Seed Button Options
  const buttons = await prisma.buttonOption.createMany({
    data: [
      {
        name: 'Two Button',
        description: 'Classic two-button closure. Timeless and versatile.',
        category: 'two-button',
        inStock: true,
      },
      {
        name: 'Three Button',
        description: 'Traditional three-button configuration. More formal appearance.',
        category: 'three-button',
        inStock: true,
      },
      {
        name: 'Four Button',
        description: 'Four-button closure for a sophisticated, modern look.',
        category: 'four-button',
        inStock: true,
      },
      {
        name: 'Double Breasted Two',
        description: 'Double-breasted with two buttons. Stylish and bold.',
        category: 'double-breasted-two',
        inStock: false,
      },
    ],
  });

  console.log('✓ Database seeded successfully');
  console.log(`  - ${lapels.count} lapel styles created`);
  console.log(`  - ${vents.count} vent styles created`);
  console.log(`  - ${buttons.count} button options created`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
