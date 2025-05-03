// middleware/killTrigger.js
const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  // assumes you've already called admin.initializeApp() in server.js
  admin.initializeApp();
}

const db = getFirestore();

module.exports = async function killTrigger(req, res, next) {
  const userId = req.headers['x-user-id'] || req.body.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Missing userId header or body field.' });
  }
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists || !userDoc.data().hasTakenTest) {
    return res.status(403).json({
      error: 'You must complete at least one practice test before using the API.'
    });
  }
  next();
};
