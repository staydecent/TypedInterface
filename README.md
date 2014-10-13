TypedInterface
==============

TypedInterface allows you to define the parameter types and return type that a function or method must accept. 

## Usage

### `defineFunction`

Used for wrapping functions within a given context. You can pass in the local context `this` or even `window` for globals.

#### Arguments

- `ctx` the context (or environment, or namespace) where the function is defined.
- `name` the name of the function
- `argTypes` ordered array of types that the function must accept
- `rType` The return value type

#### Example

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
