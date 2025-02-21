const express = require("express");
const db = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");
const roleMiddileware = require("../middleware/roleMiddleware");
const router = express.Router();
router.get("/", verifyToken, (req, res) => {
  const query = `select * from Products`;
  db.query(query, (err, result) => {
    if (err) {
      return res.status(500).send({ message: "Failed to retrieve employees" });
    }
    res.status(200).json(result);
  });
});
router.get("/:id", verifyToken, roleMiddileware("admin"), (req, res) => {
  const productsId = req.params.id;
  const query = `select * from Products where ProductID=?`;
  db.query(query, [productsId], (err, result) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res.status(500).json({ error: "Failed to retrieve products" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "products not found" });
    }
    res.status(200).json(result[0]);
  });
});

router.post("/", verifyToken, roleMiddileware("admin"), (req, res) => {
  const {
    ProductCode,
    ProductName,
    ProductDescription = "",
    StandardUnitCost,
    UnitPrice,
    ReorderLevel,
    TargetLevel,
    QuantityPerUnit,
    Discontinued,
    MinimumReorderQuantity,
    ProductCategoryID,
    addedBy,
    ModifiedBy,
    supplier_id,
  } = req.body;
  if (
    !ProductCode ||
    !ProductName ||
    StandardUnitCost == null ||
    UnitPrice == null ||
    ReorderLevel == null ||
    TargetLevel == null ||
    !QuantityPerUnit ||
    Discontinued == null ||
    MinimumReorderQuantity == null ||
    ProductCategoryID == null ||
    !addedBy ||
    !ModifiedBy ||
    !supplier_id
  ) {
    // console.log(
    //   ProductCode,
    //   ProductName,
    //   StandardUnitCost,
    //   UnitPrice,
    //   ReorderLevel,
    //   TargetLevel,
    //   QuantityPerUnit,
    //   Discontinued,
    //   MinimumReorderQuantity,
    //   ProductCategoryID,
    //   ModifiedBy,
    //   supplier_id
    // );
    return res.status(403).send({ message: "required all fields" });
  }
  const productQuery = `insert into Products (ProductCode,
    ProductName,
    ProductDescription,
    StandardUnitCost,
    UnitPrice,
    ReorderLevel,
    TargetLevel,
    QuantityPerUnit,
    Discontinued,
    MinimumReorderQuantity,
    ProductCategoryID,
    addedBy,
    ModifiedBy,AddedOn) values (?,?,?,?,?,?,?,?,?,?,?,?,?,NOW())`;
  db.query(
    productQuery,
    [
      ProductCode,
      ProductName,
      ProductDescription,
      StandardUnitCost,
      UnitPrice,
      ReorderLevel,
      TargetLevel,
      QuantityPerUnit,
      Discontinued,
      MinimumReorderQuantity,
      ProductCategoryID,
      addedBy,
      ModifiedBy,
    ],
    (err, results) => {
      if (err) {
        return res.status(403).send({
          message: "something wrong check it again or enter unique id",
        });
      }
      if (results.affectedRows === 0) {
        return res.status(403).send({ message: "must add unique id" });
      }
      const checkSupplierId = "select * from suppliers where id=?";
      db.query(checkSupplierId, [supplier_id], (err, result) => {
        if (err) {
          return res.status(403).send({ message: "error to get supplierId" });
        }
        if (result.length === 0) {
          return res.status(403).send({ message: "supplierId not found" });
        }
        const inserts =
          "insert into supplierProductTable (supplierId) values(?)";
        db.query(inserts, [supplier_id], (err, result) => {
          if (err) {
            return res.status(403).send({ message: "query error", err });
          }
          console.log(result.insertId);
          res.status(200).json({
            message: "Products added successfully",
            productId: results.insertId,
            productData: {
              ...req.body,
              supplier_id,
              AddedOn: new Date().toISOString(),
            },
          });
        });
      });
    }
  );
});

router.put("/:id", verifyToken, roleMiddileware("admin"), (req, res) => {
  const productIndex = req.params.id;
  const {
    ProductCode,
    ProductName,
    ProductDescription = "",
    StandardUnitCost,
    UnitPrice,
    ReorderLevel,
    TargetLevel,
    QuantityPerUnit,
    Discontinued,
    MinimumReorderQuantity,
    ProductCategoryID,
    ModifiedBy,
    supplier_id,
  } = req.body;
  const productUpdate = `update Products set ProductCode=?,
    ProductName=?,
    ProductDescription = ?,
    StandardUnitCost=?,
    UnitPrice=?,
    ReorderLevel=?,
    TargetLevel=?,
    QuantityPerUnit=?,
    Discontinued=?,
    MinimumReorderQuantity=?,
    ProductCategoryID=?,        
    ModifiedBy=?,ModifiedOn=now() where ProductID=?`;
  db.query(
    productUpdate,
    [
      ProductCode,
      ProductName,
      ProductDescription,
      StandardUnitCost,
      UnitPrice,
      ReorderLevel,
      TargetLevel,
      QuantityPerUnit,
      Discontinued,
      MinimumReorderQuantity,
      ProductCategoryID,
      ModifiedBy,
      productIndex,
    ],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .send({ message: "failed to update product", err });
      }
      if (result.affectedRows === 0) {
        return res.status(404).send({ message: "product doesn't exist" });
      }
      const checkSupplierId = "select * from suppliers where id=?";
      db.query(checkSupplierId, [supplier_id], (err, result) => {
        if (err) {
          return res.status(403).send({ message: "error to get supplierId" });
        }
        if (result.length === 0) {
          return res.status(403).send({ message: "supplierId not found" });
        }
        const inserts = "update supplierProductTable set supplierId=?";
        db.query(inserts, [supplier_id], (err, result) => {
          if (err) {
            return res.status(403).send({ message: "query error", err });
          }
          res.status(200).json({
            message: "Products updated successfully",
            productId: productIndex,
            productData: {
              ...req.body,
              supplier_id,
              ModifiedBy: new Date(),
            },
          });
        });
      });
    }
  );
});
router.delete("/:id", verifyToken, roleMiddileware("admin"), (req, res) => {
  const deleteIndex = req.params.id;
  const deleteQueryId = `delete from Products where ProductID=?`;
  db.query(deleteQueryId, [deleteIndex], (err, result) => {
    if (err) {
      return res.status(500).send({ message: "failed to delete id", err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: "product not found" });
    }
    res.status(200).json({ message: "deleted successfully" });
  });
});
module.exports = router;

// const getId = "select * from Products where id=?";
// db.query(getId, result.insertId, (err, result) => {
//   if (err) {
//     return res.status(403).send({ message: "" });
//   }
//   return res.status(201).json({
//     message: "Products added successfully",
//     productData: result,
//   });
// });
