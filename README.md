TypedInterface
==============

TypedInterface allows you to define the parameter types and return type that a function or method must accept. 

## Usage

### `defineFunction`

Used for wrapping functions within a given context. You can pass in the local context `this` or even `window` for globals.

__Arguments__

- `ctx` the context (or environment, or namespace) where the function is defined.
- `name` the name of the function
- `argTypes` ordered array of types that the function must accept
- `rType` The return value type

__Example__

```javascript
Interface.defineFunction(this, 'renderTasks', [Array], String);
function renderTasks(tasks) {
  return "Tasks: " + tasks.join(", ");
}

try {
  renderTasks(1, 2);
} catch (e) {
  console.error(e.toString());
  // TypeError: Mismatched argument lengths: got 2, wanted 1 
}
```

### `defineMethod`

Used for wrapping methods of a prototype. This allows you to define the types for each method of the prototype, and then use the `extend` method to adopt the same definitions for each instance of that prototype. Check out the example for a better explanation.

__Arguments__

- `cls` the class/prototype reference
- `name` the name of the method
- `argTypes` ordered array of types that the function must accept
- `rType` The return value type

__Example__

```javascript
// Define our Interface prototype that various other 'classes' will implement
var ServiceClass = function(){};
ServiceClass.prototype.login = function() {}; // no need to actually write logic here
ServiceClass.prototype.getInputFields = function() {};

Interface.defineMethod(ServiceClass, 
  "login", [optional(Object), optional(Function)], undefined);

Interface.defineMethod(ServiceClass, 
  "getInputFields", [Object, String, Function], undefined);

// Example of a class that implements the above defined methods
var SomeService = function(){};
SomeService.prototype.login = function(data, cb) {
  [...]
};
SomeService.prototype.getInputFields = function(data, site, cb) {
  [...]
};

// Extend it! This will adopt the same type checks as the ServiceClass. 
// Any method that SomeService does not implement will fallback to ServiceClass.
// This does not create new wrappers, rather relies on the CACHED wrappers 
// for ServiceClass.
SomeService = Interface.extend(ServiceClass, SomeService);

// And instantiate as you normally would:
var SomeServiceInstance = new SomeService();
```


## Exception Examples

```javascript

var myTasks = [
  'Goto park',
  'Bake bread',
  'Win lottery'
];

var renders = {
  tasks: function(tasks) {
    return "Tasks: " + tasks.join(", ");
  },
  badTasks: function(tasks) {
    return tasks;
  }
};
Interface.defineFunction(renders, 'tasks', [Array], String);
Interface.defineFunction(renders, 'badTasks', [Array], String);


try {
  renders.tasks(true);
} catch (e) {
  console.error(e.toString());
  // TypeError: Mismatched argument 1: got boolean, wanted function Array() { [native code] } for undefined() 
}

try {
  renders.tasks(myTasks, true);
} catch (e) {
  console.error(e.toString());
  // TypeError: Mismatched argument lengths: got 2, wanted 1 
}

try {
  renders.tasks();
} catch (e) {
  console.error(e.toString());
  // TypeError: Mismatched argument lengths: got 0, wanted 1 
}

try {
  renders.badTasks(myTasks);
} catch (e) {
  console.error(e.toString());
  // Mismatched return value (got: object, wanted: function String() { [native code] }) 
}

// yay!
var out = renders.tasks(myTasks);
console.debug(out);
```

## Credits

The original idea and proof was the work of the rather illustrious [Lewis Zimmerman](https://github.com/lzimm).
