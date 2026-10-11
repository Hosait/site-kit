import * as migration_20261011_111848_initial from './20261011_111848_initial';
import * as migration_20261011_114117_stats_without_consent_off from './20261011_114117_stats_without_consent_off';

export const migrations = [
  {
    up: migration_20261011_111848_initial.up,
    down: migration_20261011_111848_initial.down,
    name: '20261011_111848_initial',
  },
  {
    up: migration_20261011_114117_stats_without_consent_off.up,
    down: migration_20261011_114117_stats_without_consent_off.down,
    name: '20261011_114117_stats_without_consent_off'
  },
];
