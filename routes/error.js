const express = require("express");
const router = express.Router();

router.get("/bad_request", (req, res) => {
    res.send("Bad Request Don't Repeat it !!!")
})


module.exports = router;