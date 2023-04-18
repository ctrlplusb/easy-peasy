import React, {PropsWithChildren} from 'react';
import {View, Switch, Text, StyleSheet} from 'react-native';
import {useStoreState} from '../store';

type Props = PropsWithChildren<{
  isEnabled: boolean;
  setIsEnabled: Function;
}>;

const Toolbar = ({isEnabled, setIsEnabled}: Props): JSX.Element => {
  const {completedCount, totalCount} = useStoreState(state => state);

  const toggleSwitch = () => {
    setIsEnabled((previousState: Boolean) => !previousState);
  };

  return (
    <View style={styles.row}>
      <Text>
        {completedCount} of {totalCount}
      </Text>
      <View style={styles.switchLabel}>
        <Text style={styles.label}>Hide Done</Text>
        <Switch onValueChange={toggleSwitch} value={isEnabled} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  switchLabel: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  label: {
    marginHorizontal: 5,
    fontSize: 16,
  },
});

export default Toolbar;
