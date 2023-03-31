import Page from '../components/Page';

import { initializeStore } from '../store/store';

export default function SSR() {
  return <Page title="SSR Page" linkTo="/" />;
}

export function getServerSideProps() {
  const store = initializeStore();

  const data = ['apple', 'pear', 'orange', 'nuts'];
  store.getActions().inventory.setItems(data);

  return { props: { serverStoreState: store.getState() } };
}
