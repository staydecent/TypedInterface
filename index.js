(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Typed = factory();
  }
}(this, function() {
  'use strict';

  var isMatchingArgument = function (argVal, argType) {
    if (argType === '*') {
      return argVal !== undefined && argVal !== null;
    } else if (argType === '?') {
      return true;
    } else {
      return ({}).toString.call(argVal).indexOf(argType) !== -1;
    }
  };

  var wrapper = function (argVals, argTypes, rType, func, name) {
    var givenLen = argVals.length;
    var argType, argVal;

    for (var x=0; x < givenLen; x++) {
      argType = argTypes[x];
      argVal = argVals[x];
      
      if (argType === undefined || !isMatchingArgument(argVal, argType)) {
        noop();
      }
    }

    var rVal = func.apply(this, argVals);
    if (isMatchingArgument(rVal, rType)) {
      return rVal;
    } else {
      noop();
    }
  };

  return function (func, argTypes, rType) {
    if (!func || !(func instanceof Function)) {
      noop();
    } else if (!argTypes || argTypes.length) {
      noop();
    } else if (!rType) {
      noop();
    } else {
      return function() { return wrapper.apply(this, [arguments, argTypes, rType, func]); };
    }
  };
}));
