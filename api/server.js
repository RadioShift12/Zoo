const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const animals = [
    { id: 1, name: "Leeeo", species: "Lion", health: "Excellent", status: "open" },
    { id: 2, name: "Mort", species: "Orca", health: "Good", status: "open" },
    { id: 3, name: "Ella", species: "Elephant", health: "Healthy", status: "closed" },
    { id: 4, name: "Dolly", species: "Dolphin", health: "Excellent", status: "open" }
];

app.get('/api/animals', (req, res) => {
    res.json(animals);
});

app.listen(PORT, () => {
    console.log(`Zoo API server running on http://localhost:${PORT}`);
});