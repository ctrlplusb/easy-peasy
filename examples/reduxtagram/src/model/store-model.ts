import { postsModel, PostsModel } from './posts-model';
import { commentsModel, CommentsModel } from './comments-model';

export interface StoreModel {
  commentsModel: CommentsModel;
  postsModel: PostsModel;
}

export const storeModel: StoreModel = {
  commentsModel,
  postsModel,
};
