const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin
const serviceAccount = require('./config/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Automated Daily Notifications (Cron Job)
const cron = require('node-cron');
// Runs every day at 18:00 (6:00 PM)
cron.schedule('0 18 * * *', () => {
    console.log('[CRON] Running daily garbage collection notification task...');
    if (apiRoutes.sendTomorrowNotifications) {
        apiRoutes.sendTomorrowNotifications();
    }
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log('Firebase Admin initialized');
});
