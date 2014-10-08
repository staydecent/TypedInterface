TypedInterface
==============

Typed Interface allow you to specify the methods and their parameter types that another Object must define.


## Object Example

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
