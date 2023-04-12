import { produce, setAutoFreeze } from 'immer';

export const migrate = (
  data,
  migrations,
) => {
  setAutoFreeze(false);

  let version = data._migrationVersion ?? 0;
  const toVersion = migrations.migrationVersion

  if (typeof version !== "number" || typeof toVersion !== 'number') {
    throw new Error('No migration version found');
  }

  while (version < toVersion) {
    const nextVersion = version + 1;
    const migrator = migrations[nextVersion];

    if (!migrator) {
      throw new Error(`No migrator found for \`migrationVersion\` ${nextVersion}`);
    }

    data = produce(data, migrator);
    data._migrationVersion = nextVersion;
    version = data._migrationVersion;
  }

  setAutoFreeze(true);
  return data;
}
