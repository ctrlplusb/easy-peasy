# Community Extensions

Below is a list of some of the work performed by the community, providing some interesting extensions to Easy Peasy.

## [`easy-peasy-decorators`](https://github.com/easypeasy-community/decorators)

This is a lightweight TypeScript library, providing the ability to generate stores via classes and decorators.

```typescript
import { Model, Property, Action, createStore } from "easy-peasy-decorators";

@Model("todos")
class TodoModel {
    @Property()
    public items = ["Create store", "Wrap application", "Use store"];

    @Action()
    add(payload: string) {
        this.items.push(payload);
    }
}

interface IStoreModel {
    todos: TodoModel;
}

export const store = createStore<IStoreModel>();
```

Check out the [GitHub repository](https://github.com/easypeasy-community/decorators) for more information.