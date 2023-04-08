import { Request, Response } from 'express';
import { Gender } from '@prisma/client'
import { z } from "zod";

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const prisma = require('@/utils/db');

const handleLogin = async (req: Request, res: Response) => {
    // validation schema
    const schema = z.object({
        email: z.string().email(),
        password: z.string().min(8).max(32)
    });

    const errorResponse = { message: "E-Posta adresi veya şifre hatalı." };

    try {
        // validate request body
        schema.parse(req.body);

        // check if email is in use
        const user = await prisma.user.findUnique({
            where: {
                email: req.body.email
            }
        });

        if (!user) {
            // Email not registered. Return generic error message to prevent user enumeration
            return res.status(400).json(errorResponse);
        }

        // check if password is correct
        const isPasswordCorrect = bcrypt.compare(req.body.password, user.password);
        if (!isPasswordCorrect) {
            // Password is not correct. Return generic error message to prevent user enumeration
            return res.status(400).json(errorResponse);
        }

        // Login credentials are correct, create jwt
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // send response
        return res.status(200).json({ token });

    } catch (err) {
        return res.status(400).json({ error: "Bir hata oluştu." });
    }

}

const handleRegister = async (req: Request, res: Response) => {
    console.log("Register request received: " + JSON.stringify(req.body, null, 2));
    const schema = z.object({
        name: z.string({
            description: "İsim",
            required_error: "İsim alanı boş bırakılamaz.",
        }).min(2,{
            message: "İsim en az 2 karakter olmalıdır.",
        }).max(30,{
            message: "İsim en fazla 30 karakter olmalıdır.",
            }
        ),

        surname: z.string({
            description: "Soyisim",
            required_error: "Soyisim alanı boş bırakılamaz.",
        }).min(2,{
            message: "Soyisim en az 2 karakter olmalıdır.",
        }).max(40,{
            message: "Soyisim en fazla 40 karakter olmalıdır.",
        }),

        email: z.string({
            description: "E-Posta",
            required_error: "E-Posta alanı boş bırakılamaz.",
        }).email({
            message: "Geçersiz e-posta adresi.",
        }),

        password: z.string({
            description: "Şifre",
            required_error: "Şifre alanı boş bırakılamaz.",
        }).min(8,{
            message: "Şifre en az 8 karakter olmalıdır.",
        }).max(32,{
            message: "Şifre en fazla 32 karakter olmalıdır.",
        }),

        phone: z.string({
            description: "Telefon Numarası",
            required_error: "Telefon numarası alanı boş bırakılamaz.",
        }).length(10, {
            message: "Telefon numarası 10 haneli olmalıdır.",
        }), // example: 5321235588

        gender: z.nativeEnum(Gender),

        dateOfBirth: z.coerce.date({
            description: "Doğum Tarihi",
            required_error: "Doğum tarihi alanı boş bırakılamaz.",
            invalid_type_error: "Geçersiz tarih formatı."
        })
    });

    try {
        type data = z.infer<typeof schema>;
        const data:data = req.body;

        // validate request body
        const parserResult = schema.safeParse(data);

        // If validation fails, return error
        if (!parserResult.success) {
            // Build error message
            let errorMessage = "";
            parserResult.error.issues.forEach((issue) => {
                errorMessage += issue.message + " ";
            });
            // Remove last space
            errorMessage = errorMessage.slice(0, -1);

            // errors zod object
            const errors = parserResult.error.issues.map((issue) => {
                return {
                    field: issue.path[0].toString(),
                    message: issue.message
                }
            });

            // Return error
            return res.status(400).json({ message: errorMessage, errors: errors });
        }

        // check if email is already in use
        const user = await prisma.user.findUnique({
            where: { email: req.body.email }
        });

        if (user) { return res.status(400).json({ message: "Bu e-posta adresi zaten kayıtlı." }) }

        // hash password, 10 rounds
        const hashedPassword = bcrypt.hashSync(data.password, 10);
        console.log("Hashed password: " + hashedPassword);

        // create user
        const newUser = await prisma.user.create({
            data: {
                name: data.name,
                surname: data.surname,
                email: data.email,
                password: hashedPassword,
                phone: data.phone,
                gender: data.gender,
                dateOfBirth: new Date(data.dateOfBirth)
            }
        });

        console.log("New user created: " + JSON.stringify(newUser, null, 2));

        // create jwt
        const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // send response
        return res.status(201).json({ token });

    } catch (err) {
        return res.status(400)
    }
}

export {
    handleLogin,
    handleRegister
};