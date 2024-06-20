// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

// Create an Express application
const app = express();

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'sdvx8f5sd84fzd8v5f29dz84fv52z9df52v69dzf2695sdfv95sdf95sdf', // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

app.set('view engine', 'ejs'); // Set EJS as the view engine

// Middleware to check if user is logged in
function requireLogin(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login.html');
    }
}
// Routes

app.get("/login" , (req,res)=>{
    if (req.session.user) {
        res.redirect("/admin/orders");
    } else {
        res.redirect('/login.html');
    }
})
app.get("/login.html" , (req,res,next)=>{
    if (req.session.user) {
        res.redirect("/admin/orders");
    } else {
        next();
    }
})


app.post('/loginpost', (req, res) => {
    const { username, password } = req.body;
    const users = [
        {
            username: 'ayoublahna',
            password: 'password11'
        }
    ];
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        req.session.user = user;
        res.redirect('/admin/orders');
    } else {
        res.status(401).send(`
            <script>
                alert('Invalid username or password');
                setTimeout(function() {
                    window.location.href = '/login.html';
                }, 1000); // Redirect back to login page after 1 second
            </script>
        `);
    }
});

app.get("/admin/orders", requireLogin, (req, res) => {
    const filePath = './data/orders.json';

    // Read the existing data from the JSON file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading data.json:', err);
            res.status(500).send('Error reading data');
            return;
        }

        let jsonData;
        try {
            jsonData = data ? JSON.parse(data) : [];
        } catch (parseErr) {
            console.error('Error parsing JSON data:', parseErr);
            res.status(500).send('Error parsing data');
            return;
        }
        res.render("display_orders", { submissions: jsonData });
    });
});

app.post('/submit', (req, res) => {
    // Extract form data from the request
    const { name, email, subject, message } = req.body;

    // Path to the JSON file
    const filePath = './data/orders.json';

    // Read the existing data from the JSON file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading data.json:', err);
            res.status(500).send('Error reading data');
            return;
        }

        let jsonData;
        try {
            jsonData = data ? JSON.parse(data) : [];
        } catch (parseErr) {
            console.error('Error parsing JSON data:', parseErr);
            res.status(500).send('Error parsing data');
            return;
        }

        // Add the new form data to the JSON data
        const newEntry = {
            name,
            email,
            subject,
            message,
            timestamp: new Date().toISOString()
        };
        jsonData.push(newEntry);

        // Write the updated data back to the JSON file
        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', (writeErr) => {
            if (writeErr) {
                console.error('Error writing to data.json:', writeErr);
                res.status(500).send('Error saving data');
                return;
            }

            // Respond to the client
            res.json({ message: 'Data saved successfully' });
        });
    });
});

app.get('/', (req, res) => {
    // Get the Accept-Language header from the request
    
    const acceptLanguageHeader = req.headers['accept-language'];

    if (acceptLanguageHeader) {
        // Parse the Accept-Language header to extract preferred languages
        const preferredLanguages = acceptLanguageHeader
            .split(',')
            .map(lang => {
                const [language, priority = 'q=1.0'] = lang.trim().split(';');
                return { language: language.toLowerCase(), priority: parseFloat(priority.split('=')[1]) };
            })
            .sort((a, b) => b.priority - a.priority)
            .map(entry => entry.language);

        if (preferredLanguages.length > 0) {
            // Check if French ('fr') is preferred
            const isFrenchPreferred = preferredLanguages.includes('fr');

            if (isFrenchPreferred) {
                res.redirect('/index.html');
            } else {
                res.redirect('/index_en.html');
            }
        } else {
            res.redirect('/index.html');
        }
    } else {
        res.redirect('/index.html');
    }
});

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Handle 404 errors
app.use((req, res) => {
    res.status(404).redirect("/404.html")
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Server is running on : http://localhost:${PORT}`);
});
