import { Thunk } from 'easy-peasy';

type Injections = any;

type ISomeOtherModel = {};

interface IModelA<TStore extends ISomeOtherModel> {
  commitSomething: Thunk<
    IModelAStoreModel<TStore>,
    void,
    Injections,
    IModelAStoreModel<TStore>
  >;
}

// IModelAStoreModel is generic, and requires the root store as input
type IModelAStoreModel<TStore extends ISomeOtherModel> = IModelA<TStore> &
  ISomeOtherModel & {
    onSomethingLoaded: Thunk<TStore, any>;
  };

// IModelBStoreModel is not generic, and is based on IModelAStoreModel, but it does not care about the generic type
// of IModelAStoreModel (thus it is just passing`any` to`IModelAStoreModel`)
interface IModelBStoreModel extends IModelAStoreModel<any> {}

// ❌ Fails here 👇
// > Interface 'IStoreModel' cannot simultaneously extend types 'IModelAStoreModel<IStoreModel>' and 'IModelBStoreModel'.
// >   Named property 'commitSomething' of types 'IModelAStoreModel<IStoreModel>' and 'IModelBStoreModel' are not identical.
interface IStoreModel
  extends IModelAStoreModel<IStoreModel>,
    IModelBStoreModel {}
