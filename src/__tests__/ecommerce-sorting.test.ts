/**
 * E-Commerce Sorting Tests
 */

import { describe, it, expect } from "vitest";
import { buildFuzzyIndex, getSuggestions } from "../index.js";

describe("E-Commerce Sorting", () => {
  describe("Numeric Sorting", () => {
    it("should sort by price ascending", () => {
      const products = [
        { name: "Expensive Shoes", price: 150 },
        { name: "Cheap Shoes", price: 20 },
        { name: "Mid Shoes", price: 50 },
      ];

      const index = buildFuzzyIndex(products, {
        fields: ["name", "price"],
      });

      const results = getSuggestions(index, "shoes", 10, {
        sort: {
          primary: { field: "price", order: "asc" },
        },
      });

      expect(results.length).toBe(3);
      const prices = results.map((r) => Number(r.fields?.price));
      expect(prices).toEqual([20, 50, 150]);
    });

    it("should sort by price descending", () => {
      const products = [
        { name: "Cheap Shoes", price: 20 },
        { name: "Mid Shoes", price: 50 },
        { name: "Expensive Shoes", price: 150 },
      ];

      const index = buildFuzzyIndex(products, {
        fields: ["name", "price"],
      });

      const results = getSuggestions(index, "shoes", 10, {
        sort: {
          primary: { field: "price", order: "desc" },
        },
      });

      expect(results.length).toBe(3);
      const prices = results.map((r) => Number(r.fields?.price));
      expect(prices).toEqual([150, 50, 20]);
    });
  });

  describe("String Sorting", () => {
    it("should sort by name alphabetically", () => {
      const products = [
        { name: "Zebra Product", category: "Animals" },
        { name: "Apple Product", category: "Fruits" },
        { name: "Mango Product", category: "Fruits" },
      ];

      const index = buildFuzzyIndex(products, {
        fields: ["name", "category"],
      });

      const results = getSuggestions(index, "product", 10, {
        sort: {
          primary: { field: "name", order: "asc", type: "string" },
        },
      });

      expect(results[0].display).toBe("Apple Product");
      expect(results[1].display).toBe("Mango Product");
      expect(results[2].display).toBe("Zebra Product");
    });
  });

  describe("Secondary Sorting", () => {
    it("should use secondary sort for ties", () => {
      const products = [
        { name: "Product A", price: 50, rating: 3.5 },
        { name: "Product B", price: 50, rating: 4.5 },
        { name: "Product C", price: 50, rating: 4.0 },
      ];

      const index = buildFuzzyIndex(products, {
        fields: ["name", "price", "rating"],
      });

      const results = getSuggestions(index, "product", 10, {
        sort: {
          primary: { field: "price", order: "asc" },
          secondary: { field: "rating", order: "desc" },
        },
      });

      expect(results.length).toBe(3);
      const ratings = results.map((r) => Number(r.fields?.rating));
      // All have same price, so sorted by rating descending
      expect(ratings[0]).toBeGreaterThanOrEqual(ratings[1]);
      expect(ratings[1]).toBeGreaterThanOrEqual(ratings[2]);
    });
  });

  describe("Sorting with Filters", () => {
    it("should sort filtered results", () => {
      const products = [
        { name: "Nike Shoes", brand: "Nike", price: 75 },
        { name: "Adidas Shoes", brand: "Adidas", price: 60 },
        { name: "Nike Sneakers", brand: "Nike", price: 50 },
        { name: "Puma Shoes", brand: "Puma", price: 80 },
      ];

      const index = buildFuzzyIndex(products, {
        fields: ["name", "brand", "price"],
      });

      const results = getSuggestions(index, "nike", 10, {
        filters: {
          terms: [{ field: "brand", values: ["Nike"] }],
        },
        sort: {
          primary: { field: "price", order: "asc" },
        },
      });

      expect(results.length).toBe(2);
      const prices = results.map((r) => Number(r.fields?.price));
      expect(prices).toEqual([50, 75]);
    });
  });
});
