'use strict';

const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');

const validateContact = [
  body('name').trim().notEmpty().withMessage('Le nom est requis').isLength({ max: 200 }),
  body('email').trim().isEmail().withMessage('Adresse email invalide').normalizeEmail(),
  body('company').optional().trim().isLength({ max: 200 }),
  body('phone').optional().trim().isLength({ max: 30 }),
  body('subject').optional().trim().isLength({ max: 200 }),
  body('message').trim().notEmpty().withMessage('Le message est requis').isLength({ max: 5000 }),
];

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

async function sendContact(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { name, email, company, phone, subject, message } = req.body;
  const contactTo = process.env.CONTACT_TO || 'contact@voltea-energie.fr';

  const subjectLine = subject
    ? `[Voltea Énergie] ${subject} — ${name}`
    : `[Voltea Énergie] Nouveau message de ${name}`;

  const htmlBody = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: #0b101e; padding: 20px 24px; border-radius: 8px 8px 0 0; margin-bottom: 0;">
    <h1 style="color: #fff; font-size: 18px; margin: 0;">Nouveau message — Voltea Énergie</h1>
  </div>
  <div style="background: #f9f9f9; padding: 24px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 8px 0; font-weight: bold; width: 130px; color: #555;">Nom :</td><td style="padding: 8px 0;">${name}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Email :</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
      ${company ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Entreprise :</td><td style="padding: 8px 0;">${company}</td></tr>` : ''}
      ${phone ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Téléphone :</td><td style="padding: 8px 0;">${phone}</td></tr>` : ''}
      ${subject ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Objet :</td><td style="padding: 8px 0;">${subject}</td></tr>` : ''}
    </table>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />
    <h3 style="color: #555; margin-top: 0;">Message :</h3>
    <p style="line-height: 1.7; white-space: pre-wrap;">${message}</p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />
    <p style="font-size: 12px; color: #999;">Message envoyé depuis le formulaire de contact de voltea-energie.fr</p>
  </div>
</body>
</html>`;

  try {
    const mailer = getTransporter();
    await mailer.sendMail({
      from: `"Voltea Énergie" <${process.env.SMTP_USER}>`,
      to: contactTo,
      replyTo: email,
      subject: subjectLine,
      html: htmlBody,
    });

    return res.json({ success: true, message: 'Votre message a bien été envoyé. Nous vous répondrons sous 24h ouvrées.' });
  } catch (err) {
    console.error('[contact/sendContact]', err);
    return res.status(500).json({ error: 'Erreur lors de l\'envoi du message. Veuillez réessayer ou nous contacter directement.' });
  }
}

module.exports = { sendContact, validateContact };
