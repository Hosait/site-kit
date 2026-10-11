import * as migration_20261011_111848_initial from './20261011_111848_initial';

export const migrations = [
  {
    up: migration_20261011_111848_initial.up,
    down: migration_20261011_111848_initial.down,
    name: '20261011_111848_initial'
  },
];
