import { useState } from 'react';
import { useStoreActions, useStoreState } from '../../store';
import { StoreModel } from '../../store/model';
import generateId from '../../utils/generateId';

const AddTask: React.FC<{ list: keyof StoreModel }> = ({ list }) => {
  const [name, setName] = useState('');
  const { name: listName } = useStoreState((state) => state[list]);
  const { addTask } = useStoreActions((actions) => actions[list]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        addTask({ id: generateId(), name });
        setName('');
      }}
    >
      <textarea
        className="block w-full rounded-md mb-2"
        aria-label={`Task name for "${listName}"`}
        placeholder="Task name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        className="w-full rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm disabled:bg-slate-300"
        aria-label={`Add task for "${listName}"`}
        type="submit"
        disabled={!name.length}
      >
        Add task
      </button>
    </form>
  );
};

export default AddTask;
