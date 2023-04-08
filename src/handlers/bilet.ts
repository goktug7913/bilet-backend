import { Request, Response } from 'express';
import {userType} from "@/middleware/jwt";
import { Seat, Gender } from '@prisma/client';

const prisma = require('@/utils/db');

const handleGetBilet = async (req: Request, res: Response) => {
    try {
        // user id from jwt
        const userId = req.headers['userId'] as unknown as userType;

        const result = await prisma.ticket.findMany({
            where: { userId: userId.id },
            select: { id: true }
        });

        if (result.length === 0) {
            return res.status(400).json({ message: 'Bilet bulunamadı.' });
        }

        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: 'Bir hata oluştu.' });
    }
}

const handleCreateBilet = async (req: Request, res: Response) => {
    const maxBooking = 5;

    type bodyType = {
        seferId: string,
        seats: [{
            seatNo: number
            gender: Gender
        }]
    }

    const body = req.body as bodyType;

    // user id from jwt
    const userId = req.headers['userId'] as unknown as userType;

    if (!body.seferId || !body.seats) {
        return res.status(400).json({ message: 'Sefer id ve koltuk numarası belirtilmelidir.' });
    }

    // check if user is trying to book more than 5 seats
    if (body.seats.length > maxBooking) {
        return res.status(400).json({ message: 'En fazla 5 koltuk rezerve edebilirsiniz.' });
    }

    // check if sefer exists
    let sefer = await prisma.sefer.findUnique({ where: { id: body.seferId } });

    if (!sefer) { return res.status(400).json({ message: 'Sefer bulunamadı.' }) }

    // are we booking single or multiple seats?
    const multiple = body.seats.length > 1;

    // check if seat is available
    let bookedSeats:number[] = [];
    for (const seat of body.seats) {
        sefer.seats.forEach((s: any) => {
            if (s.seatNo === seat.seatNo) {
                if (s.sold) { bookedSeats.push(seat.seatNo) }
            }
        });
    }
    // if there are booked seats, return them with the error message
    if (bookedSeats.length > 0) { return res.status(400).json({ message: 'Koltuklar dolu.', bookedSeats }) }

    // we can query the user now
    const user = await prisma.user.findUnique({ where: { id: userId.id } });

    if (!multiple) {
        // if we are booking a single seat, we can only book beside the same gender
        // seats are grouped in pairs, 1 and 2, 3 and 4, 5 and 6 etc.
        // if we are booking seat 6, seat 5 must be the same gender.

        // get the seat number of the seat beside the one we are booking
        const seatNo = body.seats[0].seatNo;
        let seatNoToCheck = 0;
        if (seatNo % 2 === 0) {
            // if the seat number is even, the seat beside it is odd
            seatNoToCheck = seatNo - 1;
        }
        else {
            // if the seat number is odd, the seat beside it is even
            seatNoToCheck = seatNo + 1;
        }

        // check if the seat beside the one we are booking is available
        let seatToCheck = sefer.seats.find((s: Seat) => s.seatNo === seatNoToCheck);

        if (seatToCheck && seatToCheck.sold) {
            if (seatToCheck.gender!==body.seats[0].gender) {
                return res.status(400).json({ message: "Yanınızdaki koltuk aynı cinsiyette olmalıdır." } );
            }
        }

    } else {
        // we are booking multiple seats.
        // if we are booking both seats in a pair, they can be opposite genders.
        // if the seat is beside someone else's seat, it needs to be the same gender.
        for (let i = 0; i < body.seats.length; i++) {
            const seat = body.seats[i];
            let seatNoToCheck = 0;
            if (seat.seatNo % 2 === 0) {
                // if the seat number is even, the seat beside it is odd
                seatNoToCheck = seat.seatNo - 1;
            }
            else {
                // if the seat number is odd, the seat beside it is even
                seatNoToCheck = seat.seatNo + 1;
            }

            // check if the seat beside the one we are booking is available
            let seatToCheck = sefer.seats.find((s: Seat) => s.seatNo === seatNoToCheck);

            let isPair = false;

            // Are we booking both seats in a pair?
            if (req.body.seats.find((s: any) => s.seatNo === seatNoToCheck)) {
                console.log("we are buying seats: ", seat.seatNo, seatNoToCheck);
                isPair = true;
            }

            if (isPair) {
                // Can purchase both seats in a pair no matter genders
            } else {
                // If the other seat is reserved, we can only buy if its same gender
                if (seatToCheck && seatToCheck.sold) {
                    if (seatToCheck.gender !== body.seats[i].gender) {
                        return res.status(400).json({ message: "Yanınızdaki koltuk aynı cinsiyette olmalıdır." });
                    }
                }
            }
        }
    }

    // if we are here, we can book the seats
    // we need to update the sefer and create a ticket

    // first, create an updated seats array
    let updatedSeats = sefer.seats;
    for (const seat of body.seats) {
        sefer.seats.find((s: Seat) => {
            // find the seat in the sefer
            if (s.seatNo === seat.seatNo) {
                // update the seat
                s.sold = true;
                s.gender = seat.gender;
            }
        });
    }

    // update the sefer
    await prisma.sefer.update({
        where: { id: body.seferId },
        data: {
            seats: updatedSeats
        }
    });

    const ticket = await prisma.ticket.create({
        data: {
            seferId: body.seferId,
            userId: userId.id,
            seatNums: body.seats.map(s => s.seatNo),
        }
    });

    res.status(200).json(ticket);
}

const handleGetDetails = async (req: Request, res: Response) => {
    // bilet id from query
    const id = req.query.bilet?.toString();

    if (!id) {
        return res.status(400).json({ message: 'Bilet id belirtilmelidir.' });
    }

    const result = await prisma.ticket.findUnique({
        where: { id: id },
    });

    if (!result) {
        return res.status(400).json({ message: 'Bilet bulunamadı.' });
    }

    const sefer = await prisma.sefer.findUnique({
        where: { id: result.seferId },
    });

    const data = {
        id: result.id,
        seferId: result.seferId,
        from: sefer?.from,
        to: sefer?.to,
        time: new Date(sefer?.DateTime).toLocaleTimeString(),
        seatNums: result.seatNums,
    }

    res.status(200).json(data);
}

export { handleGetBilet, handleCreateBilet, handleGetDetails };