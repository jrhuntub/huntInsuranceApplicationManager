import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import indexRouter from './routes/index.mjs';

// Load environment variables from .env file
dotenv.config();

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse URL-encoded bodies (for text inputs in forms)
app.use(express.urlencoded({ extended: true }));

// Mount our routes
app.use('/', indexRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running securely on http://localhost:${PORT}`);
});