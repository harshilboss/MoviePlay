const express = require('express');
const cors = require('cors');
const app = express();

let commandQueue = [];

app.use(cors());
app.use(express.json());

// POST: add command
app.post('/sendCommand', (req, res) => {
    const cmd = req.body.command;
    if (cmd) {
        commandQueue.push(cmd);
        console.log("Received command:", cmd);
    }
    res.send("OK");
});

// GET: fetch all pending commands
app.get('/getCommand', (req, res) => {
    res.json({ commands: [...commandQueue] }); // send a copy
    commandQueue = []; // clear after sending
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
