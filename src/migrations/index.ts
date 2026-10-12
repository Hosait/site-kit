import * as migration_20261011_111848_initial from './20261011_111848_initial';
import * as migration_20261011_114117_stats_without_consent_off from './20261011_114117_stats_without_consent_off';
import * as migration_20261012_113705_forms_retention from './20261012_113705_forms_retention';

export const migrations = [
  {
    up: migration_20261011_111848_initial.up,
    down: migration_20261011_111848_initial.down,
    name: '20261011_111848_initial',
  },
  {
    up: migration_20261011_114117_stats_without_consent_off.up,
    down: migration_20261011_114117_stats_without_consent_off.down,
    name: '20261011_114117_stats_without_consent_off',
  },
  {
    up: migration_20261012_113705_forms_retention.up,
    down: migration_20261012_113705_forms_retention.down,
    name: '20261012_113705_forms_retention'
  },
];
