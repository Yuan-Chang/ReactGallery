const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());


if (process.env.NODE_ENV === 'production') {

    const path = require('path');

    // Express will serve up production assets
    // like our main.js file, or main.css file!
    app.use(express.static(path.resolve(__dirname, 'client', 'build')));

    // Express will serve up the index.html file
    // if it doesn't recognize the route

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT);
