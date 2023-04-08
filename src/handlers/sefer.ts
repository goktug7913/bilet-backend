import { Request, Response } from 'express';
import {Cities} from '@prisma/client'

const prisma = require('@/utils/db');

const handleGetSefer = async (req: Request, res: Response) => {

    try {
        const from = req.query.from?.toString().toUpperCase();
        const to = req.query.to?.toString().toUpperCase();

        let query = {}

        // TODO: Switch statement?
        if (!from && !to) {
            return res.status(400).json({ message: 'Kalkış veya varış şehri belirtilmelidir.' });
        }

        if (from === to) {
            return res.status(400).json({ message: 'Kalkış ve varış şehirleri aynı olamaz.' });
        }

        if (from && !to) {
            query = { from: from }
        }

        if (!from && to) {
            query = { to: to }
        }

        if (from && to) {
            // if params are not in Cities enum, prisma will throw an error,
            // we want to return a custom error message instead
            if (!Object.values(Cities).includes(from as any) || !Object.values(Cities).includes(to as any)) {
                return res.status(400).json({ message: 'Sefer bulunamadı.' });
            }
            query = { from: from, to: to }
        }

        const result = await prisma.sefer.findMany({
            where: query,
            select: {
                // Select specific fields to fetch from the database
                id: true,
                from: true,
                to: true,
                DateTime: true,
                seatPrice: true,
            }
        });

        if (result.length === 0) {
            return res.status(400).json({ message: 'Sefer bulunamadı.' });
        }

        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: 'Bir hata oluştu.' });
    }
}

const handleGetDetails = async (req: Request, res: Response) => {
    const id = req.query.id?.toString();

    if (!id) {
        return res.status(400).json({ message: 'Sefer id belirtilmelidir.' });
    }

    const result = await prisma.sefer.findUnique({
        where: { id: id },
        select: {
            id: true,
            seatCount: true,
            seats: true
        }
    });

    if (!result) {
        return res.status(400).json({ message: 'Sefer bulunamadı.' });
    }

    res.status(200).json(result);
}

export { handleGetSefer, handleGetDetails };