import * as migration_20261011_111848_initial from './20261011_111848_initial';
import * as migration_20261011_114117_stats_without_consent_off from './20261011_114117_stats_without_consent_off';
import * as migration_20261012_050628_site_settings_no_brand_defaults from './20261012_050628_site_settings_no_brand_defaults';

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
    up: migration_20261012_050628_site_settings_no_brand_defaults.up,
    down: migration_20261012_050628_site_settings_no_brand_defaults.down,
    name: '20261012_050628_site_settings_no_brand_defaults'
  },
];
