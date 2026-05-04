import express from 'express';
import multer from 'multer';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize Resend with API key from .env
const resend = new Resend(process.env.RESEND_API_KEY);

// Configure Multer to use memory storage (keeps file in RAM, not on disk)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        // Only accept PDFs
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed.'), false);
        }
    }
});

// GET: Show the application form
router.get('/', (req, res) => {
    res.render('index');
});

// POST: Handle the form submission
// The string 'resume' must match the name attribute of your file input
router.post('/submit', upload.single('resume'), async (req, res) => {
    try {
        const { fullName, email } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).send('Please upload a valid PDF resume.');
        }

        // Send the email using Resend
        const { data, error } = await resend.emails.send({
            from: 'Hunt Insurance Application <onboarding@resend.dev>',
            to: ['jrhunt@my.milligan.edu'],
            subject: `New Job Application from ${fullName}`,
            html: `
                <h2>New Application Received</h2>
                <p><strong>Name:</strong> ${fullName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p>The applicant's resume is attached to this email.</p>
            `,
            attachments: [
                {
                    filename: file.originalname,
                    content: file.buffer // Attaches the file directly from RAM
                }
            ]
        });

        if (error) {
            console.error('Resend Error:', error);
            return res.status(500).send('Error sending application.');
        }

        // If successful, redirect to the thank you page
        res.redirect('/thank-you');

    } catch (err) {
        console.error('Server Error:', err);
        res.status(500).send('An unexpected error occurred.');
    }
});

// GET: Show the thank you page
router.get('/thank-you', (req, res) => {
    res.render('thank-you');
});

export default router;