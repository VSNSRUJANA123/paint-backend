const express = require("express");
const router = express.Router();
const db = require("../config/db");
router.get("/", (req, res) => {
  try {
    const rows = `
            SELECT * FROM purchase`;
    db.query(rows, (err, result) => {
      if (err) {
        return res.status(403).send({ message: "error to get productTable" });
      }
      return res.status(200).json(result);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post("/getProduct/:id", (req, res) => {
  const { id } = req.params;
  const getproductsid = "select * from id=?";
  const joinIndex='select * from inner products inner join '
});
module.exports = router;
