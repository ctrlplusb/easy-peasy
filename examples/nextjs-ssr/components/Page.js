import Link from 'next/link';

import Counter from './Counter';
import Shop from './Shop';
import Inventory from './Inventory';

function Page({ title, linkTo }) {
  return (
    <div>
      <h1>{title}</h1>
      <Counter />
      <Shop />
      <Inventory />
      <Link href={linkTo}>{linkTo === '/' ? '/index' : linkTo}</Link>

      {' - '}
      <Link href="/ssr">SSR (again)</Link>
    </div>
  );
}

export default Page;
