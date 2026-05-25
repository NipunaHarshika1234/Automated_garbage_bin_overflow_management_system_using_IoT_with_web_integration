const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Removed top-level db reference to ensure we always use initialized firestore inside routes



// --- BIN ROUTES (Bridge for ESP32) ---

// This route receives data from ESP32 and updates Firestore
router.post('/bins/update', async (req, res) => {
    console.log(`[API] Received POST request to /bins/update at ${new Date().toISOString()}`);
    
    if (!req.body || Object.keys(req.body).length === 0) {
        console.warn("[API] Received empty request body");
        return res.status(400).json({ error: 'Request body is empty' });
    }

    console.log(`[API] Body Data:`, JSON.stringify(req.body));
    
    try {
        const { fillLevel, level, lat, lng, latitude, longitude, address, zone } = req.body;
        let binId = req.body.binId;
        
        if (!binId) {
            console.warn("[API] Missing 'binId' in request body");
            return res.status(400).json({ error: 'binId is required' });
        }
        
        binId = binId.trim(); // Ensure no trailing spaces

        // Robustness: Accept both 'fillLevel' and 'level'
        const rawLevel = fillLevel !== undefined ? fillLevel : level;
        const numericLevel = Number(rawLevel) || 0;
        
        // Robustness: Accept both 'lat/lng' and 'latitude/longitude'
        const finalLat = Number(lat || latitude) || 0;
        const finalLng = Number(lng || longitude) || 0;

        // Get Firestore instance inside the route to ensure it's initialized
        const firestore = admin.firestore();
        const binRef = firestore.collection('bins').doc(binId);

        // Fetch current status to check if it's already "dispatched"
        const binDoc = await binRef.get();
        const currentStatus = binDoc.exists ? binDoc.data().status : 'active';
        
        const integerLevel = Math.floor(numericLevel);
        let newStatus = integerLevel >= 100 ? 'overflowing' : 'active';
        
        if (currentStatus === 'dispatched') {
            if (integerLevel >= 100) {
                newStatus = 'dispatched';
            } else {
                console.log(`[API] DISPATCH AUTO-CLEAR: Bin ${binId} level is ${integerLevel}% (less than 100%). Reverting to active.`);
                newStatus = 'active';
            }
        }

        console.log(`[SENSOR UPDATE] Bin: ${binId} | Level: ${integerLevel}% | Status: ${currentStatus} -> ${newStatus}`);

        const updateData = {
            binId,
            fillLevel: integerLevel,
            status: newStatus,
            latitude: finalLat,
            longitude: finalLng,
            address: address || binId,
            zone: zone || 'Unassigned',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await binRef.set(updateData, { merge: true });
        res.json({ msg: 'Bin updated in Firestore successfully', bin: updateData });
    } catch (err) {
        console.error('[API] Firestore Update Error:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// GET /bins (Optional now as frontend uses Firestore directly, but kept for testing)
router.get('/bins', async (req, res) => {
    try {
        const snapshot = await db.collection('bins').get();
        const bins = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(bins);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// --- DISPATCH ROUTE (Send Email) ---

router.post('/dispatch', async (req, res) => {
    const { binId, address, zone, driverPhone } = req.body;

    try {
        // Improved transporter configuration
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: `"UrbanClean Dispatch" <${process.env.EMAIL_USER}>`,
            to: 'thimirahansika23@gmail.com',
            subject: `🚨 WASTE OVERFLOW ALERT: Bin #${binId}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px;">
                    <h2 style="color: #ef4444; border-bottom: 2px solid #ef4444; padding-bottom: 10px;">Critical Overflow Detected</h2>
                    <p style="font-size: 16px;"><strong>Bin ID:</strong> #${binId}</p>
                    <p style="font-size: 16px;"><strong>Location:</strong> ${address}</p>
                    <p style="font-size: 16px;"><strong>Zone:</strong> ${zone}</p>
                    <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin-top: 20px;">
                        <p style="margin: 0; font-weight: bold; color: #166534;">Truck Driver Contact:</p>
                        <p style="margin: 5px 0 0 0; font-size: 24px; color: #10b981; font-weight: 800;">${driverPhone}</p>
                    </div>
                    <p style="color: #64748b; font-size: 12px; margin-top: 20px;">Please dispatch this truck to clear the bin immediately.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        // Professional Touch: Update Firestore status in the backend upon successful dispatch
        const firestore = admin.firestore();
        const binRef = firestore.collection('bins').doc(binId);
        await binRef.update({ 
            status: 'dispatched',
            dispatchedAt: admin.firestore.FieldValue.serverTimestamp()
        }).catch(err => console.error(`[API] Could not update status to dispatched for ${binId}:`, err.message));

        res.json({ success: true, msg: 'Dispatch email sent and status updated' });
    } catch (err) {
        console.error('Email Dispatch Error Details:', err.message);
        res.status(200).json({ success: false, msg: 'Email failed: ' + err.message });
    }
});

// --- NOTIFICATION ROUTES (Automated SMS) ---

// Logic to send notifications for tomorrow's collection
const sendTomorrowNotifications = async () => {
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateKey = tomorrow.toISOString().split('T')[0];

        console.log(`[AUTOMATION] Checking schedule for ${dateKey}...`);

        // 1. Check if there's a special schedule in garbage_calendar
        const calendarDoc = await db.collection('garbage_calendar').doc(dateKey).get();
        let collectionType = null;

        if (calendarDoc.exists) {
            collectionType = calendarDoc.data().type;
        }

        // 2. If no special schedule, check if there's a manual collection entry (optional, depends on how you want it)
        // For now, we only use the professional calendar as the source of truth for "Tomorrow's Collection"
        
        if (!collectionType) {
            console.log(`[AUTOMATION] No collection scheduled for tomorrow (${dateKey}).`);
            return { success: true, msg: 'No collection scheduled' };
        }

        console.log(`[AUTOMATION] Found collection type: ${collectionType}. Fetching citizens...`);

        // 3. Get all citizens with phone numbers
        const usersSnapshot = await db.collection('users').where('role', '==', 'citizen').get();
        const citizens = usersSnapshot.docs.map(doc => doc.data()).filter(u => u.phoneNumber);

        if (citizens.length === 0) {
            console.log('[AUTOMATION] No citizens with phone numbers found.');
            return { success: true, msg: 'No citizens to notify' };
        }

        for (const citizen of citizens) {
            const message = `Hello ${citizen.name.split(' ')[0]}, this is UrbanClean. Tomorrow (${dateKey}) we will be collecting ${collectionType} waste. Please have your bins ready by 7:00 AM.`;
            
            // Log the notification (Twilio SMS removed)
            console.log('------------------------------------------');
            console.log(`[NOTIFICATION] To: ${citizen.phoneNumber}`);
            console.log(`MESSAGE: ${message}`);
            console.log('------------------------------------------');
        }

        return { success: true, count: citizens.length, type: collectionType };
    } catch (err) {
        console.error('[AUTOMATION ERROR]:', err);
        throw err;
    }
};

// Route to manually trigger (for testing or admin button)
router.post('/notifications/trigger-tomorrow', async (req, res) => {
    try {
        const result = await sendTomorrowNotifications();
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Export the function so server.js can use it for cron
router.sendTomorrowNotifications = sendTomorrowNotifications;

module.exports = router;
