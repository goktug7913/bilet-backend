export default function dbSeeder() {
    // read "test.txt" file to check if the server started for the first time
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, 'test.txt');
    // if the file does not exist, we need to create test data in the database
    if (!fs.existsSync(filePath)) {
        console.log('Sunucu ilk defa başlatılıyor. Test verileri oluşturuluyor...');

        const {User, Cities, Sefer, Seat } = require('@prisma/client');
        const prisma = require('@/utils/db');
        const bcrypt = require('bcrypt');

        // create a user
        const pwd = bcrypt.hashSync('12341234', 10);

        prisma.user.create({
            data: {
                name: "Test",
                surname: "User",
                email: "test@example.com",
                phone: "5331234455",
                password: pwd,
                gender: "ERKEK",
                dateOfBirth: new Date(1990, 5, 1),
            }
        }).then((user:typeof User) => {
            console.log("Test kullanıcısı oluşturuldu:", user.email, "Şifre:", "12341234")
        }).catch((err:Error) => {
            console.log(err);
        });

        // create routes for each city
        for (let i = 0; i < Object.keys(Cities).length; i++) {
            for (let j = 0; j < Object.keys(Cities).length; j++) {
                if (i === j) { continue; /* Skip same city routes */ }

                const randPrice = Math.floor(Math.random() * 100) + 1;
                const randDate = new Date();
                randDate.setDate(randDate.getDate() + Math.floor(Math.random() * 7) + 1);

                let seats: typeof Seat = [];
                for (let k = 1; k <= 64; k++) {
                    seats.push({seatNo: k, sold: false});
                }

                prisma.sefer.create({
                    data: {
                        from: Object.keys(Cities)[i],
                        to: Object.keys(Cities)[j],
                        DateTime: randDate,
                        seatPrice: randPrice,
                        seatCount: 64,
                        seats: seats,
                    }
                }).then((sefer: typeof Sefer) => {
                    console.log(sefer.from + ' - ' + sefer.to + ' seferi oluşturuldu.')
                }).catch((err: Error) => {
                    console.log(err);
                });
            }
        }
        // create test.txt to indicate that test data has been created
        fs.writeFileSync(filePath, 'test.txt');
    }
}

module.exports = dbSeeder;