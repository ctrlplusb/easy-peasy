import React from 'react';
import Photo from '@/components/photo';
import { useStoreState } from '@/hooks';

export default function PhotoGrid() {
  const allPosts = useStoreState((state) => state.postsModel.posts);
  const allComments = useStoreState((state) => state.commentsModel.comments);

  return (
    <div className="photo-grid">
      {allPosts.map((post) => {
        const postComments = allComments[post.id];
        return <Photo key={post.id} post={post} comments={postComments || []} />;
      })}
    </div>
  );
}
