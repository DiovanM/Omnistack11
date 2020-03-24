const express = require('express');

const app = express();

app.get('/', (req, res) => {
    return res.json({
        nome: 'eu',
        description: 'fé'
    });
});

app.listen(3333);

