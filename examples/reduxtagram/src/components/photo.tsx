import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import { useStoreActions } from '@/hooks';
import { Comment, Post } from '@/model';

interface Props {
  post: Post;
  comments: Comment[]; // comments related to this post
}

export default function Photo({ post, comments }: Props) {
  const [appear, setAppear] = useState(false);
  const likePost = useStoreActions((actions) => actions.postsModel.likePost);

  return (
    <figure className="grid-figure">
      <div className="grid-photo-wrap">
        <Link to={`/view/${post.id}`}>
          <img className="grid-photo" src={post.src} alt={post.caption} loading={'lazy'} />
        </Link>

        <CSSTransition
          in={appear}
          classNames="like"
          timeout={{ enter: 500, exit: 500 }}
          onEntered={() => setAppear(false)}
        >
          <span className="likes-heart">{post.likes}</span>
        </CSSTransition>
      </div>

      <figcaption>
        <p>{post.caption}</p>

        <div className="control-buttons">
          <button
            onClick={() => {
              likePost(post.id);
              setAppear(true);
            }}
            className="likes"
          >
            &hearts; {post.likes}
          </button>

          <Link to={`/view/${post.id}`} className="button">
            <span className="comment-count">
              <span className="speech-bubble"></span> {comments.length}
            </span>
          </Link>
        </div>
      </figcaption>
    </figure>
  );
}
