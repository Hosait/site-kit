import * as migration_20261011_111848_initial from './20261011_111848_initial';
import * as migration_20261011_114117_stats_without_consent_off from './20261011_114117_stats_without_consent_off';
import * as migration_20261012_050628_site_settings_no_brand_defaults from './20261012_050628_site_settings_no_brand_defaults';
import * as migration_20261016_190445_forms_retention from './20261016_190445_forms_retention';
import * as migration_20261115_111150_section_settings from './20261115_111150_section_settings';
import * as migration_20261115_120137_more_blocks from './20261115_120137_more_blocks';
import * as migration_20261115_122639_reusable_content from './20261115_122639_reusable_content';
import * as migration_20261115_132306_visual_editor_simple_mode from './20261115_132306_visual_editor_simple_mode';

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
    name: '20261012_050628_site_settings_no_brand_defaults',
  },
  {
    up: migration_20261016_190445_forms_retention.up,
    down: migration_20261016_190445_forms_retention.down,
    name: '20261016_190445_forms_retention',
  },
  {
    up: migration_20261115_111150_section_settings.up,
    down: migration_20261115_111150_section_settings.down,
    name: '20261115_111150_section_settings',
  },
  {
    up: migration_20261115_120137_more_blocks.up,
    down: migration_20261115_120137_more_blocks.down,
    name: '20261115_120137_more_blocks',
  },
  {
    up: migration_20261115_122639_reusable_content.up,
    down: migration_20261115_122639_reusable_content.down,
    name: '20261115_122639_reusable_content',
  },
  {
    up: migration_20261115_132306_visual_editor_simple_mode.up,
    down: migration_20261115_132306_visual_editor_simple_mode.down,
    name: '20261115_132306_visual_editor_simple_mode'
  },
];
