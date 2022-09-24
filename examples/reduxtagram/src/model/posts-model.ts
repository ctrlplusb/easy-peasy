import { Action, action } from 'easy-peasy';

export interface Post {
  id: string;
  caption: string;
  likes: number;
  src: string;
}

export interface PostsModel {
  posts: Post[];

  likePost: Action<PostsModel, string>;
}

export const postsModel: PostsModel = {
  posts: [],

  likePost: action((state, postId) => {
    const post = state.posts.find((item) => item.id === postId);

    if (post) {
      post.likes += 1;
    }
  }),
};
