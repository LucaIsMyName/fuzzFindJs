"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
class ObjectPool {
  pool = [];
  factory;
  reset;
  maxSize;
  constructor(factory, maxSize = 1e3, reset) {
    this.factory = factory;
    this.maxSize = maxSize;
    this.reset = reset;
  }
  /**
   * Get an object from the pool or create a new one
   */
  acquire() {
    const obj = this.pool.pop();
    if (obj !== void 0) {
      return obj;
    }
    return this.factory();
  }
  /**
   * Return an object to the pool for reuse
   */
  release(obj) {
    if (this.pool.length < this.maxSize) {
      if (this.reset) {
        this.reset(obj);
      }
      this.pool.push(obj);
    }
  }
  /**
   * Clear the pool
   */
  clear() {
    this.pool = [];
  }
  /**
   * Get current pool size
   */
  size() {
    return this.pool.length;
  }
}
class ArrayPool {
  pool = [];
  maxSize;
  constructor(maxSize = 1e3) {
    this.maxSize = maxSize;
  }
  /**
   * Get an array from the pool (size is just a hint for organization)
   */
  acquire(_size) {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return [];
  }
  /**
   * Return an array to the pool for reuse
   */
  release(arr) {
    if (this.pool.length < this.maxSize) {
      arr.length = 0;
      this.pool.push(arr);
    }
  }
  /**
   * Clear the pool
   */
  clear() {
    this.pool = [];
  }
  /**
   * Get total number of pooled arrays
   */
  size() {
    return this.pool.length;
  }
}
const globalArrayPool = new ArrayPool(500);
function withPooledArray(size, fn) {
  const arr = globalArrayPool.acquire(size);
  try {
    return fn(arr);
  } finally {
    globalArrayPool.release(arr);
  }
}
class MapPool {
  pool = [];
  maxSize;
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }
  /**
   * Get a Map from the pool
   */
  acquire() {
    const map = this.pool.pop();
    if (map !== void 0) {
      return map;
    }
    return /* @__PURE__ */ new Map();
  }
  /**
   * Return a Map to the pool for reuse
   */
  release(map) {
    if (this.pool.length < this.maxSize) {
      map.clear();
      this.pool.push(map);
    }
  }
  /**
   * Clear the pool
   */
  clear() {
    this.pool = [];
  }
  /**
   * Get current pool size
   */
  size() {
    return this.pool.length;
  }
}
class SetPool {
  pool = [];
  maxSize;
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }
  /**
   * Get a Set from the pool
   */
  acquire() {
    const set = this.pool.pop();
    if (set !== void 0) {
      return set;
    }
    return /* @__PURE__ */ new Set();
  }
  /**
   * Return a Set to the pool for reuse
   */
  release(set) {
    if (this.pool.length < this.maxSize) {
      set.clear();
      this.pool.push(set);
    }
  }
  /**
   * Clear the pool
   */
  clear() {
    this.pool = [];
  }
  /**
   * Get current pool size
   */
  size() {
    return this.pool.length;
  }
}
const globalMapPool = new MapPool(100);
const globalSetPool = new SetPool(100);
exports.ArrayPool = ArrayPool;
exports.MapPool = MapPool;
exports.ObjectPool = ObjectPool;
exports.SetPool = SetPool;
exports.globalArrayPool = globalArrayPool;
exports.globalMapPool = globalMapPool;
exports.globalSetPool = globalSetPool;
exports.withPooledArray = withPooledArray;
//# sourceMappingURL=memory-pool.cjs.map
