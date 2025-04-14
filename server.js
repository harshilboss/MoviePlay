// const express = require('express');
// const cors = require('cors');
// const app = express();

// let command = "";

// app.use(cors());
// app.use(express.json());

// app.get('/getCommand', (req, res) => {
//     res.json({ command });   // ✅ Proper JSON format for Unity
//     command = "";
// });



// app.post('/sendCommand', (req, res) => {
//     command = req.body.command;
//     res.send("OK");
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


const express = require('express');
const cors = require('cors');
const app = express();

let command = "";
let lastUpdated = 0;

app.use(cors());
app.use(express.json());

app.get('/getCommand', (req, res) => {
    res.json({ command });

    // Delay command clear for 2 seconds so all clients can fetch it
    const clearDelay = 2000;
    lastUpdated = Date.now();
    setTimeout(() => {
        if (Date.now() - lastUpdated >= clearDelay) {
            command = "";
        }
    }, clearDelay);
});

app.post('/sendCommand', (req, res) => {
    command = req.body.command;
    console.log("Received command:", command);
    res.send("OK");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
