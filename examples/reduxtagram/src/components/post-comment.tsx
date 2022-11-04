import React from 'react';
import { useStoreActions } from '@/hooks';
import { Comment } from '@/model';

interface Props {
  postId: string;
  comment: Comment; // comment related to post
}

export default function PostComment({ postId, comment }: Props) {
  const removeComment = useStoreActions((actions) => actions.commentsModel.removeComment);

  return (
    <div className="comment">
      <p>
        <strong>{comment.user}</strong>
        {comment.text}
        <button className="remove-comment" onClick={() => removeComment({ postId, commentId: comment.id })}>
          &times;
        </button>
      </p>
    </div>
  );
}
