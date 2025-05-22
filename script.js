import express from 'express';
import axios from 'axios';
import cors from 'cors';
import nodemailer from 'nodemailer';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS
    }
})

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

app.get('/clima', async (req, res) => {
    const city = req.query.city || 'London';
    const encodedCity = encodeURIComponent(city);
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodedCity}&appid=${API_KEY}&units=metric&lang=pt_br`;

    try {
        const response = await axios.get(url);
        res.json(response.data);

    } catch (error) {
        res.status(500).json({
            error: 'Erro ao buscar dados do clima. Verifique a cidade ou tente novamente mais tarde.'
        });
    }
});


app.post('/verify-captcha', async (req, res) => {
    const { token, name, email, message } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Token não fornecido' });
    }

    const secret = process.env.CAPTCHA_KEY;
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`;

    try {
        const response = await axios.post(url);
        const data = response.data;

        if (data.success) {
            try {
                await transporter.sendMail({
                    from: `"${name}" <${email}>`,
                    to: process.env.USER_EMAIL,
                    subject: 'Mensagem do site',
                    text: message,
                    html: `<p><strong>Nome:</strong> ${name}</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Mensagem:</strong> ${message}</p>`
                })

                res.json({ success: true });
            } catch (error) {
                console.error('Erro ao enviar email:', error)
                res.status(500).json({ error: 'Erro ao enviar email.'})
            }

        } else {
            res.status(403).json({ success: false, error: 'reCAPTCHA inválido' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao verificar reCAPTCHA' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando no localhost:${PORT}`);
});