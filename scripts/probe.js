const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.$queryRaw`select now()`.then(r => {
  console.log('OK:', r);
}).catch(e => {
  console.error('ERROR:', e);
}).finally(() => p.$disconnect());