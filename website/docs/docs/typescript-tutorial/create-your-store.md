# Create your store

The heart of the Typescript integration with Easy Peasy are the typing definitions you provide for your model. From this Easy Peasy will be able to provide you with typing information, code completion, and assertions across the rest of its APIs.

Our model will consist of two slices; todos and an audit log. For now we will only define the state within our model, no actions etc.

```typescript
// The interface representing our Todos model
interface TodosModel {
  items: string[];
}

// The interface representing our Audit model
interface AuditModel {
  log: string[];
}

// The interface representing our entire store model
interface StoreModel {
  todos: TodosModel;
  audit: AuditModel;
}
```

Using our model interface we can create our initial model implementation.

```typescript
const todos: TodosModel = {
  items: []
};

const audit: AuditModel = {
  logs: []
};

const model: StoreModel = {
  todos,
  audit
}
```

Good ol' Typescript will make sure that we implement the model in full.

***TODO: Screenshot of validation against model***

You can organise your interfaces and model implementation as you please. My personal preference is to split them out by slice, for example.

```typescript
// todos.ts

export interface TodosModel {
  items: Todo[];
}

const todos: TodosModel = {
  items: []
};

export default todos;
```

Now that we have our model defined we can pass it to [createStore](/docs/api/create-store) in order to create our [store](/docs/api/store).

```typescript
const store = createStore(model);
```

The [store](/docs/api/store) that is returned will be fully typed. If you try to use the [store's](/docs/api/store) APIs you will note the typing information and code completion being offered by your IDE.

***TODO: Screenshot of store APIs typing***