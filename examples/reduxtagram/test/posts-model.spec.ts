import { describe, expect, it } from 'vitest';
import { createStore } from 'easy-peasy';
import { Post, postsModel } from '@/model';

describe('Posts', () => {
  it('should be initialized', () => {
    // arrange
    const store = createStore(postsModel, { initialState: { posts: [] } });

    // assert
    expect(store.getState().posts).toEqual([]);
  });

  it('should like post', () => {
    // arrange
    const post: Post = {
      caption: 'Lunch #hamont',
      likes: 8,
      id: 'BAcyDyQwcXX',
      src: 'https://picsum.photos/400/400/?image=64',
    };
    const store = createStore(postsModel, {
      initialState: { posts: [post] },
    });

    // act
    store.getActions().likePost('BAcyDyQwcXX');

    // assert
    expect(store.getState().posts).toEqual([{ ...post, likes: 9 }]);
  });
});
