# memo

This helper provides you with a mechanism by which to create a memoised function. A memoised function will cache its results until its inputs change.

Internally Easy Peasy uses a lot of memoisation, and there are cases you may want to create a memoised function, incorporating it into your Easy Peasy model. This helper allows you to avoid bringing your own memoisation library to the table.

## Arguments

- `fn` (Function, *required*)

  The function to memoise.

- `cacheSize` (number, *required*)

  The size of the memoisation cache. Your memoised function will cache variations of the inputs to your function up to the given cache size.

## Example

```javascript
import { memo } from 'easy-peasy';

const fullName = (firstName, lastName) => `${firstName} ${lastName}`;

const memoisedFullName = memo(fullName, 2);

memoisedFullName('Mary', 'Poppins'); // new cache entry
memoisedFullName('Mary', 'Poppins'); // cache hit
memoisedFullName('Bob', 'Poppins'); // new cache entry
memoisedFullName('Bob', 'Poppins'); // cache hit
```