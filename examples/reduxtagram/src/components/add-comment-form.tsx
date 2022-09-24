import React, { FormEvent, useState } from 'react';
import { useStoreActions } from '@/hooks';

interface Props {
  postId: string;
}

export default function AddCommentForm({ postId }: Props) {
  const addComment = useStoreActions((actions) => actions.commentsModel.addComment);
  const [author, setAuthor] = useState('');
  const [comment, setComment] = useState('');

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (author && comment) {
      addComment({ postId, user: author, text: comment });
      setAuthor('');
      setComment('');
    }
  };

  return (
    <form onSubmit={onSubmit} className="comment-form">
      <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="author" required />
      <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="comment" required />
      <button type="submit" className={'button w-full mt-2'}>
        Add comment
      </button>
    </form>
  );
}
