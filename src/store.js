import Provider from './provider';
import { useStoreModel } from './hooks';

const Model = ({ model, children }) => {
  useStoreModel(model);

  return children;
};

export default {
  Provider,
  Model,
};
