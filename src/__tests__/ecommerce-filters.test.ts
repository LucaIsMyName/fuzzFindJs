/**
 * E-Commerce Filtering Tests
 */

import { describe, it, expect } from "vitest";
import { buildFuzzyIndex, getSuggestions } from "../index.js";

describe("E-Commerce Filters", () => {
  describe("Range Filters", () => {
    it("should filter by price range", () => {
      const products = [
        { name: "Cheap Shoes", price: 20 },
        { name: "Mid Shoes", price: 50 },
        { name: "Expensive Shoes", price: 150 },
      ];

      const index = buildFuzzyIndex(products, {
        fields: ["name", "price"],
      });

      const results = getSuggestions(index, "shoes", 10, {
        filters: {
          ranges: [{ field: "price", min: 40, max: 100 }],
        },
      });

      expect(results.length).toBe(1);
      expect(results[0].display).toBe("Mid Shoes");
    });
  });

  describe("Term Filters", () => {
    it("should filter by brand", () => {
      const products = [
        { name: "Nike Shoes", brand: "Nike" },
        { name: "Adidas Shoes", brand: "Adidas" },
        { name: "Puma Shoes", brand: "Puma" },
      ];

      const index = buildFuzzyIndex(products, {
        fields: ["name", "brand"],
      });

      const results = getSuggestions(index, "shoes", 10, {
        filters: {
          terms: [{ field: "brand", values: ["Nike", "Adidas"] }],
        },
      });

      expect(results.length).toBe(2);
      expect(results.some((r) => r.display === "Nike Shoes")).toBe(true);
      expect(results.some((r) => r.display === "Adidas Shoes")).toBe(true);
    });
  });

  describe("Boolean Filters", () => {
    it("should filter by inStock", () => {
      const products = [
        { name: "Available Item", inStock: true },
        { name: "Sold Out Item", inStock: false },
      ];

      const index = buildFuzzyIndex(products, {
        fields: ["name", "inStock"],
      });

      const results = getSuggestions(index, "item", 10, {
        filters: {
          booleans: [{ field: "inStock", value: true }],
        },
      });

      expect(results.length).toBe(1);
      expect(results[0].display).toBe("Available Item");
    });
  });

  describe("Combined Filters", () => {
    it("should apply multiple filters", () => {
      const products = [
        { name: "Nike Red Shoes", brand: "Nike", price: 50, inStock: true },
        { name: "Nike Blue Shoes", brand: "Nike", price: 75, inStock: false },
        { name: "Adidas Red Shoes", brand: "Adidas", price: 60, inStock: true },
      ];

      const index = buildFuzzyIndex(products, {
        fields: ["name", "brand", "price", "inStock"],
      });

      const results = getSuggestions(index, "shoes", 10, {
        filters: {
          ranges: [{ field: "price", min: 50, max: 70 }],
          terms: [{ field: "brand", values: ["Nike", "Adidas"] }],
          booleans: [{ field: "inStock", value: true }],
        },
      });

      expect(results.length).toBe(2);
      expect(results.some((r) => r.display === "Nike Red Shoes")).toBe(true);
      expect(results.some((r) => r.display === "Adidas Red Shoes")).toBe(true);
    });
  });
});
