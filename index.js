(function() {
  'use strict';

  var Interface = {};

  Interface.CACHE = {
    CONTEXT: {}
  };


  // Additional types

  window.StringOrArray = function (val) {
    return val.constructor === String || val.constructor === Array;
  };

  window.NumberOrArray = function (val) {
    return val.constructor === Number || val.constructor === Array;
  };

  window.Promise = function (val) {
    return val.always && val.then;
  };

  window.optional = function (type) {
    var f = function(val) {
      if (!val) return true;

      if (typeof type === 'function' && typeof val === 'function') {
        return true;
      } else if (val.constructor == type || (val instanceof type)) {
        return true;
      }
      return false;
    };

    f.Optional = true;

    return f;
  };


  // Private

  var isMatchingArgument = function (argVal, argType) {
    if (argType === undefined && argVal === undefined) {
      return true;
    }
    
    var isNativeType = [
        'object',
        'boolean',
        'number', 
        'string', 
        'function'
      ].some(function(t) { return t === typeof argType; });

    var wantArray = false;
    if (isNativeType) 
      wantArray = (argType.toString().indexOf('Array') > -1);

    if (argType.Optional && argType(argVal)) {
      return true;
    } else if (!isNativeType && argType(argVal)) {
      return true;
    } else if (isNativeType) {
      // objects are not arrays!
      if (wantArray && argVal instanceof Array) {   
        return true;
      } else if (!wantArray && 
        (argType.toString().toLowerCase().indexOf(typeof argVal) > -1)) {
        return true;
      }
    }

    return false;
  };

  /**
   * Wraps a function for defineFunction or defineMethod.
   *
   * Type checks all arguments and the return value of the original Function.
   * If everything passes, then return the original Functions return value.
   */
  var wrapper = function (argVals, argTypes, rType, func, name) {
    var i, l;
    var givenLen = argVals.length;
    var expectedLen = 0;
    var optionalLen = 0;

    argTypes.forEach(function(t) {
      if (t.Optional) optionalLen += 1;
      else expectedLen += 1;
    });

    if ((optionalLen && givenLen !== (optionalLen + expectedLen)) &&
       (!optionalLen && givenLen !== expectedLen)) {
      throw new TypeError("Mismatched argument lengths: got " + givenLen + ", wanted " + expectedLen);
    }

    // iterate each given arg, testing if valid type
    for (i = 0, l = givenLen; i < l; i++) {
      var argVal = argVals[i];
      var argType = argTypes[i];

      if (isMatchingArgument(argVal, argType)) 
        continue;

      throw new TypeError("Mismatched argument " + (i+1) + ": got " + typeof argVal + ", wanted " + argType + " for " + name + "()");
    }

    // return the valid return value of the original function or throw
    var rVal = func.apply(this, argVals);
    if (isMatchingArgument(rVal, rType))
      return;

    throw new TypeError("Mismatched return value (got: " + typeof (rVal) + ", wanted: " + rType + ")");
  };


  // Public

  /**
   * Define types on an Object's property.
   * 
   * @param  {Object} ctx      Reference to some Object
   * @param  {String} name     Property name of a Function
   * @param  {Array}  argTypes Array of types ex. [Number, Boolean, ..]
   * @param  {Mixed}  rType    The return value's type ex. Boolean
   */
  Interface.defineFunction = function (ctx, name, argTypes, rType) {
    var func = ctx[name];

    if (!func || !(func instanceof Function)) {
      throw new TypeError("Function: " + name + " in context: " + ctx + " isn't a valid function: " + func);
    }

    var wrapped = function () {
      return wrapper.apply(this, [arguments, argTypes, rType, func]);
    };

    ctx[name] = wrapped;

    var cacheObj = {
      ctx: ctx,
      original: func,
      wrapped: wrapped
    };

    Interface.CACHE.CONTEXT[ctx] = Interface.CACHE.CONTEXT[ctx] || {};
    Interface.CACHE.CONTEXT[ctx][name] = cacheObj;
  };


  /**
   * Define types on an instance's property.
   * 
   * @param  {Prototype} cls      An Object instance
   * @param  {String}    name     Property name of a method
   * @param  {Array}     argTypes Array of types ex. [Number, Boolean, ..]
   * @param  {Mixed}     rType    The return value's type ex. Boolean
   */
  Interface.defineMethod = function (cls, name, argTypes, rType) {
    var defMethod = function (ctxs, c, name, argTypes, rType) {
      var ctx = ctxs[c];
      var func = ctx.prototype[name];

      if (!func || !(func instanceof Function)) {
        throw new TypeError("Function: " + name + " in context: " + ctxs + " isn't a valid function: " + func);
      }

      var wrapped = function () {
        return wrapper.apply(this, [arguments, argTypes, rType, func, name]);
      };

      ctx.prototype[name] = wrapped;

      var cacheObj = {
        ctx: ctx,
        original: func,
        wrapped: wrapped,
        args: Array.prototype.slice.call(arguments, -2),
        test: true
      };

      Interface.CACHE.CONTEXT[ctx] = Interface.CACHE.CONTEXT[ctx] || {};
      Interface.CACHE.CONTEXT[ctx][name] = cacheObj;
    };

    var ctxs = [];
    ctxs.push(cls);

    for (var c = 0, l = ctxs.length; c < l; c++) {
      defMethod(ctxs, c, name, argTypes, rType);
    }
  };


  /**
   * Adopt the 'type rules' of cached Prototype.
   * 
   * @param  {Prototype} parent
   * @param  {Prototype} child
   * @return {Reference}
   */
  Interface.extend = function(ctx, child) {
    // apply wrapper to child properties
    var cached = Interface.CACHE.CONTEXT[ctx];
    for (var prop in cached) {
      var args = cached[prop].args;
      
      // adopt missing methods from ctx
      if (!child.prototype.hasOwnProperty(prop)) {
        child.prototype[prop] = cached[prop].original;
      }

      Interface.defineMethod(child, prop, args[0], args[1]);
    }

    return child;
  };


  // var MyClass = function() {};
  // MyClass.prototype.test = function(a,b,c) { return true; };
  // Interface.defineMethod(MyClass, 'test', [Number, Array, Array], Boolean);
  // var testClass = new MyClass();
  // var r = testClass.test(1, {}, [1,2,3]);


  window.Interface = Interface;

}).call(this);