const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// test connection
prisma.$connect().then(() => {
    console.log('MongoDB bağlantısı aktif.');
}).catch((err:Error) => {
    console.log("Prisma bağlantı hatası: " + err);
});

module.exports = prisma;