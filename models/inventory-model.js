const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

// Get Vehicle by Id

async function getVehicleById(invId) {
  try {
    const sql = "SELECT * FROM inventory WHERE inv_id = $1"
    const result = await pool.query(sql, [invId])
    return result.rows[0]
  } catch (error) {
    console.error("getVehicleById error: " + error)
  }
}

async function checkExistingClassification(classification_name) {
  try {
    const sql = "SELECT * FROM classification WHERE classification_name = $1"
    const result = await pool.query(sql, [classification_name])
    return result.rowCount > 0
  } catch (error) {
    console.error("checkExistingClassification error:", error)
    return false
  }
}

async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    const data = await pool.query(sql, [classification_name])
    return data.rows[0]
  } catch (error) {
    console.error("addClassification error:", error)
    return null
  }
}

async function addInventory(
  classification_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color
) {
  try {
    const sql = `
      INSERT INTO inventory (
        classification_id, inv_make, inv_model, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`
    const data = await pool.query(sql, [
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
    ])
    return data.rows[0]
  } catch (error) {
    console.error("addInventory error:", error)
    return null
  }
}

async function updateInventory(item) {
  try {
    const sql = `
      UPDATE inventory
         SET classification_id = $1,
             inv_make = $2,
             inv_model = $3,
             inv_description = $4,
             inv_image = $5,
             inv_thumbnail = $6,
             inv_price = $7,
             inv_year = $8,
             inv_miles = $9,
             inv_color = $10
       WHERE inv_id = $11
       RETURNING inv_id`
    const params = [
      item.classification_id,
      item.inv_make,
      item.inv_model,
      item.inv_description,
      item.inv_image,
      item.inv_thumbnail,
      item.inv_price,
      item.inv_year,
      item.inv_miles,
      item.inv_color,
      item.inv_id
    ]
    const result = await pool.query(sql, params)
    return result.rowCount === 1
  } catch (err) {
    console.error("updateInventory error:", err)
    return false
  }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventory(inv_id) {
  try {
    const sql = "DELETE FROM inventory WHERE inv_id = $1"
    const data = await pool.query(sql, [inv_id])
    return data.rowCount === 1
  } catch (error) {
    console.error("deleteInventory error:", error)
    return false
  }
}

module.exports = {
  getClassifications, 
  getInventoryByClassificationId, 
  getVehicleById, 
  checkExistingClassification, 
  addClassification, 
  addInventory, 
  updateInventory, 
  deleteInventory 
};