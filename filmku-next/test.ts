import { prisma } from './src/lib/prisma';
prisma.movie.findUnique({where: {id: '853db8f7-d9dc-4a52-b433-3d48848e302d'}}).then(console.log).catch(console.error).finally(() => prisma.$disconnect());
