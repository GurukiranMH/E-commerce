const express = require('express');

const adminController = require('../controllers/admin');

const isAuth = require('../middleware/is_auth');

const { body } = require('express-validator');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProductPage);

// /admin/add-product => POST
router.post(
  '/add-product',
  [
    body('title').isString().isLength({ min: 3 }).trim(),
    body('price').isFloat(),
    body('description').isLength({ min: 3, max: 400 }).trim(),
  ],
  isAuth,
  adminController.postNewProduct
);

// // /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

router.get(
  '/edit-product/:productId',
  isAuth,
  adminController.getEditProductPage
);

router.post(
  '/edit-product',
  [
    body('title').isString().isLength({ min: 3 }).trim(),
    body('price').isFloat(),
    body('description').isLength({ min: 3, max: 400 }).trim(),
  ],
  isAuth,
  adminController.postEditProductPage
);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
