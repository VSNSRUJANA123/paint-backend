const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");
const roleMiddileware = require("../middleware/roleMiddleware");

// Get all suppliers
router.get("/", verifyToken, roleMiddileware("admin"), (req, res) => {
  const query = "SELECT * FROM suppliers";
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).send("Failed to retrieve suppliers");
    }
    res.status(200).json(result);
  });
});

// Get supplier by ID
router.get("/:id", verifyToken, roleMiddileware("admin"), (req, res) => {
  const supplierId = req.params.id;
  const query = "SELECT * FROM suppliers WHERE id = ?";

  db.query(query, [supplierId], (err, result) => {
    if (err) {
      console.error("Error fetching supplier:", err);
      return res.status(500).json({ error: "Failed to retrieve supplier" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.status(200).json(result[0]);
  });
});

// Add a new supplier (only if the employee ID exists)
router.post("/", verifyToken, roleMiddileware("admin"), (req, res) => {
  // const { id } = req.params;
  const {
    firstname,
    lastname,
    email,
    phonenumber,
    company_id,
    jobtitle,
    address,
    city,
    state,
    zip,
    website,
    description,
  } = req.body;

  if (!firstname || !phonenumber || !company_id) {
    return res.status(403).send("required fields");
  }
  const companyQuery = "select * from company where id=? ";
  db.query(companyQuery, [company_id], (err, result) => {
    if (err) {
      console.log(err);
      return res
        .status(403)
        .json({ message: "something error to get company" });
    }
    if (result.length === 0) {
      return res.status(200).json({ message: "company not found" });
    }
    console.log("yes i am here");
    const supplierQuery = `insert into suppliers(firstname,
        lastname,
        email,
        phonenumber,
        company_id,
        jobtitle,
        address,
        city,
        state,
        zip,
        website,
        description) values(?,?,?,?,?,?,?,?,?,?,?,?)`;
    db.query(
      supplierQuery,
      [
        firstname,
        lastname,
        email,
        phonenumber,
        company_id,
        jobtitle,
        address,
        city,
        state,
        zip,
        website,
        description,
      ],
      (err, result) => {
        if (err) {
          console.error("Error inserting supplier data:", err);
          return res.status(500).json({ message: "Failed to add supplier" });
        }
        res.status(201).json({
          message: "Supplier added successfully",
          supplierId: result.insertId,
          supplierData: req.body,
        });
      }
    );
  });
});

router.put("/:id", verifyToken, roleMiddileware("admin"), (req, res) => {
  const productIndex = req.params.id;
  const {
    firstname,
    lastname,
    email,
    phonenumber,
    company_id,
    jobtitle,
    address,
    city,
    state,
    zip,
    website,
    description,
  } = req.body;
  const employeeQuery = "SELECT * FROM suppliers WHERE id = ?";
  db.query(employeeQuery, [productIndex], (err, employeeResult) => {
    if (err) {
      console.error("Error checking employeeId:", err);
      return res.status(500).json({ error: "Failed to verify employeeId" });
    }
    if (employeeResult.affectedRows === 0) {
      return res.status(404).json({ error: "supplier not found" });
    }
    const companyIndex = "select * from company where id=?";
    db.query(companyIndex, [company_id], (err, result) => {
      if (err) {
        return res
          .status(403)
          .send({ message: "error to get company details" });
      }
      if (result.length === 0) {
        return res.status(403).send({ message: "invalid company" });
      }
      const query = `UPDATE suppliers SET firstname=?,
    lastname=?,
    email=?,
    phonenumber=?,
    company_id=?,
    jobtitle=?,
    address=?,
    city=?,
    state=?,
    zip=?,
    website=?,
    description=?
    WHERE id = ?`;
      const websiteValue = website ? website : null;
      const descriptionValue = description ? description : null;
      db.query(
        query,
        [
          firstname,
          lastname,
          email,
          phonenumber,
          company_id,
          jobtitle,
          address,
          city,
          state,
          zip,
          websiteValue,
          descriptionValue,
          productIndex,
        ],
        (err, result) => {
          if (err) {
            return res.status(500).json({ error: "Failed to update supplier" });
          }
          if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Supplier not found" });
          }
          res.status(200).json({
            message: "Supplier updated successfully",
            supplierId: productIndex,
            supplierData: req.body,
          });
        }
      );
    });
  });
});

router.delete("/:id", verifyToken, roleMiddileware("admin"), (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM suppliers WHERE id = ?`;
  db.query(query, [id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({ message: "Failed to delete supplier" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: "Supplier not found" });
    }
    res.status(200).json({ message: "Supplier deleted successfully" });
  });
});

module.exports = router;
