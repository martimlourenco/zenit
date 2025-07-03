const bcrypt = require('bcrypt');
const User = require('../models/User');
const nodemailer = require('nodemailer');
require('dotenv').config();


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASSWORD 
    }
});

// senha aleatoria
function generateTempPassword() {
    return Math.random().toString(36).slice(-8);
}

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // verifica se ja existe um email na bd
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: 'E-mail não encontrado!' });
        }

        // gera a senha e crypta
        const tempPassword = generateTempPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // atualiza a senha pela criada 
        await user.update({ password: hashedPassword });

        // email
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #333; text-align: center;">Recuperação de Senha</h2>
                <p style="color: #555; font-size: 16px;">Olá, <strong>${user.name}</strong>,</p>
                <p style="color: #555; font-size: 16px;">
                    Recebemos uma solicitação para redefinir a sua senha. Aqui está a sua nova senha temporária:
                </p>
                <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 20px; font-weight: bold; border-radius: 5px;">
                    ${tempPassword}
                </div>
                <p style="color: #555; font-size: 16px;">
                    Por favor, aceda à sua conta e altere a sua senha o mais rápido possível para garantir a segurança do seu perfil.
                </p>
                <p style="color: #555; font-size: 16px;">
                    Caso não tenha solicitado esta mudança, entre em contato com o nosso suporte imediatamente.
                </p>
                <div style="text-align: center; margin-top: 20px;">
                    <a href="https://softinsa.pt" style="background-color: #004aad; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">
                        Softinsa
                    </a>
                </div>
                <p style="color: #777; font-size: 14px; text-align: center; margin-top: 30px;">
                    © 2025 Softinsa. Todos os direitos reservados.
                </p>
            </div>
        `;

        // envia email
        await transporter.sendMail({
            from: `"Suporte Softinsa" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Recuperação de Senha - Softinsa",
            html: emailHtml
        });

        res.json({ message: 'E-mail enviado com sucesso! Verifique a sua caixa de entrada.' });

    } catch (error) {
        console.error("Erro ao enviar e-mail:", error);
        res.status(500).json({ error: 'Erro ao enviar o e-mail. Tente novamente mais tarde.' });
    }
};
