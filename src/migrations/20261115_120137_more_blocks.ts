import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_tabs_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_tabs_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_tabs_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_tabs_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_tabs_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_tabs_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_pages_blocks_pricing_plans_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_pricing_plans_link_appearance" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum_pages_blocks_pricing_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_pricing_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_pricing_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_pricing_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_pricing_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_pricing_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_pricing_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_pages_blocks_logo_wall_logos_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_logo_wall_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_logo_wall_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_logo_wall_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_logo_wall_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_logo_wall_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_logo_wall_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_logo_wall_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_columns" AS ENUM('1', '2', '3');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_testimonials_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_pages_blocks_carousel_slides_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_carousel_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_carousel_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_carousel_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_carousel_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_carousel_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_carousel_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_pages_blocks_table_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_table_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_table_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_table_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_table_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_table_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_pages_blocks_contact_card_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_contact_card_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_contact_card_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_contact_card_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_contact_card_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_contact_card_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_pages_blocks_icon_features_items_icon" AS ENUM('check', 'star', 'heart', 'shield', 'lock', 'clock', 'calendar', 'mail', 'phone', 'map-pin', 'users', 'home', 'tool', 'lightbulb', 'chart', 'leaf', 'award', 'truck', 'message', 'search', 'settings', 'zap', 'thumbs-up', 'book', 'globe', 'handshake', 'target', 'rocket');
  CREATE TYPE "public"."enum_pages_blocks_icon_features_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_icon_features_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_pages_blocks_icon_features_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_icon_features_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_icon_features_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_icon_features_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_icon_features_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_icon_features_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_icon_features_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_pages_blocks_banner_variant" AS ENUM('info', 'warning', 'success');
  CREATE TYPE "public"."enum_pages_blocks_banner_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_banner_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_banner_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_banner_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_banner_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_banner_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_pages_blocks_button_group_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_button_group_links_link_appearance" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum_pages_blocks_button_group_justify" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_pages_blocks_button_group_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_button_group_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_button_group_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_button_group_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_button_group_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_button_group_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_pages_blocks_divider_kind" AS ENUM('line', 'space');
  CREATE TYPE "public"."enum_pages_blocks_divider_size" AS ENUM('s', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_divider_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_divider_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_divider_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_divider_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_divider_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_pages_blocks_columns_layout" AS ENUM('1-1', '2-1', '1-2', '1-1-1', '1-1-1-1');
  CREATE TYPE "public"."enum_pages_blocks_columns_vertical_align" AS ENUM('top', 'center', 'bottom');
  CREATE TYPE "public"."enum_pages_blocks_columns_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_columns_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_columns_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_columns_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_columns_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_columns_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_pages_blocks_newsletter_mode" AS ENUM('form', 'embed');
  CREATE TYPE "public"."enum_pages_blocks_newsletter_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_newsletter_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_pages_blocks_newsletter_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_newsletter_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_newsletter_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_newsletter_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_newsletter_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__pages_v_blocks_tabs_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_tabs_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_tabs_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_tabs_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_tabs_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_tabs_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_plans_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_plans_link_appearance" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_pricing_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_wall_logos_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_wall_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_wall_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_wall_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_wall_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_wall_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_wall_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_logo_wall_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_columns" AS ENUM('1', '2', '3');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_testimonials_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_slides_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_carousel_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__pages_v_blocks_table_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_table_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_table_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_table_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_table_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_table_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_card_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_card_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_card_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_card_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_card_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_card_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__pages_v_blocks_icon_features_items_icon" AS ENUM('check', 'star', 'heart', 'shield', 'lock', 'clock', 'calendar', 'mail', 'phone', 'map-pin', 'users', 'home', 'tool', 'lightbulb', 'chart', 'leaf', 'award', 'truck', 'message', 'search', 'settings', 'zap', 'thumbs-up', 'book', 'globe', 'handshake', 'target', 'rocket');
  CREATE TYPE "public"."enum__pages_v_blocks_icon_features_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_icon_features_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum__pages_v_blocks_icon_features_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_icon_features_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_icon_features_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_icon_features_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_icon_features_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_icon_features_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_icon_features_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__pages_v_blocks_banner_variant" AS ENUM('info', 'warning', 'success');
  CREATE TYPE "public"."enum__pages_v_blocks_banner_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_banner_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_banner_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_banner_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_banner_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_banner_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__pages_v_blocks_button_group_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_button_group_links_link_appearance" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum__pages_v_blocks_button_group_justify" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum__pages_v_blocks_button_group_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_button_group_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_button_group_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_button_group_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_button_group_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_button_group_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__pages_v_blocks_divider_kind" AS ENUM('line', 'space');
  CREATE TYPE "public"."enum__pages_v_blocks_divider_size" AS ENUM('s', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_divider_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_divider_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_divider_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_divider_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_divider_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__pages_v_blocks_columns_layout" AS ENUM('1-1', '2-1', '1-2', '1-1-1', '1-1-1-1');
  CREATE TYPE "public"."enum__pages_v_blocks_columns_vertical_align" AS ENUM('top', 'center', 'bottom');
  CREATE TYPE "public"."enum__pages_v_blocks_columns_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_columns_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_columns_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_columns_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_columns_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_columns_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__pages_v_blocks_newsletter_mode" AS ENUM('form', 'embed');
  CREATE TYPE "public"."enum__pages_v_blocks_newsletter_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_newsletter_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__pages_v_blocks_newsletter_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_newsletter_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_newsletter_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_newsletter_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_newsletter_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TABLE "pages_blocks_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"content" jsonb
  );
  
  CREATE TABLE "pages_blocks_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"background" "enum_pages_blocks_tabs_background" DEFAULT 'none',
  	"section_space_top" "enum_pages_blocks_tabs_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_pages_blocks_tabs_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_pages_blocks_tabs_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_pages_blocks_tabs_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_pages_blocks_tabs_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_pricing_plans_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_pricing_plans" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"highlighted" boolean DEFAULT false,
  	"badge" varchar,
  	"price" varchar,
  	"period" varchar,
  	"description" varchar,
  	"link_type" "enum_pages_blocks_pricing_plans_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_blocks_pricing_plans_link_appearance" DEFAULT 'primary'
  );
  
  CREATE TABLE "pages_blocks_pricing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"background" "enum_pages_blocks_pricing_background" DEFAULT 'none',
  	"align" "enum_pages_blocks_pricing_align" DEFAULT 'left',
  	"section_space_top" "enum_pages_blocks_pricing_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_pages_blocks_pricing_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_pages_blocks_pricing_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_pages_blocks_pricing_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_pages_blocks_pricing_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_logo_wall_logos" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"name" varchar,
  	"link_type" "enum_pages_blocks_logo_wall_logos_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "pages_blocks_logo_wall" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"background" "enum_pages_blocks_logo_wall_background" DEFAULT 'none',
  	"align" "enum_pages_blocks_logo_wall_align" DEFAULT 'left',
  	"section_space_top" "enum_pages_blocks_logo_wall_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_pages_blocks_logo_wall_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_pages_blocks_logo_wall_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_pages_blocks_logo_wall_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_pages_blocks_logo_wall_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author" varchar,
  	"role" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "pages_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"columns" "enum_pages_blocks_testimonials_columns" DEFAULT '2',
  	"background" "enum_pages_blocks_testimonials_background" DEFAULT 'none',
  	"align" "enum_pages_blocks_testimonials_align" DEFAULT 'left',
  	"section_space_top" "enum_pages_blocks_testimonials_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_pages_blocks_testimonials_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_pages_blocks_testimonials_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_pages_blocks_testimonials_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_pages_blocks_testimonials_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"heading" varchar,
  	"text" varchar,
  	"link_type" "enum_pages_blocks_carousel_slides_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "pages_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"autoplay" boolean DEFAULT false,
  	"interval" numeric DEFAULT 6,
  	"background" "enum_pages_blocks_carousel_background" DEFAULT 'none',
  	"section_space_top" "enum_pages_blocks_carousel_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_pages_blocks_carousel_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_pages_blocks_carousel_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_pages_blocks_carousel_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_pages_blocks_carousel_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_table_header" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_table_rows_cells" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_table_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"caption" varchar,
  	"row_headers" boolean DEFAULT false,
  	"background" "enum_pages_blocks_table_background" DEFAULT 'none',
  	"section_space_top" "enum_pages_blocks_table_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_pages_blocks_table_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_pages_blocks_table_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_pages_blocks_table_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_pages_blocks_table_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contact_card_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"days" varchar,
  	"time" varchar
  );
  
  CREATE TABLE "pages_blocks_contact_card" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"name" varchar,
  	"address" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"map_url" varchar,
  	"map_title" varchar,
  	"map_height" numeric DEFAULT 320,
  	"background" "enum_pages_blocks_contact_card_background" DEFAULT 'none',
  	"section_space_top" "enum_pages_blocks_contact_card_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_pages_blocks_contact_card_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_pages_blocks_contact_card_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_pages_blocks_contact_card_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_pages_blocks_contact_card_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_icon_features_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_icon_features_items_icon" DEFAULT 'check',
  	"title" varchar,
  	"text" varchar,
  	"link_type" "enum_pages_blocks_icon_features_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "pages_blocks_icon_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"columns" "enum_pages_blocks_icon_features_columns" DEFAULT '3',
  	"background" "enum_pages_blocks_icon_features_background" DEFAULT 'none',
  	"align" "enum_pages_blocks_icon_features_align" DEFAULT 'left',
  	"section_space_top" "enum_pages_blocks_icon_features_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_pages_blocks_icon_features_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_pages_blocks_icon_features_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_pages_blocks_icon_features_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_pages_blocks_icon_features_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_banner_variant" DEFAULT 'info',
  	"title" varchar,
  	"text" varchar,
  	"link_type" "enum_pages_blocks_banner_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"section_space_top" "enum_pages_blocks_banner_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_pages_blocks_banner_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_pages_blocks_banner_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_pages_blocks_banner_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_pages_blocks_banner_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_button_group_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_button_group_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_blocks_button_group_links_link_appearance" DEFAULT 'primary'
  );
  
  CREATE TABLE "pages_blocks_button_group" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"justify" "enum_pages_blocks_button_group_justify" DEFAULT 'left',
  	"background" "enum_pages_blocks_button_group_background" DEFAULT 'none',
  	"section_space_top" "enum_pages_blocks_button_group_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_pages_blocks_button_group_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_pages_blocks_button_group_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_pages_blocks_button_group_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_pages_blocks_button_group_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_divider" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_pages_blocks_divider_kind" DEFAULT 'line',
  	"size" "enum_pages_blocks_divider_size" DEFAULT 'm',
  	"section_space_top" "enum_pages_blocks_divider_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_pages_blocks_divider_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_pages_blocks_divider_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_pages_blocks_divider_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_pages_blocks_divider_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_columns_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_pages_blocks_columns_layout" DEFAULT '1-1',
  	"vertical_align" "enum_pages_blocks_columns_vertical_align" DEFAULT 'top',
  	"background" "enum_pages_blocks_columns_background" DEFAULT 'none',
  	"section_space_top" "enum_pages_blocks_columns_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_pages_blocks_columns_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_pages_blocks_columns_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_pages_blocks_columns_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_pages_blocks_columns_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_newsletter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"text" varchar,
  	"mode" "enum_pages_blocks_newsletter_mode" DEFAULT 'form',
  	"form_id" integer,
  	"embed_url" varchar,
  	"embed_title" varchar,
  	"embed_height" numeric DEFAULT 420,
  	"background" "enum_pages_blocks_newsletter_background" DEFAULT 'none',
  	"align" "enum_pages_blocks_newsletter_align" DEFAULT 'left',
  	"section_space_top" "enum_pages_blocks_newsletter_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_pages_blocks_newsletter_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_pages_blocks_newsletter_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_pages_blocks_newsletter_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_pages_blocks_newsletter_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"content" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"background" "enum__pages_v_blocks_tabs_background" DEFAULT 'none',
  	"section_space_top" "enum__pages_v_blocks_tabs_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__pages_v_blocks_tabs_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__pages_v_blocks_tabs_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__pages_v_blocks_tabs_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__pages_v_blocks_tabs_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_plans_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing_plans" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"highlighted" boolean DEFAULT false,
  	"badge" varchar,
  	"price" varchar,
  	"period" varchar,
  	"description" varchar,
  	"link_type" "enum__pages_v_blocks_pricing_plans_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_blocks_pricing_plans_link_appearance" DEFAULT 'primary',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_pricing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"background" "enum__pages_v_blocks_pricing_background" DEFAULT 'none',
  	"align" "enum__pages_v_blocks_pricing_align" DEFAULT 'left',
  	"section_space_top" "enum__pages_v_blocks_pricing_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__pages_v_blocks_pricing_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__pages_v_blocks_pricing_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__pages_v_blocks_pricing_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__pages_v_blocks_pricing_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_logo_wall_logos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"name" varchar,
  	"link_type" "enum__pages_v_blocks_logo_wall_logos_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_logo_wall" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"background" "enum__pages_v_blocks_logo_wall_background" DEFAULT 'none',
  	"align" "enum__pages_v_blocks_logo_wall_align" DEFAULT 'left',
  	"section_space_top" "enum__pages_v_blocks_logo_wall_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__pages_v_blocks_logo_wall_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__pages_v_blocks_logo_wall_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__pages_v_blocks_logo_wall_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__pages_v_blocks_logo_wall_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author" varchar,
  	"role" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"columns" "enum__pages_v_blocks_testimonials_columns" DEFAULT '2',
  	"background" "enum__pages_v_blocks_testimonials_background" DEFAULT 'none',
  	"align" "enum__pages_v_blocks_testimonials_align" DEFAULT 'left',
  	"section_space_top" "enum__pages_v_blocks_testimonials_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__pages_v_blocks_testimonials_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__pages_v_blocks_testimonials_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__pages_v_blocks_testimonials_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__pages_v_blocks_testimonials_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"heading" varchar,
  	"text" varchar,
  	"link_type" "enum__pages_v_blocks_carousel_slides_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"autoplay" boolean DEFAULT false,
  	"interval" numeric DEFAULT 6,
  	"background" "enum__pages_v_blocks_carousel_background" DEFAULT 'none',
  	"section_space_top" "enum__pages_v_blocks_carousel_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__pages_v_blocks_carousel_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__pages_v_blocks_carousel_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__pages_v_blocks_carousel_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__pages_v_blocks_carousel_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_table_header" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_table_rows_cells" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_table_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"caption" varchar,
  	"row_headers" boolean DEFAULT false,
  	"background" "enum__pages_v_blocks_table_background" DEFAULT 'none',
  	"section_space_top" "enum__pages_v_blocks_table_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__pages_v_blocks_table_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__pages_v_blocks_table_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__pages_v_blocks_table_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__pages_v_blocks_table_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact_card_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"days" varchar,
  	"time" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact_card" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"name" varchar,
  	"address" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"map_url" varchar,
  	"map_title" varchar,
  	"map_height" numeric DEFAULT 320,
  	"background" "enum__pages_v_blocks_contact_card_background" DEFAULT 'none',
  	"section_space_top" "enum__pages_v_blocks_contact_card_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__pages_v_blocks_contact_card_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__pages_v_blocks_contact_card_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__pages_v_blocks_contact_card_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__pages_v_blocks_contact_card_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_icon_features_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__pages_v_blocks_icon_features_items_icon" DEFAULT 'check',
  	"title" varchar,
  	"text" varchar,
  	"link_type" "enum__pages_v_blocks_icon_features_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_icon_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"columns" "enum__pages_v_blocks_icon_features_columns" DEFAULT '3',
  	"background" "enum__pages_v_blocks_icon_features_background" DEFAULT 'none',
  	"align" "enum__pages_v_blocks_icon_features_align" DEFAULT 'left',
  	"section_space_top" "enum__pages_v_blocks_icon_features_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__pages_v_blocks_icon_features_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__pages_v_blocks_icon_features_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__pages_v_blocks_icon_features_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__pages_v_blocks_icon_features_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_banner_variant" DEFAULT 'info',
  	"title" varchar,
  	"text" varchar,
  	"link_type" "enum__pages_v_blocks_banner_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"section_space_top" "enum__pages_v_blocks_banner_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__pages_v_blocks_banner_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__pages_v_blocks_banner_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__pages_v_blocks_banner_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__pages_v_blocks_banner_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_button_group_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_button_group_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_blocks_button_group_links_link_appearance" DEFAULT 'primary',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_button_group" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"justify" "enum__pages_v_blocks_button_group_justify" DEFAULT 'left',
  	"background" "enum__pages_v_blocks_button_group_background" DEFAULT 'none',
  	"section_space_top" "enum__pages_v_blocks_button_group_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__pages_v_blocks_button_group_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__pages_v_blocks_button_group_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__pages_v_blocks_button_group_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__pages_v_blocks_button_group_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_divider" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum__pages_v_blocks_divider_kind" DEFAULT 'line',
  	"size" "enum__pages_v_blocks_divider_size" DEFAULT 'm',
  	"section_space_top" "enum__pages_v_blocks_divider_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__pages_v_blocks_divider_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__pages_v_blocks_divider_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__pages_v_blocks_divider_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__pages_v_blocks_divider_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_columns_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"layout" "enum__pages_v_blocks_columns_layout" DEFAULT '1-1',
  	"vertical_align" "enum__pages_v_blocks_columns_vertical_align" DEFAULT 'top',
  	"background" "enum__pages_v_blocks_columns_background" DEFAULT 'none',
  	"section_space_top" "enum__pages_v_blocks_columns_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__pages_v_blocks_columns_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__pages_v_blocks_columns_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__pages_v_blocks_columns_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__pages_v_blocks_columns_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_newsletter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"text" varchar,
  	"mode" "enum__pages_v_blocks_newsletter_mode" DEFAULT 'form',
  	"form_id" integer,
  	"embed_url" varchar,
  	"embed_title" varchar,
  	"embed_height" numeric DEFAULT 420,
  	"background" "enum__pages_v_blocks_newsletter_background" DEFAULT 'none',
  	"align" "enum__pages_v_blocks_newsletter_align" DEFAULT 'left',
  	"section_space_top" "enum__pages_v_blocks_newsletter_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__pages_v_blocks_newsletter_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__pages_v_blocks_newsletter_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__pages_v_blocks_newsletter_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__pages_v_blocks_newsletter_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_tabs_items" ADD CONSTRAINT "pages_blocks_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs" ADD CONSTRAINT "pages_blocks_tabs_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_tabs" ADD CONSTRAINT "pages_blocks_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_plans_features" ADD CONSTRAINT "pages_blocks_pricing_plans_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing_plans" ADD CONSTRAINT "pages_blocks_pricing_plans_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing" ADD CONSTRAINT "pages_blocks_pricing_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_pricing" ADD CONSTRAINT "pages_blocks_pricing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_logo_wall_logos" ADD CONSTRAINT "pages_blocks_logo_wall_logos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_logo_wall_logos" ADD CONSTRAINT "pages_blocks_logo_wall_logos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_logo_wall"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_logo_wall" ADD CONSTRAINT "pages_blocks_logo_wall_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_logo_wall" ADD CONSTRAINT "pages_blocks_logo_wall_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials_items" ADD CONSTRAINT "pages_blocks_testimonials_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials_items" ADD CONSTRAINT "pages_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials" ADD CONSTRAINT "pages_blocks_testimonials_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_testimonials" ADD CONSTRAINT "pages_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_carousel_slides" ADD CONSTRAINT "pages_blocks_carousel_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_carousel_slides" ADD CONSTRAINT "pages_blocks_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_carousel" ADD CONSTRAINT "pages_blocks_carousel_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_carousel" ADD CONSTRAINT "pages_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_table_header" ADD CONSTRAINT "pages_blocks_table_header_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_table_rows_cells" ADD CONSTRAINT "pages_blocks_table_rows_cells_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_table_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_table_rows" ADD CONSTRAINT "pages_blocks_table_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_table" ADD CONSTRAINT "pages_blocks_table_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_table" ADD CONSTRAINT "pages_blocks_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_card_hours" ADD CONSTRAINT "pages_blocks_contact_card_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_contact_card"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_card" ADD CONSTRAINT "pages_blocks_contact_card_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_card" ADD CONSTRAINT "pages_blocks_contact_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_icon_features_items" ADD CONSTRAINT "pages_blocks_icon_features_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_icon_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_icon_features" ADD CONSTRAINT "pages_blocks_icon_features_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_icon_features" ADD CONSTRAINT "pages_blocks_icon_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_banner" ADD CONSTRAINT "pages_blocks_banner_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_banner" ADD CONSTRAINT "pages_blocks_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_button_group_links" ADD CONSTRAINT "pages_blocks_button_group_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_button_group"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_button_group" ADD CONSTRAINT "pages_blocks_button_group_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_button_group" ADD CONSTRAINT "pages_blocks_button_group_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_divider" ADD CONSTRAINT "pages_blocks_divider_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_divider" ADD CONSTRAINT "pages_blocks_divider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_columns_columns" ADD CONSTRAINT "pages_blocks_columns_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_columns" ADD CONSTRAINT "pages_blocks_columns_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_columns" ADD CONSTRAINT "pages_blocks_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_newsletter" ADD CONSTRAINT "pages_blocks_newsletter_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_newsletter" ADD CONSTRAINT "pages_blocks_newsletter_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_newsletter" ADD CONSTRAINT "pages_blocks_newsletter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs_items" ADD CONSTRAINT "_pages_v_blocks_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs" ADD CONSTRAINT "_pages_v_blocks_tabs_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_tabs" ADD CONSTRAINT "_pages_v_blocks_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_plans_features" ADD CONSTRAINT "_pages_v_blocks_pricing_plans_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing_plans" ADD CONSTRAINT "_pages_v_blocks_pricing_plans_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing" ADD CONSTRAINT "_pages_v_blocks_pricing_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_pricing" ADD CONSTRAINT "_pages_v_blocks_pricing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_logo_wall_logos" ADD CONSTRAINT "_pages_v_blocks_logo_wall_logos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_logo_wall_logos" ADD CONSTRAINT "_pages_v_blocks_logo_wall_logos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_logo_wall"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_logo_wall" ADD CONSTRAINT "_pages_v_blocks_logo_wall_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_logo_wall" ADD CONSTRAINT "_pages_v_blocks_logo_wall_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials_items" ADD CONSTRAINT "_pages_v_blocks_testimonials_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials_items" ADD CONSTRAINT "_pages_v_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonials_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_testimonials" ADD CONSTRAINT "_pages_v_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel_slides" ADD CONSTRAINT "_pages_v_blocks_carousel_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel_slides" ADD CONSTRAINT "_pages_v_blocks_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel" ADD CONSTRAINT "_pages_v_blocks_carousel_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_carousel" ADD CONSTRAINT "_pages_v_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_table_header" ADD CONSTRAINT "_pages_v_blocks_table_header_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_table_rows_cells" ADD CONSTRAINT "_pages_v_blocks_table_rows_cells_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_table_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_table_rows" ADD CONSTRAINT "_pages_v_blocks_table_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_table" ADD CONSTRAINT "_pages_v_blocks_table_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_table" ADD CONSTRAINT "_pages_v_blocks_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_card_hours" ADD CONSTRAINT "_pages_v_blocks_contact_card_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_contact_card"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_card" ADD CONSTRAINT "_pages_v_blocks_contact_card_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_card" ADD CONSTRAINT "_pages_v_blocks_contact_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_icon_features_items" ADD CONSTRAINT "_pages_v_blocks_icon_features_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_icon_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_icon_features" ADD CONSTRAINT "_pages_v_blocks_icon_features_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_icon_features" ADD CONSTRAINT "_pages_v_blocks_icon_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_banner" ADD CONSTRAINT "_pages_v_blocks_banner_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_banner" ADD CONSTRAINT "_pages_v_blocks_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_button_group_links" ADD CONSTRAINT "_pages_v_blocks_button_group_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_button_group"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_button_group" ADD CONSTRAINT "_pages_v_blocks_button_group_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_button_group" ADD CONSTRAINT "_pages_v_blocks_button_group_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_divider" ADD CONSTRAINT "_pages_v_blocks_divider_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_divider" ADD CONSTRAINT "_pages_v_blocks_divider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_columns_columns" ADD CONSTRAINT "_pages_v_blocks_columns_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_columns" ADD CONSTRAINT "_pages_v_blocks_columns_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_columns" ADD CONSTRAINT "_pages_v_blocks_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_newsletter" ADD CONSTRAINT "_pages_v_blocks_newsletter_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_newsletter" ADD CONSTRAINT "_pages_v_blocks_newsletter_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_newsletter" ADD CONSTRAINT "_pages_v_blocks_newsletter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_tabs_items_order_idx" ON "pages_blocks_tabs_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_tabs_items_parent_id_idx" ON "pages_blocks_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_tabs_items_locale_idx" ON "pages_blocks_tabs_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_tabs_order_idx" ON "pages_blocks_tabs" USING btree ("_order");
  CREATE INDEX "pages_blocks_tabs_parent_id_idx" ON "pages_blocks_tabs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_tabs_path_idx" ON "pages_blocks_tabs" USING btree ("_path");
  CREATE INDEX "pages_blocks_tabs_locale_idx" ON "pages_blocks_tabs" USING btree ("_locale");
  CREATE INDEX "pages_blocks_tabs_section_section_background_media_idx" ON "pages_blocks_tabs" USING btree ("section_background_media_id");
  CREATE INDEX "pages_blocks_pricing_plans_features_order_idx" ON "pages_blocks_pricing_plans_features" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_plans_features_parent_id_idx" ON "pages_blocks_pricing_plans_features" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_plans_features_locale_idx" ON "pages_blocks_pricing_plans_features" USING btree ("_locale");
  CREATE INDEX "pages_blocks_pricing_plans_order_idx" ON "pages_blocks_pricing_plans" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_plans_parent_id_idx" ON "pages_blocks_pricing_plans" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_plans_locale_idx" ON "pages_blocks_pricing_plans" USING btree ("_locale");
  CREATE INDEX "pages_blocks_pricing_order_idx" ON "pages_blocks_pricing" USING btree ("_order");
  CREATE INDEX "pages_blocks_pricing_parent_id_idx" ON "pages_blocks_pricing" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_pricing_path_idx" ON "pages_blocks_pricing" USING btree ("_path");
  CREATE INDEX "pages_blocks_pricing_locale_idx" ON "pages_blocks_pricing" USING btree ("_locale");
  CREATE INDEX "pages_blocks_pricing_section_section_background_media_idx" ON "pages_blocks_pricing" USING btree ("section_background_media_id");
  CREATE INDEX "pages_blocks_logo_wall_logos_order_idx" ON "pages_blocks_logo_wall_logos" USING btree ("_order");
  CREATE INDEX "pages_blocks_logo_wall_logos_parent_id_idx" ON "pages_blocks_logo_wall_logos" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_logo_wall_logos_locale_idx" ON "pages_blocks_logo_wall_logos" USING btree ("_locale");
  CREATE INDEX "pages_blocks_logo_wall_logos_image_idx" ON "pages_blocks_logo_wall_logos" USING btree ("image_id");
  CREATE INDEX "pages_blocks_logo_wall_order_idx" ON "pages_blocks_logo_wall" USING btree ("_order");
  CREATE INDEX "pages_blocks_logo_wall_parent_id_idx" ON "pages_blocks_logo_wall" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_logo_wall_path_idx" ON "pages_blocks_logo_wall" USING btree ("_path");
  CREATE INDEX "pages_blocks_logo_wall_locale_idx" ON "pages_blocks_logo_wall" USING btree ("_locale");
  CREATE INDEX "pages_blocks_logo_wall_section_section_background_media_idx" ON "pages_blocks_logo_wall" USING btree ("section_background_media_id");
  CREATE INDEX "pages_blocks_testimonials_items_order_idx" ON "pages_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_items_parent_id_idx" ON "pages_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_items_locale_idx" ON "pages_blocks_testimonials_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_testimonials_items_image_idx" ON "pages_blocks_testimonials_items" USING btree ("image_id");
  CREATE INDEX "pages_blocks_testimonials_order_idx" ON "pages_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "pages_blocks_testimonials_parent_id_idx" ON "pages_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_testimonials_path_idx" ON "pages_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "pages_blocks_testimonials_locale_idx" ON "pages_blocks_testimonials" USING btree ("_locale");
  CREATE INDEX "pages_blocks_testimonials_section_section_background_med_idx" ON "pages_blocks_testimonials" USING btree ("section_background_media_id");
  CREATE INDEX "pages_blocks_carousel_slides_order_idx" ON "pages_blocks_carousel_slides" USING btree ("_order");
  CREATE INDEX "pages_blocks_carousel_slides_parent_id_idx" ON "pages_blocks_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_carousel_slides_locale_idx" ON "pages_blocks_carousel_slides" USING btree ("_locale");
  CREATE INDEX "pages_blocks_carousel_slides_image_idx" ON "pages_blocks_carousel_slides" USING btree ("image_id");
  CREATE INDEX "pages_blocks_carousel_order_idx" ON "pages_blocks_carousel" USING btree ("_order");
  CREATE INDEX "pages_blocks_carousel_parent_id_idx" ON "pages_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_carousel_path_idx" ON "pages_blocks_carousel" USING btree ("_path");
  CREATE INDEX "pages_blocks_carousel_locale_idx" ON "pages_blocks_carousel" USING btree ("_locale");
  CREATE INDEX "pages_blocks_carousel_section_section_background_media_idx" ON "pages_blocks_carousel" USING btree ("section_background_media_id");
  CREATE INDEX "pages_blocks_table_header_order_idx" ON "pages_blocks_table_header" USING btree ("_order");
  CREATE INDEX "pages_blocks_table_header_parent_id_idx" ON "pages_blocks_table_header" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_table_header_locale_idx" ON "pages_blocks_table_header" USING btree ("_locale");
  CREATE INDEX "pages_blocks_table_rows_cells_order_idx" ON "pages_blocks_table_rows_cells" USING btree ("_order");
  CREATE INDEX "pages_blocks_table_rows_cells_parent_id_idx" ON "pages_blocks_table_rows_cells" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_table_rows_cells_locale_idx" ON "pages_blocks_table_rows_cells" USING btree ("_locale");
  CREATE INDEX "pages_blocks_table_rows_order_idx" ON "pages_blocks_table_rows" USING btree ("_order");
  CREATE INDEX "pages_blocks_table_rows_parent_id_idx" ON "pages_blocks_table_rows" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_table_rows_locale_idx" ON "pages_blocks_table_rows" USING btree ("_locale");
  CREATE INDEX "pages_blocks_table_order_idx" ON "pages_blocks_table" USING btree ("_order");
  CREATE INDEX "pages_blocks_table_parent_id_idx" ON "pages_blocks_table" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_table_path_idx" ON "pages_blocks_table" USING btree ("_path");
  CREATE INDEX "pages_blocks_table_locale_idx" ON "pages_blocks_table" USING btree ("_locale");
  CREATE INDEX "pages_blocks_table_section_section_background_media_idx" ON "pages_blocks_table" USING btree ("section_background_media_id");
  CREATE INDEX "pages_blocks_contact_card_hours_order_idx" ON "pages_blocks_contact_card_hours" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_card_hours_parent_id_idx" ON "pages_blocks_contact_card_hours" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_card_hours_locale_idx" ON "pages_blocks_contact_card_hours" USING btree ("_locale");
  CREATE INDEX "pages_blocks_contact_card_order_idx" ON "pages_blocks_contact_card" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_card_parent_id_idx" ON "pages_blocks_contact_card" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_card_path_idx" ON "pages_blocks_contact_card" USING btree ("_path");
  CREATE INDEX "pages_blocks_contact_card_locale_idx" ON "pages_blocks_contact_card" USING btree ("_locale");
  CREATE INDEX "pages_blocks_contact_card_section_section_background_med_idx" ON "pages_blocks_contact_card" USING btree ("section_background_media_id");
  CREATE INDEX "pages_blocks_icon_features_items_order_idx" ON "pages_blocks_icon_features_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_icon_features_items_parent_id_idx" ON "pages_blocks_icon_features_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_icon_features_items_locale_idx" ON "pages_blocks_icon_features_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_icon_features_order_idx" ON "pages_blocks_icon_features" USING btree ("_order");
  CREATE INDEX "pages_blocks_icon_features_parent_id_idx" ON "pages_blocks_icon_features" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_icon_features_path_idx" ON "pages_blocks_icon_features" USING btree ("_path");
  CREATE INDEX "pages_blocks_icon_features_locale_idx" ON "pages_blocks_icon_features" USING btree ("_locale");
  CREATE INDEX "pages_blocks_icon_features_section_section_background_me_idx" ON "pages_blocks_icon_features" USING btree ("section_background_media_id");
  CREATE INDEX "pages_blocks_banner_order_idx" ON "pages_blocks_banner" USING btree ("_order");
  CREATE INDEX "pages_blocks_banner_parent_id_idx" ON "pages_blocks_banner" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_banner_path_idx" ON "pages_blocks_banner" USING btree ("_path");
  CREATE INDEX "pages_blocks_banner_locale_idx" ON "pages_blocks_banner" USING btree ("_locale");
  CREATE INDEX "pages_blocks_banner_section_section_background_media_idx" ON "pages_blocks_banner" USING btree ("section_background_media_id");
  CREATE INDEX "pages_blocks_button_group_links_order_idx" ON "pages_blocks_button_group_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_button_group_links_parent_id_idx" ON "pages_blocks_button_group_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_button_group_links_locale_idx" ON "pages_blocks_button_group_links" USING btree ("_locale");
  CREATE INDEX "pages_blocks_button_group_order_idx" ON "pages_blocks_button_group" USING btree ("_order");
  CREATE INDEX "pages_blocks_button_group_parent_id_idx" ON "pages_blocks_button_group" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_button_group_path_idx" ON "pages_blocks_button_group" USING btree ("_path");
  CREATE INDEX "pages_blocks_button_group_locale_idx" ON "pages_blocks_button_group" USING btree ("_locale");
  CREATE INDEX "pages_blocks_button_group_section_section_background_med_idx" ON "pages_blocks_button_group" USING btree ("section_background_media_id");
  CREATE INDEX "pages_blocks_divider_order_idx" ON "pages_blocks_divider" USING btree ("_order");
  CREATE INDEX "pages_blocks_divider_parent_id_idx" ON "pages_blocks_divider" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_divider_path_idx" ON "pages_blocks_divider" USING btree ("_path");
  CREATE INDEX "pages_blocks_divider_locale_idx" ON "pages_blocks_divider" USING btree ("_locale");
  CREATE INDEX "pages_blocks_divider_section_section_background_media_idx" ON "pages_blocks_divider" USING btree ("section_background_media_id");
  CREATE INDEX "pages_blocks_columns_columns_order_idx" ON "pages_blocks_columns_columns" USING btree ("_order");
  CREATE INDEX "pages_blocks_columns_columns_parent_id_idx" ON "pages_blocks_columns_columns" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_columns_columns_locale_idx" ON "pages_blocks_columns_columns" USING btree ("_locale");
  CREATE INDEX "pages_blocks_columns_order_idx" ON "pages_blocks_columns" USING btree ("_order");
  CREATE INDEX "pages_blocks_columns_parent_id_idx" ON "pages_blocks_columns" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_columns_path_idx" ON "pages_blocks_columns" USING btree ("_path");
  CREATE INDEX "pages_blocks_columns_locale_idx" ON "pages_blocks_columns" USING btree ("_locale");
  CREATE INDEX "pages_blocks_columns_section_section_background_media_idx" ON "pages_blocks_columns" USING btree ("section_background_media_id");
  CREATE INDEX "pages_blocks_newsletter_order_idx" ON "pages_blocks_newsletter" USING btree ("_order");
  CREATE INDEX "pages_blocks_newsletter_parent_id_idx" ON "pages_blocks_newsletter" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_newsletter_path_idx" ON "pages_blocks_newsletter" USING btree ("_path");
  CREATE INDEX "pages_blocks_newsletter_locale_idx" ON "pages_blocks_newsletter" USING btree ("_locale");
  CREATE INDEX "pages_blocks_newsletter_form_idx" ON "pages_blocks_newsletter" USING btree ("form_id");
  CREATE INDEX "pages_blocks_newsletter_section_section_background_media_idx" ON "pages_blocks_newsletter" USING btree ("section_background_media_id");
  CREATE INDEX "_pages_v_blocks_tabs_items_order_idx" ON "_pages_v_blocks_tabs_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_tabs_items_parent_id_idx" ON "_pages_v_blocks_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_tabs_items_locale_idx" ON "_pages_v_blocks_tabs_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_tabs_order_idx" ON "_pages_v_blocks_tabs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_tabs_parent_id_idx" ON "_pages_v_blocks_tabs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_tabs_path_idx" ON "_pages_v_blocks_tabs" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_tabs_locale_idx" ON "_pages_v_blocks_tabs" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_tabs_section_section_background_media_idx" ON "_pages_v_blocks_tabs" USING btree ("section_background_media_id");
  CREATE INDEX "_pages_v_blocks_pricing_plans_features_order_idx" ON "_pages_v_blocks_pricing_plans_features" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_plans_features_parent_id_idx" ON "_pages_v_blocks_pricing_plans_features" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_plans_features_locale_idx" ON "_pages_v_blocks_pricing_plans_features" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_pricing_plans_order_idx" ON "_pages_v_blocks_pricing_plans" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_plans_parent_id_idx" ON "_pages_v_blocks_pricing_plans" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_plans_locale_idx" ON "_pages_v_blocks_pricing_plans" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_pricing_order_idx" ON "_pages_v_blocks_pricing" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_pricing_parent_id_idx" ON "_pages_v_blocks_pricing" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_pricing_path_idx" ON "_pages_v_blocks_pricing" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_pricing_locale_idx" ON "_pages_v_blocks_pricing" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_pricing_section_section_background_media_idx" ON "_pages_v_blocks_pricing" USING btree ("section_background_media_id");
  CREATE INDEX "_pages_v_blocks_logo_wall_logos_order_idx" ON "_pages_v_blocks_logo_wall_logos" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_logo_wall_logos_parent_id_idx" ON "_pages_v_blocks_logo_wall_logos" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_logo_wall_logos_locale_idx" ON "_pages_v_blocks_logo_wall_logos" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_logo_wall_logos_image_idx" ON "_pages_v_blocks_logo_wall_logos" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_logo_wall_order_idx" ON "_pages_v_blocks_logo_wall" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_logo_wall_parent_id_idx" ON "_pages_v_blocks_logo_wall" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_logo_wall_path_idx" ON "_pages_v_blocks_logo_wall" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_logo_wall_locale_idx" ON "_pages_v_blocks_logo_wall" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_logo_wall_section_section_background_med_idx" ON "_pages_v_blocks_logo_wall" USING btree ("section_background_media_id");
  CREATE INDEX "_pages_v_blocks_testimonials_items_order_idx" ON "_pages_v_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_items_parent_id_idx" ON "_pages_v_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_items_locale_idx" ON "_pages_v_blocks_testimonials_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_testimonials_items_image_idx" ON "_pages_v_blocks_testimonials_items" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_testimonials_order_idx" ON "_pages_v_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_testimonials_parent_id_idx" ON "_pages_v_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_testimonials_path_idx" ON "_pages_v_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_testimonials_locale_idx" ON "_pages_v_blocks_testimonials" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_testimonials_section_section_background__idx" ON "_pages_v_blocks_testimonials" USING btree ("section_background_media_id");
  CREATE INDEX "_pages_v_blocks_carousel_slides_order_idx" ON "_pages_v_blocks_carousel_slides" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_carousel_slides_parent_id_idx" ON "_pages_v_blocks_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_carousel_slides_locale_idx" ON "_pages_v_blocks_carousel_slides" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_carousel_slides_image_idx" ON "_pages_v_blocks_carousel_slides" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_carousel_order_idx" ON "_pages_v_blocks_carousel" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_carousel_parent_id_idx" ON "_pages_v_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_carousel_path_idx" ON "_pages_v_blocks_carousel" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_carousel_locale_idx" ON "_pages_v_blocks_carousel" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_carousel_section_section_background_medi_idx" ON "_pages_v_blocks_carousel" USING btree ("section_background_media_id");
  CREATE INDEX "_pages_v_blocks_table_header_order_idx" ON "_pages_v_blocks_table_header" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_table_header_parent_id_idx" ON "_pages_v_blocks_table_header" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_table_header_locale_idx" ON "_pages_v_blocks_table_header" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_table_rows_cells_order_idx" ON "_pages_v_blocks_table_rows_cells" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_table_rows_cells_parent_id_idx" ON "_pages_v_blocks_table_rows_cells" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_table_rows_cells_locale_idx" ON "_pages_v_blocks_table_rows_cells" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_table_rows_order_idx" ON "_pages_v_blocks_table_rows" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_table_rows_parent_id_idx" ON "_pages_v_blocks_table_rows" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_table_rows_locale_idx" ON "_pages_v_blocks_table_rows" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_table_order_idx" ON "_pages_v_blocks_table" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_table_parent_id_idx" ON "_pages_v_blocks_table" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_table_path_idx" ON "_pages_v_blocks_table" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_table_locale_idx" ON "_pages_v_blocks_table" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_table_section_section_background_media_idx" ON "_pages_v_blocks_table" USING btree ("section_background_media_id");
  CREATE INDEX "_pages_v_blocks_contact_card_hours_order_idx" ON "_pages_v_blocks_contact_card_hours" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_card_hours_parent_id_idx" ON "_pages_v_blocks_contact_card_hours" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_card_hours_locale_idx" ON "_pages_v_blocks_contact_card_hours" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_contact_card_order_idx" ON "_pages_v_blocks_contact_card" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_card_parent_id_idx" ON "_pages_v_blocks_contact_card" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_card_path_idx" ON "_pages_v_blocks_contact_card" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contact_card_locale_idx" ON "_pages_v_blocks_contact_card" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_contact_card_section_section_background__idx" ON "_pages_v_blocks_contact_card" USING btree ("section_background_media_id");
  CREATE INDEX "_pages_v_blocks_icon_features_items_order_idx" ON "_pages_v_blocks_icon_features_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_icon_features_items_parent_id_idx" ON "_pages_v_blocks_icon_features_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_icon_features_items_locale_idx" ON "_pages_v_blocks_icon_features_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_icon_features_order_idx" ON "_pages_v_blocks_icon_features" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_icon_features_parent_id_idx" ON "_pages_v_blocks_icon_features" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_icon_features_path_idx" ON "_pages_v_blocks_icon_features" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_icon_features_locale_idx" ON "_pages_v_blocks_icon_features" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_icon_features_section_section_background_idx" ON "_pages_v_blocks_icon_features" USING btree ("section_background_media_id");
  CREATE INDEX "_pages_v_blocks_banner_order_idx" ON "_pages_v_blocks_banner" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_banner_parent_id_idx" ON "_pages_v_blocks_banner" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_banner_path_idx" ON "_pages_v_blocks_banner" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_banner_locale_idx" ON "_pages_v_blocks_banner" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_banner_section_section_background_media_idx" ON "_pages_v_blocks_banner" USING btree ("section_background_media_id");
  CREATE INDEX "_pages_v_blocks_button_group_links_order_idx" ON "_pages_v_blocks_button_group_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_button_group_links_parent_id_idx" ON "_pages_v_blocks_button_group_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_button_group_links_locale_idx" ON "_pages_v_blocks_button_group_links" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_button_group_order_idx" ON "_pages_v_blocks_button_group" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_button_group_parent_id_idx" ON "_pages_v_blocks_button_group" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_button_group_path_idx" ON "_pages_v_blocks_button_group" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_button_group_locale_idx" ON "_pages_v_blocks_button_group" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_button_group_section_section_background__idx" ON "_pages_v_blocks_button_group" USING btree ("section_background_media_id");
  CREATE INDEX "_pages_v_blocks_divider_order_idx" ON "_pages_v_blocks_divider" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_divider_parent_id_idx" ON "_pages_v_blocks_divider" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_divider_path_idx" ON "_pages_v_blocks_divider" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_divider_locale_idx" ON "_pages_v_blocks_divider" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_divider_section_section_background_media_idx" ON "_pages_v_blocks_divider" USING btree ("section_background_media_id");
  CREATE INDEX "_pages_v_blocks_columns_columns_order_idx" ON "_pages_v_blocks_columns_columns" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_columns_columns_parent_id_idx" ON "_pages_v_blocks_columns_columns" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_columns_columns_locale_idx" ON "_pages_v_blocks_columns_columns" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_columns_order_idx" ON "_pages_v_blocks_columns" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_columns_parent_id_idx" ON "_pages_v_blocks_columns" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_columns_path_idx" ON "_pages_v_blocks_columns" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_columns_locale_idx" ON "_pages_v_blocks_columns" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_columns_section_section_background_media_idx" ON "_pages_v_blocks_columns" USING btree ("section_background_media_id");
  CREATE INDEX "_pages_v_blocks_newsletter_order_idx" ON "_pages_v_blocks_newsletter" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_newsletter_parent_id_idx" ON "_pages_v_blocks_newsletter" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_newsletter_path_idx" ON "_pages_v_blocks_newsletter" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_newsletter_locale_idx" ON "_pages_v_blocks_newsletter" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_newsletter_form_idx" ON "_pages_v_blocks_newsletter" USING btree ("form_id");
  CREATE INDEX "_pages_v_blocks_newsletter_section_section_background_me_idx" ON "_pages_v_blocks_newsletter" USING btree ("section_background_media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_tabs_items" CASCADE;
  DROP TABLE "pages_blocks_tabs" CASCADE;
  DROP TABLE "pages_blocks_pricing_plans_features" CASCADE;
  DROP TABLE "pages_blocks_pricing_plans" CASCADE;
  DROP TABLE "pages_blocks_pricing" CASCADE;
  DROP TABLE "pages_blocks_logo_wall_logos" CASCADE;
  DROP TABLE "pages_blocks_logo_wall" CASCADE;
  DROP TABLE "pages_blocks_testimonials_items" CASCADE;
  DROP TABLE "pages_blocks_testimonials" CASCADE;
  DROP TABLE "pages_blocks_carousel_slides" CASCADE;
  DROP TABLE "pages_blocks_carousel" CASCADE;
  DROP TABLE "pages_blocks_table_header" CASCADE;
  DROP TABLE "pages_blocks_table_rows_cells" CASCADE;
  DROP TABLE "pages_blocks_table_rows" CASCADE;
  DROP TABLE "pages_blocks_table" CASCADE;
  DROP TABLE "pages_blocks_contact_card_hours" CASCADE;
  DROP TABLE "pages_blocks_contact_card" CASCADE;
  DROP TABLE "pages_blocks_icon_features_items" CASCADE;
  DROP TABLE "pages_blocks_icon_features" CASCADE;
  DROP TABLE "pages_blocks_banner" CASCADE;
  DROP TABLE "pages_blocks_button_group_links" CASCADE;
  DROP TABLE "pages_blocks_button_group" CASCADE;
  DROP TABLE "pages_blocks_divider" CASCADE;
  DROP TABLE "pages_blocks_columns_columns" CASCADE;
  DROP TABLE "pages_blocks_columns" CASCADE;
  DROP TABLE "pages_blocks_newsletter" CASCADE;
  DROP TABLE "_pages_v_blocks_tabs_items" CASCADE;
  DROP TABLE "_pages_v_blocks_tabs" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_plans_features" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing_plans" CASCADE;
  DROP TABLE "_pages_v_blocks_pricing" CASCADE;
  DROP TABLE "_pages_v_blocks_logo_wall_logos" CASCADE;
  DROP TABLE "_pages_v_blocks_logo_wall" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials_items" CASCADE;
  DROP TABLE "_pages_v_blocks_testimonials" CASCADE;
  DROP TABLE "_pages_v_blocks_carousel_slides" CASCADE;
  DROP TABLE "_pages_v_blocks_carousel" CASCADE;
  DROP TABLE "_pages_v_blocks_table_header" CASCADE;
  DROP TABLE "_pages_v_blocks_table_rows_cells" CASCADE;
  DROP TABLE "_pages_v_blocks_table_rows" CASCADE;
  DROP TABLE "_pages_v_blocks_table" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_card_hours" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_card" CASCADE;
  DROP TABLE "_pages_v_blocks_icon_features_items" CASCADE;
  DROP TABLE "_pages_v_blocks_icon_features" CASCADE;
  DROP TABLE "_pages_v_blocks_banner" CASCADE;
  DROP TABLE "_pages_v_blocks_button_group_links" CASCADE;
  DROP TABLE "_pages_v_blocks_button_group" CASCADE;
  DROP TABLE "_pages_v_blocks_divider" CASCADE;
  DROP TABLE "_pages_v_blocks_columns_columns" CASCADE;
  DROP TABLE "_pages_v_blocks_columns" CASCADE;
  DROP TABLE "_pages_v_blocks_newsletter" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_tabs_background";
  DROP TYPE "public"."enum_pages_blocks_tabs_section_space_top";
  DROP TYPE "public"."enum_pages_blocks_tabs_section_space_bottom";
  DROP TYPE "public"."enum_pages_blocks_tabs_section_width";
  DROP TYPE "public"."enum_pages_blocks_tabs_section_overlay";
  DROP TYPE "public"."enum_pages_blocks_tabs_section_hide";
  DROP TYPE "public"."enum_pages_blocks_pricing_plans_link_type";
  DROP TYPE "public"."enum_pages_blocks_pricing_plans_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_pricing_background";
  DROP TYPE "public"."enum_pages_blocks_pricing_align";
  DROP TYPE "public"."enum_pages_blocks_pricing_section_space_top";
  DROP TYPE "public"."enum_pages_blocks_pricing_section_space_bottom";
  DROP TYPE "public"."enum_pages_blocks_pricing_section_width";
  DROP TYPE "public"."enum_pages_blocks_pricing_section_overlay";
  DROP TYPE "public"."enum_pages_blocks_pricing_section_hide";
  DROP TYPE "public"."enum_pages_blocks_logo_wall_logos_link_type";
  DROP TYPE "public"."enum_pages_blocks_logo_wall_background";
  DROP TYPE "public"."enum_pages_blocks_logo_wall_align";
  DROP TYPE "public"."enum_pages_blocks_logo_wall_section_space_top";
  DROP TYPE "public"."enum_pages_blocks_logo_wall_section_space_bottom";
  DROP TYPE "public"."enum_pages_blocks_logo_wall_section_width";
  DROP TYPE "public"."enum_pages_blocks_logo_wall_section_overlay";
  DROP TYPE "public"."enum_pages_blocks_logo_wall_section_hide";
  DROP TYPE "public"."enum_pages_blocks_testimonials_columns";
  DROP TYPE "public"."enum_pages_blocks_testimonials_background";
  DROP TYPE "public"."enum_pages_blocks_testimonials_align";
  DROP TYPE "public"."enum_pages_blocks_testimonials_section_space_top";
  DROP TYPE "public"."enum_pages_blocks_testimonials_section_space_bottom";
  DROP TYPE "public"."enum_pages_blocks_testimonials_section_width";
  DROP TYPE "public"."enum_pages_blocks_testimonials_section_overlay";
  DROP TYPE "public"."enum_pages_blocks_testimonials_section_hide";
  DROP TYPE "public"."enum_pages_blocks_carousel_slides_link_type";
  DROP TYPE "public"."enum_pages_blocks_carousel_background";
  DROP TYPE "public"."enum_pages_blocks_carousel_section_space_top";
  DROP TYPE "public"."enum_pages_blocks_carousel_section_space_bottom";
  DROP TYPE "public"."enum_pages_blocks_carousel_section_width";
  DROP TYPE "public"."enum_pages_blocks_carousel_section_overlay";
  DROP TYPE "public"."enum_pages_blocks_carousel_section_hide";
  DROP TYPE "public"."enum_pages_blocks_table_background";
  DROP TYPE "public"."enum_pages_blocks_table_section_space_top";
  DROP TYPE "public"."enum_pages_blocks_table_section_space_bottom";
  DROP TYPE "public"."enum_pages_blocks_table_section_width";
  DROP TYPE "public"."enum_pages_blocks_table_section_overlay";
  DROP TYPE "public"."enum_pages_blocks_table_section_hide";
  DROP TYPE "public"."enum_pages_blocks_contact_card_background";
  DROP TYPE "public"."enum_pages_blocks_contact_card_section_space_top";
  DROP TYPE "public"."enum_pages_blocks_contact_card_section_space_bottom";
  DROP TYPE "public"."enum_pages_blocks_contact_card_section_width";
  DROP TYPE "public"."enum_pages_blocks_contact_card_section_overlay";
  DROP TYPE "public"."enum_pages_blocks_contact_card_section_hide";
  DROP TYPE "public"."enum_pages_blocks_icon_features_items_icon";
  DROP TYPE "public"."enum_pages_blocks_icon_features_items_link_type";
  DROP TYPE "public"."enum_pages_blocks_icon_features_columns";
  DROP TYPE "public"."enum_pages_blocks_icon_features_background";
  DROP TYPE "public"."enum_pages_blocks_icon_features_align";
  DROP TYPE "public"."enum_pages_blocks_icon_features_section_space_top";
  DROP TYPE "public"."enum_pages_blocks_icon_features_section_space_bottom";
  DROP TYPE "public"."enum_pages_blocks_icon_features_section_width";
  DROP TYPE "public"."enum_pages_blocks_icon_features_section_overlay";
  DROP TYPE "public"."enum_pages_blocks_icon_features_section_hide";
  DROP TYPE "public"."enum_pages_blocks_banner_variant";
  DROP TYPE "public"."enum_pages_blocks_banner_link_type";
  DROP TYPE "public"."enum_pages_blocks_banner_section_space_top";
  DROP TYPE "public"."enum_pages_blocks_banner_section_space_bottom";
  DROP TYPE "public"."enum_pages_blocks_banner_section_width";
  DROP TYPE "public"."enum_pages_blocks_banner_section_overlay";
  DROP TYPE "public"."enum_pages_blocks_banner_section_hide";
  DROP TYPE "public"."enum_pages_blocks_button_group_links_link_type";
  DROP TYPE "public"."enum_pages_blocks_button_group_links_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_button_group_justify";
  DROP TYPE "public"."enum_pages_blocks_button_group_background";
  DROP TYPE "public"."enum_pages_blocks_button_group_section_space_top";
  DROP TYPE "public"."enum_pages_blocks_button_group_section_space_bottom";
  DROP TYPE "public"."enum_pages_blocks_button_group_section_width";
  DROP TYPE "public"."enum_pages_blocks_button_group_section_overlay";
  DROP TYPE "public"."enum_pages_blocks_button_group_section_hide";
  DROP TYPE "public"."enum_pages_blocks_divider_kind";
  DROP TYPE "public"."enum_pages_blocks_divider_size";
  DROP TYPE "public"."enum_pages_blocks_divider_section_space_top";
  DROP TYPE "public"."enum_pages_blocks_divider_section_space_bottom";
  DROP TYPE "public"."enum_pages_blocks_divider_section_width";
  DROP TYPE "public"."enum_pages_blocks_divider_section_overlay";
  DROP TYPE "public"."enum_pages_blocks_divider_section_hide";
  DROP TYPE "public"."enum_pages_blocks_columns_layout";
  DROP TYPE "public"."enum_pages_blocks_columns_vertical_align";
  DROP TYPE "public"."enum_pages_blocks_columns_background";
  DROP TYPE "public"."enum_pages_blocks_columns_section_space_top";
  DROP TYPE "public"."enum_pages_blocks_columns_section_space_bottom";
  DROP TYPE "public"."enum_pages_blocks_columns_section_width";
  DROP TYPE "public"."enum_pages_blocks_columns_section_overlay";
  DROP TYPE "public"."enum_pages_blocks_columns_section_hide";
  DROP TYPE "public"."enum_pages_blocks_newsletter_mode";
  DROP TYPE "public"."enum_pages_blocks_newsletter_background";
  DROP TYPE "public"."enum_pages_blocks_newsletter_align";
  DROP TYPE "public"."enum_pages_blocks_newsletter_section_space_top";
  DROP TYPE "public"."enum_pages_blocks_newsletter_section_space_bottom";
  DROP TYPE "public"."enum_pages_blocks_newsletter_section_width";
  DROP TYPE "public"."enum_pages_blocks_newsletter_section_overlay";
  DROP TYPE "public"."enum_pages_blocks_newsletter_section_hide";
  DROP TYPE "public"."enum__pages_v_blocks_tabs_background";
  DROP TYPE "public"."enum__pages_v_blocks_tabs_section_space_top";
  DROP TYPE "public"."enum__pages_v_blocks_tabs_section_space_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_tabs_section_width";
  DROP TYPE "public"."enum__pages_v_blocks_tabs_section_overlay";
  DROP TYPE "public"."enum__pages_v_blocks_tabs_section_hide";
  DROP TYPE "public"."enum__pages_v_blocks_pricing_plans_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_pricing_plans_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_pricing_background";
  DROP TYPE "public"."enum__pages_v_blocks_pricing_align";
  DROP TYPE "public"."enum__pages_v_blocks_pricing_section_space_top";
  DROP TYPE "public"."enum__pages_v_blocks_pricing_section_space_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_pricing_section_width";
  DROP TYPE "public"."enum__pages_v_blocks_pricing_section_overlay";
  DROP TYPE "public"."enum__pages_v_blocks_pricing_section_hide";
  DROP TYPE "public"."enum__pages_v_blocks_logo_wall_logos_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_logo_wall_background";
  DROP TYPE "public"."enum__pages_v_blocks_logo_wall_align";
  DROP TYPE "public"."enum__pages_v_blocks_logo_wall_section_space_top";
  DROP TYPE "public"."enum__pages_v_blocks_logo_wall_section_space_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_logo_wall_section_width";
  DROP TYPE "public"."enum__pages_v_blocks_logo_wall_section_overlay";
  DROP TYPE "public"."enum__pages_v_blocks_logo_wall_section_hide";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_columns";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_background";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_align";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_section_space_top";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_section_space_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_section_width";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_section_overlay";
  DROP TYPE "public"."enum__pages_v_blocks_testimonials_section_hide";
  DROP TYPE "public"."enum__pages_v_blocks_carousel_slides_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_carousel_background";
  DROP TYPE "public"."enum__pages_v_blocks_carousel_section_space_top";
  DROP TYPE "public"."enum__pages_v_blocks_carousel_section_space_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_carousel_section_width";
  DROP TYPE "public"."enum__pages_v_blocks_carousel_section_overlay";
  DROP TYPE "public"."enum__pages_v_blocks_carousel_section_hide";
  DROP TYPE "public"."enum__pages_v_blocks_table_background";
  DROP TYPE "public"."enum__pages_v_blocks_table_section_space_top";
  DROP TYPE "public"."enum__pages_v_blocks_table_section_space_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_table_section_width";
  DROP TYPE "public"."enum__pages_v_blocks_table_section_overlay";
  DROP TYPE "public"."enum__pages_v_blocks_table_section_hide";
  DROP TYPE "public"."enum__pages_v_blocks_contact_card_background";
  DROP TYPE "public"."enum__pages_v_blocks_contact_card_section_space_top";
  DROP TYPE "public"."enum__pages_v_blocks_contact_card_section_space_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_contact_card_section_width";
  DROP TYPE "public"."enum__pages_v_blocks_contact_card_section_overlay";
  DROP TYPE "public"."enum__pages_v_blocks_contact_card_section_hide";
  DROP TYPE "public"."enum__pages_v_blocks_icon_features_items_icon";
  DROP TYPE "public"."enum__pages_v_blocks_icon_features_items_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_icon_features_columns";
  DROP TYPE "public"."enum__pages_v_blocks_icon_features_background";
  DROP TYPE "public"."enum__pages_v_blocks_icon_features_align";
  DROP TYPE "public"."enum__pages_v_blocks_icon_features_section_space_top";
  DROP TYPE "public"."enum__pages_v_blocks_icon_features_section_space_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_icon_features_section_width";
  DROP TYPE "public"."enum__pages_v_blocks_icon_features_section_overlay";
  DROP TYPE "public"."enum__pages_v_blocks_icon_features_section_hide";
  DROP TYPE "public"."enum__pages_v_blocks_banner_variant";
  DROP TYPE "public"."enum__pages_v_blocks_banner_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_banner_section_space_top";
  DROP TYPE "public"."enum__pages_v_blocks_banner_section_space_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_banner_section_width";
  DROP TYPE "public"."enum__pages_v_blocks_banner_section_overlay";
  DROP TYPE "public"."enum__pages_v_blocks_banner_section_hide";
  DROP TYPE "public"."enum__pages_v_blocks_button_group_links_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_button_group_links_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_button_group_justify";
  DROP TYPE "public"."enum__pages_v_blocks_button_group_background";
  DROP TYPE "public"."enum__pages_v_blocks_button_group_section_space_top";
  DROP TYPE "public"."enum__pages_v_blocks_button_group_section_space_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_button_group_section_width";
  DROP TYPE "public"."enum__pages_v_blocks_button_group_section_overlay";
  DROP TYPE "public"."enum__pages_v_blocks_button_group_section_hide";
  DROP TYPE "public"."enum__pages_v_blocks_divider_kind";
  DROP TYPE "public"."enum__pages_v_blocks_divider_size";
  DROP TYPE "public"."enum__pages_v_blocks_divider_section_space_top";
  DROP TYPE "public"."enum__pages_v_blocks_divider_section_space_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_divider_section_width";
  DROP TYPE "public"."enum__pages_v_blocks_divider_section_overlay";
  DROP TYPE "public"."enum__pages_v_blocks_divider_section_hide";
  DROP TYPE "public"."enum__pages_v_blocks_columns_layout";
  DROP TYPE "public"."enum__pages_v_blocks_columns_vertical_align";
  DROP TYPE "public"."enum__pages_v_blocks_columns_background";
  DROP TYPE "public"."enum__pages_v_blocks_columns_section_space_top";
  DROP TYPE "public"."enum__pages_v_blocks_columns_section_space_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_columns_section_width";
  DROP TYPE "public"."enum__pages_v_blocks_columns_section_overlay";
  DROP TYPE "public"."enum__pages_v_blocks_columns_section_hide";
  DROP TYPE "public"."enum__pages_v_blocks_newsletter_mode";
  DROP TYPE "public"."enum__pages_v_blocks_newsletter_background";
  DROP TYPE "public"."enum__pages_v_blocks_newsletter_align";
  DROP TYPE "public"."enum__pages_v_blocks_newsletter_section_space_top";
  DROP TYPE "public"."enum__pages_v_blocks_newsletter_section_space_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_newsletter_section_width";
  DROP TYPE "public"."enum__pages_v_blocks_newsletter_section_overlay";
  DROP TYPE "public"."enum__pages_v_blocks_newsletter_section_hide";`)
}
