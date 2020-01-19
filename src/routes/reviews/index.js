const express = require("express");
const db = require("../../../db");
const moment = require("moment");

const router = express.Router();

router.get('/', async (req, res) => {
    let query = "SELECT * FROM reviews";
    const limit = req.query.limit;
    const offset = req.query.offset;
    const sort = req.query.sort;

    delete req.query.limit;
    delete req.query.offset;
    delete req.query.sort;

    const params = [limit, offset];

    let i = 0;
    for (var propName in req.query) { //for each extra query string parameter
        query += i === 0 ? " WHERE " : " AND "; //if it's the first, set the WHERE, else put the AND to join them
        query += propName + " = $" + (i + 3);// Add a property name followed by = $ number of the current param.
        //Since I already have $1 and $2 i must start from $3
        params.push(req.query[propName]);//I add the value of the query string param into the params array
        i++; //increment the index
    }
    if (sort)
        query += ' ORDER BY name ' + ((sort === "desc") ? "DESC" : "ASC");

    query += ' LIMIT $1 OFFSET $2';//closing up my query with limit and offset
    try {
        const reviews = await db.query(query, params);
        res.send({
            reviews: reviews.rows,
            total: reviews.rowCount
        })
    } catch (ex) {
        res.status(500).send(ex)
    }
});
router.get('/:id', async (req, res) => {
    try {
        const reviews = await db.query(`SELECT * FROM reviews WHERE reviews."productId" = $1`, [req.params.id]);
        if (reviews.rowCount === 0)
            return res.status(404).send("Not Found");
        else
            return res.send(reviews.rows)
    } catch (error) {
        res.status(500).send(error);

    }
});
// router.get('/search/:name', async (req,res)=>{
//     const projects = await db.query(`SELECT * FROM projects WHERE name LIKE $1`, [ '%' + req.params.name + '%']);
//     res.send(projects.rows);
// });
router.post('/', async (req, res) => {
    try {
        const result = await db.query(`INSERT INTO reviews (comment, rate,\"productId\", \"createdAt\")
                                       VALUES ($1,$2,$3,$4) 
                                       RETURNING *`,
            [req.body.comment, req.body.rate, req.body.productId, moment().format('YYYY-MM-DD HH:mm:ss')]);
        res.send(result.rows[0])
    } catch (ex) {
        console.log(ex);
        res.status(500).send(ex)
    }
});
router.put("/:id", async (req, res) => {
    try {
        const result = await db.query(`UPDATE reviews 
                                       SET 
                                       comment = $1,
                                        rate = $2,
                                      \"productId\" = $3
                                     WHERE _id = $4`,
            [req.body.comment, req.body.rate, req.body.productId, req.params.id]);

        if (result.rowCount === 0)
            res.status(404).send("not found");
        else
            res.send("OK")
    } catch (ex) {
        res.status(500).send(ex)
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const result = await db.query(`DELETE FROM reviews WHERE _id = $1`, [req.params.id]);

        if (result.rowCount === 0)
            res.status(404).send("not found");
        else
            res.send("OK")
    } catch (ex) {
        res.status(500).send(ex);
    }
});


module.exports = router;