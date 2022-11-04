import { createStore } from 'easy-peasy';
import comments from '@/data/comments';
import posts from '@/data/posts';
import { storeModel } from '@/model';

const store = createStore(storeModel, {
  devTools: import.meta.env.DEV ? { name: 'Easy Peasy Reduxtagram' } : false,
  initialState: { commentsModel: { comments }, postsModel: { posts } },
});

export default store;
