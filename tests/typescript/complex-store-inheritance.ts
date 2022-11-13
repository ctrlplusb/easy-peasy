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

// IStoreModel should be allowed to extend both IModelAStoreModel & IModelBStoreModel
interface IStoreModel
  extends IModelAStoreModel<IStoreModel>,
    IModelBStoreModel {}
