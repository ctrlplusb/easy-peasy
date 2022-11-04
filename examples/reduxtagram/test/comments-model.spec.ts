import { describe, expect, it } from 'vitest';
import { createStore } from 'easy-peasy';
import { commentsModel } from '@/model';

describe('Comments', () => {
  it('should be initialized', () => {
    // arrange
    const store = createStore(commentsModel);

    // act
    expect(store.getState().comments).toEqual({});
  });

  it('should add comment', () => {
    // arrange
    const postId = 'BAPIPRjQce9';
    const comment = {
      text: "Those are cute! They're like silver dollar pancakes.",
      user: 'rrsimonsen',
    };
    const store = createStore(commentsModel, {
      initialState: {
        comments: {},
      },
    });

    // act
    store.getActions().addComment({ postId, text: comment.text, user: comment.user });

    // assert
    expect(store.getState()).toMatchObject({
      comments: {
        BAPIPRjQce9: [comment],
      },
    });
  });

  it('should remove comment', () => {
    // arrange
    const postId = 'baf2ky4wcry';
    const comments = [
      {
        id: '1205010424',
        text: "Looking great Wes! I'd like to see the other side of the room too.",
        user: 'axcdnt',
      },
      {
        id: '6325185448',
        text: "I've never caught your podcast. Have one right? Btw - they don't have a Canary pillow? 😝",
        user: 'henrihelvetica',
      },
      {
        id: '5044355491',
        text: 'Great way to start the year.',
        user: 'pmgllc',
      },
      {
        id: '2535904459',
        text: 'Are there 4k monitors?',
        user: 'alexbaumgertner',
      },
      {
        id: '1232637418',
        text: "@axcdnt that is where I put all the junk. I'll have to clean that side too @henrihelvetica no podcast yet! @pmgllc ohh yeah! @alexbaumgertner yep - the main one is 4K - I'm loving it",
        user: 'wesbos',
      },
      {
        id: '1675609189',
        text: 'That chrome pillow. 😉',
        user: 'imagesofthisandthat',
      },
      {
        id: '4098289457',
        text: '@wesbos is that the Dell 4k? The MacBook Pro powers it well? I also have a Retina™ / x1 setup as well. Very handy.',
        user: 'henrihelvetica',
      },
      {
        id: '9916299438',
        text: '#minimalsetups',
        user: 'wesbos',
      },
    ];
    const store = createStore(commentsModel, {
      initialState: {
        comments: {
          [postId]: comments,
        },
      },
    });
    const commentId = '6325185448';
    const commentsAfterRemoval = comments.filter((item) => item.id !== commentId);

    // actqq
    store.getActions().removeComment({ postId, commentId: '6325185448' });

    // assert
    expect(store.getState().comments[postId]).toEqual(commentsAfterRemoval);
  });
});
