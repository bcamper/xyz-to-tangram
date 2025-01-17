(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.xyzToTangram = factory());
}(this, function () { 'use strict';

    // Basemap options
    var defaultBasemap = 'refill';

    // this gets merged into basemaps to change 'mapzen' vector tile source definitions to their XYZ HERE equivalent
    // TODO: this does not yet override terrain/normal tiles for hillshading
    var xyzTilezenSourceOverride = {
        sources: {
            mapzen: {
                url: 'https://xyz.api.here.com/tiles/osmbase/512/all/{z}/{x}/{y}.mvt',
                url_params: {
                    'access_token': 'global.xyz_access_token'
                }
            }
        }
    };

    // basemap scene definitions
    // each is a function that takes an options object, and returns a Tangram scene object
    var basemaps = {
        // No basemap
        'none': function () {
          return {};
        },

        // XYZ basemaps
        'dots': function () {
            return Object.assign({}, {import: 'https://sensescape.github.io/xyz-dots/scene.yaml'},
                xyzTilezenSourceOverride);
        },
        'pixel': function () {
            return Object.assign({}, {import: 'https://sensescape.github.io/xyz-pixel/scene.yaml'},
                xyzTilezenSourceOverride);
        },
        'satellite': function () {
            return Object.assign({}, {import: [
                    'https://www.nextzen.org/carto/refill-style/refill-style.zip',
                    'satellite.yaml'
                ]},
                xyzTilezenSourceOverride);
        },

        // Mapzen basemaps
        'refill': function (ref) {
            var labelsOnTop = ref.labelsOnTop;

            var basemap = Object.assign({}, {import: [
                    'https://www.nextzen.org/carto/refill-style/refill-style.zip',
                    'https://www.nextzen.org/carto/refill-style/themes/label-4.zip',
                    'https://www.nextzen.org/carto/refill-style/themes/terrain-shading-dark.zip',
                    'https://www.nextzen.org/carto/refill-style/themes/no-texture.zip'
                ]},
                xyzTilezenSourceOverride);
            if (labelsOnTop) {
                basemap.styles = {
                    // temp override to put basemap labels on top
                    'text-blend-order': {
                        blend_order: 100
                    },
                    mapzen_icon_library: {
                        blend_order: 100
                    }
                };
            }
            return basemap;
        },
        'refill-dark': function (ref) {
            var labelsOnTop = ref.labelsOnTop;

            var basemap = Object.assign({}, {import: [
                    'https://www.nextzen.org/carto/refill-style/refill-style.zip',
                    'https://www.nextzen.org/carto/refill-style/themes/color-gray-gold.zip',
                    'https://www.nextzen.org/carto/refill-style/themes/label-4.zip' ]},
                xyzTilezenSourceOverride);
            if (labelsOnTop) {
                basemap.styles = {
                    // temp override to put basemap labels on top
                    'text-blend-order': {
                        blend_order: 100
                    },
                    mapzen_icon_library: {
                        blend_order: 100
                    }
                };
            }
            return basemap;
        },
        'walkabout': function (ref) {
            var labelsOnTop = ref.labelsOnTop;

            var basemap = Object.assign({}, {import: [
                    'https://www.nextzen.org/carto/walkabout-style/walkabout-style.zip',
                    'https://www.nextzen.org/carto/walkabout-style/themes/walkabout-road-shields-usa.zip',
                    'https://www.nextzen.org/carto/walkabout-style/themes/walkabout-road-shields-international.zip'
                ]},
                xyzTilezenSourceOverride);
            if (labelsOnTop) {
                basemap.styles = {
                    // temp override to put basemap labels on top
                    'text-blend-order': {
                        blend_order: 100
                    },
                    mapzen_icon_library: {
                        blend_order: 100
                    }
                };
            }
            return basemap;
        }
    };

    var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var btoa = createCommonjsModule(function (module) {
    (function () {

      function btoa(str) {
        var buffer;

        if (str instanceof Buffer) {
          buffer = str;
        } else {
          buffer = Buffer.from(str.toString(), 'binary');
        }

        return buffer.toString('base64');
      }

      module.exports = btoa;
    }());
    });

    var lodash_merge = createCommonjsModule(function (module, exports) {
    /**
     * Lodash (Custom Build) <https://lodash.com/>
     * Build: `lodash modularize exports="npm" -o ./`
     * Copyright JS Foundation and other contributors <https://js.foundation/>
     * Released under MIT license <https://lodash.com/license>
     * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
     * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
     */

    /** Used as the size to enable large array optimizations. */
    var LARGE_ARRAY_SIZE = 200;

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED = '__lodash_hash_undefined__';

    /** Used to detect hot functions by number of calls within a span of milliseconds. */
    var HOT_COUNT = 800,
        HOT_SPAN = 16;

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER = 9007199254740991;

    /** `Object#toString` result references. */
    var argsTag = '[object Arguments]',
        arrayTag = '[object Array]',
        asyncTag = '[object AsyncFunction]',
        boolTag = '[object Boolean]',
        dateTag = '[object Date]',
        errorTag = '[object Error]',
        funcTag = '[object Function]',
        genTag = '[object GeneratorFunction]',
        mapTag = '[object Map]',
        numberTag = '[object Number]',
        nullTag = '[object Null]',
        objectTag = '[object Object]',
        proxyTag = '[object Proxy]',
        regexpTag = '[object RegExp]',
        setTag = '[object Set]',
        stringTag = '[object String]',
        undefinedTag = '[object Undefined]',
        weakMapTag = '[object WeakMap]';

    var arrayBufferTag = '[object ArrayBuffer]',
        dataViewTag = '[object DataView]',
        float32Tag = '[object Float32Array]',
        float64Tag = '[object Float64Array]',
        int8Tag = '[object Int8Array]',
        int16Tag = '[object Int16Array]',
        int32Tag = '[object Int32Array]',
        uint8Tag = '[object Uint8Array]',
        uint8ClampedTag = '[object Uint8ClampedArray]',
        uint16Tag = '[object Uint16Array]',
        uint32Tag = '[object Uint32Array]';

    /**
     * Used to match `RegExp`
     * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
     */
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

    /** Used to detect host constructors (Safari). */
    var reIsHostCtor = /^\[object .+?Constructor\]$/;

    /** Used to detect unsigned integer values. */
    var reIsUint = /^(?:0|[1-9]\d*)$/;

    /** Used to identify `toStringTag` values of typed arrays. */
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
    typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
    typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
    typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
    typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
    typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
    typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
    typedArrayTags[errorTag] = typedArrayTags[funcTag] =
    typedArrayTags[mapTag] = typedArrayTags[numberTag] =
    typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
    typedArrayTags[setTag] = typedArrayTags[stringTag] =
    typedArrayTags[weakMapTag] = false;

    /** Detect free variable `global` from Node.js. */
    var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

    /** Detect free variable `self`. */
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

    /** Used as a reference to the global object. */
    var root = freeGlobal || freeSelf || Function('return this')();

    /** Detect free variable `exports`. */
    var freeExports = exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /** Detect free variable `process` from Node.js. */
    var freeProcess = moduleExports && freeGlobal.process;

    /** Used to access faster Node.js helpers. */
    var nodeUtil = (function() {
      try {
        return freeProcess && freeProcess.binding && freeProcess.binding('util');
      } catch (e) {}
    }());

    /* Node.js helper references. */
    var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

    /**
     * A faster alternative to `Function#apply`, this function invokes `func`
     * with the `this` binding of `thisArg` and the arguments of `args`.
     *
     * @private
     * @param {Function} func The function to invoke.
     * @param {*} thisArg The `this` binding of `func`.
     * @param {Array} args The arguments to invoke `func` with.
     * @returns {*} Returns the result of `func`.
     */
    function apply(func, thisArg, args) {
      switch (args.length) {
        case 0: return func.call(thisArg);
        case 1: return func.call(thisArg, args[0]);
        case 2: return func.call(thisArg, args[0], args[1]);
        case 3: return func.call(thisArg, args[0], args[1], args[2]);
      }
      return func.apply(thisArg, args);
    }

    /**
     * The base implementation of `_.times` without support for iteratee shorthands
     * or max array length checks.
     *
     * @private
     * @param {number} n The number of times to invoke `iteratee`.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the array of results.
     */
    function baseTimes(n, iteratee) {
      var index = -1,
          result = Array(n);

      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }

    /**
     * The base implementation of `_.unary` without support for storing metadata.
     *
     * @private
     * @param {Function} func The function to cap arguments for.
     * @returns {Function} Returns the new capped function.
     */
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }

    /**
     * Gets the value at `key` of `object`.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {string} key The key of the property to get.
     * @returns {*} Returns the property value.
     */
    function getValue(object, key) {
      return object == null ? undefined : object[key];
    }

    /**
     * Creates a unary function that invokes `func` with its argument transformed.
     *
     * @private
     * @param {Function} func The function to wrap.
     * @param {Function} transform The argument transform.
     * @returns {Function} Returns the new function.
     */
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }

    /**
     * Gets the value at `key`, unless `key` is "__proto__".
     *
     * @private
     * @param {Object} object The object to query.
     * @param {string} key The key of the property to get.
     * @returns {*} Returns the property value.
     */
    function safeGet(object, key) {
      return key == '__proto__'
        ? undefined
        : object[key];
    }

    /** Used for built-in method references. */
    var arrayProto = Array.prototype,
        funcProto = Function.prototype,
        objectProto = Object.prototype;

    /** Used to detect overreaching core-js shims. */
    var coreJsData = root['__core-js_shared__'];

    /** Used to resolve the decompiled source of functions. */
    var funcToString = funcProto.toString;

    /** Used to check objects for own properties. */
    var hasOwnProperty = objectProto.hasOwnProperty;

    /** Used to detect methods masquerading as native. */
    var maskSrcKey = (function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
      return uid ? ('Symbol(src)_1.' + uid) : '';
    }());

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString = objectProto.toString;

    /** Used to infer the `Object` constructor. */
    var objectCtorString = funcToString.call(Object);

    /** Used to detect if a method is native. */
    var reIsNative = RegExp('^' +
      funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
      .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
    );

    /** Built-in value references. */
    var Buffer = moduleExports ? root.Buffer : undefined,
        Symbol = root.Symbol,
        Uint8Array = root.Uint8Array,
        allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined,
        getPrototype = overArg(Object.getPrototypeOf, Object),
        objectCreate = Object.create,
        propertyIsEnumerable = objectProto.propertyIsEnumerable,
        splice = arrayProto.splice,
        symToStringTag = Symbol ? Symbol.toStringTag : undefined;

    var defineProperty = (function() {
      try {
        var func = getNative(Object, 'defineProperty');
        func({}, '', {});
        return func;
      } catch (e) {}
    }());

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
        nativeMax = Math.max,
        nativeNow = Date.now;

    /* Built-in method references that are verified to be native. */
    var Map = getNative(root, 'Map'),
        nativeCreate = getNative(Object, 'create');

    /**
     * The base implementation of `_.create` without support for assigning
     * properties to the created object.
     *
     * @private
     * @param {Object} proto The object to inherit from.
     * @returns {Object} Returns the new object.
     */
    var baseCreate = (function() {
      function object() {}
      return function(proto) {
        if (!isObject(proto)) {
          return {};
        }
        if (objectCreate) {
          return objectCreate(proto);
        }
        object.prototype = proto;
        var result = new object;
        object.prototype = undefined;
        return result;
      };
    }());

    /**
     * Creates a hash object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Hash(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    /**
     * Removes all key-value entries from the hash.
     *
     * @private
     * @name clear
     * @memberOf Hash
     */
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
      this.size = 0;
    }

    /**
     * Removes `key` and its value from the hash.
     *
     * @private
     * @name delete
     * @memberOf Hash
     * @param {Object} hash The hash to modify.
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }

    /**
     * Gets the hash value for `key`.
     *
     * @private
     * @name get
     * @memberOf Hash
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? undefined : result;
      }
      return hasOwnProperty.call(data, key) ? data[key] : undefined;
    }

    /**
     * Checks if a hash value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Hash
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
    }

    /**
     * Sets the hash `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Hash
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the hash instance.
     */
    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
      return this;
    }

    // Add methods to `Hash`.
    Hash.prototype.clear = hashClear;
    Hash.prototype['delete'] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;

    /**
     * Creates an list cache object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function ListCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    /**
     * Removes all key-value entries from the list cache.
     *
     * @private
     * @name clear
     * @memberOf ListCache
     */
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }

    /**
     * Removes `key` and its value from the list cache.
     *
     * @private
     * @name delete
     * @memberOf ListCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function listCacheDelete(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      --this.size;
      return true;
    }

    /**
     * Gets the list cache value for `key`.
     *
     * @private
     * @name get
     * @memberOf ListCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function listCacheGet(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      return index < 0 ? undefined : data[index][1];
    }

    /**
     * Checks if a list cache value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf ListCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }

    /**
     * Sets the list cache `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf ListCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the list cache instance.
     */
    function listCacheSet(key, value) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }

    // Add methods to `ListCache`.
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype['delete'] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;

    /**
     * Creates a map cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function MapCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    /**
     * Removes all key-value entries from the map.
     *
     * @private
     * @name clear
     * @memberOf MapCache
     */
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        'hash': new Hash,
        'map': new (Map || ListCache),
        'string': new Hash
      };
    }

    /**
     * Removes `key` and its value from the map.
     *
     * @private
     * @name delete
     * @memberOf MapCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function mapCacheDelete(key) {
      var result = getMapData(this, key)['delete'](key);
      this.size -= result ? 1 : 0;
      return result;
    }

    /**
     * Gets the map value for `key`.
     *
     * @private
     * @name get
     * @memberOf MapCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }

    /**
     * Checks if a map value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf MapCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }

    /**
     * Sets the map `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf MapCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the map cache instance.
     */
    function mapCacheSet(key, value) {
      var data = getMapData(this, key),
          size = data.size;

      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }

    // Add methods to `MapCache`.
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype['delete'] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;

    /**
     * Creates a stack cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Stack(entries) {
      var data = this.__data__ = new ListCache(entries);
      this.size = data.size;
    }

    /**
     * Removes all key-value entries from the stack.
     *
     * @private
     * @name clear
     * @memberOf Stack
     */
    function stackClear() {
      this.__data__ = new ListCache;
      this.size = 0;
    }

    /**
     * Removes `key` and its value from the stack.
     *
     * @private
     * @name delete
     * @memberOf Stack
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function stackDelete(key) {
      var data = this.__data__,
          result = data['delete'](key);

      this.size = data.size;
      return result;
    }

    /**
     * Gets the stack value for `key`.
     *
     * @private
     * @name get
     * @memberOf Stack
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function stackGet(key) {
      return this.__data__.get(key);
    }

    /**
     * Checks if a stack value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Stack
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function stackHas(key) {
      return this.__data__.has(key);
    }

    /**
     * Sets the stack `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Stack
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the stack cache instance.
     */
    function stackSet(key, value) {
      var data = this.__data__;
      if (data instanceof ListCache) {
        var pairs = data.__data__;
        if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }

    // Add methods to `Stack`.
    Stack.prototype.clear = stackClear;
    Stack.prototype['delete'] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;

    /**
     * Creates an array of the enumerable property names of the array-like `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @param {boolean} inherited Specify returning inherited property names.
     * @returns {Array} Returns the array of property names.
     */
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray(value),
          isArg = !isArr && isArguments(value),
          isBuff = !isArr && !isArg && isBuffer(value),
          isType = !isArr && !isArg && !isBuff && isTypedArray(value),
          skipIndexes = isArr || isArg || isBuff || isType,
          result = skipIndexes ? baseTimes(value.length, String) : [],
          length = result.length;

      for (var key in value) {
        if ((inherited || hasOwnProperty.call(value, key)) &&
            !(skipIndexes && (
               // Safari 9 has enumerable `arguments.length` in strict mode.
               key == 'length' ||
               // Node.js 0.10 has enumerable non-index properties on buffers.
               (isBuff && (key == 'offset' || key == 'parent')) ||
               // PhantomJS 2 has enumerable non-index properties on typed arrays.
               (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
               // Skip index properties.
               isIndex(key, length)
            ))) {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * This function is like `assignValue` except that it doesn't assign
     * `undefined` values.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {string} key The key of the property to assign.
     * @param {*} value The value to assign.
     */
    function assignMergeValue(object, key, value) {
      if ((value !== undefined && !eq(object[key], value)) ||
          (value === undefined && !(key in object))) {
        baseAssignValue(object, key, value);
      }
    }

    /**
     * Assigns `value` to `key` of `object` if the existing value is not equivalent
     * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * for equality comparisons.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {string} key The key of the property to assign.
     * @param {*} value The value to assign.
     */
    function assignValue(object, key, value) {
      var objValue = object[key];
      if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
          (value === undefined && !(key in object))) {
        baseAssignValue(object, key, value);
      }
    }

    /**
     * Gets the index at which the `key` is found in `array` of key-value pairs.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} key The key to search for.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }

    /**
     * The base implementation of `assignValue` and `assignMergeValue` without
     * value checks.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {string} key The key of the property to assign.
     * @param {*} value The value to assign.
     */
    function baseAssignValue(object, key, value) {
      if (key == '__proto__' && defineProperty) {
        defineProperty(object, key, {
          'configurable': true,
          'enumerable': true,
          'value': value,
          'writable': true
        });
      } else {
        object[key] = value;
      }
    }

    /**
     * The base implementation of `baseForOwn` which iterates over `object`
     * properties returned by `keysFunc` and invokes `iteratee` for each property.
     * Iteratee functions may exit iteration early by explicitly returning `false`.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @returns {Object} Returns `object`.
     */
    var baseFor = createBaseFor();

    /**
     * The base implementation of `getTag` without fallbacks for buggy environments.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    function baseGetTag(value) {
      if (value == null) {
        return value === undefined ? undefinedTag : nullTag;
      }
      return (symToStringTag && symToStringTag in Object(value))
        ? getRawTag(value)
        : objectToString(value);
    }

    /**
     * The base implementation of `_.isArguments`.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     */
    function baseIsArguments(value) {
      return isObjectLike(value) && baseGetTag(value) == argsTag;
    }

    /**
     * The base implementation of `_.isNative` without bad shim checks.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a native function,
     *  else `false`.
     */
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }

    /**
     * The base implementation of `_.isTypedArray` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     */
    function baseIsTypedArray(value) {
      return isObjectLike(value) &&
        isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
    }

    /**
     * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function baseKeysIn(object) {
      if (!isObject(object)) {
        return nativeKeysIn(object);
      }
      var isProto = isPrototype(object),
          result = [];

      for (var key in object) {
        if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.merge` without support for multiple sources.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {number} srcIndex The index of `source`.
     * @param {Function} [customizer] The function to customize merged values.
     * @param {Object} [stack] Tracks traversed source values and their merged
     *  counterparts.
     */
    function baseMerge(object, source, srcIndex, customizer, stack) {
      if (object === source) {
        return;
      }
      baseFor(source, function(srcValue, key) {
        if (isObject(srcValue)) {
          stack || (stack = new Stack);
          baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
        }
        else {
          var newValue = customizer
            ? customizer(safeGet(object, key), srcValue, (key + ''), object, source, stack)
            : undefined;

          if (newValue === undefined) {
            newValue = srcValue;
          }
          assignMergeValue(object, key, newValue);
        }
      }, keysIn);
    }

    /**
     * A specialized version of `baseMerge` for arrays and objects which performs
     * deep merges and tracks traversed objects enabling objects with circular
     * references to be merged.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {string} key The key of the value to merge.
     * @param {number} srcIndex The index of `source`.
     * @param {Function} mergeFunc The function to merge values.
     * @param {Function} [customizer] The function to customize assigned values.
     * @param {Object} [stack] Tracks traversed source values and their merged
     *  counterparts.
     */
    function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
      var objValue = safeGet(object, key),
          srcValue = safeGet(source, key),
          stacked = stack.get(srcValue);

      if (stacked) {
        assignMergeValue(object, key, stacked);
        return;
      }
      var newValue = customizer
        ? customizer(objValue, srcValue, (key + ''), object, source, stack)
        : undefined;

      var isCommon = newValue === undefined;

      if (isCommon) {
        var isArr = isArray(srcValue),
            isBuff = !isArr && isBuffer(srcValue),
            isTyped = !isArr && !isBuff && isTypedArray(srcValue);

        newValue = srcValue;
        if (isArr || isBuff || isTyped) {
          if (isArray(objValue)) {
            newValue = objValue;
          }
          else if (isArrayLikeObject(objValue)) {
            newValue = copyArray(objValue);
          }
          else if (isBuff) {
            isCommon = false;
            newValue = cloneBuffer(srcValue, true);
          }
          else if (isTyped) {
            isCommon = false;
            newValue = cloneTypedArray(srcValue, true);
          }
          else {
            newValue = [];
          }
        }
        else if (isPlainObject(srcValue) || isArguments(srcValue)) {
          newValue = objValue;
          if (isArguments(objValue)) {
            newValue = toPlainObject(objValue);
          }
          else if (!isObject(objValue) || (srcIndex && isFunction(objValue))) {
            newValue = initCloneObject(srcValue);
          }
        }
        else {
          isCommon = false;
        }
      }
      if (isCommon) {
        // Recursively merge objects and arrays (susceptible to call stack limits).
        stack.set(srcValue, newValue);
        mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
        stack['delete'](srcValue);
      }
      assignMergeValue(object, key, newValue);
    }

    /**
     * The base implementation of `_.rest` which doesn't validate or coerce arguments.
     *
     * @private
     * @param {Function} func The function to apply a rest parameter to.
     * @param {number} [start=func.length-1] The start position of the rest parameter.
     * @returns {Function} Returns the new function.
     */
    function baseRest(func, start) {
      return setToString(overRest(func, start, identity), func + '');
    }

    /**
     * The base implementation of `setToString` without support for hot loop shorting.
     *
     * @private
     * @param {Function} func The function to modify.
     * @param {Function} string The `toString` result.
     * @returns {Function} Returns `func`.
     */
    var baseSetToString = !defineProperty ? identity : function(func, string) {
      return defineProperty(func, 'toString', {
        'configurable': true,
        'enumerable': false,
        'value': constant(string),
        'writable': true
      });
    };

    /**
     * Creates a clone of  `buffer`.
     *
     * @private
     * @param {Buffer} buffer The buffer to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Buffer} Returns the cloned buffer.
     */
    function cloneBuffer(buffer, isDeep) {
      if (isDeep) {
        return buffer.slice();
      }
      var length = buffer.length,
          result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

      buffer.copy(result);
      return result;
    }

    /**
     * Creates a clone of `arrayBuffer`.
     *
     * @private
     * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
     * @returns {ArrayBuffer} Returns the cloned array buffer.
     */
    function cloneArrayBuffer(arrayBuffer) {
      var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
      new Uint8Array(result).set(new Uint8Array(arrayBuffer));
      return result;
    }

    /**
     * Creates a clone of `typedArray`.
     *
     * @private
     * @param {Object} typedArray The typed array to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the cloned typed array.
     */
    function cloneTypedArray(typedArray, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
      return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
    }

    /**
     * Copies the values of `source` to `array`.
     *
     * @private
     * @param {Array} source The array to copy values from.
     * @param {Array} [array=[]] The array to copy values to.
     * @returns {Array} Returns `array`.
     */
    function copyArray(source, array) {
      var index = -1,
          length = source.length;

      array || (array = Array(length));
      while (++index < length) {
        array[index] = source[index];
      }
      return array;
    }

    /**
     * Copies properties of `source` to `object`.
     *
     * @private
     * @param {Object} source The object to copy properties from.
     * @param {Array} props The property identifiers to copy.
     * @param {Object} [object={}] The object to copy properties to.
     * @param {Function} [customizer] The function to customize copied values.
     * @returns {Object} Returns `object`.
     */
    function copyObject(source, props, object, customizer) {
      var isNew = !object;
      object || (object = {});

      var index = -1,
          length = props.length;

      while (++index < length) {
        var key = props[index];

        var newValue = customizer
          ? customizer(object[key], source[key], key, object, source)
          : undefined;

        if (newValue === undefined) {
          newValue = source[key];
        }
        if (isNew) {
          baseAssignValue(object, key, newValue);
        } else {
          assignValue(object, key, newValue);
        }
      }
      return object;
    }

    /**
     * Creates a function like `_.assign`.
     *
     * @private
     * @param {Function} assigner The function to assign values.
     * @returns {Function} Returns the new assigner function.
     */
    function createAssigner(assigner) {
      return baseRest(function(object, sources) {
        var index = -1,
            length = sources.length,
            customizer = length > 1 ? sources[length - 1] : undefined,
            guard = length > 2 ? sources[2] : undefined;

        customizer = (assigner.length > 3 && typeof customizer == 'function')
          ? (length--, customizer)
          : undefined;

        if (guard && isIterateeCall(sources[0], sources[1], guard)) {
          customizer = length < 3 ? undefined : customizer;
          length = 1;
        }
        object = Object(object);
        while (++index < length) {
          var source = sources[index];
          if (source) {
            assigner(object, source, index, customizer);
          }
        }
        return object;
      });
    }

    /**
     * Creates a base function for methods like `_.forIn` and `_.forOwn`.
     *
     * @private
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new base function.
     */
    function createBaseFor(fromRight) {
      return function(object, iteratee, keysFunc) {
        var index = -1,
            iterable = Object(object),
            props = keysFunc(object),
            length = props.length;

        while (length--) {
          var key = props[fromRight ? length : ++index];
          if (iteratee(iterable[key], key, iterable) === false) {
            break;
          }
        }
        return object;
      };
    }

    /**
     * Gets the data for `map`.
     *
     * @private
     * @param {Object} map The map to query.
     * @param {string} key The reference key.
     * @returns {*} Returns the map data.
     */
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key)
        ? data[typeof key == 'string' ? 'string' : 'hash']
        : data.map;
    }

    /**
     * Gets the native function at `key` of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {string} key The key of the method to get.
     * @returns {*} Returns the function if it's native, else `undefined`.
     */
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : undefined;
    }

    /**
     * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the raw `toStringTag`.
     */
    function getRawTag(value) {
      var isOwn = hasOwnProperty.call(value, symToStringTag),
          tag = value[symToStringTag];

      try {
        value[symToStringTag] = undefined;
        var unmasked = true;
      } catch (e) {}

      var result = nativeObjectToString.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }
      return result;
    }

    /**
     * Initializes an object clone.
     *
     * @private
     * @param {Object} object The object to clone.
     * @returns {Object} Returns the initialized clone.
     */
    function initCloneObject(object) {
      return (typeof object.constructor == 'function' && !isPrototype(object))
        ? baseCreate(getPrototype(object))
        : {};
    }

    /**
     * Checks if `value` is a valid array-like index.
     *
     * @private
     * @param {*} value The value to check.
     * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
     * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
     */
    function isIndex(value, length) {
      var type = typeof value;
      length = length == null ? MAX_SAFE_INTEGER : length;

      return !!length &&
        (type == 'number' ||
          (type != 'symbol' && reIsUint.test(value))) &&
            (value > -1 && value % 1 == 0 && value < length);
    }

    /**
     * Checks if the given arguments are from an iteratee call.
     *
     * @private
     * @param {*} value The potential iteratee value argument.
     * @param {*} index The potential iteratee index or key argument.
     * @param {*} object The potential iteratee object argument.
     * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
     *  else `false`.
     */
    function isIterateeCall(value, index, object) {
      if (!isObject(object)) {
        return false;
      }
      var type = typeof index;
      if (type == 'number'
            ? (isArrayLike(object) && isIndex(index, object.length))
            : (type == 'string' && index in object)
          ) {
        return eq(object[index], value);
      }
      return false;
    }

    /**
     * Checks if `value` is suitable for use as unique object key.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
     */
    function isKeyable(value) {
      var type = typeof value;
      return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
        ? (value !== '__proto__')
        : (value === null);
    }

    /**
     * Checks if `func` has its source masked.
     *
     * @private
     * @param {Function} func The function to check.
     * @returns {boolean} Returns `true` if `func` is masked, else `false`.
     */
    function isMasked(func) {
      return !!maskSrcKey && (maskSrcKey in func);
    }

    /**
     * Checks if `value` is likely a prototype object.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
     */
    function isPrototype(value) {
      var Ctor = value && value.constructor,
          proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

      return value === proto;
    }

    /**
     * This function is like
     * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
     * except that it includes inherited enumerable properties.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function nativeKeysIn(object) {
      var result = [];
      if (object != null) {
        for (var key in Object(object)) {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * Converts `value` to a string using `Object.prototype.toString`.
     *
     * @private
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     */
    function objectToString(value) {
      return nativeObjectToString.call(value);
    }

    /**
     * A specialized version of `baseRest` which transforms the rest array.
     *
     * @private
     * @param {Function} func The function to apply a rest parameter to.
     * @param {number} [start=func.length-1] The start position of the rest parameter.
     * @param {Function} transform The rest array transform.
     * @returns {Function} Returns the new function.
     */
    function overRest(func, start, transform) {
      start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
      return function() {
        var args = arguments,
            index = -1,
            length = nativeMax(args.length - start, 0),
            array = Array(length);

        while (++index < length) {
          array[index] = args[start + index];
        }
        index = -1;
        var otherArgs = Array(start + 1);
        while (++index < start) {
          otherArgs[index] = args[index];
        }
        otherArgs[start] = transform(array);
        return apply(func, this, otherArgs);
      };
    }

    /**
     * Sets the `toString` method of `func` to return `string`.
     *
     * @private
     * @param {Function} func The function to modify.
     * @param {Function} string The `toString` result.
     * @returns {Function} Returns `func`.
     */
    var setToString = shortOut(baseSetToString);

    /**
     * Creates a function that'll short out and invoke `identity` instead
     * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
     * milliseconds.
     *
     * @private
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new shortable function.
     */
    function shortOut(func) {
      var count = 0,
          lastCalled = 0;

      return function() {
        var stamp = nativeNow(),
            remaining = HOT_SPAN - (stamp - lastCalled);

        lastCalled = stamp;
        if (remaining > 0) {
          if (++count >= HOT_COUNT) {
            return arguments[0];
          }
        } else {
          count = 0;
        }
        return func.apply(undefined, arguments);
      };
    }

    /**
     * Converts `func` to its source code.
     *
     * @private
     * @param {Function} func The function to convert.
     * @returns {string} Returns the source code.
     */
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {}
        try {
          return (func + '');
        } catch (e) {}
      }
      return '';
    }

    /**
     * Performs a
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * comparison between two values to determine if they are equivalent.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'a': 1 };
     * var other = { 'a': 1 };
     *
     * _.eq(object, object);
     * // => true
     *
     * _.eq(object, other);
     * // => false
     *
     * _.eq('a', 'a');
     * // => true
     *
     * _.eq('a', Object('a'));
     * // => false
     *
     * _.eq(NaN, NaN);
     * // => true
     */
    function eq(value, other) {
      return value === other || (value !== value && other !== other);
    }

    /**
     * Checks if `value` is likely an `arguments` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     *  else `false`.
     * @example
     *
     * _.isArguments(function() { return arguments; }());
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
      return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
        !propertyIsEnumerable.call(value, 'callee');
    };

    /**
     * Checks if `value` is classified as an `Array` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array, else `false`.
     * @example
     *
     * _.isArray([1, 2, 3]);
     * // => true
     *
     * _.isArray(document.body.children);
     * // => false
     *
     * _.isArray('abc');
     * // => false
     *
     * _.isArray(_.noop);
     * // => false
     */
    var isArray = Array.isArray;

    /**
     * Checks if `value` is array-like. A value is considered array-like if it's
     * not a function and has a `value.length` that's an integer greater than or
     * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
     * @example
     *
     * _.isArrayLike([1, 2, 3]);
     * // => true
     *
     * _.isArrayLike(document.body.children);
     * // => true
     *
     * _.isArrayLike('abc');
     * // => true
     *
     * _.isArrayLike(_.noop);
     * // => false
     */
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }

    /**
     * This method is like `_.isArrayLike` except that it also checks if `value`
     * is an object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array-like object,
     *  else `false`.
     * @example
     *
     * _.isArrayLikeObject([1, 2, 3]);
     * // => true
     *
     * _.isArrayLikeObject(document.body.children);
     * // => true
     *
     * _.isArrayLikeObject('abc');
     * // => false
     *
     * _.isArrayLikeObject(_.noop);
     * // => false
     */
    function isArrayLikeObject(value) {
      return isObjectLike(value) && isArrayLike(value);
    }

    /**
     * Checks if `value` is a buffer.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
     * @example
     *
     * _.isBuffer(new Buffer(2));
     * // => true
     *
     * _.isBuffer(new Uint8Array(2));
     * // => false
     */
    var isBuffer = nativeIsBuffer || stubFalse;

    /**
     * Checks if `value` is classified as a `Function` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     *
     * _.isFunction(/abc/);
     * // => false
     */
    function isFunction(value) {
      if (!isObject(value)) {
        return false;
      }
      // The use of `Object#toString` avoids issues with the `typeof` operator
      // in Safari 9 which returns 'object' for typed arrays and other constructors.
      var tag = baseGetTag(value);
      return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
    }

    /**
     * Checks if `value` is a valid array-like length.
     *
     * **Note:** This method is loosely based on
     * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
     * @example
     *
     * _.isLength(3);
     * // => true
     *
     * _.isLength(Number.MIN_VALUE);
     * // => false
     *
     * _.isLength(Infinity);
     * // => false
     *
     * _.isLength('3');
     * // => false
     */
    function isLength(value) {
      return typeof value == 'number' &&
        value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }

    /**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(_.noop);
     * // => true
     *
     * _.isObject(null);
     * // => false
     */
    function isObject(value) {
      var type = typeof value;
      return value != null && (type == 'object' || type == 'function');
    }

    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */
    function isObjectLike(value) {
      return value != null && typeof value == 'object';
    }

    /**
     * Checks if `value` is a plain object, that is, an object created by the
     * `Object` constructor or one with a `[[Prototype]]` of `null`.
     *
     * @static
     * @memberOf _
     * @since 0.8.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     * }
     *
     * _.isPlainObject(new Foo);
     * // => false
     *
     * _.isPlainObject([1, 2, 3]);
     * // => false
     *
     * _.isPlainObject({ 'x': 0, 'y': 0 });
     * // => true
     *
     * _.isPlainObject(Object.create(null));
     * // => true
     */
    function isPlainObject(value) {
      if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
        return false;
      }
      var proto = getPrototype(value);
      if (proto === null) {
        return true;
      }
      var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
      return typeof Ctor == 'function' && Ctor instanceof Ctor &&
        funcToString.call(Ctor) == objectCtorString;
    }

    /**
     * Checks if `value` is classified as a typed array.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     * @example
     *
     * _.isTypedArray(new Uint8Array);
     * // => true
     *
     * _.isTypedArray([]);
     * // => false
     */
    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

    /**
     * Converts `value` to a plain object flattening inherited enumerable string
     * keyed properties of `value` to own properties of the plain object.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {Object} Returns the converted plain object.
     * @example
     *
     * function Foo() {
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.assign({ 'a': 1 }, new Foo);
     * // => { 'a': 1, 'b': 2 }
     *
     * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
     * // => { 'a': 1, 'b': 2, 'c': 3 }
     */
    function toPlainObject(value) {
      return copyObject(value, keysIn(value));
    }

    /**
     * Creates an array of the own and inherited enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keysIn(new Foo);
     * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
     */
    function keysIn(object) {
      return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
    }

    /**
     * This method is like `_.assign` except that it recursively merges own and
     * inherited enumerable string keyed properties of source objects into the
     * destination object. Source properties that resolve to `undefined` are
     * skipped if a destination value exists. Array and plain object properties
     * are merged recursively. Other objects and value types are overridden by
     * assignment. Source objects are applied from left to right. Subsequent
     * sources overwrite property assignments of previous sources.
     *
     * **Note:** This method mutates `object`.
     *
     * @static
     * @memberOf _
     * @since 0.5.0
     * @category Object
     * @param {Object} object The destination object.
     * @param {...Object} [sources] The source objects.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var object = {
     *   'a': [{ 'b': 2 }, { 'd': 4 }]
     * };
     *
     * var other = {
     *   'a': [{ 'c': 3 }, { 'e': 5 }]
     * };
     *
     * _.merge(object, other);
     * // => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }
     */
    var merge = createAssigner(function(object, source, srcIndex) {
      baseMerge(object, source, srcIndex);
    });

    /**
     * Creates a function that returns `value`.
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Util
     * @param {*} value The value to return from the new function.
     * @returns {Function} Returns the new constant function.
     * @example
     *
     * var objects = _.times(2, _.constant({ 'a': 1 }));
     *
     * console.log(objects);
     * // => [{ 'a': 1 }, { 'a': 1 }]
     *
     * console.log(objects[0] === objects[1]);
     * // => true
     */
    function constant(value) {
      return function() {
        return value;
      };
    }

    /**
     * This method returns the first argument it receives.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Util
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'a': 1 };
     *
     * console.log(_.identity(object) === object);
     * // => true
     */
    function identity(value) {
      return value;
    }

    /**
     * This method returns `false`.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {boolean} Returns `false`.
     * @example
     *
     * _.times(2, _.stubFalse);
     * // => [false, false]
     */
    function stubFalse() {
      return false;
    }

    module.exports = merge;
    });

    var parser = createCommonjsModule(function (module) {
    (function (root, factory) {
        if (module.exports) {
            // Node. Does not work with strict CommonJS, but
            // only CommonJS-like environments that support module.exports,
            // like Node.
            module.exports = factory();
        } else {
            // Browser globals
            root.cssFontParser = factory();
        }
    }(commonjsGlobal, function (b) {
      /**
       * @enum {number}
       */
      var states = {
        VARIATION: 1,
        LINE_HEIGHT: 2,
        FONT_FAMILY: 3,
        BEFORE_FONT_FAMILY: 4
      };

      /**
       * Attempt to parse a string as an identifier. Return
       * a normalized identifier, or null when the string
       * contains an invalid identifier.
       *
       * @param {string} str
       * @return {string|null}
       */
      function parseIdentifier(str) {
        var identifiers = str.replace(/^\s+|\s+$/, '').replace(/\s+/g, ' ').split(' ');

        for (var i = 0; i < identifiers.length; i += 1) {
          if (/^(-?\d|--)/.test(identifiers[i]) ||
               !/^([_a-zA-Z0-9-]|[^\0-\237]|(\\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?|\\[^\n\r\f0-9a-f]))+$/.test(identifiers[i])) {
            return null;
          }
        }
        return identifiers.join(' ');
      }

      /**
       * @param {string} input
       * @return {Object|null}
       */
      function parse(input) {
        var state = states.VARIATION,
            buffer = '',
            result = {
              'font-family': []
            };

        for (var c, i = 0; c = input.charAt(i); i += 1) {
          if (state === states.BEFORE_FONT_FAMILY && (c === '"' || c === "'")) {
            var index = i + 1;

            // consume the entire string
            do {
              index = input.indexOf(c, index) + 1;
              if (!index) {
                // If a string is not closed by a ' or " return null.
                return null;
              }
            } while (input.charAt(index - 2) === '\\');

            result['font-family'].push(input.slice(i, index));

            i = index - 1;
            state = states.FONT_FAMILY;
            buffer = '';
          } else if (state === states.FONT_FAMILY && c === ',') {
            state = states.BEFORE_FONT_FAMILY;
            buffer = '';
          } else if (state === states.BEFORE_FONT_FAMILY && c === ',') {
            var identifier = parseIdentifier(buffer);

            if (identifier) {
              result['font-family'].push(identifier);
            }
            buffer = '';
          } else if (state === states.VARIATION && (c === ' ' || c === '/')) {
            if (/^((xx|x)-large|(xx|s)-small|small|large|medium)$/.test(buffer) ||
                /^(larg|small)er$/.test(buffer) ||
                /^(\+|-)?([0-9]*\.)?[0-9]+(em|ex|ch|rem|vh|vw|vmin|vmax|px|mm|cm|in|pt|pc|%)$/.test(buffer)) {
              state = c === '/' ? states.LINE_HEIGHT : states.BEFORE_FONT_FAMILY;
              result['font-size'] = buffer;
            } else if (/^(italic|oblique)$/.test(buffer)) {
              result['font-style'] = buffer;
            } else if (/^small-caps$/.test(buffer)) {
              result['font-variant'] = buffer;
            } else if (/^(bold(er)?|lighter|[1-9]00)$/.test(buffer)) {
              result['font-weight'] = buffer;
            } else if (/^((ultra|extra|semi)-)?(condensed|expanded)$/.test(buffer)) {
              result['font-stretch'] = buffer;
            }
            buffer = '';
          } else if (state === states.LINE_HEIGHT && c === ' ') {
            if (/^(\+|-)?([0-9]*\.)?[0-9]+(em|ex|ch|rem|vh|vw|vmin|vmax|px|mm|cm|in|pt|pc|%)?$/.test(buffer)) {
              result['line-height'] = buffer;
            }
            state = states.BEFORE_FONT_FAMILY;
            buffer = '';
          } else {
            buffer += c;
          }
        }

        // This is for the case where a string was specified followed by
        // an identifier, but without a separating comma.
        if (state === states.FONT_FAMILY && !/^\s*$/.test(buffer)) {
          return null;
        }

        if (state === states.BEFORE_FONT_FAMILY) {
          var identifier = parseIdentifier(buffer);

          if (identifier) {
            result['font-family'].push(identifier);
          }
        }

        if (result['font-size'] && result['font-family'].length) {
          return result;
        } else {
          return null;
        }
      }

      return parse;
    }));
    });

    // choose browser or node implementation of btoa
    var btoa$1 = (typeof window !== 'undefined' && window.btoa) || btoa;

    function xyzToTangram(xyzStyle, ref) {
        if ( ref === void 0 ) ref = {};
        var basemap = ref.basemap; if ( basemap === void 0 ) basemap = defaultBasemap;
        var setStartPosition = ref.setStartPosition; if ( setStartPosition === void 0 ) setStartPosition = true;
        var collide = ref.collide; if ( collide === void 0 ) collide = true;
        var labelsOnTop = ref.labelsOnTop; if ( labelsOnTop === void 0 ) labelsOnTop = true;


        var scene = {}; // Tangram scene object to return
        var legends = []; // data needed to render XYZ Studio-style legends
        var options = { // options for the scene and basemap
           collide: Boolean(collide),
           labelsOnTop: Boolean(labelsOnTop)
        };

        // Add Tangram scene elements so that insertion order matches Tangram idioms
        // (camera first, then sources, styles before layers, etc.)
        if (setStartPosition) {
            scene.cameras = makeCamera(xyzStyle);
        }
        scene.sources = makeSources(xyzStyle);
        scene.styles = makeStyles();
        scene.layers = makeLayers(xyzStyle, legends, options);
        scene.meta = makeMeta(xyzStyle);
        scene.global = makeGlobals(xyzStyle);

        // Add basemap
        var basemapGenerator = basemaps[basemap];
        var basemapScene = (basemapGenerator && basemapGenerator(options)) || {};

        // Create Tangram as a Leaflet layer
        scene = lodash_merge({}, basemapScene, scene);

        return { scene: scene, legends: legends };
    }

    // add subset of XYZ Studio JSON as scene metadata
    // not used by Tangram directly, but useful for cards functionality, and general reference/debugging
    function makeMeta(xyz) {
        var meta = {};
        meta.xyz = { // put under XYZ-specific namespace
            id: xyz.id,
            meta: xyz.meta,
            bookmarks: xyz.bookmarks,
            publish_settings: xyz.publish_settings,
            layers: xyz.layers.map(function (layer) {
                return {
                    id: layer.id,
                    meta: layer.meta,
                    geospace: layer.geospace,
                    cards: layer.cards.filter(function (c) { return c.length > 0; })
                };
            })
        };
        return meta;
    }

    // create a Tangram camera, which will set the map position when the scene is loaded
    function makeCamera(xyz) {
        var pos = xyz.map_settings;
        if (pos &&
            pos.center &&
            pos.center.length === 2 &&
            pos.zoom) {
            return {
                xyz: {
                    position: [pos.center[1], pos.center[0], pos.zoom].map(Number),
                    active: true
                }
            };
        }
    }

    // helper function to construct a Tangram layer name for an XYZ layer
    function getXYZLayerName(xyzLayer, index) {
        return (xyzLayer.meta && xyzLayer.meta.title) || ("layer-" + index);
    }

    // create data Tangram sources
    function makeSources(xyz) {
        // https://xyz.api.here.com/hub/spaces/{space}/tile/web/{z}_{x}_{y}
        return xyz.layers.reduce(function (tgSources, xyzLayer, index) {
            var spaceId = xyzLayer.geospace.id;
            var name = getXYZLayerName(xyzLayer, index);
            var access_token = xyz.rot;

            tgSources[name] = {
                type: 'GeoJSON',
                url: ("https://xyz.api.here.com/hub/spaces/" + spaceId + "/tile/web/{z}_{x}_{y}"),
                // url: `https://xyz.api.here.com/hub/spaces/${spaceId}/tile/quadkey/{q}`,
                url_params: {
                    access_token: access_token,
                    clip: true,
                    clientId: 'viewer',
                },
                // max_zoom: 16, // using explicit zoom list below for now instead
                zooms: [0, 2, 4, 6, 8, 10, 12, 14, 16], // load every other zoom
                transform: 'global.add_feature_id' // TODO: remove this when Tangram 0.19 is released (temp solution for 0.18.x)
            };

            // add comma-delimited list of tags if available
            if (xyzLayer.meta && Array.isArray(xyzLayer.meta.spaceTags)) {
                tgSources[name].url_params.tags = xyzLayer.meta.spaceTags.join(',');
            }

            // add layer bounding box if available (sometimes `bbox` property is an empty array)
            // TODO: ignoring bounds for now, because bbox reported by Studio is sometimes incorrect
            // if (Array.isArray(xyzLayer.bbox) && xyzLayer.bbox.length === 4) {
            //     tgSources[name].bounds = xyzLayer.bbox;
            // }

            return tgSources;
        }, {});
    }

    // create Tangram rendering styles
    function makeStyles() {
        // One style per geometry type, with overlay blending
        return ['polygons', 'lines', 'points', 'text'].reduce(function (tgStyles, geomType) {
            tgStyles[("XYZ_" + geomType)] = {
                base: geomType,
                blend: 'overlay'
            };
            return tgStyles;
        }, {});
    }

    // create Tangram layers
    function makeLayers(xyz, legends, tgOptions) {
        // TODO: more general handling of visible flag
        return xyz.layers.filter(function (x) { return x.visible; }).reduce(function (tgLayers, xyzLayer, xyzLayerIndex) {
            // Make one enclosing Tangram layer for the entire XYZ layer,
            // and then one sub-layer for each geometry type present in the XYZ layer
            var xyzLayerName = getXYZLayerName(xyzLayer, xyzLayerIndex);
            tgLayers[xyzLayerName] = {
                data: {
                    source: xyzLayerName
                }
            };

            // The geometry types in this XYZ layer (Point, Line, Polygon)
            var geomTypes = []; // `geometries` field is unreliable, doesn't always match features present in layer
            var geomCounts = xyzLayer.geometriesCount; // use `geometriesCount` instead
            if (geomCounts) {
                if (geomCounts['Point'] || geomCounts['MultiPoint']) { geomTypes.push('Point'); }
                if (geomCounts['LineString'] || geomCounts['MultiLineString']) { geomTypes.push('Line'); }
                if (geomCounts['Polygon'] || geomCounts['MultiPolygon']) { geomTypes.push('Polygon'); }
            }
            else { // sometimes `geometriesCount` is also missing, check for all geometry types in this case
                geomTypes.push('Point', 'Line', 'Polygon');
            }

            // For each geometry type in this XYZ layer, create Tangram sub-layers
            geomTypes.forEach(function (geomType) {
                makeGeometryTypeLayer({ xyz: xyz, xyzLayer: xyzLayer, xyzLayerIndex: xyzLayerIndex, geomType: geomType, tgLayers: tgLayers, tgOptions: tgOptions, legends: legends });
            });

            return tgLayers;
        }, {});
    }

    // create Tangram sub-layers for all style groups of a given geometry type
    function makeGeometryTypeLayer(ref) {
        var xyz = ref.xyz;
        var xyzLayer = ref.xyzLayer;
        var xyzLayerIndex = ref.xyzLayerIndex;
        var geomType = ref.geomType;
        var tgLayers = ref.tgLayers;
        var tgOptions = ref.tgOptions;
        var legends = ref.legends;


        // Tangram sub-layer for all features with this geometry type
        var xyzLayerName = getXYZLayerName(xyzLayer, xyzLayerIndex);
        var tgGeomLayer = tgLayers[xyzLayerName][geomType] = {
            filter: {
                $geometry: geomType.toLowerCase()
            }
        };

        // Make further Tangram sub-layers, one per XYZ layer style group
        var styleGroupPrefix = (geomType.toLowerCase()) + "Style";
        var styleGroups = Object.entries(xyzLayer.styleGroups).filter(function (ref) {
            var k = ref[0];

            return k.startsWith(styleGroupPrefix);
        });
        var styleRules = (xyzLayer.styleRules && xyzLayer.styleRules[geomType]) || [];

        // Process XYZ style groups
        styleGroups.forEach(function (ref) {
            var styleGroupName = ref[0];
            var styleGroup = ref[1];

            // Create a Tangram sub-layer for this style group
            var ref$1 = makeStyleGroupLayer({
                xyz: xyz, xyzLayerName: xyzLayerName, xyzLayerIndex: xyzLayerIndex,
                styleRules: styleRules, styleGroupName: styleGroupName, styleGroup: styleGroup, styleGroupPrefix: styleGroupPrefix,
                tgGeomLayer: tgGeomLayer, tgOptions: tgOptions
            });
            var legendName = ref$1.legendName;

            // Add legend entry
            var legendStyle = styleGroup
                .filter(function (s) { return s.opacity > 0; }) // exclude invisible groups
                .filter(function (s) { return !s.skip; }) // exclude groups that were replaced by postprocessing
                .filter(function (s) { return s.type !== 'Line' || s.strokeWidth > 0; }) // zero-width lines are sometimes used for "hidden" groups
                .filter(function (s) { return s.type !== 'Text'; })[0]; // exclude text styles from legends

            if (legendStyle) {
                legends.push({
                    geomType: geomType,
                    name: legendName || ("Default " + (geomType.toLowerCase()) + " style"), // use default name if necessary
                    style: legendStyle
                });
            }
        });
    }

    // create Tangram sub-layer for an XYZ layer style group
    function makeStyleGroupLayer(ref) {
        var styleRules = ref.styleRules;
        var styleGroupName = ref.styleGroupName;
        var styleGroupPrefix = ref.styleGroupPrefix;
        var styleGroup = ref.styleGroup;
        var tgGeomLayer = ref.tgGeomLayer;
        var tgOptions = ref.tgOptions;
        var xyzLayerName = ref.xyzLayerName;
        var xyz = ref.xyz;
        var xyzLayerIndex = ref.xyzLayerIndex;


        // Match XYZ style rules for this style group, and create Tangram filter
        var ref$1 = matchStyleRules({ styleRules: styleRules, styleGroupName: styleGroupName, styleGroupPrefix: styleGroupPrefix });
        var tgFilter = ref$1.tgFilter;
        var priority = ref$1.priority;
        var name = ref$1.name;

        // Create Tangram sub-layer for this XYZ style group
        // These layers are mutually exclusive, and matching priority is determined by the order of styleRules
        // Style groups that don't match a rule (e.g. default / not-conditional style groups) are matched last
        var tgStyleLayer = tgGeomLayer[styleGroupName] = {
            priority: priority,
            exclusive: true
        };
        if (tgFilter != null) {
            tgStyleLayer.filter = tgFilter;
        }

        // Combine XYZ icon and circle/rect shapes into a single SVG
        // This is done because XYZ treats these as independent render entities, which prevents them from
        // properly overlapping and colliding between each other. By combining them into a single SVG image,
        // we can render each group as a single Tangram point feature, with proper visual ordering and collision.
        compositeIcons(styleGroup);

        // Create Tangram draw groups, one for each XYZ style in this style group
        tgStyleLayer.draw = styleGroup
            .filter(function (s) { return s.opacity > 0; }) // this seems to be used as a general filter to disable symbolizers?
            .filter(function (s) { return !s.skip; }) // skip pre-processed styles (they've been composited into others)
            .reduce(function (draw, style, styleIndex) {
                // Add Tangram draw groups for each XYZ style object
                if (style.type === 'Polygon') {
                    // Polygon fill
                    makePolygonStyleLayer({ style: style, styleIndex: styleIndex, draw: draw, xyzLayerName: xyzLayerName, xyz: xyz, xyzLayerIndex: xyzLayerIndex, tgOptions: tgOptions });
                }
                else if (style.type === 'Line') {
                    // Line stroke
                    makeLineStyleLayer({ style: style, styleIndex: styleIndex, draw: draw, xyzLayerName: xyzLayerName, xyz: xyz, xyzLayerIndex: xyzLayerIndex, tgOptions: tgOptions });
                }
                else if (style.type === 'Circle') {
                    // Circle point
                    makeCircleStyleLayer({ style: style, styleIndex: styleIndex, draw: draw, xyzLayerName: xyzLayerName, xyz: xyz, xyzLayerIndex: xyzLayerIndex, tgOptions: tgOptions });
                }
                else if (style.type === 'Image') {
                    // Circle point
                    makeImageStyleLayer({ style: style, styleIndex: styleIndex, draw: draw, xyzLayerName: xyzLayerName, xyz: xyz, xyzLayerIndex: xyzLayerIndex, tgOptions: tgOptions });
                }
                else if (style.type === 'Text') {
                    // Text label
                    makeTextStyleLayer({ style: style, styleIndex: styleIndex, draw: draw, xyzLayerName: xyzLayerName, xyz: xyz, xyzLayerIndex: xyzLayerIndex, tgOptions: tgOptions });
                }
                return draw;
            }, {});

        return { legendName: name };
    }

    // XYZ style groups and style rules are linked through a naming scheme, e.g.:
    // a style group name `lineStyle_79l75_ceg3xiefz` should be filtered by the corresponding style rule
    // with id `79l75_rgj1c8o30`
    // This function finds the appropriate style rule (if there is one) for a given style group
    function matchStyleRules(ref) {
        var styleRules = ref.styleRules;
        var styleGroupName = ref.styleGroupName;
        var styleGroupPrefix = ref.styleGroupPrefix;

        var rule = styleRules.find(function (rule) { return styleGroupName === (styleGroupPrefix + "_" + (rule.id)); });
        var name;
        var priority = styleRules.length;
        var tgFilter;
        if (rule) {
            name = rule.name;
            priority = styleRules.findIndex(function (rule) { return styleGroupName === (styleGroupPrefix + "_" + (rule.id)); });
            tgFilter = makeFilter(rule); // create the Tangram filter for this style rule
        }
        return { name: name, tgFilter: tgFilter, priority: priority };
    }

    // Build a Tangram layer filter for an XYZ style rule
    function makeFilter(styleRule) {
        if (styleRule == null) {
            return;
        }

        var rules = styleRule.r[0]; // TODO: handle multi-element OR properties (Studio doesn't currently support)
        var conditions = [];
        rules.forEach(function (rule) {
            // Tangram property look-up
            var prop = rule.property;

            // special handling for `id` and `__id` property handling between XYZ and Tangram
            if (prop === 'id') { // XYZ property `id`' is for `feature.id` (NOT `feature.properties.id`)
                // prop = '$id'; // in Tangram, this is accessed through a special `$id` property
                prop = '_feature_id'; // TODO: remove this when Tangram 0.19 is released (temp solution for 0.18.x)
            }
            else if (prop === '__id') { // XYZ property `__id` is for `feature.properties.id` (NOT `feature.id`)
                prop = 'id'; // in Tangram, this is accessed as a normal feature property
            }

            var value;
            if (prop[0] === '$') { // special Tangram accessor prefixed with `$`, use property name directly
                value = prop; // e.g. `$id`, `$geometry`, `$layer`, etc.
            }
            else { // regular feature property
                value = "feature['" + prop + "']"; // Tangram exposes feature properties in the `feature` object
            }

            // apply the logic for this operator
            switch (rule.operator) {
                case 'eq': // equals
                    conditions.push((value + " == " + (quoteValue(rule.value))));
                    break;
                case 'neq': // not equals
                    conditions.push((value + " != " + (quoteValue(rule.value))));
                    break;
                case 'lt': // less than
                    conditions.push((value + " < " + (quoteValue(rule.value))));
                    break;
                case 'gt': // greater than
                    conditions.push((value + " > " + (quoteValue(rule.value))));
                    break;
                case 'em': // is empty
                    conditions.push((value + " == null"));
                    break;
                case 'nem': // is not empty
                    conditions.push((value + " != null"));
                    break;
            }
        });

        if (conditions.length === 0) {
            return;
        }

        var filter = "function() { return " + (conditions.join(' && ')) + "; }";
        return filter;
    }

    // Create a Tangram draw group for a polygon
    function makePolygonStyleLayer(ref) {
        var style = ref.style;
        var styleIndex = ref.styleIndex;
        var draw = ref.draw;
        var xyz = ref.xyz;
        var xyzLayerIndex = ref.xyzLayerIndex;

        // Polygon fill
        var tgFillDrawGroupName = (style.type) + "_" + styleIndex + "_fill";
        draw[tgFillDrawGroupName] = {
            interactive: true,
            style: 'XYZ_polygons',
            color: style.fill,
            blend_order: getBlendOrder(style, xyz.layers, xyzLayerIndex)
        };

        // Polygon stroke
        var tgStrokeDrawGroupName = (style.type) + "_" + styleIndex + "_stroke";
        draw[tgStrokeDrawGroupName] = {
            interactive: true,
            style: 'XYZ_lines',
            color: style.stroke,
            width: ((style.strokeWidth) + "px"),
            cap: style.strokeLinecap,
            join: style.strokeLinejoin,
            blend_order: getBlendOrder(style, xyz.layers, xyzLayerIndex)
        };

        if (hasDash(style.strokeDasharray)) {
            draw[tgStrokeDrawGroupName].dash = style.strokeDasharray;
        }
    }

    // Create a Tangram draw group for a line
    function makeLineStyleLayer(ref) {
        var style = ref.style;
        var styleIndex = ref.styleIndex;
        var draw = ref.draw;
        var xyz = ref.xyz;
        var xyzLayerIndex = ref.xyzLayerIndex;

        if (style.strokeWidth === 0) {
            return; // zero-width lines are sometimes used for "hidden" groups
        }

        var tgStrokeDrawGroupName = (style.type) + "_" + styleIndex + "_stroke";
        draw[tgStrokeDrawGroupName] = {
            interactive: true,
            style: 'XYZ_lines',
            color: style.stroke,
            width: ((style.strokeWidth) + "px"),
            cap: style.strokeLinecap,
            join: style.strokeLinejoin,
            blend_order: getBlendOrder(style, xyz.layers, xyzLayerIndex)
        };

        if (hasDash(style.strokeDasharray)) {
            draw[tgStrokeDrawGroupName].dash = style.strokeDasharray;
        }
    }

    // Create a Tangram draw group for a circle point
    function makeCircleStyleLayer(ref) {
        var style = ref.style;
        var styleIndex = ref.styleIndex;
        var draw = ref.draw;
        var xyz = ref.xyz;
        var xyzLayerIndex = ref.xyzLayerIndex;
        var tgOptions = ref.tgOptions;

        var tgPointDrawGroupName = (style.type) + "_" + styleIndex + "_point";
        draw[tgPointDrawGroupName] = {
            interactive: true,
            collide: tgOptions.collide,
            priority: getLabelPriority(xyz.layers, xyzLayerIndex, tgOptions),
            style: 'XYZ_points',
            color: style.fill,
            size: ((style.radius * 2) + "px"),
            // size: [`${style.width}px`, `${style.height}px`],
            offset: getOffset(style),
            blend_order: getBlendOrder(style, xyz.layers, xyzLayerIndex)
        };
        if (style.outline) {
            draw[tgPointDrawGroupName].outline = {
                color: style.outline.fill,
                width: ((style.outline.radius - style.radius) + "px")
            };
        }
    }

    // Create a Tangram draw group for an image point, with optional text label
    function makeImageStyleLayer(ref) {
        var style = ref.style;
        var styleIndex = ref.styleIndex;
        var draw = ref.draw;
        var xyz = ref.xyz;
        var xyzLayerIndex = ref.xyzLayerIndex;
        var tgOptions = ref.tgOptions;

        var tgPointDrawGroupName = (style.type) + "_" + styleIndex + "_point";
        draw[tgPointDrawGroupName] = {
            interactive: true,
            collide: tgOptions.collide,
            priority: getLabelPriority(xyz.layers, xyzLayerIndex, tgOptions),
            style: 'XYZ_points',
            size: [((style.width) + "px"), ((style.height) + "px")],
            texture: style.src,
            offset: getOffset(style),
            blend_order: getBlendOrder(style, xyz.layers, xyzLayerIndex)
        };

        // optionally attached text label
        if (style.text) {
            var textDraws = {};
            makeTextStyleLayer({
                style: style.text, styleIndex: 0,
                draw: textDraws,
                xyz: xyz, xyzLayerIndex: xyzLayerIndex,
                tgOptions: Object.assign({}, tgOptions, {priority: 2}) // default attached text labels to lower priority than parent
            });
            var text = Object.values(textDraws)[0];
            if (text) {
                draw[tgPointDrawGroupName].text = text;
                text.optional = true; // attached text labels are preferred but optional
            }
        }
    }

    // Create a Tangram draw group for a text label
    function makeTextStyleLayer(ref) {
        var style = ref.style;
        var styleIndex = ref.styleIndex;
        var draw = ref.draw;
        var xyz = ref.xyz;
        var xyzLayerIndex = ref.xyzLayerIndex;
        var tgOptions = ref.tgOptions;

        var tgTextDrawGroupName = (style.type) + "_" + styleIndex + "_text";
        draw[tgTextDrawGroupName] = {
            interactive: true,
            collide: true, // always collide text labels (no real downside)
            priority: getLabelPriority(xyz.layers, xyzLayerIndex, tgOptions),
            style: 'XYZ_text',
            text_source: ("function() { var properties = feature; return " + (style.textRef) + "; }"),
            font: {
                fill: style.fill,
                stroke: {
                    color: style.stroke,
                    width: ((style.strokeWidth) + "px")
                }
            },
            offset: getOffset(style),
            anchor: 'center',
            // repeat_distance: '1000px',
            blend_order: getBlendOrder(style, xyz.layers, xyzLayerIndex)
        };

        // parse XYZ font field
        var font = parser(style.font);
        if (font['font-family'].length > 0) {
            draw[tgTextDrawGroupName].font.family = font['font-family'][0]; // use first family in list
        }

        draw[tgTextDrawGroupName].font.size = font['font-size'] || '12px';

        if (font['font-style']) {
            draw[tgTextDrawGroupName].font.style = font['font-style'];
        }

        if (font['font-weight']) {
            draw[tgTextDrawGroupName].font.weight = font['font-weight'];
        }
    }

    // add Tangram global utility functions
    function makeGlobals(xyz) {
        return {
            xyz_access_token: xyz.rot, // access token from XYZ style

            // TODO: remove this when Tangram 0.19 is released (temp solution for 0.18.x)
            // copy `feature.id` to `feature.properties._feature_id`
            add_feature_id:
                "function (data) {\n                const layers = (Array.isArray(data) ? data : [data]); // single or multiple layers\n                Object.values(layers).forEach(layer => {\n                    layer.features.forEach(feature => {\n                        feature.properties['_feature_id'] = feature.id;\n                    })\n                });\n                return data;\n            }"
        };
    }

    // Calculate Tangram blend order based on XYZ layer position and style zIndex
    function getBlendOrder(style, xyzLayers, xyzLayerIndex) {
        var tgBlendOrderBase = 1;
        var tgBlendOrderMultiplier = 0.001;
        var blendOrder = style.zIndex * tgBlendOrderMultiplier + (xyzLayers.length - xyzLayerIndex) + tgBlendOrderBase;
        return Number(blendOrder.toFixed(3)); // cap digit precision
    }

    // Calculate Tangram label priority based on XYZ layer position
    function getLabelPriority(xyzLayers, xyzLayerIndex, tgOptions) {
        var tgPriorityBase = 0;
        var tgPriorityMultiplier = 0.1;
        return (xyzLayerIndex * tgPriorityMultiplier + tgPriorityBase) +
            ((tgOptions.priority == null ? 1 : tgOptions.priority) * tgPriorityMultiplier * 0.5);
    }

    // Filters out XYZ style placeholder dasharray values that actually indicate solid line
    function hasDash(strokeDasharray) {
        if (strokeDasharray && strokeDasharray[0] == 0 && strokeDasharray[1] == 0) {
            return false;
        }
        return true;
    }

    // Get the offset value from an XYZ style as an array
    function getOffset(style) {
        return [style.offsetX || 0, style.offsetY || 0];
    }

    // Combine icon and circle/rect shapes into a single SVG
    // This allows markers to properly overlap and collide
    function compositeIcons(styleGroup) {
        var shapes = styleGroup
            .filter(function (s) { return s.opacity > 0; })
            .filter(function (s) { return ['Circle', 'Rect', 'Image'].indexOf(s.type) > -1; })
            .sort(function (a, b) { return a.zIndex - b.zIndex; });

        if (shapes.length === 0) {
            return;
        }

        // find width/height incorporating offsets
        var maxOffsetWidth = Math.max.apply(Math, shapes.map(function (s) { return Math.abs(s.offsetX || 0); }).filter(function (x) { return x != null; }));
        var maxOffsetHeight = Math.max.apply(Math, shapes.map(function (s) { return Math.abs(s.offsetY || 0); }).filter(function (x) { return x != null; }));
        var width = Math.max.apply(Math, shapes.map(function (s) { return s.width; }).filter(function (x) { return x != null; })) + maxOffsetWidth;
        var height = Math.max.apply(Math, shapes.map(function (s) { return s.height; }).filter(function (x) { return x != null; })) + maxOffsetHeight;

        var svg =
            "<svg width=\"" + width + "\" height=\"" + height + "\" viewBox=\"0 0 " + width + " " + height + "\" version=\"1.1\"\n            xmlns=\"http://www.w3.org/2000/svg\"\n            xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n";

        shapes.forEach(function (s) {
            // SVG examples as reference
            // <circle cx="25" cy="25" r="20" style="fill: red; stroke: black; stroke-width: 3px;" />
            // <rect x="5" y="5" width="30" height="30" style="fill: red; stroke: black; stroke-width: 3px;" />
            // <image x="0" y="0" width="50" height="50" xlink:href="${url}" />

            var offsetX = (s.offsetX || 0) + (width / 2);
            var offsetY = (s.offsetY || 0) + (height / 2);

            if (s.type === 'Circle') {
                var style = "fill: " + (s.fill) + "; ";
                if (s.stroke && s.strokeWidth) {
                    style += "stroke: " + (s.stroke) + "; stroke-width: " + (s.strokeWidth) + "px;";
                }
                svg += "<circle cx=\"" + offsetX + "\" cy=\"" + offsetY + "\" r=\"" + (s.radius) + "\" style=\"" + style + "\" />\n";
            }
            else if (s.type === 'Rect') {
                var style$1 = "fill: " + (s.fill) + "; ";
                if (s.stroke && s.strokeWidth) {
                    style$1 += "stroke: " + (s.stroke) + "; stroke-width: " + (s.strokeWidth) + "px;";
                }
                svg += "<rect x=\"" + (offsetX - s.width / 2) + "\" y=\"" + (offsetY - s.height / 2) + "\" width=\"" + (s.width) + "\" height=\"" + (s.height) + "\" style=\"" + style$1 + "\" />\n";
            }
            else if (s.type === 'Image') {
                svg += "<image x=\"" + (offsetX - s.width / 2) + "\" y=\"" + (offsetY - s.height / 2) + "\" width=\"" + (s.width) + "\" height=\"" + (s.height) + "\" xlink:href=\"" + (s.src) + "\"/>\n";
            }

            s.skip = true; // mark the group as one we want to skip (replaced by new combined image)
        });

        svg += '</svg>';
        var url = "data:image/svg+xml;base64," + (btoa$1(svg)); // encode SVG as data URL

        // Create a new Image style for the composited SVG
        var image = {
            type: 'Image',
            width: width,
            height: height,
            zIndex: shapes[shapes.length - 1].zIndex, // max zIndex is last
            src: url,
            opacity: 1
        };

        // Optionally attach a text label, if exactly one is found
        var texts = styleGroup.filter(function (s) { return s.type === 'Text' && s.opacity > 0; });
        if (texts.length === 1) {
            var text = texts[0];
            image.text = text;
            text.skip = true; // mark the group as one we want to skip (now attached to new combined image)
        }

        styleGroup.push(image); // add new composited SVG
    }

    // Utility functions

    function quoteValue(value) {
        // quote non-numeric values
        return (isNaN(Number(value)) ? ("'" + value + "'") : Number(value));
    }

    return xyzToTangram;

}));
