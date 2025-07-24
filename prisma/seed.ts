import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.incident.deleteMany();
  await prisma.camera.deleteMany();

  // Insert cameras
  const cameras = await prisma.camera.createMany({
    data: [
      { name: 'Shop Floor A', location: 'Ground Floor - East Wing' },
      { name: 'Vault', location: 'Restricted Area - Basement' },
      { name: 'Entrance', location: 'Main Gate - Front' },
    ],
  });

  // Get inserted cameras
  const allCameras = await prisma.camera.findMany();

  // Threat types
  const threatTypes = [
    'Unauthorized Access',
    'Gun Threat',
    'Face Recognized',
    'Suspicious Behavior',
    'Object Left Behind',
  ];

  // Generate 15 incidents
  const baseTime = new Date(); // Now
  const incidents = Array.from({ length: 15 }, (_, i) => {
    const tsStart = new Date(baseTime.getTime() - (24 - i) * 60 * 60 * 1000); // spread over 24 hours
    const tsEnd = new Date(tsStart.getTime() + 5 * 60 * 1000); // +5 minutes
    const camera = allCameras[i % allCameras.length];
    const type = threatTypes[i % threatTypes.length];
    const thumbnail = `/images/thumb${(i % 5) + 1}.jpg`;

    return {
      cameraId: camera.id,
      type,
      tsStart,
      tsEnd,
      thumbnailUrl: thumbnail,
      resolved: i % 2 === 0,
    };
  });

  await prisma.incident.createMany({ data: incidents });

  console.log('Seeded 3 cameras and 15 incidents successfully.');
}

main()
  .catch((e) => {
    console.error(' Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
