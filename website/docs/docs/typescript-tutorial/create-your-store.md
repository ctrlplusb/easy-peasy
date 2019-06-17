# Create your store

The heart of the Typescript integration with Easy Peasy are the typing definitions you define to represent your [store's](/docs/api/store) model. This typing information can then be used by the various Easy Peasy APIs to provide you with assertions, code completions, etc.

For this tutorial we will create a model consisting of two slices; todos and an audit log. 

We will start by defining the state for our model - without actions/thunks/etc.

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

Using our model interfaces we can create our model implementation.

```typescript
const todosModel: TodosModel = {
  items: []
};

const auditModel: AuditModel = {
  logs: []
};

const storeModel: StoreModel = {
  todos,
  audit
}
```

Good ol' Typescript will make sure that we implement the model in full.

***TODO: Screenshot of validation against model***

You can organise your model interfaces and implementations as you please. My personal preference is to split them out into seperate files based on slice/feature.

```typescript
// todos.ts

export interface TodosModel {
  items: Todo[];
}

const todosModel: TodosModel = {
  items: []
};

export default todosModel;
```

Now that we have our model defined we can pass it to [createStore](/docs/api/create-store) in order to create our [store](/docs/api/store).

```typescript
import storeModel from './model';

const store = createStore(storeModel);
```

The [store](/docs/api/store) that is returned will be fully typed. If you try to use the [store's](/docs/api/store) APIs you will note the typing information and code completion being offered by your IDE.

***TODO: Screenshot of store APIs typing***