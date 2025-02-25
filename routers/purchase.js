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
// router.post("/getProduct/:id", (req, res) => {
//   const { id } = req.params;
//   const getproductsid = "select * from id=?";
//   const joinIndex = "select * from products inner join ";
// });
router.post("/", async (req, res) => {
  const {
    vendorId,
    submittedById,
    submittedDate,
    approvedById,
    approvedDate,
    statusId,
    recievedDate,
    shippingFee,
    taxamount,
    paymentDate,
    paymentAmount,
    paymentMethod,
    notes,
    totalAmount,
    products,
  } = req.body;
  if (
    !vendorId ||
    !submittedById ||
    !approvedById ||
    !statusId ||
    !totalAmount ||
    !products ||
    products.length === 0
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    await connection.beginTransaction();
    const purchaseOrderId = await db.execute(
      `SELECT IFNULL(MAX(CategoryId),0) AS max_id FROM purchase`
    );
    db.query(purchaseOrderId, (err, result) => {
      if (err) {
        return req.send({ message: "error to get id" });
      }
      const index = result[0];
      if (!result[0]) {
        return res.send({ message: "invalid index" });
      }
      const { max_ids } = index;
      const insertProduct = `insert into purchase(purchaseOrderId, vendorId,
    submittedById,
    submittedDate,
    approvedById,
    approvedDate,
    statusId,
    recievedDate,
    shippingFee,
    taxamount,
    paymentDate,
    paymentAmount,
    paymentMethod,
    notes,
    totalAmount) values (?,?,?,NOW(),?,?,?,?,?,?,?,?,?,?,0)`;
      db.query(
        insertProduct,
        [
          max_ids + 1,
          vendorId,
          submittedById,
          submittedDate,
          approvedById,
          approvedDate,
          statusId,
          recievedDate,
          shippingFee,
          taxamount,
          paymentDate,
          paymentAmount,
          paymentMethod,
          notes,
          totalAmount,
        ],
        async (err, result) => {
          if (err) {
            return res.status(403).send({ message: "error to insert" });
          }
          const purchaseOrderDetailId = await db.execute(
            `SELECT IFNULL(MAX(CategoryId),0) AS max_id FROM purchaseOrderDetail`
          );
          db.query(purchaseOrderDetailId, (err, result) => {
            if (err) {
              return req.send({
                message: "error to create purchaseOrderDetailId id",
              });
            }
            const index = result[0];
            if (!result[0]) {
              return res.send({ message: "invalid index" });
            }
            const { max_id } = index;
          });
        }
      );
    });
  } catch (err) {
    return rollback();
  }
});
module.exports = router;

// const productQueries = products.map(
//   ({ ProductId, QuantityPerUnit, UnitPrice }) => {
//     return db
//       .promise()
//       .query(
//         `INSERT INTO purchaseOrderDetails (purchaseOrderDetailId,purchaseOrderId, productId, quantity, unitCost, receivedDate) VALUES (?, ?, ?, ?, ?)`,
//         [
//           max_ids + 1,
//           max_id + 1,
//           ProductId,
//           QuantityPerUnit,
//           UnitPrice,
//           recievedDate,
//         ]
//       );
//   }
// );
// Promise.all(productQueries)
//   .then(() => {
//     res.status(201).json({
//       message: "Purchase Order Created Successfully",
//       purchaseOrderId,
//     });
//   })
//   .catch((productError) => {
//     console.error("Error inserting products:", productError);
//     res.status(500).json({ message: "Failed to add products" });
//   });
