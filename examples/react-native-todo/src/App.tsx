import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';

import {StoreProvider} from 'easy-peasy';
import store from './store';
import {TodoList} from './components/TodoList';

function App(): JSX.Element {
  return (
    <StoreProvider store={store}>
      <SafeAreaView style={styles.mainView}>
        <TodoList />
      </SafeAreaView>
    </StoreProvider>
  );
}

export const styles = StyleSheet.create({
  mainView: {backgroundColor: '#FFF4C2', flex: 1},
});

export default App;
