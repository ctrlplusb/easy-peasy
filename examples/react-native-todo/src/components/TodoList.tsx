import React, {useRef, useState} from 'react';
import {ScrollView, StyleSheet, Text, TextInput} from 'react-native';
import {useStoreActions, useStoreState} from '../store';
import Toolbar from './Toolbar';

export function TodoList(): JSX.Element {
  const {remainingTodos, todos} = useStoreState(state => state);
  const [hideComplete, setHideComplete] = useState(false);

  const newTodoRef = useRef<TextInput>(null);
  const addTodo = useStoreActions(actions => actions.addTodo);
  const toggleTodo = useStoreActions(actions => actions.toggleTodo);

  return (
    <ScrollView style={styles.sectionContainer}>
      <TextInput
        placeholder="Add todo..."
        onSubmitEditing={e => {
          if (e.nativeEvent.text.trim() !== '') {
            addTodo({text: e.nativeEvent.text, done: false});
            newTodoRef.current?.clear();
          }
        }}
        returnKeyType="next"
        ref={newTodoRef}
        autoFocus={true}
        placeholderTextColor="#8fa5d1"
        style={[styles.todo, styles.newTodo]}
      />
      <Toolbar isEnabled={hideComplete} setIsEnabled={setHideComplete} />
      {todos &&
        (hideComplete ? remainingTodos : todos).map((todo, i) => (
          <Text
            key={i}
            style={[styles.todo, todo.done ? styles.done : null]}
            onPress={() => toggleTodo(todo.text)}>
            {todo.text}
          </Text>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  todo: {
    fontSize: 24,
    marginBottom: 6,
    color: '#1E3A8A',
  },
  done: {
    textDecorationLine: 'line-through',
  },
  newTodo: {
    color: '#3E5EB9',
    fontStyle: 'italic',
  },
});
