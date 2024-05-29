const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const admin = require("firebase-admin");
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const app = express();
const db = getFirestore();

app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/dashboard', (req, res) => {
    const { username } = req.query;
    if (!username) {
        return res.status(401).send('Unauthorized');
    }
    res.render('dashboard', { username });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.listen(8080, () => {
    console.log('Server is listening on port 8080');
});

app.post('/api/users/login', (req, res) => {
    const { email, password } = req.body;

    db.collection('Loginpage').where('email', '==', email).where('password', '==', password).get()
        .then((snapshot) => {
            if (snapshot.empty) {
                res.status(401).json({ error: 'Invalid email or password' });
            } else {
                const user = snapshot.docs[0].data();
                res.status(200).json({ message: 'Login successful', username: user.name });
            }
        })
        .catch((error) => {
            console.error("Error during login:", error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

app.post('/api/users', (req, res) => {
    const userData = req.body;
    db.collection('Loginpage').add(userData)
        .then((docRef) => {
            res.status(201).json({ message: "User added successfully", username: userData.name });
        })
        .catch((error) => {
            console.error("Error adding user:", error);
            res.status(500).json({ error: "Internal Server Error" });
        });
});
