const express = require("express");
const router = express.Router();
const db = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");
const roleMiddileware = require("../middleware/roleMiddleware");
router.get("/", verifyToken, roleMiddileware("admin"), (req, res) => {
  try {
    const query = "SELECT * FROM employees";
    db.query(query, (err, result) => {
      if (err) {
        return res
          .status(403)
          .send({ message: "Failed to retrieve employees" });
      }
      res.status(200).json(result);
    });
  } catch (err) {
    return res.status(500).json({ message: "something went wrong" });
  }
});

router.get("/:id", verifyToken, roleMiddileware("admin"), (req, res) => {
  const employeeId = req.params.id;
  const query = "SELECT * FROM employees WHERE id = ?";

  db.query(query, [employeeId], (err, result) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res.status(500).json({ error: "Failed to retrieve employee" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json(result[0]);
  });
});

router.post("/", verifyToken, roleMiddileware("admin"), (req, res) => {
  const {
    firstname,
    lastname,
    email,
    phonenumber,
    job_title,
    company_name,
    address,
    status,
  } = req.body;
  // console.log("post employee", req.body);
  if (!firstname || !phonenumber || !company_name || !address) {
    return res.status(400).json({ error: "All fields are required" });
  }
  // console.log(
  //   firstname,
  //   lastname,
  //   email,
  //   phonenumber,
  //   job_title,
  //   company_name,
  //   address,
  //   status
  // );
  const query = `INSERT INTO employees (firstname, lastname, email, phonenumber, job_title,company_name, address,status)
                 VALUES (?, ?, ?, ?, ?, ?,?,?)`;
  db.query(
    query,
    [
      firstname,
      lastname,
      email,
      phonenumber,
      job_title,
      company_name,
      address,
      status,
    ],
    (err, result) => {
      if (err) {
        console.error("Error inserting data:", err);
        return res.status(403).json({ error: "Failed to add employee" || err });
      }
      res.status(201).json({
        message: "Employee added successfully",
        employeeId: result.insertId,
        employeeData: req.body,
      });
    }
  );
});

router.put("/:id", verifyToken, roleMiddileware("admin"), (req, res) => {
  const { id } = req.params;
  const {
    firstname,
    lastname,
    email,
    phonenumber,
    job_title,
    company_name,
    address,
    status,
  } = req.body;
  // if (
  //   !firstname ||
  //   !lastname ||
  //   !email ||
  //   !phonenumber ||
  //   !job_title ||
  //   !company_name ||
  //   !address
  // ) {
  //   return res.status(400).json({ error: "All fields are required" });
  // }
  const query = `UPDATE employees SET firstname = ?, lastname = ?, email = ?,phonenumber=?,job_title=?, company_name = ?, address = ?,status=? WHERE id = ?`;
  db.query(
    query,
    [
      firstname,
      lastname,
      email,
      phonenumber,
      job_title,
      company_name,
      address,
      status,
      id,
    ],
    (err, result) => {
      if (err) {
        // console.log(err);
        return res.status(500).json({ error: "Failed to update employee" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.status(200).json({ message: "Employee updated successfully" });
    }
  );
});

router.delete("/:id", verifyToken, roleMiddileware("admin"), (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM employees WHERE id = ?`;

  db.query(query, [id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({ error: "Failed to delete employee" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).send({ error: "Employee not found" });
    }
    res.status(200).json({ message: "Employee deleted successfully" });
  });
});
module.exports = router;
