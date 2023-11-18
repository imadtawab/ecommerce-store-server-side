const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
  },
  categorie: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  prices: {
    type: Object,
    childSchemas: {
      originalPrice: Number,
      salePrice: Number,
      discount: Number,
    },
  },
  media: {
    type: Object,
    childSchemas: {
      images: Array,
    },
  },
  searchEngineOptimize: {
    type: Object,
    childSchemas: {
      urlKey: String,
      metaTitle: String,
      metaKeywords: String,
      metaDescription: String,
    },
  },
  productStatus: {
    type: Object,
    childSchemas: {
      status: String,
      visibility: String,
    },
  },
  quantite: {
    type: Number,
  },
  addedIn: {
    type: Date,
    default: Date.now(),
  },
  variants: {
    type: Array,
    dafault: []
  },
  attributes: {
    type: Array,
    dafault: []
  },
  userId: String
});

const products = mongoose.model("products", productSchema);

module.exports = products;
