// Accept a Firestore instance so we do not initialize Firebase here
module.exports = (db) => async function killTrigger(req, res, next) {
  const userId = req.headers['x-user-id'] || req.body.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Missing userId header or body field.' });
  }
  
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists || !userDoc.data().hasTakenTest) {
      return res.status(403).json({
        error: 'You must complete at least one practice test before using the API.'
      });
    }
    next();
  } catch (err) {
    console.error('killTrigger error', err);
    res.status(500).json({ error: 'Internal middleware error' });
    });
  }
};
