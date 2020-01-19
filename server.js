const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const listEndpoints = require("express-list-endpoints");
dotenv.config();
const server = express();
const db = require('./db');
const productsRouter = require("./src/routes/products");
const reviewRouter = require("./src/routes/reviews");

server.use(express.json());
server.use(cors());
server.use('/reviews', reviewRouter);
server.use('/products', productsRouter);
server.get('/', async (req, res) => {
        const response = await db.query("SELECT * FROM products");
        res.send(response.rows)
    }
);
console.log(listEndpoints(server));
server.listen(process.env.PORT, () => console.log(`Server is listening on ${process.env.PORT}`));