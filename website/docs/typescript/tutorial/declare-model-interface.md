# Declare model interface

Firstly, you need to define a type that represents your model.

```typescript
import { Action, Reducer, Thunk, Select } from 'easy-peasy'

interface TodosModel {
  items: Array<string>
  // represents a "select"
  firstItem: Select<TodosModel, string | void>
  // represents an "action"
  addTodo: Action<TodosModel, string>
}

interface UserModel {
  token?: string
  loggedIn: Action<UserModel, string>
  // represents a "thunk"
  login: Thunk<UserModel, { username: string; password: string }>
}

interface StoreModel {
  todos: TodosModel
  user: UserModel
  // represents a custom reducer
  counter: Reducer<number>
}
```