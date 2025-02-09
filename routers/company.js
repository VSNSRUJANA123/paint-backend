const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");
const roleMiddileware = require("../middleware/roleMiddleware");
router.get("/", (req, res) => {
  const companyDetails = "select * from company";
  db.query(companyDetails, (err, result) => {
    if (err) {
      return res.status(403).send({ message: "error to get company values" });
    }
    return res.status(200).send(result);
  });
});
router.post("/", verifyToken, roleMiddileware("admin"), (req, res) => {
  const { name, addedby, modifiedBy } = req.body;
  console.log(name, addedby, modifiedBy);
  if (!name || !addedby || !modifiedBy) {
    return res.status(403).json({ message: "required field" });
  }
  const insertCompany =
    "insert into company (name,addedby,modifiedBy) values (?,?,?)";
  db.query(insertCompany, [name, addedby, modifiedBy], (err, result) => {
    if (err) {
      return res.status(403).send({ message: "error to insert values", err });
    }
    const getId = `select * from company where id=${result.insertId}`;
    db.query(getId, (err, result) => {
      if (err) {
        return res.status(403).send({ message: "error to create id" });
      }
      return res
        .status(200)
        .send({ message: "company add successfully", result });
    });
    // return res.status(200).send({
    //   message: "company add successfully",
    //   companyTypeId: result.insertId,
    //   companyTypeBody: req.body,
    // });
  });
});
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, modifiedBy } = req.body;
  const index = "select * from company where id=?";
  db.query(index, [id], (err, result) => {
    if (err) {
      return res.status(403).send({ message: "error to get id" });
    }
    if (result.length === 0) {
      return res.status(200).send({ message: "company id not found" });
    }
    const updateCompany = "update company set name=?,modifiedBy=? where id=?";
    db.query(updateCompany, [name, modifiedBy, id], (err, result) => {
      if (err) {
        return res.status(403).send({ message: "error to update data", err });
      }
      const getId = `select * from company where id=${id}`;
      db.query(getId, (err, result) => {
        if (err) {
          return res.status(403).send({ message: "error to create id" });
        }
        return res.status(200).send({ message: "update successfully", result });
      });
      // return res.status(200).send({ message: "update successfully" });
    });
  });
});
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const index = "select * from company where id=?";
  db.query(index, [id], (err, result) => {
    if (err) {
      return res.status(403).send({ message: "error to get id" });
    }
    if (result.length === 0) {
      return res.status(200).send({ message: "companyType id not found" });
    }
    const deleteCompany = "delete from company where id=?";
    db.query(deleteCompany, [id], (err, result) => {
      if (err) {
        return res.status(403).send({ message: "error to delete data", err });
      }
      return res.status(200).send({ message: "delete data successfully" });
    });
  });
});
module.exports = router;
