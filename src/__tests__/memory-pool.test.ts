import { describe, it, expect, beforeEach } from "vitest";
import {
  ObjectPool,
  ArrayPool,
  MapPool,
  SetPool,
  withPooledArray,
  globalArrayPool,
  globalMapPool,
  globalSetPool,
} from "../utils/memory-pool.js";

describe("Memory Pooling", () => {
  describe("ObjectPool", () => {
    it("should create new objects when pool is empty", () => {
      const pool = new ObjectPool(() => ({ value: 0 }));
      const obj1 = pool.acquire();
      const obj2 = pool.acquire();

      expect(obj1).toBeDefined();
      expect(obj2).toBeDefined();
      expect(obj1).not.toBe(obj2);
    });

    it("should reuse released objects", () => {
      const pool = new ObjectPool(() => ({ value: 0 }));
      const obj1 = pool.acquire();
      obj1.value = 42;

      pool.release(obj1);
      const obj2 = pool.acquire();

      expect(obj2).toBe(obj1);
      expect(obj2.value).toBe(42);
    });

    it("should reset objects when reset function provided", () => {
      const pool = new ObjectPool(
        () => ({ value: 0 }),
        1000,
        (obj) => {
          obj.value = 0;
        }
      );

      const obj1 = pool.acquire();
      obj1.value = 42;
      pool.release(obj1);

      const obj2 = pool.acquire();
      expect(obj2).toBe(obj1);
      expect(obj2.value).toBe(0); // Reset to 0
    });

    it("should respect max pool size", () => {
      const pool = new ObjectPool(() => ({ value: 0 }), 2);

      const obj1 = pool.acquire();
      const obj2 = pool.acquire();
      const obj3 = pool.acquire();

      pool.release(obj1);
      pool.release(obj2);
      pool.release(obj3); // Should be discarded

      expect(pool.size()).toBe(2);
    });

    it("should clear the pool", () => {
      const pool = new ObjectPool(() => ({ value: 0 }));
      const obj = pool.acquire();
      pool.release(obj);

      expect(pool.size()).toBe(1);
      pool.clear();
      expect(pool.size()).toBe(0);
    });
  });

  describe("ArrayPool", () => {
    let pool: ArrayPool<number>;

    beforeEach(() => {
      pool = new ArrayPool<number>(100);
    });

    it("should create new arrays when pool is empty", () => {
      const arr1 = pool.acquire(10);
      const arr2 = pool.acquire(10);

      expect(arr1).toBeInstanceOf(Array);
      expect(arr2).toBeInstanceOf(Array);
      expect(arr1).not.toBe(arr2);
    });

    it("should reuse released arrays of same size", () => {
      const arr1 = pool.acquire(10);
      arr1[0] = 42;

      pool.release(arr1);
      const arr2 = pool.acquire(10);

      expect(arr2).toBe(arr1);
      expect(arr2.length).toBe(0); // Cleared
    });

    it("should reuse any released array regardless of size hint", () => {
      const arr1 = pool.acquire(5);
      const arr2 = pool.acquire(10);

      pool.release(arr1);
      pool.release(arr2);

      // Should get arr2 (last released)
      const reused1 = pool.acquire(100);
      expect(reused1).toBe(arr2);

      // Should get arr1
      const reused2 = pool.acquire(1);
      expect(reused2).toBe(arr1);
    });

    it("should clear array contents on release", () => {
      const arr = pool.acquire(5);
      arr.push(1, 2, 3, 4, 5);
      
      expect(arr.length).toBe(5);

      pool.release(arr);
      const reused = pool.acquire(5);

      expect(reused).toBe(arr);
      expect(reused.length).toBe(0);
      expect(reused).toEqual([]);
    });

    it("should respect max pool size per array size", () => {
      const smallPool = new ArrayPool<number>(2);

      const arr1 = smallPool.acquire(10);
      const arr2 = smallPool.acquire(10);
      const arr3 = smallPool.acquire(10);

      smallPool.release(arr1);
      smallPool.release(arr2);
      smallPool.release(arr3); // Should be discarded

      expect(smallPool.size()).toBe(2);
    });

    it("should clear the pool", () => {
      const arr1 = pool.acquire(5);
      const arr2 = pool.acquire(10);

      pool.release(arr1);
      pool.release(arr2);

      expect(pool.size()).toBe(2);
      pool.clear();
      expect(pool.size()).toBe(0);
    });
  });

  describe("withPooledArray", () => {
    it("should provide pooled array and auto-cleanup", () => {
      const initialSize = globalArrayPool.size();

      const result = withPooledArray<number, number>(10, (arr) => {
        arr.push(1, 2, 3);
        return arr.reduce((a, b) => a + b, 0);
      });

      expect(result).toBe(6);
      // Array should be returned to pool
      expect(globalArrayPool.size()).toBeGreaterThanOrEqual(initialSize);
    });

    it("should cleanup even if function throws", () => {
      const initialSize = globalArrayPool.size();

      expect(() => {
        withPooledArray(10, () => {
          throw new Error("Test error");
        });
      }).toThrow("Test error");

      // Array should still be returned to pool
      expect(globalArrayPool.size()).toBeGreaterThanOrEqual(initialSize);
    });
  });

  describe("MapPool", () => {
    let pool: MapPool<string, number>;

    beforeEach(() => {
      pool = new MapPool<string, number>(50);
    });

    it("should create new Maps when pool is empty", () => {
      const map1 = pool.acquire();
      const map2 = pool.acquire();

      expect(map1).toBeInstanceOf(Map);
      expect(map2).toBeInstanceOf(Map);
      expect(map1).not.toBe(map2);
    });

    it("should reuse released Maps", () => {
      const map1 = pool.acquire();
      map1.set("key", 42);

      pool.release(map1);
      const map2 = pool.acquire();

      expect(map2).toBe(map1);
      expect(map2.size).toBe(0); // Cleared
    });

    it("should clear Map contents on release", () => {
      const map = pool.acquire();
      map.set("a", 1);
      map.set("b", 2);

      pool.release(map);
      const reused = pool.acquire();

      expect(reused).toBe(map);
      expect(reused.size).toBe(0);
    });

    it("should respect max pool size", () => {
      const smallPool = new MapPool<string, number>(2);

      const map1 = smallPool.acquire();
      const map2 = smallPool.acquire();
      const map3 = smallPool.acquire();

      smallPool.release(map1);
      smallPool.release(map2);
      smallPool.release(map3); // Should be discarded

      expect(smallPool.size()).toBe(2);
    });
  });

  describe("SetPool", () => {
    let pool: SetPool<string>;

    beforeEach(() => {
      pool = new SetPool<string>(50);
    });

    it("should create new Sets when pool is empty", () => {
      const set1 = pool.acquire();
      const set2 = pool.acquire();

      expect(set1).toBeInstanceOf(Set);
      expect(set2).toBeInstanceOf(Set);
      expect(set1).not.toBe(set2);
    });

    it("should reuse released Sets", () => {
      const set1 = pool.acquire();
      set1.add("value");

      pool.release(set1);
      const set2 = pool.acquire();

      expect(set2).toBe(set1);
      expect(set2.size).toBe(0); // Cleared
    });

    it("should clear Set contents on release", () => {
      const set = pool.acquire();
      set.add("a");
      set.add("b");

      pool.release(set);
      const reused = pool.acquire();

      expect(reused).toBe(set);
      expect(reused.size).toBe(0);
    });

    it("should respect max pool size", () => {
      const smallPool = new SetPool<string>(2);

      const set1 = smallPool.acquire();
      const set2 = smallPool.acquire();
      const set3 = smallPool.acquire();

      smallPool.release(set1);
      smallPool.release(set2);
      smallPool.release(set3); // Should be discarded

      expect(smallPool.size()).toBe(2);
    });
  });

  describe("Global Pools", () => {
    it("should have global array pool available", () => {
      expect(globalArrayPool).toBeDefined();
      expect(globalArrayPool).toBeInstanceOf(ArrayPool);
    });

    it("should have global map pool available", () => {
      expect(globalMapPool).toBeDefined();
      expect(globalMapPool).toBeInstanceOf(MapPool);
    });

    it("should have global set pool available", () => {
      expect(globalSetPool).toBeDefined();
      expect(globalSetPool).toBeInstanceOf(SetPool);
    });
  });

  describe("Performance", () => {
    it("should reduce allocation overhead", () => {
      const pool = new ArrayPool<number>(1000);
      const iterations = 1000;

      // Warm up
      for (let i = 0; i < 10; i++) {
        const arr = pool.acquire(100);
        pool.release(arr);
      }

      // Measure with pooling
      const startPooled = performance.now();
      for (let i = 0; i < iterations; i++) {
        const arr = pool.acquire(100);
        arr.push(...Array.from({ length: 100 }, (_, i) => i));
        pool.release(arr);
      }
      const pooledTime = performance.now() - startPooled;

      // Measure without pooling
      const startNormal = performance.now();
      for (let i = 0; i < iterations; i++) {
        const arr = new Array(100);
        arr.push(...Array.from({ length: 100 }, (_, i) => i));
      }
      const normalTime = performance.now() - startNormal;

      // Pooling should be faster (though this can vary)
      // At minimum, it shouldn't be significantly slower
      expect(pooledTime).toBeLessThan(normalTime * 2);
    });
  });
});
