const express = require('express');
const path = require('path');

const app = express();
const port = 8080;

// Serve static files
app.use(express.static(__dirname));

// Route for the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Serenity Spa website running at http://localhost:${port}`);
});