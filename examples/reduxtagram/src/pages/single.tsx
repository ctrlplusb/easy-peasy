import React from 'react';
import { useParams } from 'react-router';
import AddCommentForm from '@/components/add-comment-form';
import Photo from '@/components/photo';
import PostComment from '@/components/post-comment';
import { useStoreState } from '@/hooks';

export default function Single() {
  const { postId } = useParams<{ postId: string }>();
  const post = useStoreState((state) => state.postsModel.posts.find((item) => item.id === postId));
  const postComments = useStoreState((state) => (post ? state.commentsModel.byPostId(post.id) : []));

  if (post) {
    return (
      <div className="single-photo">
        <Photo post={post} comments={postComments} />
        <div className="comments">
          {postComments.map((comment) => (
            <PostComment key={comment.id} postId={postId!} comment={comment} />
          ))}
          <AddCommentForm postId={postId!} />
        </div>
      </div>
    );
  } else {
    return null;
  }
}
