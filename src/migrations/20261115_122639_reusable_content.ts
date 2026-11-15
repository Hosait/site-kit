import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_global_section_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_global_section_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_global_section_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_global_section_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_global_section_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__pages_v_blocks_global_section_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_global_section_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_global_section_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_global_section_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_global_section_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_gsections_blocks_hero_links_link_appearance" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum_gsections_blocks_hero_variant" AS ENUM('text', 'image', 'split');
  CREATE TYPE "public"."enum_gsections_blocks_hero_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_gsections_blocks_hero_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_hero_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_hero_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_hero_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_hero_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_content_width" AS ENUM('text', 'wide');
  CREATE TYPE "public"."enum_gsections_blocks_content_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_gsections_blocks_content_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_gsections_blocks_content_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_content_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_content_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_content_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_content_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_text_image_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_gsections_blocks_text_image_links_link_appearance" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum_gsections_blocks_text_image_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_gsections_blocks_text_image_layout" AS ENUM('split', 'feature');
  CREATE TYPE "public"."enum_gsections_blocks_text_image_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_gsections_blocks_text_image_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_text_image_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_text_image_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_text_image_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_text_image_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_full_image_size" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_full_image_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_full_image_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_full_image_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_full_image_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_full_image_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_image_grid_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_gsections_blocks_image_grid_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_gsections_blocks_image_grid_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_image_grid_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_image_grid_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_image_grid_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_image_grid_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_cards_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_gsections_blocks_cards_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_gsections_blocks_cards_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_gsections_blocks_cards_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_gsections_blocks_cards_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_cards_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_cards_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_cards_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_cards_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_child_pages_depth" AS ENUM('1', '2');
  CREATE TYPE "public"."enum_gsections_blocks_child_pages_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_gsections_blocks_child_pages_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_gsections_blocks_child_pages_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_child_pages_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_child_pages_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_child_pages_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_child_pages_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_gsections_blocks_cta_links_link_appearance" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum_gsections_blocks_cta_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_gsections_blocks_cta_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_gsections_blocks_cta_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_cta_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_cta_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_cta_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_cta_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_quote_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_gsections_blocks_quote_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_gsections_blocks_quote_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_quote_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_quote_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_quote_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_quote_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_stats_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_gsections_blocks_stats_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_gsections_blocks_stats_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_stats_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_stats_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_stats_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_stats_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_facts_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_gsections_blocks_facts_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_facts_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_facts_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_facts_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_facts_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_article_feed_sites" AS ENUM('main');
  CREATE TYPE "public"."enum_gsections_blocks_article_feed_kind" AS ENUM('all', 'news', 'blog');
  CREATE TYPE "public"."enum_gsections_blocks_article_feed_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_gsections_blocks_article_feed_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_article_feed_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_article_feed_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_article_feed_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_article_feed_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_people_layout" AS ENUM('grid', 'list');
  CREATE TYPE "public"."enum_gsections_blocks_people_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_gsections_blocks_people_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_people_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_people_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_people_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_people_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_documents_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_gsections_blocks_documents_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_documents_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_documents_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_documents_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_documents_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_timeline_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_gsections_blocks_timeline_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_timeline_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_timeline_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_timeline_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_timeline_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_accordion_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_gsections_blocks_accordion_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_accordion_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_accordion_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_accordion_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_accordion_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_video_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_gsections_blocks_video_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_video_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_video_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_video_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_video_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_embed_provider" AS ENUM('google-maps', 'other');
  CREATE TYPE "public"."enum_gsections_blocks_embed_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_embed_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_embed_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_embed_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_embed_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_tabs_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_gsections_blocks_tabs_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_tabs_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_tabs_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_tabs_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_tabs_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_pricing_plans_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_gsections_blocks_pricing_plans_link_appearance" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum_gsections_blocks_pricing_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_gsections_blocks_pricing_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_gsections_blocks_pricing_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_pricing_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_pricing_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_pricing_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_pricing_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_logo_wall_logos_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_gsections_blocks_logo_wall_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_gsections_blocks_logo_wall_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_gsections_blocks_logo_wall_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_logo_wall_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_logo_wall_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_logo_wall_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_logo_wall_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_testimonials_columns" AS ENUM('1', '2', '3');
  CREATE TYPE "public"."enum_gsections_blocks_testimonials_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_gsections_blocks_testimonials_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_gsections_blocks_testimonials_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_testimonials_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_testimonials_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_testimonials_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_testimonials_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_carousel_slides_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_gsections_blocks_carousel_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_gsections_blocks_carousel_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_carousel_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_carousel_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_carousel_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_carousel_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_table_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_gsections_blocks_table_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_table_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_table_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_table_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_table_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_contact_card_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_gsections_blocks_contact_card_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_contact_card_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_contact_card_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_contact_card_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_contact_card_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_icon_features_items_icon" AS ENUM('check', 'star', 'heart', 'shield', 'lock', 'clock', 'calendar', 'mail', 'phone', 'map-pin', 'users', 'home', 'tool', 'lightbulb', 'chart', 'leaf', 'award', 'truck', 'message', 'search', 'settings', 'zap', 'thumbs-up', 'book', 'globe', 'handshake', 'target', 'rocket');
  CREATE TYPE "public"."enum_gsections_blocks_icon_features_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_gsections_blocks_icon_features_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_gsections_blocks_icon_features_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_gsections_blocks_icon_features_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_gsections_blocks_icon_features_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_icon_features_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_icon_features_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_icon_features_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_icon_features_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_banner_variant" AS ENUM('info', 'warning', 'success');
  CREATE TYPE "public"."enum_gsections_blocks_banner_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_gsections_blocks_banner_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_banner_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_banner_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_banner_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_banner_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_button_group_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_gsections_blocks_button_group_links_link_appearance" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum_gsections_blocks_button_group_justify" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_gsections_blocks_button_group_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_gsections_blocks_button_group_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_button_group_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_button_group_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_button_group_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_button_group_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_divider_kind" AS ENUM('line', 'space');
  CREATE TYPE "public"."enum_gsections_blocks_divider_size" AS ENUM('s', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_divider_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_divider_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_divider_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_divider_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_divider_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_columns_layout" AS ENUM('1-1', '2-1', '1-2', '1-1-1', '1-1-1-1');
  CREATE TYPE "public"."enum_gsections_blocks_columns_vertical_align" AS ENUM('top', 'center', 'bottom');
  CREATE TYPE "public"."enum_gsections_blocks_columns_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_gsections_blocks_columns_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_columns_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_columns_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_columns_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_columns_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_form_block_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_form_block_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_form_block_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_form_block_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_form_block_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_newsletter_mode" AS ENUM('form', 'embed');
  CREATE TYPE "public"."enum_gsections_blocks_newsletter_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_gsections_blocks_newsletter_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_gsections_blocks_newsletter_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_newsletter_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_newsletter_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_newsletter_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_newsletter_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_site" AS ENUM('main');
  CREATE TYPE "public"."enum_gsections_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__gsections_v_blocks_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__gsections_v_blocks_hero_links_link_appearance" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum__gsections_v_blocks_hero_variant" AS ENUM('text', 'image', 'split');
  CREATE TYPE "public"."enum__gsections_v_blocks_hero_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__gsections_v_blocks_hero_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_hero_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_hero_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_hero_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_hero_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_content_width" AS ENUM('text', 'wide');
  CREATE TYPE "public"."enum__gsections_v_blocks_content_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__gsections_v_blocks_content_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__gsections_v_blocks_content_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_content_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_content_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_content_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_content_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_text_image_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__gsections_v_blocks_text_image_links_link_appearance" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum__gsections_v_blocks_text_image_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum__gsections_v_blocks_text_image_layout" AS ENUM('split', 'feature');
  CREATE TYPE "public"."enum__gsections_v_blocks_text_image_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__gsections_v_blocks_text_image_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_text_image_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_text_image_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_text_image_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_text_image_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_full_image_size" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_full_image_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_full_image_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_full_image_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_full_image_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_full_image_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_image_grid_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum__gsections_v_blocks_image_grid_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__gsections_v_blocks_image_grid_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_image_grid_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_image_grid_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_image_grid_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_image_grid_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_cards_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__gsections_v_blocks_cards_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum__gsections_v_blocks_cards_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__gsections_v_blocks_cards_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__gsections_v_blocks_cards_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_cards_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_cards_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_cards_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_cards_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_child_pages_depth" AS ENUM('1', '2');
  CREATE TYPE "public"."enum__gsections_v_blocks_child_pages_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum__gsections_v_blocks_child_pages_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__gsections_v_blocks_child_pages_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_child_pages_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_child_pages_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_child_pages_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_child_pages_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__gsections_v_blocks_cta_links_link_appearance" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum__gsections_v_blocks_cta_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__gsections_v_blocks_cta_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__gsections_v_blocks_cta_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_cta_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_cta_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_cta_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_cta_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_quote_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__gsections_v_blocks_quote_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__gsections_v_blocks_quote_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_quote_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_quote_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_quote_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_quote_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_stats_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__gsections_v_blocks_stats_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__gsections_v_blocks_stats_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_stats_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_stats_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_stats_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_stats_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_facts_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__gsections_v_blocks_facts_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_facts_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_facts_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_facts_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_facts_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_article_feed_sites" AS ENUM('main');
  CREATE TYPE "public"."enum__gsections_v_blocks_article_feed_kind" AS ENUM('all', 'news', 'blog');
  CREATE TYPE "public"."enum__gsections_v_blocks_article_feed_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__gsections_v_blocks_article_feed_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_article_feed_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_article_feed_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_article_feed_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_article_feed_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_people_layout" AS ENUM('grid', 'list');
  CREATE TYPE "public"."enum__gsections_v_blocks_people_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__gsections_v_blocks_people_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_people_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_people_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_people_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_people_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_documents_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__gsections_v_blocks_documents_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_documents_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_documents_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_documents_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_documents_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_timeline_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__gsections_v_blocks_timeline_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_timeline_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_timeline_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_timeline_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_timeline_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_accordion_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__gsections_v_blocks_accordion_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_accordion_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_accordion_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_accordion_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_accordion_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_video_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__gsections_v_blocks_video_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_video_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_video_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_video_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_video_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_embed_provider" AS ENUM('google-maps', 'other');
  CREATE TYPE "public"."enum__gsections_v_blocks_embed_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_embed_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_embed_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_embed_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_embed_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_tabs_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__gsections_v_blocks_tabs_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_tabs_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_tabs_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_tabs_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_tabs_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_pricing_plans_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__gsections_v_blocks_pricing_plans_link_appearance" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum__gsections_v_blocks_pricing_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__gsections_v_blocks_pricing_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__gsections_v_blocks_pricing_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_pricing_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_pricing_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_pricing_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_pricing_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_logo_wall_logos_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__gsections_v_blocks_logo_wall_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__gsections_v_blocks_logo_wall_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__gsections_v_blocks_logo_wall_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_logo_wall_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_logo_wall_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_logo_wall_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_logo_wall_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_testimonials_columns" AS ENUM('1', '2', '3');
  CREATE TYPE "public"."enum__gsections_v_blocks_testimonials_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__gsections_v_blocks_testimonials_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__gsections_v_blocks_testimonials_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_testimonials_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_testimonials_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_testimonials_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_testimonials_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_carousel_slides_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__gsections_v_blocks_carousel_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__gsections_v_blocks_carousel_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_carousel_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_carousel_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_carousel_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_carousel_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_table_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__gsections_v_blocks_table_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_table_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_table_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_table_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_table_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_contact_card_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__gsections_v_blocks_contact_card_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_contact_card_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_contact_card_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_contact_card_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_contact_card_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_icon_features_items_icon" AS ENUM('check', 'star', 'heart', 'shield', 'lock', 'clock', 'calendar', 'mail', 'phone', 'map-pin', 'users', 'home', 'tool', 'lightbulb', 'chart', 'leaf', 'award', 'truck', 'message', 'search', 'settings', 'zap', 'thumbs-up', 'book', 'globe', 'handshake', 'target', 'rocket');
  CREATE TYPE "public"."enum__gsections_v_blocks_icon_features_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__gsections_v_blocks_icon_features_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum__gsections_v_blocks_icon_features_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__gsections_v_blocks_icon_features_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__gsections_v_blocks_icon_features_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_icon_features_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_icon_features_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_icon_features_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_icon_features_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_banner_variant" AS ENUM('info', 'warning', 'success');
  CREATE TYPE "public"."enum__gsections_v_blocks_banner_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__gsections_v_blocks_banner_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_banner_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_banner_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_banner_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_banner_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_button_group_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__gsections_v_blocks_button_group_links_link_appearance" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum__gsections_v_blocks_button_group_justify" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum__gsections_v_blocks_button_group_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__gsections_v_blocks_button_group_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_button_group_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_button_group_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_button_group_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_button_group_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_divider_kind" AS ENUM('line', 'space');
  CREATE TYPE "public"."enum__gsections_v_blocks_divider_size" AS ENUM('s', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_divider_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_divider_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_divider_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_divider_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_divider_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_columns_layout" AS ENUM('1-1', '2-1', '1-2', '1-1-1', '1-1-1-1');
  CREATE TYPE "public"."enum__gsections_v_blocks_columns_vertical_align" AS ENUM('top', 'center', 'bottom');
  CREATE TYPE "public"."enum__gsections_v_blocks_columns_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__gsections_v_blocks_columns_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_columns_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_columns_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_columns_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_columns_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_form_block_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_form_block_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_form_block_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_form_block_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_form_block_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_newsletter_mode" AS ENUM('form', 'embed');
  CREATE TYPE "public"."enum__gsections_v_blocks_newsletter_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__gsections_v_blocks_newsletter_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum__gsections_v_blocks_newsletter_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_newsletter_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_newsletter_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_newsletter_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_newsletter_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_version_site" AS ENUM('main');
  CREATE TYPE "public"."enum__gsections_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__gsections_v_published_locale" AS ENUM('no', 'en');
  CREATE TYPE "public"."enum_page_templates_blocks_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_page_templates_blocks_hero_links_link_appearance" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum_page_templates_blocks_hero_variant" AS ENUM('text', 'image', 'split');
  CREATE TYPE "public"."enum_page_templates_blocks_hero_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_page_templates_blocks_hero_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_hero_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_hero_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_hero_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_hero_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_content_width" AS ENUM('text', 'wide');
  CREATE TYPE "public"."enum_page_templates_blocks_content_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_page_templates_blocks_content_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_page_templates_blocks_content_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_content_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_content_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_content_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_content_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_text_image_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_page_templates_blocks_text_image_links_link_appearance" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum_page_templates_blocks_text_image_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_page_templates_blocks_text_image_layout" AS ENUM('split', 'feature');
  CREATE TYPE "public"."enum_page_templates_blocks_text_image_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_page_templates_blocks_text_image_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_text_image_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_text_image_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_text_image_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_text_image_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_full_image_size" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_full_image_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_full_image_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_full_image_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_full_image_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_full_image_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_image_grid_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_page_templates_blocks_image_grid_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_page_templates_blocks_image_grid_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_image_grid_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_image_grid_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_image_grid_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_image_grid_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_cards_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_page_templates_blocks_cards_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_page_templates_blocks_cards_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_page_templates_blocks_cards_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_page_templates_blocks_cards_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_cards_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_cards_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_cards_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_cards_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_child_pages_depth" AS ENUM('1', '2');
  CREATE TYPE "public"."enum_page_templates_blocks_child_pages_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_page_templates_blocks_child_pages_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_page_templates_blocks_child_pages_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_child_pages_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_child_pages_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_child_pages_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_child_pages_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_page_templates_blocks_cta_links_link_appearance" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum_page_templates_blocks_cta_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_page_templates_blocks_cta_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_page_templates_blocks_cta_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_cta_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_cta_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_cta_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_cta_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_quote_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_page_templates_blocks_quote_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_page_templates_blocks_quote_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_quote_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_quote_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_quote_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_quote_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_stats_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_page_templates_blocks_stats_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_page_templates_blocks_stats_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_stats_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_stats_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_stats_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_stats_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_facts_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_page_templates_blocks_facts_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_facts_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_facts_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_facts_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_facts_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_article_feed_sites" AS ENUM('main');
  CREATE TYPE "public"."enum_page_templates_blocks_article_feed_kind" AS ENUM('all', 'news', 'blog');
  CREATE TYPE "public"."enum_page_templates_blocks_article_feed_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_page_templates_blocks_article_feed_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_article_feed_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_article_feed_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_article_feed_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_article_feed_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_people_layout" AS ENUM('grid', 'list');
  CREATE TYPE "public"."enum_page_templates_blocks_people_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_page_templates_blocks_people_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_people_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_people_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_people_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_people_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_documents_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_page_templates_blocks_documents_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_documents_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_documents_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_documents_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_documents_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_timeline_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_page_templates_blocks_timeline_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_timeline_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_timeline_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_timeline_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_timeline_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_accordion_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_page_templates_blocks_accordion_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_accordion_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_accordion_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_accordion_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_accordion_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_video_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_page_templates_blocks_video_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_video_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_video_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_video_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_video_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_embed_provider" AS ENUM('google-maps', 'other');
  CREATE TYPE "public"."enum_page_templates_blocks_embed_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_embed_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_embed_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_embed_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_embed_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_tabs_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_page_templates_blocks_tabs_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_tabs_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_tabs_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_tabs_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_tabs_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_pricing_plans_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_page_templates_blocks_pricing_plans_link_appearance" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum_page_templates_blocks_pricing_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_page_templates_blocks_pricing_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_page_templates_blocks_pricing_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_pricing_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_pricing_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_pricing_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_pricing_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_logo_wall_logos_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_page_templates_blocks_logo_wall_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_page_templates_blocks_logo_wall_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_page_templates_blocks_logo_wall_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_logo_wall_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_logo_wall_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_logo_wall_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_logo_wall_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_testimonials_columns" AS ENUM('1', '2', '3');
  CREATE TYPE "public"."enum_page_templates_blocks_testimonials_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_page_templates_blocks_testimonials_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_page_templates_blocks_testimonials_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_testimonials_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_testimonials_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_testimonials_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_testimonials_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_carousel_slides_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_page_templates_blocks_carousel_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_page_templates_blocks_carousel_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_carousel_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_carousel_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_carousel_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_carousel_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_table_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_page_templates_blocks_table_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_table_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_table_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_table_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_table_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_contact_card_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_page_templates_blocks_contact_card_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_contact_card_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_contact_card_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_contact_card_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_contact_card_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_icon_features_items_icon" AS ENUM('check', 'star', 'heart', 'shield', 'lock', 'clock', 'calendar', 'mail', 'phone', 'map-pin', 'users', 'home', 'tool', 'lightbulb', 'chart', 'leaf', 'award', 'truck', 'message', 'search', 'settings', 'zap', 'thumbs-up', 'book', 'globe', 'handshake', 'target', 'rocket');
  CREATE TYPE "public"."enum_page_templates_blocks_icon_features_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_page_templates_blocks_icon_features_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_page_templates_blocks_icon_features_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_page_templates_blocks_icon_features_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_page_templates_blocks_icon_features_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_icon_features_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_icon_features_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_icon_features_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_icon_features_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_banner_variant" AS ENUM('info', 'warning', 'success');
  CREATE TYPE "public"."enum_page_templates_blocks_banner_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_page_templates_blocks_banner_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_banner_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_banner_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_banner_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_banner_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_button_group_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_page_templates_blocks_button_group_links_link_appearance" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum_page_templates_blocks_button_group_justify" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_page_templates_blocks_button_group_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_page_templates_blocks_button_group_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_button_group_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_button_group_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_button_group_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_button_group_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_divider_kind" AS ENUM('line', 'space');
  CREATE TYPE "public"."enum_page_templates_blocks_divider_size" AS ENUM('s', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_divider_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_divider_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_divider_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_divider_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_divider_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_columns_layout" AS ENUM('1-1', '2-1', '1-2', '1-1-1', '1-1-1-1');
  CREATE TYPE "public"."enum_page_templates_blocks_columns_vertical_align" AS ENUM('top', 'center', 'bottom');
  CREATE TYPE "public"."enum_page_templates_blocks_columns_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_page_templates_blocks_columns_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_columns_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_columns_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_columns_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_columns_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_form_block_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_form_block_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_form_block_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_form_block_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_form_block_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_newsletter_mode" AS ENUM('form', 'embed');
  CREATE TYPE "public"."enum_page_templates_blocks_newsletter_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_page_templates_blocks_newsletter_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_page_templates_blocks_newsletter_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_newsletter_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_newsletter_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_newsletter_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_newsletter_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_global_section_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_global_section_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_global_section_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_global_section_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_global_section_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_site" AS ENUM('main');
  CREATE TYPE "public"."enum_section_presets_blocks_hero_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_section_presets_blocks_hero_links_link_appearance" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum_section_presets_blocks_hero_variant" AS ENUM('text', 'image', 'split');
  CREATE TYPE "public"."enum_section_presets_blocks_hero_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_section_presets_blocks_hero_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_hero_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_hero_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_hero_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_hero_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_content_width" AS ENUM('text', 'wide');
  CREATE TYPE "public"."enum_section_presets_blocks_content_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_section_presets_blocks_content_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_section_presets_blocks_content_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_content_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_content_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_content_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_content_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_text_image_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_section_presets_blocks_text_image_links_link_appearance" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum_section_presets_blocks_text_image_image_position" AS ENUM('left', 'right');
  CREATE TYPE "public"."enum_section_presets_blocks_text_image_layout" AS ENUM('split', 'feature');
  CREATE TYPE "public"."enum_section_presets_blocks_text_image_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_section_presets_blocks_text_image_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_text_image_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_text_image_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_text_image_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_text_image_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_full_image_size" AS ENUM('text', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_full_image_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_full_image_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_full_image_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_full_image_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_full_image_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_image_grid_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_section_presets_blocks_image_grid_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_section_presets_blocks_image_grid_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_image_grid_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_image_grid_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_image_grid_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_image_grid_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_cards_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_section_presets_blocks_cards_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_section_presets_blocks_cards_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_section_presets_blocks_cards_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_section_presets_blocks_cards_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_cards_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_cards_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_cards_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_cards_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_child_pages_depth" AS ENUM('1', '2');
  CREATE TYPE "public"."enum_section_presets_blocks_child_pages_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_section_presets_blocks_child_pages_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_section_presets_blocks_child_pages_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_child_pages_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_child_pages_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_child_pages_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_child_pages_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_section_presets_blocks_cta_links_link_appearance" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum_section_presets_blocks_cta_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_section_presets_blocks_cta_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_section_presets_blocks_cta_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_cta_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_cta_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_cta_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_cta_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_quote_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_section_presets_blocks_quote_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_section_presets_blocks_quote_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_quote_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_quote_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_quote_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_quote_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_stats_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_section_presets_blocks_stats_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_section_presets_blocks_stats_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_stats_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_stats_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_stats_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_stats_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_facts_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_section_presets_blocks_facts_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_facts_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_facts_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_facts_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_facts_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_article_feed_sites" AS ENUM('main');
  CREATE TYPE "public"."enum_section_presets_blocks_article_feed_kind" AS ENUM('all', 'news', 'blog');
  CREATE TYPE "public"."enum_section_presets_blocks_article_feed_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_section_presets_blocks_article_feed_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_article_feed_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_article_feed_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_article_feed_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_article_feed_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_people_layout" AS ENUM('grid', 'list');
  CREATE TYPE "public"."enum_section_presets_blocks_people_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_section_presets_blocks_people_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_people_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_people_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_people_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_people_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_documents_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_section_presets_blocks_documents_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_documents_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_documents_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_documents_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_documents_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_timeline_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_section_presets_blocks_timeline_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_timeline_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_timeline_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_timeline_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_timeline_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_accordion_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_section_presets_blocks_accordion_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_accordion_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_accordion_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_accordion_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_accordion_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_video_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_section_presets_blocks_video_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_video_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_video_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_video_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_video_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_embed_provider" AS ENUM('google-maps', 'other');
  CREATE TYPE "public"."enum_section_presets_blocks_embed_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_embed_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_embed_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_embed_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_embed_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_tabs_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_section_presets_blocks_tabs_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_tabs_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_tabs_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_tabs_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_tabs_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_pricing_plans_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_section_presets_blocks_pricing_plans_link_appearance" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum_section_presets_blocks_pricing_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_section_presets_blocks_pricing_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_section_presets_blocks_pricing_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_pricing_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_pricing_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_pricing_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_pricing_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_logo_wall_logos_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_section_presets_blocks_logo_wall_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_section_presets_blocks_logo_wall_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_section_presets_blocks_logo_wall_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_logo_wall_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_logo_wall_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_logo_wall_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_logo_wall_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_testimonials_columns" AS ENUM('1', '2', '3');
  CREATE TYPE "public"."enum_section_presets_blocks_testimonials_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_section_presets_blocks_testimonials_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_section_presets_blocks_testimonials_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_testimonials_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_testimonials_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_testimonials_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_testimonials_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_carousel_slides_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_section_presets_blocks_carousel_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_section_presets_blocks_carousel_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_carousel_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_carousel_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_carousel_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_carousel_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_table_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_section_presets_blocks_table_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_table_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_table_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_table_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_table_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_contact_card_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_section_presets_blocks_contact_card_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_contact_card_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_contact_card_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_contact_card_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_contact_card_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_icon_features_items_icon" AS ENUM('check', 'star', 'heart', 'shield', 'lock', 'clock', 'calendar', 'mail', 'phone', 'map-pin', 'users', 'home', 'tool', 'lightbulb', 'chart', 'leaf', 'award', 'truck', 'message', 'search', 'settings', 'zap', 'thumbs-up', 'book', 'globe', 'handshake', 'target', 'rocket');
  CREATE TYPE "public"."enum_section_presets_blocks_icon_features_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_section_presets_blocks_icon_features_columns" AS ENUM('2', '3', '4');
  CREATE TYPE "public"."enum_section_presets_blocks_icon_features_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_section_presets_blocks_icon_features_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_section_presets_blocks_icon_features_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_icon_features_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_icon_features_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_icon_features_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_icon_features_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_banner_variant" AS ENUM('info', 'warning', 'success');
  CREATE TYPE "public"."enum_section_presets_blocks_banner_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_section_presets_blocks_banner_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_banner_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_banner_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_banner_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_banner_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_button_group_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_section_presets_blocks_button_group_links_link_appearance" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum_section_presets_blocks_button_group_justify" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_section_presets_blocks_button_group_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_section_presets_blocks_button_group_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_button_group_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_button_group_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_button_group_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_button_group_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_divider_kind" AS ENUM('line', 'space');
  CREATE TYPE "public"."enum_section_presets_blocks_divider_size" AS ENUM('s', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_divider_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_divider_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_divider_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_divider_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_divider_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_columns_layout" AS ENUM('1-1', '2-1', '1-2', '1-1-1', '1-1-1-1');
  CREATE TYPE "public"."enum_section_presets_blocks_columns_vertical_align" AS ENUM('top', 'center', 'bottom');
  CREATE TYPE "public"."enum_section_presets_blocks_columns_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_section_presets_blocks_columns_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_columns_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_columns_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_columns_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_columns_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_form_block_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_form_block_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_form_block_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_form_block_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_form_block_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_newsletter_mode" AS ENUM('form', 'embed');
  CREATE TYPE "public"."enum_section_presets_blocks_newsletter_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_section_presets_blocks_newsletter_align" AS ENUM('left', 'center');
  CREATE TYPE "public"."enum_section_presets_blocks_newsletter_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_newsletter_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_newsletter_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_newsletter_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_newsletter_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_global_section_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_global_section_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_global_section_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_global_section_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_global_section_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_site" AS ENUM('main');
  CREATE TABLE "pages_blocks_global_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"global_section_id" integer,
  	"section_space_top" "enum_pages_blocks_global_section_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_pages_blocks_global_section_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_pages_blocks_global_section_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_pages_blocks_global_section_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_pages_blocks_global_section_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_preset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"preset_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_global_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_section_id" integer,
  	"section_space_top" "enum__pages_v_blocks_global_section_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__pages_v_blocks_global_section_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__pages_v_blocks_global_section_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__pages_v_blocks_global_section_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__pages_v_blocks_global_section_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_preset" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"preset_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_gsections_blocks_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_gsections_blocks_hero_links_link_appearance" DEFAULT 'primary'
  );
  
  CREATE TABLE "gsections_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_gsections_blocks_hero_variant" DEFAULT 'text',
  	"eyebrow" varchar,
  	"eyebrow_highlight" varchar,
  	"heading" varchar,
  	"text" varchar,
  	"media_id" integer,
  	"align" "enum_gsections_blocks_hero_align" DEFAULT 'left',
  	"section_space_top" "enum_gsections_blocks_hero_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_hero_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_hero_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_hero_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_hero_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"width" "enum_gsections_blocks_content_width" DEFAULT 'text',
  	"align" "enum_gsections_blocks_content_align" DEFAULT 'left',
  	"background" "enum_gsections_blocks_content_background" DEFAULT 'none',
  	"rich_text" jsonb,
  	"section_space_top" "enum_gsections_blocks_content_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_content_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_content_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_content_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_content_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_text_image_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_gsections_blocks_text_image_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_gsections_blocks_text_image_links_link_appearance" DEFAULT 'primary'
  );
  
  CREATE TABLE "gsections_blocks_text_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"rich_text" jsonb,
  	"image_id" integer,
  	"image_position" "enum_gsections_blocks_text_image_image_position" DEFAULT 'left',
  	"layout" "enum_gsections_blocks_text_image_layout" DEFAULT 'split',
  	"background" "enum_gsections_blocks_text_image_background" DEFAULT 'none',
  	"section_space_top" "enum_gsections_blocks_text_image_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_text_image_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_text_image_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_text_image_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_text_image_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_full_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"size" "enum_gsections_blocks_full_image_size" DEFAULT 'wide',
  	"section_space_top" "enum_gsections_blocks_full_image_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_full_image_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_full_image_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_full_image_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_full_image_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_image_grid_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE "gsections_blocks_image_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"columns" "enum_gsections_blocks_image_grid_columns" DEFAULT '3',
  	"background" "enum_gsections_blocks_image_grid_background" DEFAULT 'none',
  	"section_space_top" "enum_gsections_blocks_image_grid_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_image_grid_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_image_grid_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_image_grid_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_image_grid_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_cards_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"link_type" "enum_gsections_blocks_cards_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "gsections_blocks_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"columns" "enum_gsections_blocks_cards_columns" DEFAULT '3',
  	"background" "enum_gsections_blocks_cards_background" DEFAULT 'none',
  	"align" "enum_gsections_blocks_cards_align" DEFAULT 'left',
  	"section_space_top" "enum_gsections_blocks_cards_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_cards_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_cards_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_cards_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_cards_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_child_pages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"parent_id" integer,
  	"depth" "enum_gsections_blocks_child_pages_depth" DEFAULT '1',
  	"columns" "enum_gsections_blocks_child_pages_columns" DEFAULT '3',
  	"background" "enum_gsections_blocks_child_pages_background" DEFAULT 'none',
  	"section_space_top" "enum_gsections_blocks_child_pages_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_child_pages_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_child_pages_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_child_pages_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_child_pages_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_gsections_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_gsections_blocks_cta_links_link_appearance" DEFAULT 'primary'
  );
  
  CREATE TABLE "gsections_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"text" varchar,
  	"background" "enum_gsections_blocks_cta_background" DEFAULT 'none',
  	"align" "enum_gsections_blocks_cta_align" DEFAULT 'center',
  	"section_space_top" "enum_gsections_blocks_cta_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_cta_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_cta_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_cta_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_cta_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author" varchar,
  	"role" varchar,
  	"image_id" integer,
  	"background" "enum_gsections_blocks_quote_background" DEFAULT 'none',
  	"align" "enum_gsections_blocks_quote_align" DEFAULT 'left',
  	"section_space_top" "enum_gsections_blocks_quote_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_quote_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_quote_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_quote_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_quote_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "gsections_blocks_stats_bars" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"percent" numeric
  );
  
  CREATE TABLE "gsections_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"background" "enum_gsections_blocks_stats_background" DEFAULT 'none',
  	"align" "enum_gsections_blocks_stats_align" DEFAULT 'left',
  	"section_space_top" "enum_gsections_blocks_stats_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_stats_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_stats_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_stats_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_stats_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_facts_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "gsections_blocks_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"background" "enum_gsections_blocks_facts_background" DEFAULT 'none',
  	"section_space_top" "enum_gsections_blocks_facts_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_facts_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_facts_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_facts_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_facts_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_article_feed_sites" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_gsections_blocks_article_feed_sites",
  	"locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "gsections_blocks_article_feed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"kind" "enum_gsections_blocks_article_feed_kind" DEFAULT 'all',
  	"limit" numeric DEFAULT 3,
  	"paginate" boolean DEFAULT false,
  	"background" "enum_gsections_blocks_article_feed_background" DEFAULT 'none',
  	"section_space_top" "enum_gsections_blocks_article_feed_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_article_feed_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_article_feed_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_article_feed_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_article_feed_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_people" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"layout" "enum_gsections_blocks_people_layout" DEFAULT 'grid',
  	"background" "enum_gsections_blocks_people_background" DEFAULT 'none',
  	"section_space_top" "enum_gsections_blocks_people_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_people_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_people_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_people_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_people_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"background" "enum_gsections_blocks_documents_background" DEFAULT 'none',
  	"section_space_top" "enum_gsections_blocks_documents_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_documents_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_documents_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_documents_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_documents_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_timeline_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" varchar,
  	"title" varchar,
  	"text" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "gsections_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"background" "enum_gsections_blocks_timeline_background" DEFAULT 'none',
  	"section_space_top" "enum_gsections_blocks_timeline_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_timeline_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_timeline_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_timeline_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_timeline_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_accordion_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"content" jsonb
  );
  
  CREATE TABLE "gsections_blocks_accordion" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"background" "enum_gsections_blocks_accordion_background" DEFAULT 'none',
  	"section_space_top" "enum_gsections_blocks_accordion_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_accordion_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_accordion_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_accordion_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_accordion_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"url" varchar,
  	"file_id" integer,
  	"poster_id" integer,
  	"background" "enum_gsections_blocks_video_background" DEFAULT 'none',
  	"section_space_top" "enum_gsections_blocks_video_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_video_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_video_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_video_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_video_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"provider" "enum_gsections_blocks_embed_provider" DEFAULT 'google-maps',
  	"url" varchar,
  	"title" varchar,
  	"height" numeric DEFAULT 480,
  	"section_space_top" "enum_gsections_blocks_embed_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_embed_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_embed_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_embed_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_embed_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"content" jsonb
  );
  
  CREATE TABLE "gsections_blocks_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"background" "enum_gsections_blocks_tabs_background" DEFAULT 'none',
  	"section_space_top" "enum_gsections_blocks_tabs_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_tabs_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_tabs_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_tabs_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_tabs_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_pricing_plans_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "gsections_blocks_pricing_plans" (
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
  	"link_type" "enum_gsections_blocks_pricing_plans_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_gsections_blocks_pricing_plans_link_appearance" DEFAULT 'primary'
  );
  
  CREATE TABLE "gsections_blocks_pricing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"background" "enum_gsections_blocks_pricing_background" DEFAULT 'none',
  	"align" "enum_gsections_blocks_pricing_align" DEFAULT 'left',
  	"section_space_top" "enum_gsections_blocks_pricing_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_pricing_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_pricing_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_pricing_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_pricing_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_logo_wall_logos" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"name" varchar,
  	"link_type" "enum_gsections_blocks_logo_wall_logos_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "gsections_blocks_logo_wall" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"background" "enum_gsections_blocks_logo_wall_background" DEFAULT 'none',
  	"align" "enum_gsections_blocks_logo_wall_align" DEFAULT 'left',
  	"section_space_top" "enum_gsections_blocks_logo_wall_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_logo_wall_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_logo_wall_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_logo_wall_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_logo_wall_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author" varchar,
  	"role" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "gsections_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"columns" "enum_gsections_blocks_testimonials_columns" DEFAULT '2',
  	"background" "enum_gsections_blocks_testimonials_background" DEFAULT 'none',
  	"align" "enum_gsections_blocks_testimonials_align" DEFAULT 'left',
  	"section_space_top" "enum_gsections_blocks_testimonials_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_testimonials_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_testimonials_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_testimonials_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_testimonials_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"heading" varchar,
  	"text" varchar,
  	"link_type" "enum_gsections_blocks_carousel_slides_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "gsections_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"autoplay" boolean DEFAULT false,
  	"interval" numeric DEFAULT 6,
  	"background" "enum_gsections_blocks_carousel_background" DEFAULT 'none',
  	"section_space_top" "enum_gsections_blocks_carousel_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_carousel_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_carousel_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_carousel_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_carousel_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_table_header" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "gsections_blocks_table_rows_cells" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "gsections_blocks_table_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "gsections_blocks_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"caption" varchar,
  	"row_headers" boolean DEFAULT false,
  	"background" "enum_gsections_blocks_table_background" DEFAULT 'none',
  	"section_space_top" "enum_gsections_blocks_table_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_table_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_table_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_table_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_table_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_contact_card_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"days" varchar,
  	"time" varchar
  );
  
  CREATE TABLE "gsections_blocks_contact_card" (
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
  	"background" "enum_gsections_blocks_contact_card_background" DEFAULT 'none',
  	"section_space_top" "enum_gsections_blocks_contact_card_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_contact_card_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_contact_card_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_contact_card_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_contact_card_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_icon_features_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_gsections_blocks_icon_features_items_icon" DEFAULT 'check',
  	"title" varchar,
  	"text" varchar,
  	"link_type" "enum_gsections_blocks_icon_features_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "gsections_blocks_icon_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"columns" "enum_gsections_blocks_icon_features_columns" DEFAULT '3',
  	"background" "enum_gsections_blocks_icon_features_background" DEFAULT 'none',
  	"align" "enum_gsections_blocks_icon_features_align" DEFAULT 'left',
  	"section_space_top" "enum_gsections_blocks_icon_features_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_icon_features_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_icon_features_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_icon_features_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_icon_features_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_gsections_blocks_banner_variant" DEFAULT 'info',
  	"title" varchar,
  	"text" varchar,
  	"link_type" "enum_gsections_blocks_banner_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"section_space_top" "enum_gsections_blocks_banner_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_banner_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_banner_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_banner_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_banner_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_button_group_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_gsections_blocks_button_group_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_gsections_blocks_button_group_links_link_appearance" DEFAULT 'primary'
  );
  
  CREATE TABLE "gsections_blocks_button_group" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"justify" "enum_gsections_blocks_button_group_justify" DEFAULT 'left',
  	"background" "enum_gsections_blocks_button_group_background" DEFAULT 'none',
  	"section_space_top" "enum_gsections_blocks_button_group_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_button_group_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_button_group_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_button_group_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_button_group_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_divider" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_gsections_blocks_divider_kind" DEFAULT 'line',
  	"size" "enum_gsections_blocks_divider_size" DEFAULT 'm',
  	"section_space_top" "enum_gsections_blocks_divider_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_divider_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_divider_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_divider_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_divider_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_columns_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "gsections_blocks_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_gsections_blocks_columns_layout" DEFAULT '1-1',
  	"vertical_align" "enum_gsections_blocks_columns_vertical_align" DEFAULT 'top',
  	"background" "enum_gsections_blocks_columns_background" DEFAULT 'none',
  	"section_space_top" "enum_gsections_blocks_columns_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_columns_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_columns_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_columns_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_columns_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"section_space_top" "enum_gsections_blocks_form_block_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_form_block_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_form_block_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_form_block_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_form_block_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_newsletter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"text" varchar,
  	"mode" "enum_gsections_blocks_newsletter_mode" DEFAULT 'form',
  	"form_id" integer,
  	"embed_url" varchar,
  	"embed_title" varchar,
  	"embed_height" numeric DEFAULT 420,
  	"background" "enum_gsections_blocks_newsletter_background" DEFAULT 'none',
  	"align" "enum_gsections_blocks_newsletter_align" DEFAULT 'left',
  	"section_space_top" "enum_gsections_blocks_newsletter_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_newsletter_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_newsletter_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_newsletter_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_newsletter_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"site" "enum_gsections_site" DEFAULT 'main',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_gsections_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "gsections_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locale" "_locales",
  	"pages_id" integer,
  	"articles_id" integer,
  	"people_id" integer,
  	"documents_id" integer
  );
  
  CREATE TABLE "_gsections_v_blocks_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__gsections_v_blocks_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__gsections_v_blocks_hero_links_link_appearance" DEFAULT 'primary',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__gsections_v_blocks_hero_variant" DEFAULT 'text',
  	"eyebrow" varchar,
  	"eyebrow_highlight" varchar,
  	"heading" varchar,
  	"text" varchar,
  	"media_id" integer,
  	"align" "enum__gsections_v_blocks_hero_align" DEFAULT 'left',
  	"section_space_top" "enum__gsections_v_blocks_hero_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_hero_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_hero_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_hero_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_hero_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"width" "enum__gsections_v_blocks_content_width" DEFAULT 'text',
  	"align" "enum__gsections_v_blocks_content_align" DEFAULT 'left',
  	"background" "enum__gsections_v_blocks_content_background" DEFAULT 'none',
  	"rich_text" jsonb,
  	"section_space_top" "enum__gsections_v_blocks_content_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_content_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_content_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_content_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_content_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_text_image_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__gsections_v_blocks_text_image_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__gsections_v_blocks_text_image_links_link_appearance" DEFAULT 'primary',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_text_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"rich_text" jsonb,
  	"image_id" integer,
  	"image_position" "enum__gsections_v_blocks_text_image_image_position" DEFAULT 'left',
  	"layout" "enum__gsections_v_blocks_text_image_layout" DEFAULT 'split',
  	"background" "enum__gsections_v_blocks_text_image_background" DEFAULT 'none',
  	"section_space_top" "enum__gsections_v_blocks_text_image_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_text_image_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_text_image_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_text_image_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_text_image_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_full_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"size" "enum__gsections_v_blocks_full_image_size" DEFAULT 'wide',
  	"section_space_top" "enum__gsections_v_blocks_full_image_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_full_image_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_full_image_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_full_image_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_full_image_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_image_grid_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_image_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"columns" "enum__gsections_v_blocks_image_grid_columns" DEFAULT '3',
  	"background" "enum__gsections_v_blocks_image_grid_background" DEFAULT 'none',
  	"section_space_top" "enum__gsections_v_blocks_image_grid_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_image_grid_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_image_grid_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_image_grid_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_image_grid_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_cards_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"link_type" "enum__gsections_v_blocks_cards_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"columns" "enum__gsections_v_blocks_cards_columns" DEFAULT '3',
  	"background" "enum__gsections_v_blocks_cards_background" DEFAULT 'none',
  	"align" "enum__gsections_v_blocks_cards_align" DEFAULT 'left',
  	"section_space_top" "enum__gsections_v_blocks_cards_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_cards_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_cards_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_cards_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_cards_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_child_pages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"parent_id" integer,
  	"depth" "enum__gsections_v_blocks_child_pages_depth" DEFAULT '1',
  	"columns" "enum__gsections_v_blocks_child_pages_columns" DEFAULT '3',
  	"background" "enum__gsections_v_blocks_child_pages_background" DEFAULT 'none',
  	"section_space_top" "enum__gsections_v_blocks_child_pages_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_child_pages_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_child_pages_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_child_pages_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_child_pages_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__gsections_v_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__gsections_v_blocks_cta_links_link_appearance" DEFAULT 'primary',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"text" varchar,
  	"background" "enum__gsections_v_blocks_cta_background" DEFAULT 'none',
  	"align" "enum__gsections_v_blocks_cta_align" DEFAULT 'center',
  	"section_space_top" "enum__gsections_v_blocks_cta_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_cta_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_cta_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_cta_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_cta_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author" varchar,
  	"role" varchar,
  	"image_id" integer,
  	"background" "enum__gsections_v_blocks_quote_background" DEFAULT 'none',
  	"align" "enum__gsections_v_blocks_quote_align" DEFAULT 'left',
  	"section_space_top" "enum__gsections_v_blocks_quote_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_quote_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_quote_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_quote_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_quote_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_stats_bars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"percent" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"background" "enum__gsections_v_blocks_stats_background" DEFAULT 'none',
  	"align" "enum__gsections_v_blocks_stats_align" DEFAULT 'left',
  	"section_space_top" "enum__gsections_v_blocks_stats_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_stats_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_stats_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_stats_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_stats_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_facts_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"background" "enum__gsections_v_blocks_facts_background" DEFAULT 'none',
  	"section_space_top" "enum__gsections_v_blocks_facts_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_facts_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_facts_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_facts_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_facts_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_article_feed_sites" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__gsections_v_blocks_article_feed_sites",
  	"locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_gsections_v_blocks_article_feed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"kind" "enum__gsections_v_blocks_article_feed_kind" DEFAULT 'all',
  	"limit" numeric DEFAULT 3,
  	"paginate" boolean DEFAULT false,
  	"background" "enum__gsections_v_blocks_article_feed_background" DEFAULT 'none',
  	"section_space_top" "enum__gsections_v_blocks_article_feed_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_article_feed_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_article_feed_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_article_feed_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_article_feed_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_people" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"layout" "enum__gsections_v_blocks_people_layout" DEFAULT 'grid',
  	"background" "enum__gsections_v_blocks_people_background" DEFAULT 'none',
  	"section_space_top" "enum__gsections_v_blocks_people_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_people_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_people_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_people_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_people_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"background" "enum__gsections_v_blocks_documents_background" DEFAULT 'none',
  	"section_space_top" "enum__gsections_v_blocks_documents_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_documents_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_documents_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_documents_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_documents_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_timeline_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" varchar,
  	"title" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"background" "enum__gsections_v_blocks_timeline_background" DEFAULT 'none',
  	"section_space_top" "enum__gsections_v_blocks_timeline_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_timeline_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_timeline_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_timeline_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_timeline_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_accordion_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"content" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_accordion" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"background" "enum__gsections_v_blocks_accordion_background" DEFAULT 'none',
  	"section_space_top" "enum__gsections_v_blocks_accordion_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_accordion_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_accordion_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_accordion_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_accordion_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"url" varchar,
  	"file_id" integer,
  	"poster_id" integer,
  	"background" "enum__gsections_v_blocks_video_background" DEFAULT 'none',
  	"section_space_top" "enum__gsections_v_blocks_video_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_video_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_video_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_video_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_video_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"provider" "enum__gsections_v_blocks_embed_provider" DEFAULT 'google-maps',
  	"url" varchar,
  	"title" varchar,
  	"height" numeric DEFAULT 480,
  	"section_space_top" "enum__gsections_v_blocks_embed_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_embed_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_embed_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_embed_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_embed_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"content" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"background" "enum__gsections_v_blocks_tabs_background" DEFAULT 'none',
  	"section_space_top" "enum__gsections_v_blocks_tabs_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_tabs_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_tabs_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_tabs_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_tabs_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_pricing_plans_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_pricing_plans" (
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
  	"link_type" "enum__gsections_v_blocks_pricing_plans_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__gsections_v_blocks_pricing_plans_link_appearance" DEFAULT 'primary',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_pricing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"background" "enum__gsections_v_blocks_pricing_background" DEFAULT 'none',
  	"align" "enum__gsections_v_blocks_pricing_align" DEFAULT 'left',
  	"section_space_top" "enum__gsections_v_blocks_pricing_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_pricing_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_pricing_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_pricing_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_pricing_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_logo_wall_logos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"name" varchar,
  	"link_type" "enum__gsections_v_blocks_logo_wall_logos_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_logo_wall" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"background" "enum__gsections_v_blocks_logo_wall_background" DEFAULT 'none',
  	"align" "enum__gsections_v_blocks_logo_wall_align" DEFAULT 'left',
  	"section_space_top" "enum__gsections_v_blocks_logo_wall_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_logo_wall_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_logo_wall_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_logo_wall_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_logo_wall_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_testimonials_items" (
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
  
  CREATE TABLE "_gsections_v_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"columns" "enum__gsections_v_blocks_testimonials_columns" DEFAULT '2',
  	"background" "enum__gsections_v_blocks_testimonials_background" DEFAULT 'none',
  	"align" "enum__gsections_v_blocks_testimonials_align" DEFAULT 'left',
  	"section_space_top" "enum__gsections_v_blocks_testimonials_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_testimonials_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_testimonials_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_testimonials_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_testimonials_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"heading" varchar,
  	"text" varchar,
  	"link_type" "enum__gsections_v_blocks_carousel_slides_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"autoplay" boolean DEFAULT false,
  	"interval" numeric DEFAULT 6,
  	"background" "enum__gsections_v_blocks_carousel_background" DEFAULT 'none',
  	"section_space_top" "enum__gsections_v_blocks_carousel_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_carousel_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_carousel_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_carousel_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_carousel_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_table_header" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_table_rows_cells" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_table_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"caption" varchar,
  	"row_headers" boolean DEFAULT false,
  	"background" "enum__gsections_v_blocks_table_background" DEFAULT 'none',
  	"section_space_top" "enum__gsections_v_blocks_table_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_table_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_table_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_table_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_table_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_contact_card_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"days" varchar,
  	"time" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_contact_card" (
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
  	"background" "enum__gsections_v_blocks_contact_card_background" DEFAULT 'none',
  	"section_space_top" "enum__gsections_v_blocks_contact_card_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_contact_card_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_contact_card_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_contact_card_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_contact_card_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_icon_features_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__gsections_v_blocks_icon_features_items_icon" DEFAULT 'check',
  	"title" varchar,
  	"text" varchar,
  	"link_type" "enum__gsections_v_blocks_icon_features_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_icon_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"columns" "enum__gsections_v_blocks_icon_features_columns" DEFAULT '3',
  	"background" "enum__gsections_v_blocks_icon_features_background" DEFAULT 'none',
  	"align" "enum__gsections_v_blocks_icon_features_align" DEFAULT 'left',
  	"section_space_top" "enum__gsections_v_blocks_icon_features_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_icon_features_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_icon_features_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_icon_features_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_icon_features_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__gsections_v_blocks_banner_variant" DEFAULT 'info',
  	"title" varchar,
  	"text" varchar,
  	"link_type" "enum__gsections_v_blocks_banner_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"section_space_top" "enum__gsections_v_blocks_banner_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_banner_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_banner_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_banner_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_banner_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_button_group_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__gsections_v_blocks_button_group_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__gsections_v_blocks_button_group_links_link_appearance" DEFAULT 'primary',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_button_group" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"justify" "enum__gsections_v_blocks_button_group_justify" DEFAULT 'left',
  	"background" "enum__gsections_v_blocks_button_group_background" DEFAULT 'none',
  	"section_space_top" "enum__gsections_v_blocks_button_group_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_button_group_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_button_group_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_button_group_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_button_group_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_divider" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum__gsections_v_blocks_divider_kind" DEFAULT 'line',
  	"size" "enum__gsections_v_blocks_divider_size" DEFAULT 'm',
  	"section_space_top" "enum__gsections_v_blocks_divider_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_divider_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_divider_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_divider_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_divider_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_columns_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"layout" "enum__gsections_v_blocks_columns_layout" DEFAULT '1-1',
  	"vertical_align" "enum__gsections_v_blocks_columns_vertical_align" DEFAULT 'top',
  	"background" "enum__gsections_v_blocks_columns_background" DEFAULT 'none',
  	"section_space_top" "enum__gsections_v_blocks_columns_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_columns_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_columns_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_columns_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_columns_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"form_id" integer,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"section_space_top" "enum__gsections_v_blocks_form_block_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_form_block_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_form_block_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_form_block_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_form_block_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_newsletter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"text" varchar,
  	"mode" "enum__gsections_v_blocks_newsletter_mode" DEFAULT 'form',
  	"form_id" integer,
  	"embed_url" varchar,
  	"embed_title" varchar,
  	"embed_height" numeric DEFAULT 420,
  	"background" "enum__gsections_v_blocks_newsletter_background" DEFAULT 'none',
  	"align" "enum__gsections_v_blocks_newsletter_align" DEFAULT 'left',
  	"section_space_top" "enum__gsections_v_blocks_newsletter_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_newsletter_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_newsletter_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_newsletter_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_newsletter_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_site" "enum__gsections_v_version_site" DEFAULT 'main',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__gsections_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__gsections_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_gsections_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locale" "_locales",
  	"pages_id" integer,
  	"articles_id" integer,
  	"people_id" integer,
  	"documents_id" integer
  );
  
  CREATE TABLE "page_templates_blocks_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_page_templates_blocks_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_page_templates_blocks_hero_links_link_appearance" DEFAULT 'primary'
  );
  
  CREATE TABLE "page_templates_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_page_templates_blocks_hero_variant" DEFAULT 'text',
  	"eyebrow" varchar,
  	"eyebrow_highlight" varchar,
  	"heading" varchar,
  	"text" varchar,
  	"media_id" integer,
  	"align" "enum_page_templates_blocks_hero_align" DEFAULT 'left',
  	"section_space_top" "enum_page_templates_blocks_hero_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_hero_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_hero_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_hero_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_hero_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"width" "enum_page_templates_blocks_content_width" DEFAULT 'text',
  	"align" "enum_page_templates_blocks_content_align" DEFAULT 'left',
  	"background" "enum_page_templates_blocks_content_background" DEFAULT 'none',
  	"rich_text" jsonb,
  	"section_space_top" "enum_page_templates_blocks_content_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_content_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_content_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_content_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_content_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_text_image_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_page_templates_blocks_text_image_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_page_templates_blocks_text_image_links_link_appearance" DEFAULT 'primary'
  );
  
  CREATE TABLE "page_templates_blocks_text_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"rich_text" jsonb,
  	"image_id" integer NOT NULL,
  	"image_position" "enum_page_templates_blocks_text_image_image_position" DEFAULT 'left',
  	"layout" "enum_page_templates_blocks_text_image_layout" DEFAULT 'split',
  	"background" "enum_page_templates_blocks_text_image_background" DEFAULT 'none',
  	"section_space_top" "enum_page_templates_blocks_text_image_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_text_image_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_text_image_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_text_image_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_text_image_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_full_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar,
  	"size" "enum_page_templates_blocks_full_image_size" DEFAULT 'wide',
  	"section_space_top" "enum_page_templates_blocks_full_image_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_full_image_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_full_image_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_full_image_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_full_image_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_image_grid_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar
  );
  
  CREATE TABLE "page_templates_blocks_image_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"columns" "enum_page_templates_blocks_image_grid_columns" DEFAULT '3',
  	"background" "enum_page_templates_blocks_image_grid_background" DEFAULT 'none',
  	"section_space_top" "enum_page_templates_blocks_image_grid_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_image_grid_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_image_grid_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_image_grid_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_image_grid_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_cards_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"image_id" integer,
  	"link_type" "enum_page_templates_blocks_cards_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "page_templates_blocks_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"columns" "enum_page_templates_blocks_cards_columns" DEFAULT '3',
  	"background" "enum_page_templates_blocks_cards_background" DEFAULT 'none',
  	"align" "enum_page_templates_blocks_cards_align" DEFAULT 'left',
  	"section_space_top" "enum_page_templates_blocks_cards_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_cards_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_cards_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_cards_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_cards_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_child_pages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"parent_id" integer,
  	"depth" "enum_page_templates_blocks_child_pages_depth" DEFAULT '1',
  	"columns" "enum_page_templates_blocks_child_pages_columns" DEFAULT '3',
  	"background" "enum_page_templates_blocks_child_pages_background" DEFAULT 'none',
  	"section_space_top" "enum_page_templates_blocks_child_pages_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_child_pages_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_child_pages_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_child_pages_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_child_pages_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_page_templates_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_page_templates_blocks_cta_links_link_appearance" DEFAULT 'primary'
  );
  
  CREATE TABLE "page_templates_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"text" varchar,
  	"background" "enum_page_templates_blocks_cta_background" DEFAULT 'none',
  	"align" "enum_page_templates_blocks_cta_align" DEFAULT 'center',
  	"section_space_top" "enum_page_templates_blocks_cta_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_cta_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_cta_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_cta_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_cta_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar NOT NULL,
  	"author" varchar,
  	"role" varchar,
  	"image_id" integer,
  	"background" "enum_page_templates_blocks_quote_background" DEFAULT 'none',
  	"align" "enum_page_templates_blocks_quote_align" DEFAULT 'left',
  	"section_space_top" "enum_page_templates_blocks_quote_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_quote_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_quote_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_quote_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_quote_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "page_templates_blocks_stats_bars" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"percent" numeric NOT NULL
  );
  
  CREATE TABLE "page_templates_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"background" "enum_page_templates_blocks_stats_background" DEFAULT 'none',
  	"align" "enum_page_templates_blocks_stats_align" DEFAULT 'left',
  	"section_space_top" "enum_page_templates_blocks_stats_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_stats_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_stats_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_stats_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_stats_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_facts_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "page_templates_blocks_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"background" "enum_page_templates_blocks_facts_background" DEFAULT 'none',
  	"section_space_top" "enum_page_templates_blocks_facts_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_facts_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_facts_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_facts_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_facts_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_article_feed_sites" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_page_templates_blocks_article_feed_sites",
  	"locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "page_templates_blocks_article_feed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"kind" "enum_page_templates_blocks_article_feed_kind" DEFAULT 'all',
  	"limit" numeric DEFAULT 3,
  	"paginate" boolean DEFAULT false,
  	"background" "enum_page_templates_blocks_article_feed_background" DEFAULT 'none',
  	"section_space_top" "enum_page_templates_blocks_article_feed_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_article_feed_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_article_feed_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_article_feed_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_article_feed_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_people" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"layout" "enum_page_templates_blocks_people_layout" DEFAULT 'grid',
  	"background" "enum_page_templates_blocks_people_background" DEFAULT 'none',
  	"section_space_top" "enum_page_templates_blocks_people_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_people_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_people_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_people_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_people_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"background" "enum_page_templates_blocks_documents_background" DEFAULT 'none',
  	"section_space_top" "enum_page_templates_blocks_documents_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_documents_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_documents_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_documents_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_documents_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_timeline_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" varchar NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "page_templates_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"background" "enum_page_templates_blocks_timeline_background" DEFAULT 'none',
  	"section_space_top" "enum_page_templates_blocks_timeline_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_timeline_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_timeline_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_timeline_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_timeline_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_accordion_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"content" jsonb
  );
  
  CREATE TABLE "page_templates_blocks_accordion" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"background" "enum_page_templates_blocks_accordion_background" DEFAULT 'none',
  	"section_space_top" "enum_page_templates_blocks_accordion_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_accordion_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_accordion_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_accordion_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_accordion_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"url" varchar,
  	"file_id" integer,
  	"poster_id" integer,
  	"background" "enum_page_templates_blocks_video_background" DEFAULT 'none',
  	"section_space_top" "enum_page_templates_blocks_video_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_video_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_video_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_video_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_video_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"provider" "enum_page_templates_blocks_embed_provider" DEFAULT 'google-maps',
  	"url" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"height" numeric DEFAULT 480,
  	"section_space_top" "enum_page_templates_blocks_embed_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_embed_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_embed_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_embed_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_embed_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"content" jsonb
  );
  
  CREATE TABLE "page_templates_blocks_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"background" "enum_page_templates_blocks_tabs_background" DEFAULT 'none',
  	"section_space_top" "enum_page_templates_blocks_tabs_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_tabs_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_tabs_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_tabs_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_tabs_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_pricing_plans_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "page_templates_blocks_pricing_plans" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"highlighted" boolean DEFAULT false,
  	"badge" varchar,
  	"price" varchar NOT NULL,
  	"period" varchar,
  	"description" varchar,
  	"link_type" "enum_page_templates_blocks_pricing_plans_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_page_templates_blocks_pricing_plans_link_appearance" DEFAULT 'primary'
  );
  
  CREATE TABLE "page_templates_blocks_pricing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"background" "enum_page_templates_blocks_pricing_background" DEFAULT 'none',
  	"align" "enum_page_templates_blocks_pricing_align" DEFAULT 'left',
  	"section_space_top" "enum_page_templates_blocks_pricing_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_pricing_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_pricing_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_pricing_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_pricing_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_logo_wall_logos" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"link_type" "enum_page_templates_blocks_logo_wall_logos_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "page_templates_blocks_logo_wall" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"background" "enum_page_templates_blocks_logo_wall_background" DEFAULT 'none',
  	"align" "enum_page_templates_blocks_logo_wall_align" DEFAULT 'left',
  	"section_space_top" "enum_page_templates_blocks_logo_wall_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_logo_wall_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_logo_wall_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_logo_wall_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_logo_wall_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar NOT NULL,
  	"author" varchar,
  	"role" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "page_templates_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"columns" "enum_page_templates_blocks_testimonials_columns" DEFAULT '2',
  	"background" "enum_page_templates_blocks_testimonials_background" DEFAULT 'none',
  	"align" "enum_page_templates_blocks_testimonials_align" DEFAULT 'left',
  	"section_space_top" "enum_page_templates_blocks_testimonials_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_testimonials_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_testimonials_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_testimonials_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_testimonials_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"heading" varchar,
  	"text" varchar,
  	"link_type" "enum_page_templates_blocks_carousel_slides_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "page_templates_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"autoplay" boolean DEFAULT false,
  	"interval" numeric DEFAULT 6,
  	"background" "enum_page_templates_blocks_carousel_background" DEFAULT 'none',
  	"section_space_top" "enum_page_templates_blocks_carousel_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_carousel_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_carousel_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_carousel_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_carousel_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_table_header" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "page_templates_blocks_table_rows_cells" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "page_templates_blocks_table_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "page_templates_blocks_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"caption" varchar NOT NULL,
  	"row_headers" boolean DEFAULT false,
  	"background" "enum_page_templates_blocks_table_background" DEFAULT 'none',
  	"section_space_top" "enum_page_templates_blocks_table_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_table_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_table_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_table_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_table_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_contact_card_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"days" varchar NOT NULL,
  	"time" varchar NOT NULL
  );
  
  CREATE TABLE "page_templates_blocks_contact_card" (
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
  	"background" "enum_page_templates_blocks_contact_card_background" DEFAULT 'none',
  	"section_space_top" "enum_page_templates_blocks_contact_card_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_contact_card_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_contact_card_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_contact_card_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_contact_card_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_icon_features_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_page_templates_blocks_icon_features_items_icon" DEFAULT 'check',
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"link_type" "enum_page_templates_blocks_icon_features_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "page_templates_blocks_icon_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"columns" "enum_page_templates_blocks_icon_features_columns" DEFAULT '3',
  	"background" "enum_page_templates_blocks_icon_features_background" DEFAULT 'none',
  	"align" "enum_page_templates_blocks_icon_features_align" DEFAULT 'left',
  	"section_space_top" "enum_page_templates_blocks_icon_features_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_icon_features_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_icon_features_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_icon_features_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_icon_features_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_page_templates_blocks_banner_variant" DEFAULT 'info',
  	"title" varchar,
  	"text" varchar NOT NULL,
  	"link_type" "enum_page_templates_blocks_banner_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"section_space_top" "enum_page_templates_blocks_banner_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_banner_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_banner_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_banner_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_banner_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_button_group_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_page_templates_blocks_button_group_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_page_templates_blocks_button_group_links_link_appearance" DEFAULT 'primary'
  );
  
  CREATE TABLE "page_templates_blocks_button_group" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"justify" "enum_page_templates_blocks_button_group_justify" DEFAULT 'left',
  	"background" "enum_page_templates_blocks_button_group_background" DEFAULT 'none',
  	"section_space_top" "enum_page_templates_blocks_button_group_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_button_group_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_button_group_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_button_group_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_button_group_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_divider" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_page_templates_blocks_divider_kind" DEFAULT 'line',
  	"size" "enum_page_templates_blocks_divider_size" DEFAULT 'm',
  	"section_space_top" "enum_page_templates_blocks_divider_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_divider_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_divider_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_divider_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_divider_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_columns_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "page_templates_blocks_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_page_templates_blocks_columns_layout" DEFAULT '1-1',
  	"vertical_align" "enum_page_templates_blocks_columns_vertical_align" DEFAULT 'top',
  	"background" "enum_page_templates_blocks_columns_background" DEFAULT 'none',
  	"section_space_top" "enum_page_templates_blocks_columns_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_columns_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_columns_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_columns_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_columns_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form_id" integer NOT NULL,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"section_space_top" "enum_page_templates_blocks_form_block_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_form_block_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_form_block_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_form_block_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_form_block_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_newsletter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"text" varchar,
  	"mode" "enum_page_templates_blocks_newsletter_mode" DEFAULT 'form',
  	"form_id" integer,
  	"embed_url" varchar,
  	"embed_title" varchar,
  	"embed_height" numeric DEFAULT 420,
  	"background" "enum_page_templates_blocks_newsletter_background" DEFAULT 'none',
  	"align" "enum_page_templates_blocks_newsletter_align" DEFAULT 'left',
  	"section_space_top" "enum_page_templates_blocks_newsletter_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_newsletter_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_newsletter_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_newsletter_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_newsletter_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_global_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"global_section_id" integer NOT NULL,
  	"section_space_top" "enum_page_templates_blocks_global_section_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_global_section_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_global_section_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_global_section_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_global_section_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"site" "enum_page_templates_site" DEFAULT 'main' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "page_templates_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locale" "_locales",
  	"pages_id" integer,
  	"articles_id" integer,
  	"people_id" integer,
  	"documents_id" integer
  );
  
  CREATE TABLE "section_presets_blocks_hero_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_section_presets_blocks_hero_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_section_presets_blocks_hero_links_link_appearance" DEFAULT 'primary'
  );
  
  CREATE TABLE "section_presets_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_section_presets_blocks_hero_variant" DEFAULT 'text',
  	"eyebrow" varchar,
  	"eyebrow_highlight" varchar,
  	"heading" varchar,
  	"text" varchar,
  	"media_id" integer,
  	"align" "enum_section_presets_blocks_hero_align" DEFAULT 'left',
  	"section_space_top" "enum_section_presets_blocks_hero_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_hero_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_hero_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_hero_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_hero_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"width" "enum_section_presets_blocks_content_width" DEFAULT 'text',
  	"align" "enum_section_presets_blocks_content_align" DEFAULT 'left',
  	"background" "enum_section_presets_blocks_content_background" DEFAULT 'none',
  	"rich_text" jsonb,
  	"section_space_top" "enum_section_presets_blocks_content_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_content_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_content_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_content_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_content_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_text_image_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_section_presets_blocks_text_image_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_section_presets_blocks_text_image_links_link_appearance" DEFAULT 'primary'
  );
  
  CREATE TABLE "section_presets_blocks_text_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"rich_text" jsonb,
  	"image_id" integer NOT NULL,
  	"image_position" "enum_section_presets_blocks_text_image_image_position" DEFAULT 'left',
  	"layout" "enum_section_presets_blocks_text_image_layout" DEFAULT 'split',
  	"background" "enum_section_presets_blocks_text_image_background" DEFAULT 'none',
  	"section_space_top" "enum_section_presets_blocks_text_image_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_text_image_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_text_image_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_text_image_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_text_image_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_full_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar,
  	"size" "enum_section_presets_blocks_full_image_size" DEFAULT 'wide',
  	"section_space_top" "enum_section_presets_blocks_full_image_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_full_image_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_full_image_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_full_image_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_full_image_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_image_grid_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar
  );
  
  CREATE TABLE "section_presets_blocks_image_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"columns" "enum_section_presets_blocks_image_grid_columns" DEFAULT '3',
  	"background" "enum_section_presets_blocks_image_grid_background" DEFAULT 'none',
  	"section_space_top" "enum_section_presets_blocks_image_grid_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_image_grid_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_image_grid_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_image_grid_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_image_grid_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_cards_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"image_id" integer,
  	"link_type" "enum_section_presets_blocks_cards_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "section_presets_blocks_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"columns" "enum_section_presets_blocks_cards_columns" DEFAULT '3',
  	"background" "enum_section_presets_blocks_cards_background" DEFAULT 'none',
  	"align" "enum_section_presets_blocks_cards_align" DEFAULT 'left',
  	"section_space_top" "enum_section_presets_blocks_cards_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_cards_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_cards_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_cards_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_cards_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_child_pages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"parent_id" integer,
  	"depth" "enum_section_presets_blocks_child_pages_depth" DEFAULT '1',
  	"columns" "enum_section_presets_blocks_child_pages_columns" DEFAULT '3',
  	"background" "enum_section_presets_blocks_child_pages_background" DEFAULT 'none',
  	"section_space_top" "enum_section_presets_blocks_child_pages_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_child_pages_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_child_pages_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_child_pages_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_child_pages_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_section_presets_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_section_presets_blocks_cta_links_link_appearance" DEFAULT 'primary'
  );
  
  CREATE TABLE "section_presets_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"text" varchar,
  	"background" "enum_section_presets_blocks_cta_background" DEFAULT 'none',
  	"align" "enum_section_presets_blocks_cta_align" DEFAULT 'center',
  	"section_space_top" "enum_section_presets_blocks_cta_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_cta_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_cta_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_cta_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_cta_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar NOT NULL,
  	"author" varchar,
  	"role" varchar,
  	"image_id" integer,
  	"background" "enum_section_presets_blocks_quote_background" DEFAULT 'none',
  	"align" "enum_section_presets_blocks_quote_align" DEFAULT 'left',
  	"section_space_top" "enum_section_presets_blocks_quote_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_quote_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_quote_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_quote_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_quote_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_stats_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "section_presets_blocks_stats_bars" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"percent" numeric NOT NULL
  );
  
  CREATE TABLE "section_presets_blocks_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"background" "enum_section_presets_blocks_stats_background" DEFAULT 'none',
  	"align" "enum_section_presets_blocks_stats_align" DEFAULT 'left',
  	"section_space_top" "enum_section_presets_blocks_stats_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_stats_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_stats_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_stats_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_stats_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_facts_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "section_presets_blocks_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"background" "enum_section_presets_blocks_facts_background" DEFAULT 'none',
  	"section_space_top" "enum_section_presets_blocks_facts_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_facts_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_facts_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_facts_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_facts_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_article_feed_sites" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_section_presets_blocks_article_feed_sites",
  	"locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "section_presets_blocks_article_feed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"kind" "enum_section_presets_blocks_article_feed_kind" DEFAULT 'all',
  	"limit" numeric DEFAULT 3,
  	"paginate" boolean DEFAULT false,
  	"background" "enum_section_presets_blocks_article_feed_background" DEFAULT 'none',
  	"section_space_top" "enum_section_presets_blocks_article_feed_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_article_feed_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_article_feed_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_article_feed_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_article_feed_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_people" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"layout" "enum_section_presets_blocks_people_layout" DEFAULT 'grid',
  	"background" "enum_section_presets_blocks_people_background" DEFAULT 'none',
  	"section_space_top" "enum_section_presets_blocks_people_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_people_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_people_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_people_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_people_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"background" "enum_section_presets_blocks_documents_background" DEFAULT 'none',
  	"section_space_top" "enum_section_presets_blocks_documents_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_documents_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_documents_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_documents_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_documents_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_timeline_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"year" varchar NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "section_presets_blocks_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"background" "enum_section_presets_blocks_timeline_background" DEFAULT 'none',
  	"section_space_top" "enum_section_presets_blocks_timeline_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_timeline_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_timeline_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_timeline_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_timeline_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_accordion_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"content" jsonb
  );
  
  CREATE TABLE "section_presets_blocks_accordion" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"background" "enum_section_presets_blocks_accordion_background" DEFAULT 'none',
  	"section_space_top" "enum_section_presets_blocks_accordion_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_accordion_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_accordion_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_accordion_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_accordion_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"url" varchar,
  	"file_id" integer,
  	"poster_id" integer,
  	"background" "enum_section_presets_blocks_video_background" DEFAULT 'none',
  	"section_space_top" "enum_section_presets_blocks_video_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_video_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_video_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_video_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_video_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"provider" "enum_section_presets_blocks_embed_provider" DEFAULT 'google-maps',
  	"url" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"height" numeric DEFAULT 480,
  	"section_space_top" "enum_section_presets_blocks_embed_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_embed_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_embed_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_embed_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_embed_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_tabs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"content" jsonb
  );
  
  CREATE TABLE "section_presets_blocks_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"background" "enum_section_presets_blocks_tabs_background" DEFAULT 'none',
  	"section_space_top" "enum_section_presets_blocks_tabs_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_tabs_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_tabs_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_tabs_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_tabs_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_pricing_plans_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "section_presets_blocks_pricing_plans" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"highlighted" boolean DEFAULT false,
  	"badge" varchar,
  	"price" varchar NOT NULL,
  	"period" varchar,
  	"description" varchar,
  	"link_type" "enum_section_presets_blocks_pricing_plans_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_section_presets_blocks_pricing_plans_link_appearance" DEFAULT 'primary'
  );
  
  CREATE TABLE "section_presets_blocks_pricing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"background" "enum_section_presets_blocks_pricing_background" DEFAULT 'none',
  	"align" "enum_section_presets_blocks_pricing_align" DEFAULT 'left',
  	"section_space_top" "enum_section_presets_blocks_pricing_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_pricing_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_pricing_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_pricing_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_pricing_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_logo_wall_logos" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"name" varchar NOT NULL,
  	"link_type" "enum_section_presets_blocks_logo_wall_logos_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "section_presets_blocks_logo_wall" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"background" "enum_section_presets_blocks_logo_wall_background" DEFAULT 'none',
  	"align" "enum_section_presets_blocks_logo_wall_align" DEFAULT 'left',
  	"section_space_top" "enum_section_presets_blocks_logo_wall_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_logo_wall_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_logo_wall_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_logo_wall_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_logo_wall_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_testimonials_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar NOT NULL,
  	"author" varchar,
  	"role" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "section_presets_blocks_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"columns" "enum_section_presets_blocks_testimonials_columns" DEFAULT '2',
  	"background" "enum_section_presets_blocks_testimonials_background" DEFAULT 'none',
  	"align" "enum_section_presets_blocks_testimonials_align" DEFAULT 'left',
  	"section_space_top" "enum_section_presets_blocks_testimonials_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_testimonials_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_testimonials_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_testimonials_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_testimonials_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_carousel_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"heading" varchar,
  	"text" varchar,
  	"link_type" "enum_section_presets_blocks_carousel_slides_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "section_presets_blocks_carousel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"autoplay" boolean DEFAULT false,
  	"interval" numeric DEFAULT 6,
  	"background" "enum_section_presets_blocks_carousel_background" DEFAULT 'none',
  	"section_space_top" "enum_section_presets_blocks_carousel_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_carousel_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_carousel_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_carousel_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_carousel_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_table_header" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "section_presets_blocks_table_rows_cells" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "section_presets_blocks_table_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "section_presets_blocks_table" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"caption" varchar NOT NULL,
  	"row_headers" boolean DEFAULT false,
  	"background" "enum_section_presets_blocks_table_background" DEFAULT 'none',
  	"section_space_top" "enum_section_presets_blocks_table_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_table_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_table_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_table_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_table_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_contact_card_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"days" varchar NOT NULL,
  	"time" varchar NOT NULL
  );
  
  CREATE TABLE "section_presets_blocks_contact_card" (
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
  	"background" "enum_section_presets_blocks_contact_card_background" DEFAULT 'none',
  	"section_space_top" "enum_section_presets_blocks_contact_card_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_contact_card_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_contact_card_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_contact_card_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_contact_card_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_icon_features_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_section_presets_blocks_icon_features_items_icon" DEFAULT 'check',
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"link_type" "enum_section_presets_blocks_icon_features_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "section_presets_blocks_icon_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"intro" varchar,
  	"columns" "enum_section_presets_blocks_icon_features_columns" DEFAULT '3',
  	"background" "enum_section_presets_blocks_icon_features_background" DEFAULT 'none',
  	"align" "enum_section_presets_blocks_icon_features_align" DEFAULT 'left',
  	"section_space_top" "enum_section_presets_blocks_icon_features_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_icon_features_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_icon_features_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_icon_features_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_icon_features_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_section_presets_blocks_banner_variant" DEFAULT 'info',
  	"title" varchar,
  	"text" varchar NOT NULL,
  	"link_type" "enum_section_presets_blocks_banner_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"section_space_top" "enum_section_presets_blocks_banner_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_banner_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_banner_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_banner_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_banner_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_button_group_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_section_presets_blocks_button_group_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_section_presets_blocks_button_group_links_link_appearance" DEFAULT 'primary'
  );
  
  CREATE TABLE "section_presets_blocks_button_group" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"justify" "enum_section_presets_blocks_button_group_justify" DEFAULT 'left',
  	"background" "enum_section_presets_blocks_button_group_background" DEFAULT 'none',
  	"section_space_top" "enum_section_presets_blocks_button_group_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_button_group_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_button_group_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_button_group_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_button_group_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_divider" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_section_presets_blocks_divider_kind" DEFAULT 'line',
  	"size" "enum_section_presets_blocks_divider_size" DEFAULT 'm',
  	"section_space_top" "enum_section_presets_blocks_divider_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_divider_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_divider_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_divider_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_divider_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_columns_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "section_presets_blocks_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"layout" "enum_section_presets_blocks_columns_layout" DEFAULT '1-1',
  	"vertical_align" "enum_section_presets_blocks_columns_vertical_align" DEFAULT 'top',
  	"background" "enum_section_presets_blocks_columns_background" DEFAULT 'none',
  	"section_space_top" "enum_section_presets_blocks_columns_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_columns_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_columns_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_columns_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_columns_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_form_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"form_id" integer NOT NULL,
  	"enable_intro" boolean,
  	"intro_content" jsonb,
  	"section_space_top" "enum_section_presets_blocks_form_block_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_form_block_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_form_block_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_form_block_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_form_block_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_newsletter" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"text" varchar,
  	"mode" "enum_section_presets_blocks_newsletter_mode" DEFAULT 'form',
  	"form_id" integer,
  	"embed_url" varchar,
  	"embed_title" varchar,
  	"embed_height" numeric DEFAULT 420,
  	"background" "enum_section_presets_blocks_newsletter_background" DEFAULT 'none',
  	"align" "enum_section_presets_blocks_newsletter_align" DEFAULT 'left',
  	"section_space_top" "enum_section_presets_blocks_newsletter_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_newsletter_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_newsletter_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_newsletter_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_newsletter_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_global_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"global_section_id" integer NOT NULL,
  	"section_space_top" "enum_section_presets_blocks_global_section_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_global_section_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_global_section_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_global_section_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_global_section_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"site" "enum_section_presets_site" DEFAULT 'main' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "section_presets_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"locale" "_locales",
  	"pages_id" integer,
  	"articles_id" integer,
  	"people_id" integer,
  	"documents_id" integer
  );
  
  ALTER TABLE "pages" ADD COLUMN "template_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_template_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "gsections_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "page_templates_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "section_presets_id" integer;
  ALTER TABLE "pages_blocks_global_section" ADD CONSTRAINT "pages_blocks_global_section_global_section_id_gsections_id_fk" FOREIGN KEY ("global_section_id") REFERENCES "public"."gsections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_global_section" ADD CONSTRAINT "pages_blocks_global_section_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_global_section" ADD CONSTRAINT "pages_blocks_global_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_preset" ADD CONSTRAINT "pages_blocks_preset_preset_id_section_presets_id_fk" FOREIGN KEY ("preset_id") REFERENCES "public"."section_presets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_preset" ADD CONSTRAINT "pages_blocks_preset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_global_section" ADD CONSTRAINT "_pages_v_blocks_global_section_global_section_id_gsections_id_fk" FOREIGN KEY ("global_section_id") REFERENCES "public"."gsections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_global_section" ADD CONSTRAINT "_pages_v_blocks_global_section_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_global_section" ADD CONSTRAINT "_pages_v_blocks_global_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_preset" ADD CONSTRAINT "_pages_v_blocks_preset_preset_id_section_presets_id_fk" FOREIGN KEY ("preset_id") REFERENCES "public"."section_presets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_preset" ADD CONSTRAINT "_pages_v_blocks_preset_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_hero_links" ADD CONSTRAINT "gsections_blocks_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_hero" ADD CONSTRAINT "gsections_blocks_hero_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_hero" ADD CONSTRAINT "gsections_blocks_hero_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_hero" ADD CONSTRAINT "gsections_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_content" ADD CONSTRAINT "gsections_blocks_content_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_content" ADD CONSTRAINT "gsections_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_text_image_links" ADD CONSTRAINT "gsections_blocks_text_image_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections_blocks_text_image"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_text_image" ADD CONSTRAINT "gsections_blocks_text_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_text_image" ADD CONSTRAINT "gsections_blocks_text_image_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_text_image" ADD CONSTRAINT "gsections_blocks_text_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_full_image" ADD CONSTRAINT "gsections_blocks_full_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_full_image" ADD CONSTRAINT "gsections_blocks_full_image_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_full_image" ADD CONSTRAINT "gsections_blocks_full_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_image_grid_images" ADD CONSTRAINT "gsections_blocks_image_grid_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_image_grid_images" ADD CONSTRAINT "gsections_blocks_image_grid_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections_blocks_image_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_image_grid" ADD CONSTRAINT "gsections_blocks_image_grid_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_image_grid" ADD CONSTRAINT "gsections_blocks_image_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_cards_items" ADD CONSTRAINT "gsections_blocks_cards_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_cards_items" ADD CONSTRAINT "gsections_blocks_cards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections_blocks_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_cards" ADD CONSTRAINT "gsections_blocks_cards_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_cards" ADD CONSTRAINT "gsections_blocks_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_child_pages" ADD CONSTRAINT "gsections_blocks_child_pages_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_child_pages" ADD CONSTRAINT "gsections_blocks_child_pages_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_child_pages" ADD CONSTRAINT "gsections_blocks_child_pages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_cta_links" ADD CONSTRAINT "gsections_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_cta" ADD CONSTRAINT "gsections_blocks_cta_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_cta" ADD CONSTRAINT "gsections_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_quote" ADD CONSTRAINT "gsections_blocks_quote_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_quote" ADD CONSTRAINT "gsections_blocks_quote_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_quote" ADD CONSTRAINT "gsections_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_stats_items" ADD CONSTRAINT "gsections_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_stats_bars" ADD CONSTRAINT "gsections_blocks_stats_bars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_stats" ADD CONSTRAINT "gsections_blocks_stats_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_stats" ADD CONSTRAINT "gsections_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_facts_items" ADD CONSTRAINT "gsections_blocks_facts_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections_blocks_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_facts" ADD CONSTRAINT "gsections_blocks_facts_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_facts" ADD CONSTRAINT "gsections_blocks_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_article_feed_sites" ADD CONSTRAINT "gsections_blocks_article_feed_sites_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."gsections_blocks_article_feed"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_article_feed" ADD CONSTRAINT "gsections_blocks_article_feed_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_article_feed" ADD CONSTRAINT "gsections_blocks_article_feed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_people" ADD CONSTRAINT "gsections_blocks_people_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_people" ADD CONSTRAINT "gsections_blocks_people_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_documents" ADD CONSTRAINT "gsections_blocks_documents_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_documents" ADD CONSTRAINT "gsections_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_timeline_items" ADD CONSTRAINT "gsections_blocks_timeline_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_timeline_items" ADD CONSTRAINT "gsections_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_timeline" ADD CONSTRAINT "gsections_blocks_timeline_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_timeline" ADD CONSTRAINT "gsections_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_accordion_items" ADD CONSTRAINT "gsections_blocks_accordion_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections_blocks_accordion"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_accordion" ADD CONSTRAINT "gsections_blocks_accordion_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_accordion" ADD CONSTRAINT "gsections_blocks_accordion_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_video" ADD CONSTRAINT "gsections_blocks_video_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_video" ADD CONSTRAINT "gsections_blocks_video_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_video" ADD CONSTRAINT "gsections_blocks_video_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_video" ADD CONSTRAINT "gsections_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_embed" ADD CONSTRAINT "gsections_blocks_embed_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_embed" ADD CONSTRAINT "gsections_blocks_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_tabs_items" ADD CONSTRAINT "gsections_blocks_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_tabs" ADD CONSTRAINT "gsections_blocks_tabs_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_tabs" ADD CONSTRAINT "gsections_blocks_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_pricing_plans_features" ADD CONSTRAINT "gsections_blocks_pricing_plans_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections_blocks_pricing_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_pricing_plans" ADD CONSTRAINT "gsections_blocks_pricing_plans_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections_blocks_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_pricing" ADD CONSTRAINT "gsections_blocks_pricing_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_pricing" ADD CONSTRAINT "gsections_blocks_pricing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_logo_wall_logos" ADD CONSTRAINT "gsections_blocks_logo_wall_logos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_logo_wall_logos" ADD CONSTRAINT "gsections_blocks_logo_wall_logos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections_blocks_logo_wall"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_logo_wall" ADD CONSTRAINT "gsections_blocks_logo_wall_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_logo_wall" ADD CONSTRAINT "gsections_blocks_logo_wall_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_testimonials_items" ADD CONSTRAINT "gsections_blocks_testimonials_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_testimonials_items" ADD CONSTRAINT "gsections_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_testimonials" ADD CONSTRAINT "gsections_blocks_testimonials_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_testimonials" ADD CONSTRAINT "gsections_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_carousel_slides" ADD CONSTRAINT "gsections_blocks_carousel_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_carousel_slides" ADD CONSTRAINT "gsections_blocks_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_carousel" ADD CONSTRAINT "gsections_blocks_carousel_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_carousel" ADD CONSTRAINT "gsections_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_table_header" ADD CONSTRAINT "gsections_blocks_table_header_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections_blocks_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_table_rows_cells" ADD CONSTRAINT "gsections_blocks_table_rows_cells_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections_blocks_table_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_table_rows" ADD CONSTRAINT "gsections_blocks_table_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections_blocks_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_table" ADD CONSTRAINT "gsections_blocks_table_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_table" ADD CONSTRAINT "gsections_blocks_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_contact_card_hours" ADD CONSTRAINT "gsections_blocks_contact_card_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections_blocks_contact_card"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_contact_card" ADD CONSTRAINT "gsections_blocks_contact_card_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_contact_card" ADD CONSTRAINT "gsections_blocks_contact_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_icon_features_items" ADD CONSTRAINT "gsections_blocks_icon_features_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections_blocks_icon_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_icon_features" ADD CONSTRAINT "gsections_blocks_icon_features_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_icon_features" ADD CONSTRAINT "gsections_blocks_icon_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_banner" ADD CONSTRAINT "gsections_blocks_banner_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_banner" ADD CONSTRAINT "gsections_blocks_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_button_group_links" ADD CONSTRAINT "gsections_blocks_button_group_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections_blocks_button_group"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_button_group" ADD CONSTRAINT "gsections_blocks_button_group_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_button_group" ADD CONSTRAINT "gsections_blocks_button_group_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_divider" ADD CONSTRAINT "gsections_blocks_divider_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_divider" ADD CONSTRAINT "gsections_blocks_divider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_columns_columns" ADD CONSTRAINT "gsections_blocks_columns_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections_blocks_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_columns" ADD CONSTRAINT "gsections_blocks_columns_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_columns" ADD CONSTRAINT "gsections_blocks_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_form_block" ADD CONSTRAINT "gsections_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_form_block" ADD CONSTRAINT "gsections_blocks_form_block_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_form_block" ADD CONSTRAINT "gsections_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_newsletter" ADD CONSTRAINT "gsections_blocks_newsletter_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_newsletter" ADD CONSTRAINT "gsections_blocks_newsletter_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_newsletter" ADD CONSTRAINT "gsections_blocks_newsletter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_rels" ADD CONSTRAINT "gsections_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_rels" ADD CONSTRAINT "gsections_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_rels" ADD CONSTRAINT "gsections_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_rels" ADD CONSTRAINT "gsections_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_rels" ADD CONSTRAINT "gsections_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_hero_links" ADD CONSTRAINT "_gsections_v_blocks_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_hero" ADD CONSTRAINT "_gsections_v_blocks_hero_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_hero" ADD CONSTRAINT "_gsections_v_blocks_hero_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_hero" ADD CONSTRAINT "_gsections_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_content" ADD CONSTRAINT "_gsections_v_blocks_content_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_content" ADD CONSTRAINT "_gsections_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_text_image_links" ADD CONSTRAINT "_gsections_v_blocks_text_image_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v_blocks_text_image"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_text_image" ADD CONSTRAINT "_gsections_v_blocks_text_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_text_image" ADD CONSTRAINT "_gsections_v_blocks_text_image_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_text_image" ADD CONSTRAINT "_gsections_v_blocks_text_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_full_image" ADD CONSTRAINT "_gsections_v_blocks_full_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_full_image" ADD CONSTRAINT "_gsections_v_blocks_full_image_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_full_image" ADD CONSTRAINT "_gsections_v_blocks_full_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_image_grid_images" ADD CONSTRAINT "_gsections_v_blocks_image_grid_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_image_grid_images" ADD CONSTRAINT "_gsections_v_blocks_image_grid_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v_blocks_image_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_image_grid" ADD CONSTRAINT "_gsections_v_blocks_image_grid_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_image_grid" ADD CONSTRAINT "_gsections_v_blocks_image_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_cards_items" ADD CONSTRAINT "_gsections_v_blocks_cards_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_cards_items" ADD CONSTRAINT "_gsections_v_blocks_cards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v_blocks_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_cards" ADD CONSTRAINT "_gsections_v_blocks_cards_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_cards" ADD CONSTRAINT "_gsections_v_blocks_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_child_pages" ADD CONSTRAINT "_gsections_v_blocks_child_pages_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_child_pages" ADD CONSTRAINT "_gsections_v_blocks_child_pages_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_child_pages" ADD CONSTRAINT "_gsections_v_blocks_child_pages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_cta_links" ADD CONSTRAINT "_gsections_v_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_cta" ADD CONSTRAINT "_gsections_v_blocks_cta_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_cta" ADD CONSTRAINT "_gsections_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_quote" ADD CONSTRAINT "_gsections_v_blocks_quote_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_quote" ADD CONSTRAINT "_gsections_v_blocks_quote_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_quote" ADD CONSTRAINT "_gsections_v_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_stats_items" ADD CONSTRAINT "_gsections_v_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_stats_bars" ADD CONSTRAINT "_gsections_v_blocks_stats_bars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_stats" ADD CONSTRAINT "_gsections_v_blocks_stats_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_stats" ADD CONSTRAINT "_gsections_v_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_facts_items" ADD CONSTRAINT "_gsections_v_blocks_facts_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v_blocks_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_facts" ADD CONSTRAINT "_gsections_v_blocks_facts_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_facts" ADD CONSTRAINT "_gsections_v_blocks_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_article_feed_sites" ADD CONSTRAINT "_gsections_v_blocks_article_feed_sites_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_gsections_v_blocks_article_feed"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_article_feed" ADD CONSTRAINT "_gsections_v_blocks_article_feed_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_article_feed" ADD CONSTRAINT "_gsections_v_blocks_article_feed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_people" ADD CONSTRAINT "_gsections_v_blocks_people_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_people" ADD CONSTRAINT "_gsections_v_blocks_people_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_documents" ADD CONSTRAINT "_gsections_v_blocks_documents_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_documents" ADD CONSTRAINT "_gsections_v_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_timeline_items" ADD CONSTRAINT "_gsections_v_blocks_timeline_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_timeline_items" ADD CONSTRAINT "_gsections_v_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_timeline" ADD CONSTRAINT "_gsections_v_blocks_timeline_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_timeline" ADD CONSTRAINT "_gsections_v_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_accordion_items" ADD CONSTRAINT "_gsections_v_blocks_accordion_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v_blocks_accordion"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_accordion" ADD CONSTRAINT "_gsections_v_blocks_accordion_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_accordion" ADD CONSTRAINT "_gsections_v_blocks_accordion_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_video" ADD CONSTRAINT "_gsections_v_blocks_video_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_video" ADD CONSTRAINT "_gsections_v_blocks_video_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_video" ADD CONSTRAINT "_gsections_v_blocks_video_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_video" ADD CONSTRAINT "_gsections_v_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_embed" ADD CONSTRAINT "_gsections_v_blocks_embed_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_embed" ADD CONSTRAINT "_gsections_v_blocks_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_tabs_items" ADD CONSTRAINT "_gsections_v_blocks_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_tabs" ADD CONSTRAINT "_gsections_v_blocks_tabs_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_tabs" ADD CONSTRAINT "_gsections_v_blocks_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_pricing_plans_features" ADD CONSTRAINT "_gsections_v_blocks_pricing_plans_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v_blocks_pricing_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_pricing_plans" ADD CONSTRAINT "_gsections_v_blocks_pricing_plans_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v_blocks_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_pricing" ADD CONSTRAINT "_gsections_v_blocks_pricing_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_pricing" ADD CONSTRAINT "_gsections_v_blocks_pricing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_logo_wall_logos" ADD CONSTRAINT "_gsections_v_blocks_logo_wall_logos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_logo_wall_logos" ADD CONSTRAINT "_gsections_v_blocks_logo_wall_logos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v_blocks_logo_wall"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_logo_wall" ADD CONSTRAINT "_gsections_v_blocks_logo_wall_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_logo_wall" ADD CONSTRAINT "_gsections_v_blocks_logo_wall_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_testimonials_items" ADD CONSTRAINT "_gsections_v_blocks_testimonials_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_testimonials_items" ADD CONSTRAINT "_gsections_v_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_testimonials" ADD CONSTRAINT "_gsections_v_blocks_testimonials_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_testimonials" ADD CONSTRAINT "_gsections_v_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_carousel_slides" ADD CONSTRAINT "_gsections_v_blocks_carousel_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_carousel_slides" ADD CONSTRAINT "_gsections_v_blocks_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_carousel" ADD CONSTRAINT "_gsections_v_blocks_carousel_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_carousel" ADD CONSTRAINT "_gsections_v_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_table_header" ADD CONSTRAINT "_gsections_v_blocks_table_header_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v_blocks_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_table_rows_cells" ADD CONSTRAINT "_gsections_v_blocks_table_rows_cells_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v_blocks_table_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_table_rows" ADD CONSTRAINT "_gsections_v_blocks_table_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v_blocks_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_table" ADD CONSTRAINT "_gsections_v_blocks_table_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_table" ADD CONSTRAINT "_gsections_v_blocks_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_contact_card_hours" ADD CONSTRAINT "_gsections_v_blocks_contact_card_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v_blocks_contact_card"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_contact_card" ADD CONSTRAINT "_gsections_v_blocks_contact_card_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_contact_card" ADD CONSTRAINT "_gsections_v_blocks_contact_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_icon_features_items" ADD CONSTRAINT "_gsections_v_blocks_icon_features_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v_blocks_icon_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_icon_features" ADD CONSTRAINT "_gsections_v_blocks_icon_features_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_icon_features" ADD CONSTRAINT "_gsections_v_blocks_icon_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_banner" ADD CONSTRAINT "_gsections_v_blocks_banner_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_banner" ADD CONSTRAINT "_gsections_v_blocks_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_button_group_links" ADD CONSTRAINT "_gsections_v_blocks_button_group_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v_blocks_button_group"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_button_group" ADD CONSTRAINT "_gsections_v_blocks_button_group_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_button_group" ADD CONSTRAINT "_gsections_v_blocks_button_group_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_divider" ADD CONSTRAINT "_gsections_v_blocks_divider_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_divider" ADD CONSTRAINT "_gsections_v_blocks_divider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_columns_columns" ADD CONSTRAINT "_gsections_v_blocks_columns_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v_blocks_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_columns" ADD CONSTRAINT "_gsections_v_blocks_columns_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_columns" ADD CONSTRAINT "_gsections_v_blocks_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_form_block" ADD CONSTRAINT "_gsections_v_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_form_block" ADD CONSTRAINT "_gsections_v_blocks_form_block_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_form_block" ADD CONSTRAINT "_gsections_v_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_newsletter" ADD CONSTRAINT "_gsections_v_blocks_newsletter_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_newsletter" ADD CONSTRAINT "_gsections_v_blocks_newsletter_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_newsletter" ADD CONSTRAINT "_gsections_v_blocks_newsletter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v" ADD CONSTRAINT "_gsections_v_parent_id_gsections_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."gsections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_rels" ADD CONSTRAINT "_gsections_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_rels" ADD CONSTRAINT "_gsections_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_rels" ADD CONSTRAINT "_gsections_v_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_rels" ADD CONSTRAINT "_gsections_v_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_rels" ADD CONSTRAINT "_gsections_v_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_hero_links" ADD CONSTRAINT "page_templates_blocks_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_hero" ADD CONSTRAINT "page_templates_blocks_hero_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_hero" ADD CONSTRAINT "page_templates_blocks_hero_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_hero" ADD CONSTRAINT "page_templates_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_content" ADD CONSTRAINT "page_templates_blocks_content_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_content" ADD CONSTRAINT "page_templates_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_text_image_links" ADD CONSTRAINT "page_templates_blocks_text_image_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_text_image"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_text_image" ADD CONSTRAINT "page_templates_blocks_text_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_text_image" ADD CONSTRAINT "page_templates_blocks_text_image_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_text_image" ADD CONSTRAINT "page_templates_blocks_text_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_full_image" ADD CONSTRAINT "page_templates_blocks_full_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_full_image" ADD CONSTRAINT "page_templates_blocks_full_image_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_full_image" ADD CONSTRAINT "page_templates_blocks_full_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_image_grid_images" ADD CONSTRAINT "page_templates_blocks_image_grid_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_image_grid_images" ADD CONSTRAINT "page_templates_blocks_image_grid_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_image_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_image_grid" ADD CONSTRAINT "page_templates_blocks_image_grid_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_image_grid" ADD CONSTRAINT "page_templates_blocks_image_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_cards_items" ADD CONSTRAINT "page_templates_blocks_cards_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_cards_items" ADD CONSTRAINT "page_templates_blocks_cards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_cards" ADD CONSTRAINT "page_templates_blocks_cards_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_cards" ADD CONSTRAINT "page_templates_blocks_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_child_pages" ADD CONSTRAINT "page_templates_blocks_child_pages_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_child_pages" ADD CONSTRAINT "page_templates_blocks_child_pages_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_child_pages" ADD CONSTRAINT "page_templates_blocks_child_pages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_cta_links" ADD CONSTRAINT "page_templates_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_cta" ADD CONSTRAINT "page_templates_blocks_cta_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_cta" ADD CONSTRAINT "page_templates_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_quote" ADD CONSTRAINT "page_templates_blocks_quote_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_quote" ADD CONSTRAINT "page_templates_blocks_quote_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_quote" ADD CONSTRAINT "page_templates_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_stats_items" ADD CONSTRAINT "page_templates_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_stats_bars" ADD CONSTRAINT "page_templates_blocks_stats_bars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_stats" ADD CONSTRAINT "page_templates_blocks_stats_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_stats" ADD CONSTRAINT "page_templates_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_facts_items" ADD CONSTRAINT "page_templates_blocks_facts_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_facts" ADD CONSTRAINT "page_templates_blocks_facts_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_facts" ADD CONSTRAINT "page_templates_blocks_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_article_feed_sites" ADD CONSTRAINT "page_templates_blocks_article_feed_sites_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."page_templates_blocks_article_feed"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_article_feed" ADD CONSTRAINT "page_templates_blocks_article_feed_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_article_feed" ADD CONSTRAINT "page_templates_blocks_article_feed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_people" ADD CONSTRAINT "page_templates_blocks_people_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_people" ADD CONSTRAINT "page_templates_blocks_people_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_documents" ADD CONSTRAINT "page_templates_blocks_documents_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_documents" ADD CONSTRAINT "page_templates_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_timeline_items" ADD CONSTRAINT "page_templates_blocks_timeline_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_timeline_items" ADD CONSTRAINT "page_templates_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_timeline" ADD CONSTRAINT "page_templates_blocks_timeline_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_timeline" ADD CONSTRAINT "page_templates_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_accordion_items" ADD CONSTRAINT "page_templates_blocks_accordion_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_accordion"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_accordion" ADD CONSTRAINT "page_templates_blocks_accordion_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_accordion" ADD CONSTRAINT "page_templates_blocks_accordion_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_video" ADD CONSTRAINT "page_templates_blocks_video_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_video" ADD CONSTRAINT "page_templates_blocks_video_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_video" ADD CONSTRAINT "page_templates_blocks_video_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_video" ADD CONSTRAINT "page_templates_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_embed" ADD CONSTRAINT "page_templates_blocks_embed_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_embed" ADD CONSTRAINT "page_templates_blocks_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs_items" ADD CONSTRAINT "page_templates_blocks_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs" ADD CONSTRAINT "page_templates_blocks_tabs_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_tabs" ADD CONSTRAINT "page_templates_blocks_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_pricing_plans_features" ADD CONSTRAINT "page_templates_blocks_pricing_plans_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_pricing_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_pricing_plans" ADD CONSTRAINT "page_templates_blocks_pricing_plans_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_pricing" ADD CONSTRAINT "page_templates_blocks_pricing_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_pricing" ADD CONSTRAINT "page_templates_blocks_pricing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_logo_wall_logos" ADD CONSTRAINT "page_templates_blocks_logo_wall_logos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_logo_wall_logos" ADD CONSTRAINT "page_templates_blocks_logo_wall_logos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_logo_wall"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_logo_wall" ADD CONSTRAINT "page_templates_blocks_logo_wall_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_logo_wall" ADD CONSTRAINT "page_templates_blocks_logo_wall_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_testimonials_items" ADD CONSTRAINT "page_templates_blocks_testimonials_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_testimonials_items" ADD CONSTRAINT "page_templates_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_testimonials" ADD CONSTRAINT "page_templates_blocks_testimonials_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_testimonials" ADD CONSTRAINT "page_templates_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_carousel_slides" ADD CONSTRAINT "page_templates_blocks_carousel_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_carousel_slides" ADD CONSTRAINT "page_templates_blocks_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_carousel" ADD CONSTRAINT "page_templates_blocks_carousel_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_carousel" ADD CONSTRAINT "page_templates_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_table_header" ADD CONSTRAINT "page_templates_blocks_table_header_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_table_rows_cells" ADD CONSTRAINT "page_templates_blocks_table_rows_cells_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_table_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_table_rows" ADD CONSTRAINT "page_templates_blocks_table_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_table" ADD CONSTRAINT "page_templates_blocks_table_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_table" ADD CONSTRAINT "page_templates_blocks_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_contact_card_hours" ADD CONSTRAINT "page_templates_blocks_contact_card_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_contact_card"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_contact_card" ADD CONSTRAINT "page_templates_blocks_contact_card_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_contact_card" ADD CONSTRAINT "page_templates_blocks_contact_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_icon_features_items" ADD CONSTRAINT "page_templates_blocks_icon_features_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_icon_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_icon_features" ADD CONSTRAINT "page_templates_blocks_icon_features_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_icon_features" ADD CONSTRAINT "page_templates_blocks_icon_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_banner" ADD CONSTRAINT "page_templates_blocks_banner_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_banner" ADD CONSTRAINT "page_templates_blocks_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_button_group_links" ADD CONSTRAINT "page_templates_blocks_button_group_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_button_group"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_button_group" ADD CONSTRAINT "page_templates_blocks_button_group_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_button_group" ADD CONSTRAINT "page_templates_blocks_button_group_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_divider" ADD CONSTRAINT "page_templates_blocks_divider_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_divider" ADD CONSTRAINT "page_templates_blocks_divider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_columns_columns" ADD CONSTRAINT "page_templates_blocks_columns_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_columns" ADD CONSTRAINT "page_templates_blocks_columns_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_columns" ADD CONSTRAINT "page_templates_blocks_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_form_block" ADD CONSTRAINT "page_templates_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_form_block" ADD CONSTRAINT "page_templates_blocks_form_block_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_form_block" ADD CONSTRAINT "page_templates_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_newsletter" ADD CONSTRAINT "page_templates_blocks_newsletter_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_newsletter" ADD CONSTRAINT "page_templates_blocks_newsletter_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_newsletter" ADD CONSTRAINT "page_templates_blocks_newsletter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_global_section" ADD CONSTRAINT "page_templates_blocks_global_section_global_section_id_gsections_id_fk" FOREIGN KEY ("global_section_id") REFERENCES "public"."gsections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_global_section" ADD CONSTRAINT "page_templates_blocks_global_section_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_global_section" ADD CONSTRAINT "page_templates_blocks_global_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_rels" ADD CONSTRAINT "page_templates_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_rels" ADD CONSTRAINT "page_templates_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_rels" ADD CONSTRAINT "page_templates_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_rels" ADD CONSTRAINT "page_templates_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_rels" ADD CONSTRAINT "page_templates_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_hero_links" ADD CONSTRAINT "section_presets_blocks_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_hero" ADD CONSTRAINT "section_presets_blocks_hero_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_hero" ADD CONSTRAINT "section_presets_blocks_hero_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_hero" ADD CONSTRAINT "section_presets_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_content" ADD CONSTRAINT "section_presets_blocks_content_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_content" ADD CONSTRAINT "section_presets_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_text_image_links" ADD CONSTRAINT "section_presets_blocks_text_image_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets_blocks_text_image"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_text_image" ADD CONSTRAINT "section_presets_blocks_text_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_text_image" ADD CONSTRAINT "section_presets_blocks_text_image_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_text_image" ADD CONSTRAINT "section_presets_blocks_text_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_full_image" ADD CONSTRAINT "section_presets_blocks_full_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_full_image" ADD CONSTRAINT "section_presets_blocks_full_image_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_full_image" ADD CONSTRAINT "section_presets_blocks_full_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_image_grid_images" ADD CONSTRAINT "section_presets_blocks_image_grid_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_image_grid_images" ADD CONSTRAINT "section_presets_blocks_image_grid_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets_blocks_image_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_image_grid" ADD CONSTRAINT "section_presets_blocks_image_grid_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_image_grid" ADD CONSTRAINT "section_presets_blocks_image_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_cards_items" ADD CONSTRAINT "section_presets_blocks_cards_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_cards_items" ADD CONSTRAINT "section_presets_blocks_cards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets_blocks_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_cards" ADD CONSTRAINT "section_presets_blocks_cards_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_cards" ADD CONSTRAINT "section_presets_blocks_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_child_pages" ADD CONSTRAINT "section_presets_blocks_child_pages_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_child_pages" ADD CONSTRAINT "section_presets_blocks_child_pages_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_child_pages" ADD CONSTRAINT "section_presets_blocks_child_pages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_cta_links" ADD CONSTRAINT "section_presets_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_cta" ADD CONSTRAINT "section_presets_blocks_cta_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_cta" ADD CONSTRAINT "section_presets_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_quote" ADD CONSTRAINT "section_presets_blocks_quote_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_quote" ADD CONSTRAINT "section_presets_blocks_quote_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_quote" ADD CONSTRAINT "section_presets_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_stats_items" ADD CONSTRAINT "section_presets_blocks_stats_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_stats_bars" ADD CONSTRAINT "section_presets_blocks_stats_bars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets_blocks_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_stats" ADD CONSTRAINT "section_presets_blocks_stats_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_stats" ADD CONSTRAINT "section_presets_blocks_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_facts_items" ADD CONSTRAINT "section_presets_blocks_facts_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets_blocks_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_facts" ADD CONSTRAINT "section_presets_blocks_facts_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_facts" ADD CONSTRAINT "section_presets_blocks_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_article_feed_sites" ADD CONSTRAINT "section_presets_blocks_article_feed_sites_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."section_presets_blocks_article_feed"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_article_feed" ADD CONSTRAINT "section_presets_blocks_article_feed_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_article_feed" ADD CONSTRAINT "section_presets_blocks_article_feed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_people" ADD CONSTRAINT "section_presets_blocks_people_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_people" ADD CONSTRAINT "section_presets_blocks_people_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_documents" ADD CONSTRAINT "section_presets_blocks_documents_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_documents" ADD CONSTRAINT "section_presets_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_timeline_items" ADD CONSTRAINT "section_presets_blocks_timeline_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_timeline_items" ADD CONSTRAINT "section_presets_blocks_timeline_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets_blocks_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_timeline" ADD CONSTRAINT "section_presets_blocks_timeline_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_timeline" ADD CONSTRAINT "section_presets_blocks_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_accordion_items" ADD CONSTRAINT "section_presets_blocks_accordion_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets_blocks_accordion"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_accordion" ADD CONSTRAINT "section_presets_blocks_accordion_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_accordion" ADD CONSTRAINT "section_presets_blocks_accordion_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_video" ADD CONSTRAINT "section_presets_blocks_video_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_video" ADD CONSTRAINT "section_presets_blocks_video_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_video" ADD CONSTRAINT "section_presets_blocks_video_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_video" ADD CONSTRAINT "section_presets_blocks_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_embed" ADD CONSTRAINT "section_presets_blocks_embed_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_embed" ADD CONSTRAINT "section_presets_blocks_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_tabs_items" ADD CONSTRAINT "section_presets_blocks_tabs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets_blocks_tabs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_tabs" ADD CONSTRAINT "section_presets_blocks_tabs_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_tabs" ADD CONSTRAINT "section_presets_blocks_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_pricing_plans_features" ADD CONSTRAINT "section_presets_blocks_pricing_plans_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets_blocks_pricing_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_pricing_plans" ADD CONSTRAINT "section_presets_blocks_pricing_plans_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets_blocks_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_pricing" ADD CONSTRAINT "section_presets_blocks_pricing_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_pricing" ADD CONSTRAINT "section_presets_blocks_pricing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_logo_wall_logos" ADD CONSTRAINT "section_presets_blocks_logo_wall_logos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_logo_wall_logos" ADD CONSTRAINT "section_presets_blocks_logo_wall_logos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets_blocks_logo_wall"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_logo_wall" ADD CONSTRAINT "section_presets_blocks_logo_wall_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_logo_wall" ADD CONSTRAINT "section_presets_blocks_logo_wall_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_testimonials_items" ADD CONSTRAINT "section_presets_blocks_testimonials_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_testimonials_items" ADD CONSTRAINT "section_presets_blocks_testimonials_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets_blocks_testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_testimonials" ADD CONSTRAINT "section_presets_blocks_testimonials_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_testimonials" ADD CONSTRAINT "section_presets_blocks_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_carousel_slides" ADD CONSTRAINT "section_presets_blocks_carousel_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_carousel_slides" ADD CONSTRAINT "section_presets_blocks_carousel_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets_blocks_carousel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_carousel" ADD CONSTRAINT "section_presets_blocks_carousel_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_carousel" ADD CONSTRAINT "section_presets_blocks_carousel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_table_header" ADD CONSTRAINT "section_presets_blocks_table_header_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets_blocks_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_table_rows_cells" ADD CONSTRAINT "section_presets_blocks_table_rows_cells_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets_blocks_table_rows"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_table_rows" ADD CONSTRAINT "section_presets_blocks_table_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets_blocks_table"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_table" ADD CONSTRAINT "section_presets_blocks_table_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_table" ADD CONSTRAINT "section_presets_blocks_table_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_contact_card_hours" ADD CONSTRAINT "section_presets_blocks_contact_card_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets_blocks_contact_card"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_contact_card" ADD CONSTRAINT "section_presets_blocks_contact_card_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_contact_card" ADD CONSTRAINT "section_presets_blocks_contact_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_icon_features_items" ADD CONSTRAINT "section_presets_blocks_icon_features_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets_blocks_icon_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_icon_features" ADD CONSTRAINT "section_presets_blocks_icon_features_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_icon_features" ADD CONSTRAINT "section_presets_blocks_icon_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_banner" ADD CONSTRAINT "section_presets_blocks_banner_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_banner" ADD CONSTRAINT "section_presets_blocks_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_button_group_links" ADD CONSTRAINT "section_presets_blocks_button_group_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets_blocks_button_group"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_button_group" ADD CONSTRAINT "section_presets_blocks_button_group_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_button_group" ADD CONSTRAINT "section_presets_blocks_button_group_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_divider" ADD CONSTRAINT "section_presets_blocks_divider_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_divider" ADD CONSTRAINT "section_presets_blocks_divider_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_columns_columns" ADD CONSTRAINT "section_presets_blocks_columns_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets_blocks_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_columns" ADD CONSTRAINT "section_presets_blocks_columns_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_columns" ADD CONSTRAINT "section_presets_blocks_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_form_block" ADD CONSTRAINT "section_presets_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_form_block" ADD CONSTRAINT "section_presets_blocks_form_block_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_form_block" ADD CONSTRAINT "section_presets_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_newsletter" ADD CONSTRAINT "section_presets_blocks_newsletter_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_newsletter" ADD CONSTRAINT "section_presets_blocks_newsletter_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_newsletter" ADD CONSTRAINT "section_presets_blocks_newsletter_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_global_section" ADD CONSTRAINT "section_presets_blocks_global_section_global_section_id_gsections_id_fk" FOREIGN KEY ("global_section_id") REFERENCES "public"."gsections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_global_section" ADD CONSTRAINT "section_presets_blocks_global_section_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_global_section" ADD CONSTRAINT "section_presets_blocks_global_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_rels" ADD CONSTRAINT "section_presets_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_rels" ADD CONSTRAINT "section_presets_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_rels" ADD CONSTRAINT "section_presets_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_rels" ADD CONSTRAINT "section_presets_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_rels" ADD CONSTRAINT "section_presets_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_global_section_order_idx" ON "pages_blocks_global_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_global_section_parent_id_idx" ON "pages_blocks_global_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_global_section_path_idx" ON "pages_blocks_global_section" USING btree ("_path");
  CREATE INDEX "pages_blocks_global_section_locale_idx" ON "pages_blocks_global_section" USING btree ("_locale");
  CREATE INDEX "pages_blocks_global_section_global_section_idx" ON "pages_blocks_global_section" USING btree ("global_section_id");
  CREATE INDEX "pages_blocks_global_section_section_section_background_m_idx" ON "pages_blocks_global_section" USING btree ("section_background_media_id");
  CREATE INDEX "pages_blocks_preset_order_idx" ON "pages_blocks_preset" USING btree ("_order");
  CREATE INDEX "pages_blocks_preset_parent_id_idx" ON "pages_blocks_preset" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_preset_path_idx" ON "pages_blocks_preset" USING btree ("_path");
  CREATE INDEX "pages_blocks_preset_locale_idx" ON "pages_blocks_preset" USING btree ("_locale");
  CREATE INDEX "pages_blocks_preset_preset_idx" ON "pages_blocks_preset" USING btree ("preset_id");
  CREATE INDEX "_pages_v_blocks_global_section_order_idx" ON "_pages_v_blocks_global_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_global_section_parent_id_idx" ON "_pages_v_blocks_global_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_global_section_path_idx" ON "_pages_v_blocks_global_section" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_global_section_locale_idx" ON "_pages_v_blocks_global_section" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_global_section_global_section_idx" ON "_pages_v_blocks_global_section" USING btree ("global_section_id");
  CREATE INDEX "_pages_v_blocks_global_section_section_section_backgroun_idx" ON "_pages_v_blocks_global_section" USING btree ("section_background_media_id");
  CREATE INDEX "_pages_v_blocks_preset_order_idx" ON "_pages_v_blocks_preset" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_preset_parent_id_idx" ON "_pages_v_blocks_preset" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_preset_path_idx" ON "_pages_v_blocks_preset" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_preset_locale_idx" ON "_pages_v_blocks_preset" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_preset_preset_idx" ON "_pages_v_blocks_preset" USING btree ("preset_id");
  CREATE INDEX "gsections_blocks_hero_links_order_idx" ON "gsections_blocks_hero_links" USING btree ("_order");
  CREATE INDEX "gsections_blocks_hero_links_parent_id_idx" ON "gsections_blocks_hero_links" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_hero_links_locale_idx" ON "gsections_blocks_hero_links" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_hero_order_idx" ON "gsections_blocks_hero" USING btree ("_order");
  CREATE INDEX "gsections_blocks_hero_parent_id_idx" ON "gsections_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_hero_path_idx" ON "gsections_blocks_hero" USING btree ("_path");
  CREATE INDEX "gsections_blocks_hero_locale_idx" ON "gsections_blocks_hero" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_hero_media_idx" ON "gsections_blocks_hero" USING btree ("media_id");
  CREATE INDEX "gsections_blocks_hero_section_section_background_media_idx" ON "gsections_blocks_hero" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_content_order_idx" ON "gsections_blocks_content" USING btree ("_order");
  CREATE INDEX "gsections_blocks_content_parent_id_idx" ON "gsections_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_content_path_idx" ON "gsections_blocks_content" USING btree ("_path");
  CREATE INDEX "gsections_blocks_content_locale_idx" ON "gsections_blocks_content" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_content_section_section_background_medi_idx" ON "gsections_blocks_content" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_text_image_links_order_idx" ON "gsections_blocks_text_image_links" USING btree ("_order");
  CREATE INDEX "gsections_blocks_text_image_links_parent_id_idx" ON "gsections_blocks_text_image_links" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_text_image_links_locale_idx" ON "gsections_blocks_text_image_links" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_text_image_order_idx" ON "gsections_blocks_text_image" USING btree ("_order");
  CREATE INDEX "gsections_blocks_text_image_parent_id_idx" ON "gsections_blocks_text_image" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_text_image_path_idx" ON "gsections_blocks_text_image" USING btree ("_path");
  CREATE INDEX "gsections_blocks_text_image_locale_idx" ON "gsections_blocks_text_image" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_text_image_image_idx" ON "gsections_blocks_text_image" USING btree ("image_id");
  CREATE INDEX "gsections_blocks_text_image_section_section_background_m_idx" ON "gsections_blocks_text_image" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_full_image_order_idx" ON "gsections_blocks_full_image" USING btree ("_order");
  CREATE INDEX "gsections_blocks_full_image_parent_id_idx" ON "gsections_blocks_full_image" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_full_image_path_idx" ON "gsections_blocks_full_image" USING btree ("_path");
  CREATE INDEX "gsections_blocks_full_image_locale_idx" ON "gsections_blocks_full_image" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_full_image_image_idx" ON "gsections_blocks_full_image" USING btree ("image_id");
  CREATE INDEX "gsections_blocks_full_image_section_section_background_m_idx" ON "gsections_blocks_full_image" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_image_grid_images_order_idx" ON "gsections_blocks_image_grid_images" USING btree ("_order");
  CREATE INDEX "gsections_blocks_image_grid_images_parent_id_idx" ON "gsections_blocks_image_grid_images" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_image_grid_images_locale_idx" ON "gsections_blocks_image_grid_images" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_image_grid_images_image_idx" ON "gsections_blocks_image_grid_images" USING btree ("image_id");
  CREATE INDEX "gsections_blocks_image_grid_order_idx" ON "gsections_blocks_image_grid" USING btree ("_order");
  CREATE INDEX "gsections_blocks_image_grid_parent_id_idx" ON "gsections_blocks_image_grid" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_image_grid_path_idx" ON "gsections_blocks_image_grid" USING btree ("_path");
  CREATE INDEX "gsections_blocks_image_grid_locale_idx" ON "gsections_blocks_image_grid" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_image_grid_section_section_background_m_idx" ON "gsections_blocks_image_grid" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_cards_items_order_idx" ON "gsections_blocks_cards_items" USING btree ("_order");
  CREATE INDEX "gsections_blocks_cards_items_parent_id_idx" ON "gsections_blocks_cards_items" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_cards_items_locale_idx" ON "gsections_blocks_cards_items" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_cards_items_image_idx" ON "gsections_blocks_cards_items" USING btree ("image_id");
  CREATE INDEX "gsections_blocks_cards_order_idx" ON "gsections_blocks_cards" USING btree ("_order");
  CREATE INDEX "gsections_blocks_cards_parent_id_idx" ON "gsections_blocks_cards" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_cards_path_idx" ON "gsections_blocks_cards" USING btree ("_path");
  CREATE INDEX "gsections_blocks_cards_locale_idx" ON "gsections_blocks_cards" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_cards_section_section_background_media_idx" ON "gsections_blocks_cards" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_child_pages_order_idx" ON "gsections_blocks_child_pages" USING btree ("_order");
  CREATE INDEX "gsections_blocks_child_pages_parent_id_idx" ON "gsections_blocks_child_pages" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_child_pages_path_idx" ON "gsections_blocks_child_pages" USING btree ("_path");
  CREATE INDEX "gsections_blocks_child_pages_locale_idx" ON "gsections_blocks_child_pages" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_child_pages_parent_idx" ON "gsections_blocks_child_pages" USING btree ("parent_id");
  CREATE INDEX "gsections_blocks_child_pages_section_section_background__idx" ON "gsections_blocks_child_pages" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_cta_links_order_idx" ON "gsections_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "gsections_blocks_cta_links_parent_id_idx" ON "gsections_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_cta_links_locale_idx" ON "gsections_blocks_cta_links" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_cta_order_idx" ON "gsections_blocks_cta" USING btree ("_order");
  CREATE INDEX "gsections_blocks_cta_parent_id_idx" ON "gsections_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_cta_path_idx" ON "gsections_blocks_cta" USING btree ("_path");
  CREATE INDEX "gsections_blocks_cta_locale_idx" ON "gsections_blocks_cta" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_cta_section_section_background_media_idx" ON "gsections_blocks_cta" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_quote_order_idx" ON "gsections_blocks_quote" USING btree ("_order");
  CREATE INDEX "gsections_blocks_quote_parent_id_idx" ON "gsections_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_quote_path_idx" ON "gsections_blocks_quote" USING btree ("_path");
  CREATE INDEX "gsections_blocks_quote_locale_idx" ON "gsections_blocks_quote" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_quote_image_idx" ON "gsections_blocks_quote" USING btree ("image_id");
  CREATE INDEX "gsections_blocks_quote_section_section_background_media_idx" ON "gsections_blocks_quote" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_stats_items_order_idx" ON "gsections_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "gsections_blocks_stats_items_parent_id_idx" ON "gsections_blocks_stats_items" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_stats_items_locale_idx" ON "gsections_blocks_stats_items" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_stats_bars_order_idx" ON "gsections_blocks_stats_bars" USING btree ("_order");
  CREATE INDEX "gsections_blocks_stats_bars_parent_id_idx" ON "gsections_blocks_stats_bars" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_stats_bars_locale_idx" ON "gsections_blocks_stats_bars" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_stats_order_idx" ON "gsections_blocks_stats" USING btree ("_order");
  CREATE INDEX "gsections_blocks_stats_parent_id_idx" ON "gsections_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_stats_path_idx" ON "gsections_blocks_stats" USING btree ("_path");
  CREATE INDEX "gsections_blocks_stats_locale_idx" ON "gsections_blocks_stats" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_stats_section_section_background_media_idx" ON "gsections_blocks_stats" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_facts_items_order_idx" ON "gsections_blocks_facts_items" USING btree ("_order");
  CREATE INDEX "gsections_blocks_facts_items_parent_id_idx" ON "gsections_blocks_facts_items" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_facts_items_locale_idx" ON "gsections_blocks_facts_items" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_facts_order_idx" ON "gsections_blocks_facts" USING btree ("_order");
  CREATE INDEX "gsections_blocks_facts_parent_id_idx" ON "gsections_blocks_facts" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_facts_path_idx" ON "gsections_blocks_facts" USING btree ("_path");
  CREATE INDEX "gsections_blocks_facts_locale_idx" ON "gsections_blocks_facts" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_facts_section_section_background_media_idx" ON "gsections_blocks_facts" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_article_feed_sites_order_idx" ON "gsections_blocks_article_feed_sites" USING btree ("order");
  CREATE INDEX "gsections_blocks_article_feed_sites_parent_idx" ON "gsections_blocks_article_feed_sites" USING btree ("parent_id");
  CREATE INDEX "gsections_blocks_article_feed_sites_locale_idx" ON "gsections_blocks_article_feed_sites" USING btree ("locale");
  CREATE INDEX "gsections_blocks_article_feed_order_idx" ON "gsections_blocks_article_feed" USING btree ("_order");
  CREATE INDEX "gsections_blocks_article_feed_parent_id_idx" ON "gsections_blocks_article_feed" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_article_feed_path_idx" ON "gsections_blocks_article_feed" USING btree ("_path");
  CREATE INDEX "gsections_blocks_article_feed_locale_idx" ON "gsections_blocks_article_feed" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_article_feed_section_section_background_idx" ON "gsections_blocks_article_feed" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_people_order_idx" ON "gsections_blocks_people" USING btree ("_order");
  CREATE INDEX "gsections_blocks_people_parent_id_idx" ON "gsections_blocks_people" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_people_path_idx" ON "gsections_blocks_people" USING btree ("_path");
  CREATE INDEX "gsections_blocks_people_locale_idx" ON "gsections_blocks_people" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_people_section_section_background_media_idx" ON "gsections_blocks_people" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_documents_order_idx" ON "gsections_blocks_documents" USING btree ("_order");
  CREATE INDEX "gsections_blocks_documents_parent_id_idx" ON "gsections_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_documents_path_idx" ON "gsections_blocks_documents" USING btree ("_path");
  CREATE INDEX "gsections_blocks_documents_locale_idx" ON "gsections_blocks_documents" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_documents_section_section_background_me_idx" ON "gsections_blocks_documents" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_timeline_items_order_idx" ON "gsections_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "gsections_blocks_timeline_items_parent_id_idx" ON "gsections_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_timeline_items_locale_idx" ON "gsections_blocks_timeline_items" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_timeline_items_image_idx" ON "gsections_blocks_timeline_items" USING btree ("image_id");
  CREATE INDEX "gsections_blocks_timeline_order_idx" ON "gsections_blocks_timeline" USING btree ("_order");
  CREATE INDEX "gsections_blocks_timeline_parent_id_idx" ON "gsections_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_timeline_path_idx" ON "gsections_blocks_timeline" USING btree ("_path");
  CREATE INDEX "gsections_blocks_timeline_locale_idx" ON "gsections_blocks_timeline" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_timeline_section_section_background_med_idx" ON "gsections_blocks_timeline" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_accordion_items_order_idx" ON "gsections_blocks_accordion_items" USING btree ("_order");
  CREATE INDEX "gsections_blocks_accordion_items_parent_id_idx" ON "gsections_blocks_accordion_items" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_accordion_items_locale_idx" ON "gsections_blocks_accordion_items" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_accordion_order_idx" ON "gsections_blocks_accordion" USING btree ("_order");
  CREATE INDEX "gsections_blocks_accordion_parent_id_idx" ON "gsections_blocks_accordion" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_accordion_path_idx" ON "gsections_blocks_accordion" USING btree ("_path");
  CREATE INDEX "gsections_blocks_accordion_locale_idx" ON "gsections_blocks_accordion" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_accordion_section_section_background_me_idx" ON "gsections_blocks_accordion" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_video_order_idx" ON "gsections_blocks_video" USING btree ("_order");
  CREATE INDEX "gsections_blocks_video_parent_id_idx" ON "gsections_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_video_path_idx" ON "gsections_blocks_video" USING btree ("_path");
  CREATE INDEX "gsections_blocks_video_locale_idx" ON "gsections_blocks_video" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_video_file_idx" ON "gsections_blocks_video" USING btree ("file_id");
  CREATE INDEX "gsections_blocks_video_poster_idx" ON "gsections_blocks_video" USING btree ("poster_id");
  CREATE INDEX "gsections_blocks_video_section_section_background_media_idx" ON "gsections_blocks_video" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_embed_order_idx" ON "gsections_blocks_embed" USING btree ("_order");
  CREATE INDEX "gsections_blocks_embed_parent_id_idx" ON "gsections_blocks_embed" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_embed_path_idx" ON "gsections_blocks_embed" USING btree ("_path");
  CREATE INDEX "gsections_blocks_embed_locale_idx" ON "gsections_blocks_embed" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_embed_section_section_background_media_idx" ON "gsections_blocks_embed" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_tabs_items_order_idx" ON "gsections_blocks_tabs_items" USING btree ("_order");
  CREATE INDEX "gsections_blocks_tabs_items_parent_id_idx" ON "gsections_blocks_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_tabs_items_locale_idx" ON "gsections_blocks_tabs_items" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_tabs_order_idx" ON "gsections_blocks_tabs" USING btree ("_order");
  CREATE INDEX "gsections_blocks_tabs_parent_id_idx" ON "gsections_blocks_tabs" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_tabs_path_idx" ON "gsections_blocks_tabs" USING btree ("_path");
  CREATE INDEX "gsections_blocks_tabs_locale_idx" ON "gsections_blocks_tabs" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_tabs_section_section_background_media_idx" ON "gsections_blocks_tabs" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_pricing_plans_features_order_idx" ON "gsections_blocks_pricing_plans_features" USING btree ("_order");
  CREATE INDEX "gsections_blocks_pricing_plans_features_parent_id_idx" ON "gsections_blocks_pricing_plans_features" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_pricing_plans_features_locale_idx" ON "gsections_blocks_pricing_plans_features" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_pricing_plans_order_idx" ON "gsections_blocks_pricing_plans" USING btree ("_order");
  CREATE INDEX "gsections_blocks_pricing_plans_parent_id_idx" ON "gsections_blocks_pricing_plans" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_pricing_plans_locale_idx" ON "gsections_blocks_pricing_plans" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_pricing_order_idx" ON "gsections_blocks_pricing" USING btree ("_order");
  CREATE INDEX "gsections_blocks_pricing_parent_id_idx" ON "gsections_blocks_pricing" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_pricing_path_idx" ON "gsections_blocks_pricing" USING btree ("_path");
  CREATE INDEX "gsections_blocks_pricing_locale_idx" ON "gsections_blocks_pricing" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_pricing_section_section_background_medi_idx" ON "gsections_blocks_pricing" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_logo_wall_logos_order_idx" ON "gsections_blocks_logo_wall_logos" USING btree ("_order");
  CREATE INDEX "gsections_blocks_logo_wall_logos_parent_id_idx" ON "gsections_blocks_logo_wall_logos" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_logo_wall_logos_locale_idx" ON "gsections_blocks_logo_wall_logos" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_logo_wall_logos_image_idx" ON "gsections_blocks_logo_wall_logos" USING btree ("image_id");
  CREATE INDEX "gsections_blocks_logo_wall_order_idx" ON "gsections_blocks_logo_wall" USING btree ("_order");
  CREATE INDEX "gsections_blocks_logo_wall_parent_id_idx" ON "gsections_blocks_logo_wall" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_logo_wall_path_idx" ON "gsections_blocks_logo_wall" USING btree ("_path");
  CREATE INDEX "gsections_blocks_logo_wall_locale_idx" ON "gsections_blocks_logo_wall" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_logo_wall_section_section_background_me_idx" ON "gsections_blocks_logo_wall" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_testimonials_items_order_idx" ON "gsections_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "gsections_blocks_testimonials_items_parent_id_idx" ON "gsections_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_testimonials_items_locale_idx" ON "gsections_blocks_testimonials_items" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_testimonials_items_image_idx" ON "gsections_blocks_testimonials_items" USING btree ("image_id");
  CREATE INDEX "gsections_blocks_testimonials_order_idx" ON "gsections_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "gsections_blocks_testimonials_parent_id_idx" ON "gsections_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_testimonials_path_idx" ON "gsections_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "gsections_blocks_testimonials_locale_idx" ON "gsections_blocks_testimonials" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_testimonials_section_section_background_idx" ON "gsections_blocks_testimonials" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_carousel_slides_order_idx" ON "gsections_blocks_carousel_slides" USING btree ("_order");
  CREATE INDEX "gsections_blocks_carousel_slides_parent_id_idx" ON "gsections_blocks_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_carousel_slides_locale_idx" ON "gsections_blocks_carousel_slides" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_carousel_slides_image_idx" ON "gsections_blocks_carousel_slides" USING btree ("image_id");
  CREATE INDEX "gsections_blocks_carousel_order_idx" ON "gsections_blocks_carousel" USING btree ("_order");
  CREATE INDEX "gsections_blocks_carousel_parent_id_idx" ON "gsections_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_carousel_path_idx" ON "gsections_blocks_carousel" USING btree ("_path");
  CREATE INDEX "gsections_blocks_carousel_locale_idx" ON "gsections_blocks_carousel" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_carousel_section_section_background_med_idx" ON "gsections_blocks_carousel" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_table_header_order_idx" ON "gsections_blocks_table_header" USING btree ("_order");
  CREATE INDEX "gsections_blocks_table_header_parent_id_idx" ON "gsections_blocks_table_header" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_table_header_locale_idx" ON "gsections_blocks_table_header" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_table_rows_cells_order_idx" ON "gsections_blocks_table_rows_cells" USING btree ("_order");
  CREATE INDEX "gsections_blocks_table_rows_cells_parent_id_idx" ON "gsections_blocks_table_rows_cells" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_table_rows_cells_locale_idx" ON "gsections_blocks_table_rows_cells" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_table_rows_order_idx" ON "gsections_blocks_table_rows" USING btree ("_order");
  CREATE INDEX "gsections_blocks_table_rows_parent_id_idx" ON "gsections_blocks_table_rows" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_table_rows_locale_idx" ON "gsections_blocks_table_rows" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_table_order_idx" ON "gsections_blocks_table" USING btree ("_order");
  CREATE INDEX "gsections_blocks_table_parent_id_idx" ON "gsections_blocks_table" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_table_path_idx" ON "gsections_blocks_table" USING btree ("_path");
  CREATE INDEX "gsections_blocks_table_locale_idx" ON "gsections_blocks_table" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_table_section_section_background_media_idx" ON "gsections_blocks_table" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_contact_card_hours_order_idx" ON "gsections_blocks_contact_card_hours" USING btree ("_order");
  CREATE INDEX "gsections_blocks_contact_card_hours_parent_id_idx" ON "gsections_blocks_contact_card_hours" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_contact_card_hours_locale_idx" ON "gsections_blocks_contact_card_hours" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_contact_card_order_idx" ON "gsections_blocks_contact_card" USING btree ("_order");
  CREATE INDEX "gsections_blocks_contact_card_parent_id_idx" ON "gsections_blocks_contact_card" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_contact_card_path_idx" ON "gsections_blocks_contact_card" USING btree ("_path");
  CREATE INDEX "gsections_blocks_contact_card_locale_idx" ON "gsections_blocks_contact_card" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_contact_card_section_section_background_idx" ON "gsections_blocks_contact_card" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_icon_features_items_order_idx" ON "gsections_blocks_icon_features_items" USING btree ("_order");
  CREATE INDEX "gsections_blocks_icon_features_items_parent_id_idx" ON "gsections_blocks_icon_features_items" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_icon_features_items_locale_idx" ON "gsections_blocks_icon_features_items" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_icon_features_order_idx" ON "gsections_blocks_icon_features" USING btree ("_order");
  CREATE INDEX "gsections_blocks_icon_features_parent_id_idx" ON "gsections_blocks_icon_features" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_icon_features_path_idx" ON "gsections_blocks_icon_features" USING btree ("_path");
  CREATE INDEX "gsections_blocks_icon_features_locale_idx" ON "gsections_blocks_icon_features" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_icon_features_section_section_backgroun_idx" ON "gsections_blocks_icon_features" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_banner_order_idx" ON "gsections_blocks_banner" USING btree ("_order");
  CREATE INDEX "gsections_blocks_banner_parent_id_idx" ON "gsections_blocks_banner" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_banner_path_idx" ON "gsections_blocks_banner" USING btree ("_path");
  CREATE INDEX "gsections_blocks_banner_locale_idx" ON "gsections_blocks_banner" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_banner_section_section_background_media_idx" ON "gsections_blocks_banner" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_button_group_links_order_idx" ON "gsections_blocks_button_group_links" USING btree ("_order");
  CREATE INDEX "gsections_blocks_button_group_links_parent_id_idx" ON "gsections_blocks_button_group_links" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_button_group_links_locale_idx" ON "gsections_blocks_button_group_links" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_button_group_order_idx" ON "gsections_blocks_button_group" USING btree ("_order");
  CREATE INDEX "gsections_blocks_button_group_parent_id_idx" ON "gsections_blocks_button_group" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_button_group_path_idx" ON "gsections_blocks_button_group" USING btree ("_path");
  CREATE INDEX "gsections_blocks_button_group_locale_idx" ON "gsections_blocks_button_group" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_button_group_section_section_background_idx" ON "gsections_blocks_button_group" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_divider_order_idx" ON "gsections_blocks_divider" USING btree ("_order");
  CREATE INDEX "gsections_blocks_divider_parent_id_idx" ON "gsections_blocks_divider" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_divider_path_idx" ON "gsections_blocks_divider" USING btree ("_path");
  CREATE INDEX "gsections_blocks_divider_locale_idx" ON "gsections_blocks_divider" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_divider_section_section_background_medi_idx" ON "gsections_blocks_divider" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_columns_columns_order_idx" ON "gsections_blocks_columns_columns" USING btree ("_order");
  CREATE INDEX "gsections_blocks_columns_columns_parent_id_idx" ON "gsections_blocks_columns_columns" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_columns_columns_locale_idx" ON "gsections_blocks_columns_columns" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_columns_order_idx" ON "gsections_blocks_columns" USING btree ("_order");
  CREATE INDEX "gsections_blocks_columns_parent_id_idx" ON "gsections_blocks_columns" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_columns_path_idx" ON "gsections_blocks_columns" USING btree ("_path");
  CREATE INDEX "gsections_blocks_columns_locale_idx" ON "gsections_blocks_columns" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_columns_section_section_background_medi_idx" ON "gsections_blocks_columns" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_form_block_order_idx" ON "gsections_blocks_form_block" USING btree ("_order");
  CREATE INDEX "gsections_blocks_form_block_parent_id_idx" ON "gsections_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_form_block_path_idx" ON "gsections_blocks_form_block" USING btree ("_path");
  CREATE INDEX "gsections_blocks_form_block_locale_idx" ON "gsections_blocks_form_block" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_form_block_form_idx" ON "gsections_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "gsections_blocks_form_block_section_section_background_m_idx" ON "gsections_blocks_form_block" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_newsletter_order_idx" ON "gsections_blocks_newsletter" USING btree ("_order");
  CREATE INDEX "gsections_blocks_newsletter_parent_id_idx" ON "gsections_blocks_newsletter" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_newsletter_path_idx" ON "gsections_blocks_newsletter" USING btree ("_path");
  CREATE INDEX "gsections_blocks_newsletter_locale_idx" ON "gsections_blocks_newsletter" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_newsletter_form_idx" ON "gsections_blocks_newsletter" USING btree ("form_id");
  CREATE INDEX "gsections_blocks_newsletter_section_section_background_m_idx" ON "gsections_blocks_newsletter" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_site_idx" ON "gsections" USING btree ("site");
  CREATE INDEX "gsections_updated_at_idx" ON "gsections" USING btree ("updated_at");
  CREATE INDEX "gsections_created_at_idx" ON "gsections" USING btree ("created_at");
  CREATE INDEX "gsections__status_idx" ON "gsections" USING btree ("_status");
  CREATE INDEX "gsections_rels_order_idx" ON "gsections_rels" USING btree ("order");
  CREATE INDEX "gsections_rels_parent_idx" ON "gsections_rels" USING btree ("parent_id");
  CREATE INDEX "gsections_rels_path_idx" ON "gsections_rels" USING btree ("path");
  CREATE INDEX "gsections_rels_locale_idx" ON "gsections_rels" USING btree ("locale");
  CREATE INDEX "gsections_rels_pages_id_idx" ON "gsections_rels" USING btree ("pages_id","locale");
  CREATE INDEX "gsections_rels_articles_id_idx" ON "gsections_rels" USING btree ("articles_id","locale");
  CREATE INDEX "gsections_rels_people_id_idx" ON "gsections_rels" USING btree ("people_id","locale");
  CREATE INDEX "gsections_rels_documents_id_idx" ON "gsections_rels" USING btree ("documents_id","locale");
  CREATE INDEX "_gsections_v_blocks_hero_links_order_idx" ON "_gsections_v_blocks_hero_links" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_hero_links_parent_id_idx" ON "_gsections_v_blocks_hero_links" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_hero_links_locale_idx" ON "_gsections_v_blocks_hero_links" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_hero_order_idx" ON "_gsections_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_hero_parent_id_idx" ON "_gsections_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_hero_path_idx" ON "_gsections_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_hero_locale_idx" ON "_gsections_v_blocks_hero" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_hero_media_idx" ON "_gsections_v_blocks_hero" USING btree ("media_id");
  CREATE INDEX "_gsections_v_blocks_hero_section_section_background_medi_idx" ON "_gsections_v_blocks_hero" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_content_order_idx" ON "_gsections_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_content_parent_id_idx" ON "_gsections_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_content_path_idx" ON "_gsections_v_blocks_content" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_content_locale_idx" ON "_gsections_v_blocks_content" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_content_section_section_background_m_idx" ON "_gsections_v_blocks_content" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_text_image_links_order_idx" ON "_gsections_v_blocks_text_image_links" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_text_image_links_parent_id_idx" ON "_gsections_v_blocks_text_image_links" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_text_image_links_locale_idx" ON "_gsections_v_blocks_text_image_links" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_text_image_order_idx" ON "_gsections_v_blocks_text_image" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_text_image_parent_id_idx" ON "_gsections_v_blocks_text_image" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_text_image_path_idx" ON "_gsections_v_blocks_text_image" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_text_image_locale_idx" ON "_gsections_v_blocks_text_image" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_text_image_image_idx" ON "_gsections_v_blocks_text_image" USING btree ("image_id");
  CREATE INDEX "_gsections_v_blocks_text_image_section_section_backgroun_idx" ON "_gsections_v_blocks_text_image" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_full_image_order_idx" ON "_gsections_v_blocks_full_image" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_full_image_parent_id_idx" ON "_gsections_v_blocks_full_image" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_full_image_path_idx" ON "_gsections_v_blocks_full_image" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_full_image_locale_idx" ON "_gsections_v_blocks_full_image" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_full_image_image_idx" ON "_gsections_v_blocks_full_image" USING btree ("image_id");
  CREATE INDEX "_gsections_v_blocks_full_image_section_section_backgroun_idx" ON "_gsections_v_blocks_full_image" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_image_grid_images_order_idx" ON "_gsections_v_blocks_image_grid_images" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_image_grid_images_parent_id_idx" ON "_gsections_v_blocks_image_grid_images" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_image_grid_images_locale_idx" ON "_gsections_v_blocks_image_grid_images" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_image_grid_images_image_idx" ON "_gsections_v_blocks_image_grid_images" USING btree ("image_id");
  CREATE INDEX "_gsections_v_blocks_image_grid_order_idx" ON "_gsections_v_blocks_image_grid" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_image_grid_parent_id_idx" ON "_gsections_v_blocks_image_grid" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_image_grid_path_idx" ON "_gsections_v_blocks_image_grid" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_image_grid_locale_idx" ON "_gsections_v_blocks_image_grid" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_image_grid_section_section_backgroun_idx" ON "_gsections_v_blocks_image_grid" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_cards_items_order_idx" ON "_gsections_v_blocks_cards_items" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_cards_items_parent_id_idx" ON "_gsections_v_blocks_cards_items" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_cards_items_locale_idx" ON "_gsections_v_blocks_cards_items" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_cards_items_image_idx" ON "_gsections_v_blocks_cards_items" USING btree ("image_id");
  CREATE INDEX "_gsections_v_blocks_cards_order_idx" ON "_gsections_v_blocks_cards" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_cards_parent_id_idx" ON "_gsections_v_blocks_cards" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_cards_path_idx" ON "_gsections_v_blocks_cards" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_cards_locale_idx" ON "_gsections_v_blocks_cards" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_cards_section_section_background_med_idx" ON "_gsections_v_blocks_cards" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_child_pages_order_idx" ON "_gsections_v_blocks_child_pages" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_child_pages_parent_id_idx" ON "_gsections_v_blocks_child_pages" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_child_pages_path_idx" ON "_gsections_v_blocks_child_pages" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_child_pages_locale_idx" ON "_gsections_v_blocks_child_pages" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_child_pages_parent_idx" ON "_gsections_v_blocks_child_pages" USING btree ("parent_id");
  CREATE INDEX "_gsections_v_blocks_child_pages_section_section_backgrou_idx" ON "_gsections_v_blocks_child_pages" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_cta_links_order_idx" ON "_gsections_v_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_cta_links_parent_id_idx" ON "_gsections_v_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_cta_links_locale_idx" ON "_gsections_v_blocks_cta_links" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_cta_order_idx" ON "_gsections_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_cta_parent_id_idx" ON "_gsections_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_cta_path_idx" ON "_gsections_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_cta_locale_idx" ON "_gsections_v_blocks_cta" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_cta_section_section_background_media_idx" ON "_gsections_v_blocks_cta" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_quote_order_idx" ON "_gsections_v_blocks_quote" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_quote_parent_id_idx" ON "_gsections_v_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_quote_path_idx" ON "_gsections_v_blocks_quote" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_quote_locale_idx" ON "_gsections_v_blocks_quote" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_quote_image_idx" ON "_gsections_v_blocks_quote" USING btree ("image_id");
  CREATE INDEX "_gsections_v_blocks_quote_section_section_background_med_idx" ON "_gsections_v_blocks_quote" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_stats_items_order_idx" ON "_gsections_v_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_stats_items_parent_id_idx" ON "_gsections_v_blocks_stats_items" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_stats_items_locale_idx" ON "_gsections_v_blocks_stats_items" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_stats_bars_order_idx" ON "_gsections_v_blocks_stats_bars" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_stats_bars_parent_id_idx" ON "_gsections_v_blocks_stats_bars" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_stats_bars_locale_idx" ON "_gsections_v_blocks_stats_bars" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_stats_order_idx" ON "_gsections_v_blocks_stats" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_stats_parent_id_idx" ON "_gsections_v_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_stats_path_idx" ON "_gsections_v_blocks_stats" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_stats_locale_idx" ON "_gsections_v_blocks_stats" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_stats_section_section_background_med_idx" ON "_gsections_v_blocks_stats" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_facts_items_order_idx" ON "_gsections_v_blocks_facts_items" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_facts_items_parent_id_idx" ON "_gsections_v_blocks_facts_items" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_facts_items_locale_idx" ON "_gsections_v_blocks_facts_items" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_facts_order_idx" ON "_gsections_v_blocks_facts" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_facts_parent_id_idx" ON "_gsections_v_blocks_facts" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_facts_path_idx" ON "_gsections_v_blocks_facts" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_facts_locale_idx" ON "_gsections_v_blocks_facts" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_facts_section_section_background_med_idx" ON "_gsections_v_blocks_facts" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_article_feed_sites_order_idx" ON "_gsections_v_blocks_article_feed_sites" USING btree ("order");
  CREATE INDEX "_gsections_v_blocks_article_feed_sites_parent_idx" ON "_gsections_v_blocks_article_feed_sites" USING btree ("parent_id");
  CREATE INDEX "_gsections_v_blocks_article_feed_sites_locale_idx" ON "_gsections_v_blocks_article_feed_sites" USING btree ("locale");
  CREATE INDEX "_gsections_v_blocks_article_feed_order_idx" ON "_gsections_v_blocks_article_feed" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_article_feed_parent_id_idx" ON "_gsections_v_blocks_article_feed" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_article_feed_path_idx" ON "_gsections_v_blocks_article_feed" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_article_feed_locale_idx" ON "_gsections_v_blocks_article_feed" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_article_feed_section_section_backgro_idx" ON "_gsections_v_blocks_article_feed" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_people_order_idx" ON "_gsections_v_blocks_people" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_people_parent_id_idx" ON "_gsections_v_blocks_people" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_people_path_idx" ON "_gsections_v_blocks_people" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_people_locale_idx" ON "_gsections_v_blocks_people" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_people_section_section_background_me_idx" ON "_gsections_v_blocks_people" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_documents_order_idx" ON "_gsections_v_blocks_documents" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_documents_parent_id_idx" ON "_gsections_v_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_documents_path_idx" ON "_gsections_v_blocks_documents" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_documents_locale_idx" ON "_gsections_v_blocks_documents" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_documents_section_section_background_idx" ON "_gsections_v_blocks_documents" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_timeline_items_order_idx" ON "_gsections_v_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_timeline_items_parent_id_idx" ON "_gsections_v_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_timeline_items_locale_idx" ON "_gsections_v_blocks_timeline_items" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_timeline_items_image_idx" ON "_gsections_v_blocks_timeline_items" USING btree ("image_id");
  CREATE INDEX "_gsections_v_blocks_timeline_order_idx" ON "_gsections_v_blocks_timeline" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_timeline_parent_id_idx" ON "_gsections_v_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_timeline_path_idx" ON "_gsections_v_blocks_timeline" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_timeline_locale_idx" ON "_gsections_v_blocks_timeline" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_timeline_section_section_background__idx" ON "_gsections_v_blocks_timeline" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_accordion_items_order_idx" ON "_gsections_v_blocks_accordion_items" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_accordion_items_parent_id_idx" ON "_gsections_v_blocks_accordion_items" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_accordion_items_locale_idx" ON "_gsections_v_blocks_accordion_items" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_accordion_order_idx" ON "_gsections_v_blocks_accordion" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_accordion_parent_id_idx" ON "_gsections_v_blocks_accordion" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_accordion_path_idx" ON "_gsections_v_blocks_accordion" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_accordion_locale_idx" ON "_gsections_v_blocks_accordion" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_accordion_section_section_background_idx" ON "_gsections_v_blocks_accordion" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_video_order_idx" ON "_gsections_v_blocks_video" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_video_parent_id_idx" ON "_gsections_v_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_video_path_idx" ON "_gsections_v_blocks_video" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_video_locale_idx" ON "_gsections_v_blocks_video" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_video_file_idx" ON "_gsections_v_blocks_video" USING btree ("file_id");
  CREATE INDEX "_gsections_v_blocks_video_poster_idx" ON "_gsections_v_blocks_video" USING btree ("poster_id");
  CREATE INDEX "_gsections_v_blocks_video_section_section_background_med_idx" ON "_gsections_v_blocks_video" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_embed_order_idx" ON "_gsections_v_blocks_embed" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_embed_parent_id_idx" ON "_gsections_v_blocks_embed" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_embed_path_idx" ON "_gsections_v_blocks_embed" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_embed_locale_idx" ON "_gsections_v_blocks_embed" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_embed_section_section_background_med_idx" ON "_gsections_v_blocks_embed" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_tabs_items_order_idx" ON "_gsections_v_blocks_tabs_items" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_tabs_items_parent_id_idx" ON "_gsections_v_blocks_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_tabs_items_locale_idx" ON "_gsections_v_blocks_tabs_items" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_tabs_order_idx" ON "_gsections_v_blocks_tabs" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_tabs_parent_id_idx" ON "_gsections_v_blocks_tabs" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_tabs_path_idx" ON "_gsections_v_blocks_tabs" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_tabs_locale_idx" ON "_gsections_v_blocks_tabs" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_tabs_section_section_background_medi_idx" ON "_gsections_v_blocks_tabs" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_pricing_plans_features_order_idx" ON "_gsections_v_blocks_pricing_plans_features" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_pricing_plans_features_parent_id_idx" ON "_gsections_v_blocks_pricing_plans_features" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_pricing_plans_features_locale_idx" ON "_gsections_v_blocks_pricing_plans_features" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_pricing_plans_order_idx" ON "_gsections_v_blocks_pricing_plans" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_pricing_plans_parent_id_idx" ON "_gsections_v_blocks_pricing_plans" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_pricing_plans_locale_idx" ON "_gsections_v_blocks_pricing_plans" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_pricing_order_idx" ON "_gsections_v_blocks_pricing" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_pricing_parent_id_idx" ON "_gsections_v_blocks_pricing" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_pricing_path_idx" ON "_gsections_v_blocks_pricing" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_pricing_locale_idx" ON "_gsections_v_blocks_pricing" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_pricing_section_section_background_m_idx" ON "_gsections_v_blocks_pricing" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_logo_wall_logos_order_idx" ON "_gsections_v_blocks_logo_wall_logos" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_logo_wall_logos_parent_id_idx" ON "_gsections_v_blocks_logo_wall_logos" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_logo_wall_logos_locale_idx" ON "_gsections_v_blocks_logo_wall_logos" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_logo_wall_logos_image_idx" ON "_gsections_v_blocks_logo_wall_logos" USING btree ("image_id");
  CREATE INDEX "_gsections_v_blocks_logo_wall_order_idx" ON "_gsections_v_blocks_logo_wall" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_logo_wall_parent_id_idx" ON "_gsections_v_blocks_logo_wall" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_logo_wall_path_idx" ON "_gsections_v_blocks_logo_wall" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_logo_wall_locale_idx" ON "_gsections_v_blocks_logo_wall" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_logo_wall_section_section_background_idx" ON "_gsections_v_blocks_logo_wall" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_testimonials_items_order_idx" ON "_gsections_v_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_testimonials_items_parent_id_idx" ON "_gsections_v_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_testimonials_items_locale_idx" ON "_gsections_v_blocks_testimonials_items" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_testimonials_items_image_idx" ON "_gsections_v_blocks_testimonials_items" USING btree ("image_id");
  CREATE INDEX "_gsections_v_blocks_testimonials_order_idx" ON "_gsections_v_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_testimonials_parent_id_idx" ON "_gsections_v_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_testimonials_path_idx" ON "_gsections_v_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_testimonials_locale_idx" ON "_gsections_v_blocks_testimonials" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_testimonials_section_section_backgro_idx" ON "_gsections_v_blocks_testimonials" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_carousel_slides_order_idx" ON "_gsections_v_blocks_carousel_slides" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_carousel_slides_parent_id_idx" ON "_gsections_v_blocks_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_carousel_slides_locale_idx" ON "_gsections_v_blocks_carousel_slides" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_carousel_slides_image_idx" ON "_gsections_v_blocks_carousel_slides" USING btree ("image_id");
  CREATE INDEX "_gsections_v_blocks_carousel_order_idx" ON "_gsections_v_blocks_carousel" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_carousel_parent_id_idx" ON "_gsections_v_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_carousel_path_idx" ON "_gsections_v_blocks_carousel" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_carousel_locale_idx" ON "_gsections_v_blocks_carousel" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_carousel_section_section_background__idx" ON "_gsections_v_blocks_carousel" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_table_header_order_idx" ON "_gsections_v_blocks_table_header" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_table_header_parent_id_idx" ON "_gsections_v_blocks_table_header" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_table_header_locale_idx" ON "_gsections_v_blocks_table_header" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_table_rows_cells_order_idx" ON "_gsections_v_blocks_table_rows_cells" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_table_rows_cells_parent_id_idx" ON "_gsections_v_blocks_table_rows_cells" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_table_rows_cells_locale_idx" ON "_gsections_v_blocks_table_rows_cells" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_table_rows_order_idx" ON "_gsections_v_blocks_table_rows" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_table_rows_parent_id_idx" ON "_gsections_v_blocks_table_rows" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_table_rows_locale_idx" ON "_gsections_v_blocks_table_rows" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_table_order_idx" ON "_gsections_v_blocks_table" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_table_parent_id_idx" ON "_gsections_v_blocks_table" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_table_path_idx" ON "_gsections_v_blocks_table" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_table_locale_idx" ON "_gsections_v_blocks_table" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_table_section_section_background_med_idx" ON "_gsections_v_blocks_table" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_contact_card_hours_order_idx" ON "_gsections_v_blocks_contact_card_hours" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_contact_card_hours_parent_id_idx" ON "_gsections_v_blocks_contact_card_hours" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_contact_card_hours_locale_idx" ON "_gsections_v_blocks_contact_card_hours" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_contact_card_order_idx" ON "_gsections_v_blocks_contact_card" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_contact_card_parent_id_idx" ON "_gsections_v_blocks_contact_card" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_contact_card_path_idx" ON "_gsections_v_blocks_contact_card" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_contact_card_locale_idx" ON "_gsections_v_blocks_contact_card" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_contact_card_section_section_backgro_idx" ON "_gsections_v_blocks_contact_card" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_icon_features_items_order_idx" ON "_gsections_v_blocks_icon_features_items" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_icon_features_items_parent_id_idx" ON "_gsections_v_blocks_icon_features_items" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_icon_features_items_locale_idx" ON "_gsections_v_blocks_icon_features_items" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_icon_features_order_idx" ON "_gsections_v_blocks_icon_features" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_icon_features_parent_id_idx" ON "_gsections_v_blocks_icon_features" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_icon_features_path_idx" ON "_gsections_v_blocks_icon_features" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_icon_features_locale_idx" ON "_gsections_v_blocks_icon_features" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_icon_features_section_section_backgr_idx" ON "_gsections_v_blocks_icon_features" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_banner_order_idx" ON "_gsections_v_blocks_banner" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_banner_parent_id_idx" ON "_gsections_v_blocks_banner" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_banner_path_idx" ON "_gsections_v_blocks_banner" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_banner_locale_idx" ON "_gsections_v_blocks_banner" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_banner_section_section_background_me_idx" ON "_gsections_v_blocks_banner" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_button_group_links_order_idx" ON "_gsections_v_blocks_button_group_links" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_button_group_links_parent_id_idx" ON "_gsections_v_blocks_button_group_links" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_button_group_links_locale_idx" ON "_gsections_v_blocks_button_group_links" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_button_group_order_idx" ON "_gsections_v_blocks_button_group" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_button_group_parent_id_idx" ON "_gsections_v_blocks_button_group" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_button_group_path_idx" ON "_gsections_v_blocks_button_group" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_button_group_locale_idx" ON "_gsections_v_blocks_button_group" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_button_group_section_section_backgro_idx" ON "_gsections_v_blocks_button_group" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_divider_order_idx" ON "_gsections_v_blocks_divider" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_divider_parent_id_idx" ON "_gsections_v_blocks_divider" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_divider_path_idx" ON "_gsections_v_blocks_divider" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_divider_locale_idx" ON "_gsections_v_blocks_divider" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_divider_section_section_background_m_idx" ON "_gsections_v_blocks_divider" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_columns_columns_order_idx" ON "_gsections_v_blocks_columns_columns" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_columns_columns_parent_id_idx" ON "_gsections_v_blocks_columns_columns" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_columns_columns_locale_idx" ON "_gsections_v_blocks_columns_columns" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_columns_order_idx" ON "_gsections_v_blocks_columns" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_columns_parent_id_idx" ON "_gsections_v_blocks_columns" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_columns_path_idx" ON "_gsections_v_blocks_columns" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_columns_locale_idx" ON "_gsections_v_blocks_columns" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_columns_section_section_background_m_idx" ON "_gsections_v_blocks_columns" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_form_block_order_idx" ON "_gsections_v_blocks_form_block" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_form_block_parent_id_idx" ON "_gsections_v_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_form_block_path_idx" ON "_gsections_v_blocks_form_block" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_form_block_locale_idx" ON "_gsections_v_blocks_form_block" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_form_block_form_idx" ON "_gsections_v_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "_gsections_v_blocks_form_block_section_section_backgroun_idx" ON "_gsections_v_blocks_form_block" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_newsletter_order_idx" ON "_gsections_v_blocks_newsletter" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_newsletter_parent_id_idx" ON "_gsections_v_blocks_newsletter" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_newsletter_path_idx" ON "_gsections_v_blocks_newsletter" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_newsletter_locale_idx" ON "_gsections_v_blocks_newsletter" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_newsletter_form_idx" ON "_gsections_v_blocks_newsletter" USING btree ("form_id");
  CREATE INDEX "_gsections_v_blocks_newsletter_section_section_backgroun_idx" ON "_gsections_v_blocks_newsletter" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_parent_idx" ON "_gsections_v" USING btree ("parent_id");
  CREATE INDEX "_gsections_v_version_version_site_idx" ON "_gsections_v" USING btree ("version_site");
  CREATE INDEX "_gsections_v_version_version_updated_at_idx" ON "_gsections_v" USING btree ("version_updated_at");
  CREATE INDEX "_gsections_v_version_version_created_at_idx" ON "_gsections_v" USING btree ("version_created_at");
  CREATE INDEX "_gsections_v_version_version__status_idx" ON "_gsections_v" USING btree ("version__status");
  CREATE INDEX "_gsections_v_created_at_idx" ON "_gsections_v" USING btree ("created_at");
  CREATE INDEX "_gsections_v_updated_at_idx" ON "_gsections_v" USING btree ("updated_at");
  CREATE INDEX "_gsections_v_snapshot_idx" ON "_gsections_v" USING btree ("snapshot");
  CREATE INDEX "_gsections_v_published_locale_idx" ON "_gsections_v" USING btree ("published_locale");
  CREATE INDEX "_gsections_v_latest_idx" ON "_gsections_v" USING btree ("latest");
  CREATE INDEX "_gsections_v_autosave_idx" ON "_gsections_v" USING btree ("autosave");
  CREATE INDEX "_gsections_v_rels_order_idx" ON "_gsections_v_rels" USING btree ("order");
  CREATE INDEX "_gsections_v_rels_parent_idx" ON "_gsections_v_rels" USING btree ("parent_id");
  CREATE INDEX "_gsections_v_rels_path_idx" ON "_gsections_v_rels" USING btree ("path");
  CREATE INDEX "_gsections_v_rels_locale_idx" ON "_gsections_v_rels" USING btree ("locale");
  CREATE INDEX "_gsections_v_rels_pages_id_idx" ON "_gsections_v_rels" USING btree ("pages_id","locale");
  CREATE INDEX "_gsections_v_rels_articles_id_idx" ON "_gsections_v_rels" USING btree ("articles_id","locale");
  CREATE INDEX "_gsections_v_rels_people_id_idx" ON "_gsections_v_rels" USING btree ("people_id","locale");
  CREATE INDEX "_gsections_v_rels_documents_id_idx" ON "_gsections_v_rels" USING btree ("documents_id","locale");
  CREATE INDEX "page_templates_blocks_hero_links_order_idx" ON "page_templates_blocks_hero_links" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_hero_links_parent_id_idx" ON "page_templates_blocks_hero_links" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_hero_links_locale_idx" ON "page_templates_blocks_hero_links" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_hero_order_idx" ON "page_templates_blocks_hero" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_hero_parent_id_idx" ON "page_templates_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_hero_path_idx" ON "page_templates_blocks_hero" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_hero_locale_idx" ON "page_templates_blocks_hero" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_hero_media_idx" ON "page_templates_blocks_hero" USING btree ("media_id");
  CREATE INDEX "page_templates_blocks_hero_section_section_background_me_idx" ON "page_templates_blocks_hero" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_content_order_idx" ON "page_templates_blocks_content" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_content_parent_id_idx" ON "page_templates_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_content_path_idx" ON "page_templates_blocks_content" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_content_locale_idx" ON "page_templates_blocks_content" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_content_section_section_background_idx" ON "page_templates_blocks_content" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_text_image_links_order_idx" ON "page_templates_blocks_text_image_links" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_text_image_links_parent_id_idx" ON "page_templates_blocks_text_image_links" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_text_image_links_locale_idx" ON "page_templates_blocks_text_image_links" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_text_image_order_idx" ON "page_templates_blocks_text_image" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_text_image_parent_id_idx" ON "page_templates_blocks_text_image" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_text_image_path_idx" ON "page_templates_blocks_text_image" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_text_image_locale_idx" ON "page_templates_blocks_text_image" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_text_image_image_idx" ON "page_templates_blocks_text_image" USING btree ("image_id");
  CREATE INDEX "page_templates_blocks_text_image_section_section_backgro_idx" ON "page_templates_blocks_text_image" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_full_image_order_idx" ON "page_templates_blocks_full_image" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_full_image_parent_id_idx" ON "page_templates_blocks_full_image" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_full_image_path_idx" ON "page_templates_blocks_full_image" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_full_image_locale_idx" ON "page_templates_blocks_full_image" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_full_image_image_idx" ON "page_templates_blocks_full_image" USING btree ("image_id");
  CREATE INDEX "page_templates_blocks_full_image_section_section_backgro_idx" ON "page_templates_blocks_full_image" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_image_grid_images_order_idx" ON "page_templates_blocks_image_grid_images" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_image_grid_images_parent_id_idx" ON "page_templates_blocks_image_grid_images" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_image_grid_images_locale_idx" ON "page_templates_blocks_image_grid_images" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_image_grid_images_image_idx" ON "page_templates_blocks_image_grid_images" USING btree ("image_id");
  CREATE INDEX "page_templates_blocks_image_grid_order_idx" ON "page_templates_blocks_image_grid" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_image_grid_parent_id_idx" ON "page_templates_blocks_image_grid" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_image_grid_path_idx" ON "page_templates_blocks_image_grid" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_image_grid_locale_idx" ON "page_templates_blocks_image_grid" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_image_grid_section_section_backgro_idx" ON "page_templates_blocks_image_grid" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_cards_items_order_idx" ON "page_templates_blocks_cards_items" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_cards_items_parent_id_idx" ON "page_templates_blocks_cards_items" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_cards_items_locale_idx" ON "page_templates_blocks_cards_items" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_cards_items_image_idx" ON "page_templates_blocks_cards_items" USING btree ("image_id");
  CREATE INDEX "page_templates_blocks_cards_order_idx" ON "page_templates_blocks_cards" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_cards_parent_id_idx" ON "page_templates_blocks_cards" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_cards_path_idx" ON "page_templates_blocks_cards" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_cards_locale_idx" ON "page_templates_blocks_cards" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_cards_section_section_background_m_idx" ON "page_templates_blocks_cards" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_child_pages_order_idx" ON "page_templates_blocks_child_pages" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_child_pages_parent_id_idx" ON "page_templates_blocks_child_pages" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_child_pages_path_idx" ON "page_templates_blocks_child_pages" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_child_pages_locale_idx" ON "page_templates_blocks_child_pages" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_child_pages_parent_idx" ON "page_templates_blocks_child_pages" USING btree ("parent_id");
  CREATE INDEX "page_templates_blocks_child_pages_section_section_backgr_idx" ON "page_templates_blocks_child_pages" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_cta_links_order_idx" ON "page_templates_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_cta_links_parent_id_idx" ON "page_templates_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_cta_links_locale_idx" ON "page_templates_blocks_cta_links" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_cta_order_idx" ON "page_templates_blocks_cta" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_cta_parent_id_idx" ON "page_templates_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_cta_path_idx" ON "page_templates_blocks_cta" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_cta_locale_idx" ON "page_templates_blocks_cta" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_cta_section_section_background_med_idx" ON "page_templates_blocks_cta" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_quote_order_idx" ON "page_templates_blocks_quote" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_quote_parent_id_idx" ON "page_templates_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_quote_path_idx" ON "page_templates_blocks_quote" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_quote_locale_idx" ON "page_templates_blocks_quote" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_quote_image_idx" ON "page_templates_blocks_quote" USING btree ("image_id");
  CREATE INDEX "page_templates_blocks_quote_section_section_background_m_idx" ON "page_templates_blocks_quote" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_stats_items_order_idx" ON "page_templates_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_stats_items_parent_id_idx" ON "page_templates_blocks_stats_items" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_stats_items_locale_idx" ON "page_templates_blocks_stats_items" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_stats_bars_order_idx" ON "page_templates_blocks_stats_bars" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_stats_bars_parent_id_idx" ON "page_templates_blocks_stats_bars" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_stats_bars_locale_idx" ON "page_templates_blocks_stats_bars" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_stats_order_idx" ON "page_templates_blocks_stats" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_stats_parent_id_idx" ON "page_templates_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_stats_path_idx" ON "page_templates_blocks_stats" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_stats_locale_idx" ON "page_templates_blocks_stats" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_stats_section_section_background_m_idx" ON "page_templates_blocks_stats" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_facts_items_order_idx" ON "page_templates_blocks_facts_items" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_facts_items_parent_id_idx" ON "page_templates_blocks_facts_items" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_facts_items_locale_idx" ON "page_templates_blocks_facts_items" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_facts_order_idx" ON "page_templates_blocks_facts" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_facts_parent_id_idx" ON "page_templates_blocks_facts" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_facts_path_idx" ON "page_templates_blocks_facts" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_facts_locale_idx" ON "page_templates_blocks_facts" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_facts_section_section_background_m_idx" ON "page_templates_blocks_facts" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_article_feed_sites_order_idx" ON "page_templates_blocks_article_feed_sites" USING btree ("order");
  CREATE INDEX "page_templates_blocks_article_feed_sites_parent_idx" ON "page_templates_blocks_article_feed_sites" USING btree ("parent_id");
  CREATE INDEX "page_templates_blocks_article_feed_sites_locale_idx" ON "page_templates_blocks_article_feed_sites" USING btree ("locale");
  CREATE INDEX "page_templates_blocks_article_feed_order_idx" ON "page_templates_blocks_article_feed" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_article_feed_parent_id_idx" ON "page_templates_blocks_article_feed" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_article_feed_path_idx" ON "page_templates_blocks_article_feed" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_article_feed_locale_idx" ON "page_templates_blocks_article_feed" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_article_feed_section_section_backg_idx" ON "page_templates_blocks_article_feed" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_people_order_idx" ON "page_templates_blocks_people" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_people_parent_id_idx" ON "page_templates_blocks_people" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_people_path_idx" ON "page_templates_blocks_people" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_people_locale_idx" ON "page_templates_blocks_people" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_people_section_section_background__idx" ON "page_templates_blocks_people" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_documents_order_idx" ON "page_templates_blocks_documents" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_documents_parent_id_idx" ON "page_templates_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_documents_path_idx" ON "page_templates_blocks_documents" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_documents_locale_idx" ON "page_templates_blocks_documents" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_documents_section_section_backgrou_idx" ON "page_templates_blocks_documents" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_timeline_items_order_idx" ON "page_templates_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_timeline_items_parent_id_idx" ON "page_templates_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_timeline_items_locale_idx" ON "page_templates_blocks_timeline_items" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_timeline_items_image_idx" ON "page_templates_blocks_timeline_items" USING btree ("image_id");
  CREATE INDEX "page_templates_blocks_timeline_order_idx" ON "page_templates_blocks_timeline" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_timeline_parent_id_idx" ON "page_templates_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_timeline_path_idx" ON "page_templates_blocks_timeline" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_timeline_locale_idx" ON "page_templates_blocks_timeline" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_timeline_section_section_backgroun_idx" ON "page_templates_blocks_timeline" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_accordion_items_order_idx" ON "page_templates_blocks_accordion_items" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_accordion_items_parent_id_idx" ON "page_templates_blocks_accordion_items" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_accordion_items_locale_idx" ON "page_templates_blocks_accordion_items" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_accordion_order_idx" ON "page_templates_blocks_accordion" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_accordion_parent_id_idx" ON "page_templates_blocks_accordion" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_accordion_path_idx" ON "page_templates_blocks_accordion" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_accordion_locale_idx" ON "page_templates_blocks_accordion" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_accordion_section_section_backgrou_idx" ON "page_templates_blocks_accordion" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_video_order_idx" ON "page_templates_blocks_video" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_video_parent_id_idx" ON "page_templates_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_video_path_idx" ON "page_templates_blocks_video" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_video_locale_idx" ON "page_templates_blocks_video" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_video_file_idx" ON "page_templates_blocks_video" USING btree ("file_id");
  CREATE INDEX "page_templates_blocks_video_poster_idx" ON "page_templates_blocks_video" USING btree ("poster_id");
  CREATE INDEX "page_templates_blocks_video_section_section_background_m_idx" ON "page_templates_blocks_video" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_embed_order_idx" ON "page_templates_blocks_embed" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_embed_parent_id_idx" ON "page_templates_blocks_embed" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_embed_path_idx" ON "page_templates_blocks_embed" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_embed_locale_idx" ON "page_templates_blocks_embed" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_embed_section_section_background_m_idx" ON "page_templates_blocks_embed" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_tabs_items_order_idx" ON "page_templates_blocks_tabs_items" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_tabs_items_parent_id_idx" ON "page_templates_blocks_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_tabs_items_locale_idx" ON "page_templates_blocks_tabs_items" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_tabs_order_idx" ON "page_templates_blocks_tabs" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_tabs_parent_id_idx" ON "page_templates_blocks_tabs" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_tabs_path_idx" ON "page_templates_blocks_tabs" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_tabs_locale_idx" ON "page_templates_blocks_tabs" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_tabs_section_section_background_me_idx" ON "page_templates_blocks_tabs" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_pricing_plans_features_order_idx" ON "page_templates_blocks_pricing_plans_features" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_pricing_plans_features_parent_id_idx" ON "page_templates_blocks_pricing_plans_features" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_pricing_plans_features_locale_idx" ON "page_templates_blocks_pricing_plans_features" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_pricing_plans_order_idx" ON "page_templates_blocks_pricing_plans" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_pricing_plans_parent_id_idx" ON "page_templates_blocks_pricing_plans" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_pricing_plans_locale_idx" ON "page_templates_blocks_pricing_plans" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_pricing_order_idx" ON "page_templates_blocks_pricing" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_pricing_parent_id_idx" ON "page_templates_blocks_pricing" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_pricing_path_idx" ON "page_templates_blocks_pricing" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_pricing_locale_idx" ON "page_templates_blocks_pricing" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_pricing_section_section_background_idx" ON "page_templates_blocks_pricing" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_logo_wall_logos_order_idx" ON "page_templates_blocks_logo_wall_logos" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_logo_wall_logos_parent_id_idx" ON "page_templates_blocks_logo_wall_logos" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_logo_wall_logos_locale_idx" ON "page_templates_blocks_logo_wall_logos" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_logo_wall_logos_image_idx" ON "page_templates_blocks_logo_wall_logos" USING btree ("image_id");
  CREATE INDEX "page_templates_blocks_logo_wall_order_idx" ON "page_templates_blocks_logo_wall" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_logo_wall_parent_id_idx" ON "page_templates_blocks_logo_wall" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_logo_wall_path_idx" ON "page_templates_blocks_logo_wall" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_logo_wall_locale_idx" ON "page_templates_blocks_logo_wall" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_logo_wall_section_section_backgrou_idx" ON "page_templates_blocks_logo_wall" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_testimonials_items_order_idx" ON "page_templates_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_testimonials_items_parent_id_idx" ON "page_templates_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_testimonials_items_locale_idx" ON "page_templates_blocks_testimonials_items" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_testimonials_items_image_idx" ON "page_templates_blocks_testimonials_items" USING btree ("image_id");
  CREATE INDEX "page_templates_blocks_testimonials_order_idx" ON "page_templates_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_testimonials_parent_id_idx" ON "page_templates_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_testimonials_path_idx" ON "page_templates_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_testimonials_locale_idx" ON "page_templates_blocks_testimonials" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_testimonials_section_section_backg_idx" ON "page_templates_blocks_testimonials" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_carousel_slides_order_idx" ON "page_templates_blocks_carousel_slides" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_carousel_slides_parent_id_idx" ON "page_templates_blocks_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_carousel_slides_locale_idx" ON "page_templates_blocks_carousel_slides" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_carousel_slides_image_idx" ON "page_templates_blocks_carousel_slides" USING btree ("image_id");
  CREATE INDEX "page_templates_blocks_carousel_order_idx" ON "page_templates_blocks_carousel" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_carousel_parent_id_idx" ON "page_templates_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_carousel_path_idx" ON "page_templates_blocks_carousel" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_carousel_locale_idx" ON "page_templates_blocks_carousel" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_carousel_section_section_backgroun_idx" ON "page_templates_blocks_carousel" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_table_header_order_idx" ON "page_templates_blocks_table_header" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_table_header_parent_id_idx" ON "page_templates_blocks_table_header" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_table_header_locale_idx" ON "page_templates_blocks_table_header" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_table_rows_cells_order_idx" ON "page_templates_blocks_table_rows_cells" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_table_rows_cells_parent_id_idx" ON "page_templates_blocks_table_rows_cells" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_table_rows_cells_locale_idx" ON "page_templates_blocks_table_rows_cells" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_table_rows_order_idx" ON "page_templates_blocks_table_rows" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_table_rows_parent_id_idx" ON "page_templates_blocks_table_rows" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_table_rows_locale_idx" ON "page_templates_blocks_table_rows" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_table_order_idx" ON "page_templates_blocks_table" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_table_parent_id_idx" ON "page_templates_blocks_table" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_table_path_idx" ON "page_templates_blocks_table" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_table_locale_idx" ON "page_templates_blocks_table" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_table_section_section_background_m_idx" ON "page_templates_blocks_table" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_contact_card_hours_order_idx" ON "page_templates_blocks_contact_card_hours" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_contact_card_hours_parent_id_idx" ON "page_templates_blocks_contact_card_hours" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_contact_card_hours_locale_idx" ON "page_templates_blocks_contact_card_hours" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_contact_card_order_idx" ON "page_templates_blocks_contact_card" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_contact_card_parent_id_idx" ON "page_templates_blocks_contact_card" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_contact_card_path_idx" ON "page_templates_blocks_contact_card" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_contact_card_locale_idx" ON "page_templates_blocks_contact_card" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_contact_card_section_section_backg_idx" ON "page_templates_blocks_contact_card" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_icon_features_items_order_idx" ON "page_templates_blocks_icon_features_items" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_icon_features_items_parent_id_idx" ON "page_templates_blocks_icon_features_items" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_icon_features_items_locale_idx" ON "page_templates_blocks_icon_features_items" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_icon_features_order_idx" ON "page_templates_blocks_icon_features" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_icon_features_parent_id_idx" ON "page_templates_blocks_icon_features" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_icon_features_path_idx" ON "page_templates_blocks_icon_features" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_icon_features_locale_idx" ON "page_templates_blocks_icon_features" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_icon_features_section_section_back_idx" ON "page_templates_blocks_icon_features" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_banner_order_idx" ON "page_templates_blocks_banner" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_banner_parent_id_idx" ON "page_templates_blocks_banner" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_banner_path_idx" ON "page_templates_blocks_banner" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_banner_locale_idx" ON "page_templates_blocks_banner" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_banner_section_section_background__idx" ON "page_templates_blocks_banner" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_button_group_links_order_idx" ON "page_templates_blocks_button_group_links" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_button_group_links_parent_id_idx" ON "page_templates_blocks_button_group_links" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_button_group_links_locale_idx" ON "page_templates_blocks_button_group_links" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_button_group_order_idx" ON "page_templates_blocks_button_group" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_button_group_parent_id_idx" ON "page_templates_blocks_button_group" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_button_group_path_idx" ON "page_templates_blocks_button_group" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_button_group_locale_idx" ON "page_templates_blocks_button_group" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_button_group_section_section_backg_idx" ON "page_templates_blocks_button_group" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_divider_order_idx" ON "page_templates_blocks_divider" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_divider_parent_id_idx" ON "page_templates_blocks_divider" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_divider_path_idx" ON "page_templates_blocks_divider" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_divider_locale_idx" ON "page_templates_blocks_divider" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_divider_section_section_background_idx" ON "page_templates_blocks_divider" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_columns_columns_order_idx" ON "page_templates_blocks_columns_columns" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_columns_columns_parent_id_idx" ON "page_templates_blocks_columns_columns" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_columns_columns_locale_idx" ON "page_templates_blocks_columns_columns" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_columns_order_idx" ON "page_templates_blocks_columns" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_columns_parent_id_idx" ON "page_templates_blocks_columns" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_columns_path_idx" ON "page_templates_blocks_columns" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_columns_locale_idx" ON "page_templates_blocks_columns" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_columns_section_section_background_idx" ON "page_templates_blocks_columns" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_form_block_order_idx" ON "page_templates_blocks_form_block" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_form_block_parent_id_idx" ON "page_templates_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_form_block_path_idx" ON "page_templates_blocks_form_block" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_form_block_locale_idx" ON "page_templates_blocks_form_block" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_form_block_form_idx" ON "page_templates_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "page_templates_blocks_form_block_section_section_backgro_idx" ON "page_templates_blocks_form_block" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_newsletter_order_idx" ON "page_templates_blocks_newsletter" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_newsletter_parent_id_idx" ON "page_templates_blocks_newsletter" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_newsletter_path_idx" ON "page_templates_blocks_newsletter" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_newsletter_locale_idx" ON "page_templates_blocks_newsletter" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_newsletter_form_idx" ON "page_templates_blocks_newsletter" USING btree ("form_id");
  CREATE INDEX "page_templates_blocks_newsletter_section_section_backgro_idx" ON "page_templates_blocks_newsletter" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_global_section_order_idx" ON "page_templates_blocks_global_section" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_global_section_parent_id_idx" ON "page_templates_blocks_global_section" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_global_section_path_idx" ON "page_templates_blocks_global_section" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_global_section_locale_idx" ON "page_templates_blocks_global_section" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_global_section_global_section_idx" ON "page_templates_blocks_global_section" USING btree ("global_section_id");
  CREATE INDEX "page_templates_blocks_global_section_section_section_bac_idx" ON "page_templates_blocks_global_section" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_site_idx" ON "page_templates" USING btree ("site");
  CREATE INDEX "page_templates_updated_at_idx" ON "page_templates" USING btree ("updated_at");
  CREATE INDEX "page_templates_created_at_idx" ON "page_templates" USING btree ("created_at");
  CREATE INDEX "page_templates_rels_order_idx" ON "page_templates_rels" USING btree ("order");
  CREATE INDEX "page_templates_rels_parent_idx" ON "page_templates_rels" USING btree ("parent_id");
  CREATE INDEX "page_templates_rels_path_idx" ON "page_templates_rels" USING btree ("path");
  CREATE INDEX "page_templates_rels_locale_idx" ON "page_templates_rels" USING btree ("locale");
  CREATE INDEX "page_templates_rels_pages_id_idx" ON "page_templates_rels" USING btree ("pages_id","locale");
  CREATE INDEX "page_templates_rels_articles_id_idx" ON "page_templates_rels" USING btree ("articles_id","locale");
  CREATE INDEX "page_templates_rels_people_id_idx" ON "page_templates_rels" USING btree ("people_id","locale");
  CREATE INDEX "page_templates_rels_documents_id_idx" ON "page_templates_rels" USING btree ("documents_id","locale");
  CREATE INDEX "section_presets_blocks_hero_links_order_idx" ON "section_presets_blocks_hero_links" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_hero_links_parent_id_idx" ON "section_presets_blocks_hero_links" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_hero_links_locale_idx" ON "section_presets_blocks_hero_links" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_hero_order_idx" ON "section_presets_blocks_hero" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_hero_parent_id_idx" ON "section_presets_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_hero_path_idx" ON "section_presets_blocks_hero" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_hero_locale_idx" ON "section_presets_blocks_hero" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_hero_media_idx" ON "section_presets_blocks_hero" USING btree ("media_id");
  CREATE INDEX "section_presets_blocks_hero_section_section_background_m_idx" ON "section_presets_blocks_hero" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_content_order_idx" ON "section_presets_blocks_content" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_content_parent_id_idx" ON "section_presets_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_content_path_idx" ON "section_presets_blocks_content" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_content_locale_idx" ON "section_presets_blocks_content" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_content_section_section_backgroun_idx" ON "section_presets_blocks_content" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_text_image_links_order_idx" ON "section_presets_blocks_text_image_links" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_text_image_links_parent_id_idx" ON "section_presets_blocks_text_image_links" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_text_image_links_locale_idx" ON "section_presets_blocks_text_image_links" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_text_image_order_idx" ON "section_presets_blocks_text_image" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_text_image_parent_id_idx" ON "section_presets_blocks_text_image" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_text_image_path_idx" ON "section_presets_blocks_text_image" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_text_image_locale_idx" ON "section_presets_blocks_text_image" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_text_image_image_idx" ON "section_presets_blocks_text_image" USING btree ("image_id");
  CREATE INDEX "section_presets_blocks_text_image_section_section_backgr_idx" ON "section_presets_blocks_text_image" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_full_image_order_idx" ON "section_presets_blocks_full_image" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_full_image_parent_id_idx" ON "section_presets_blocks_full_image" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_full_image_path_idx" ON "section_presets_blocks_full_image" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_full_image_locale_idx" ON "section_presets_blocks_full_image" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_full_image_image_idx" ON "section_presets_blocks_full_image" USING btree ("image_id");
  CREATE INDEX "section_presets_blocks_full_image_section_section_backgr_idx" ON "section_presets_blocks_full_image" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_image_grid_images_order_idx" ON "section_presets_blocks_image_grid_images" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_image_grid_images_parent_id_idx" ON "section_presets_blocks_image_grid_images" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_image_grid_images_locale_idx" ON "section_presets_blocks_image_grid_images" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_image_grid_images_image_idx" ON "section_presets_blocks_image_grid_images" USING btree ("image_id");
  CREATE INDEX "section_presets_blocks_image_grid_order_idx" ON "section_presets_blocks_image_grid" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_image_grid_parent_id_idx" ON "section_presets_blocks_image_grid" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_image_grid_path_idx" ON "section_presets_blocks_image_grid" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_image_grid_locale_idx" ON "section_presets_blocks_image_grid" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_image_grid_section_section_backgr_idx" ON "section_presets_blocks_image_grid" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_cards_items_order_idx" ON "section_presets_blocks_cards_items" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_cards_items_parent_id_idx" ON "section_presets_blocks_cards_items" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_cards_items_locale_idx" ON "section_presets_blocks_cards_items" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_cards_items_image_idx" ON "section_presets_blocks_cards_items" USING btree ("image_id");
  CREATE INDEX "section_presets_blocks_cards_order_idx" ON "section_presets_blocks_cards" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_cards_parent_id_idx" ON "section_presets_blocks_cards" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_cards_path_idx" ON "section_presets_blocks_cards" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_cards_locale_idx" ON "section_presets_blocks_cards" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_cards_section_section_background__idx" ON "section_presets_blocks_cards" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_child_pages_order_idx" ON "section_presets_blocks_child_pages" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_child_pages_parent_id_idx" ON "section_presets_blocks_child_pages" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_child_pages_path_idx" ON "section_presets_blocks_child_pages" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_child_pages_locale_idx" ON "section_presets_blocks_child_pages" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_child_pages_parent_idx" ON "section_presets_blocks_child_pages" USING btree ("parent_id");
  CREATE INDEX "section_presets_blocks_child_pages_section_section_backg_idx" ON "section_presets_blocks_child_pages" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_cta_links_order_idx" ON "section_presets_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_cta_links_parent_id_idx" ON "section_presets_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_cta_links_locale_idx" ON "section_presets_blocks_cta_links" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_cta_order_idx" ON "section_presets_blocks_cta" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_cta_parent_id_idx" ON "section_presets_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_cta_path_idx" ON "section_presets_blocks_cta" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_cta_locale_idx" ON "section_presets_blocks_cta" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_cta_section_section_background_me_idx" ON "section_presets_blocks_cta" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_quote_order_idx" ON "section_presets_blocks_quote" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_quote_parent_id_idx" ON "section_presets_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_quote_path_idx" ON "section_presets_blocks_quote" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_quote_locale_idx" ON "section_presets_blocks_quote" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_quote_image_idx" ON "section_presets_blocks_quote" USING btree ("image_id");
  CREATE INDEX "section_presets_blocks_quote_section_section_background__idx" ON "section_presets_blocks_quote" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_stats_items_order_idx" ON "section_presets_blocks_stats_items" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_stats_items_parent_id_idx" ON "section_presets_blocks_stats_items" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_stats_items_locale_idx" ON "section_presets_blocks_stats_items" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_stats_bars_order_idx" ON "section_presets_blocks_stats_bars" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_stats_bars_parent_id_idx" ON "section_presets_blocks_stats_bars" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_stats_bars_locale_idx" ON "section_presets_blocks_stats_bars" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_stats_order_idx" ON "section_presets_blocks_stats" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_stats_parent_id_idx" ON "section_presets_blocks_stats" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_stats_path_idx" ON "section_presets_blocks_stats" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_stats_locale_idx" ON "section_presets_blocks_stats" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_stats_section_section_background__idx" ON "section_presets_blocks_stats" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_facts_items_order_idx" ON "section_presets_blocks_facts_items" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_facts_items_parent_id_idx" ON "section_presets_blocks_facts_items" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_facts_items_locale_idx" ON "section_presets_blocks_facts_items" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_facts_order_idx" ON "section_presets_blocks_facts" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_facts_parent_id_idx" ON "section_presets_blocks_facts" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_facts_path_idx" ON "section_presets_blocks_facts" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_facts_locale_idx" ON "section_presets_blocks_facts" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_facts_section_section_background__idx" ON "section_presets_blocks_facts" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_article_feed_sites_order_idx" ON "section_presets_blocks_article_feed_sites" USING btree ("order");
  CREATE INDEX "section_presets_blocks_article_feed_sites_parent_idx" ON "section_presets_blocks_article_feed_sites" USING btree ("parent_id");
  CREATE INDEX "section_presets_blocks_article_feed_sites_locale_idx" ON "section_presets_blocks_article_feed_sites" USING btree ("locale");
  CREATE INDEX "section_presets_blocks_article_feed_order_idx" ON "section_presets_blocks_article_feed" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_article_feed_parent_id_idx" ON "section_presets_blocks_article_feed" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_article_feed_path_idx" ON "section_presets_blocks_article_feed" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_article_feed_locale_idx" ON "section_presets_blocks_article_feed" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_article_feed_section_section_back_idx" ON "section_presets_blocks_article_feed" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_people_order_idx" ON "section_presets_blocks_people" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_people_parent_id_idx" ON "section_presets_blocks_people" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_people_path_idx" ON "section_presets_blocks_people" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_people_locale_idx" ON "section_presets_blocks_people" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_people_section_section_background_idx" ON "section_presets_blocks_people" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_documents_order_idx" ON "section_presets_blocks_documents" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_documents_parent_id_idx" ON "section_presets_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_documents_path_idx" ON "section_presets_blocks_documents" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_documents_locale_idx" ON "section_presets_blocks_documents" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_documents_section_section_backgro_idx" ON "section_presets_blocks_documents" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_timeline_items_order_idx" ON "section_presets_blocks_timeline_items" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_timeline_items_parent_id_idx" ON "section_presets_blocks_timeline_items" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_timeline_items_locale_idx" ON "section_presets_blocks_timeline_items" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_timeline_items_image_idx" ON "section_presets_blocks_timeline_items" USING btree ("image_id");
  CREATE INDEX "section_presets_blocks_timeline_order_idx" ON "section_presets_blocks_timeline" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_timeline_parent_id_idx" ON "section_presets_blocks_timeline" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_timeline_path_idx" ON "section_presets_blocks_timeline" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_timeline_locale_idx" ON "section_presets_blocks_timeline" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_timeline_section_section_backgrou_idx" ON "section_presets_blocks_timeline" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_accordion_items_order_idx" ON "section_presets_blocks_accordion_items" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_accordion_items_parent_id_idx" ON "section_presets_blocks_accordion_items" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_accordion_items_locale_idx" ON "section_presets_blocks_accordion_items" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_accordion_order_idx" ON "section_presets_blocks_accordion" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_accordion_parent_id_idx" ON "section_presets_blocks_accordion" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_accordion_path_idx" ON "section_presets_blocks_accordion" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_accordion_locale_idx" ON "section_presets_blocks_accordion" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_accordion_section_section_backgro_idx" ON "section_presets_blocks_accordion" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_video_order_idx" ON "section_presets_blocks_video" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_video_parent_id_idx" ON "section_presets_blocks_video" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_video_path_idx" ON "section_presets_blocks_video" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_video_locale_idx" ON "section_presets_blocks_video" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_video_file_idx" ON "section_presets_blocks_video" USING btree ("file_id");
  CREATE INDEX "section_presets_blocks_video_poster_idx" ON "section_presets_blocks_video" USING btree ("poster_id");
  CREATE INDEX "section_presets_blocks_video_section_section_background__idx" ON "section_presets_blocks_video" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_embed_order_idx" ON "section_presets_blocks_embed" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_embed_parent_id_idx" ON "section_presets_blocks_embed" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_embed_path_idx" ON "section_presets_blocks_embed" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_embed_locale_idx" ON "section_presets_blocks_embed" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_embed_section_section_background__idx" ON "section_presets_blocks_embed" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_tabs_items_order_idx" ON "section_presets_blocks_tabs_items" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_tabs_items_parent_id_idx" ON "section_presets_blocks_tabs_items" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_tabs_items_locale_idx" ON "section_presets_blocks_tabs_items" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_tabs_order_idx" ON "section_presets_blocks_tabs" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_tabs_parent_id_idx" ON "section_presets_blocks_tabs" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_tabs_path_idx" ON "section_presets_blocks_tabs" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_tabs_locale_idx" ON "section_presets_blocks_tabs" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_tabs_section_section_background_m_idx" ON "section_presets_blocks_tabs" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_pricing_plans_features_order_idx" ON "section_presets_blocks_pricing_plans_features" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_pricing_plans_features_parent_id_idx" ON "section_presets_blocks_pricing_plans_features" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_pricing_plans_features_locale_idx" ON "section_presets_blocks_pricing_plans_features" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_pricing_plans_order_idx" ON "section_presets_blocks_pricing_plans" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_pricing_plans_parent_id_idx" ON "section_presets_blocks_pricing_plans" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_pricing_plans_locale_idx" ON "section_presets_blocks_pricing_plans" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_pricing_order_idx" ON "section_presets_blocks_pricing" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_pricing_parent_id_idx" ON "section_presets_blocks_pricing" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_pricing_path_idx" ON "section_presets_blocks_pricing" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_pricing_locale_idx" ON "section_presets_blocks_pricing" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_pricing_section_section_backgroun_idx" ON "section_presets_blocks_pricing" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_logo_wall_logos_order_idx" ON "section_presets_blocks_logo_wall_logos" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_logo_wall_logos_parent_id_idx" ON "section_presets_blocks_logo_wall_logos" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_logo_wall_logos_locale_idx" ON "section_presets_blocks_logo_wall_logos" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_logo_wall_logos_image_idx" ON "section_presets_blocks_logo_wall_logos" USING btree ("image_id");
  CREATE INDEX "section_presets_blocks_logo_wall_order_idx" ON "section_presets_blocks_logo_wall" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_logo_wall_parent_id_idx" ON "section_presets_blocks_logo_wall" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_logo_wall_path_idx" ON "section_presets_blocks_logo_wall" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_logo_wall_locale_idx" ON "section_presets_blocks_logo_wall" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_logo_wall_section_section_backgro_idx" ON "section_presets_blocks_logo_wall" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_testimonials_items_order_idx" ON "section_presets_blocks_testimonials_items" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_testimonials_items_parent_id_idx" ON "section_presets_blocks_testimonials_items" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_testimonials_items_locale_idx" ON "section_presets_blocks_testimonials_items" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_testimonials_items_image_idx" ON "section_presets_blocks_testimonials_items" USING btree ("image_id");
  CREATE INDEX "section_presets_blocks_testimonials_order_idx" ON "section_presets_blocks_testimonials" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_testimonials_parent_id_idx" ON "section_presets_blocks_testimonials" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_testimonials_path_idx" ON "section_presets_blocks_testimonials" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_testimonials_locale_idx" ON "section_presets_blocks_testimonials" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_testimonials_section_section_back_idx" ON "section_presets_blocks_testimonials" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_carousel_slides_order_idx" ON "section_presets_blocks_carousel_slides" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_carousel_slides_parent_id_idx" ON "section_presets_blocks_carousel_slides" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_carousel_slides_locale_idx" ON "section_presets_blocks_carousel_slides" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_carousel_slides_image_idx" ON "section_presets_blocks_carousel_slides" USING btree ("image_id");
  CREATE INDEX "section_presets_blocks_carousel_order_idx" ON "section_presets_blocks_carousel" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_carousel_parent_id_idx" ON "section_presets_blocks_carousel" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_carousel_path_idx" ON "section_presets_blocks_carousel" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_carousel_locale_idx" ON "section_presets_blocks_carousel" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_carousel_section_section_backgrou_idx" ON "section_presets_blocks_carousel" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_table_header_order_idx" ON "section_presets_blocks_table_header" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_table_header_parent_id_idx" ON "section_presets_blocks_table_header" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_table_header_locale_idx" ON "section_presets_blocks_table_header" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_table_rows_cells_order_idx" ON "section_presets_blocks_table_rows_cells" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_table_rows_cells_parent_id_idx" ON "section_presets_blocks_table_rows_cells" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_table_rows_cells_locale_idx" ON "section_presets_blocks_table_rows_cells" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_table_rows_order_idx" ON "section_presets_blocks_table_rows" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_table_rows_parent_id_idx" ON "section_presets_blocks_table_rows" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_table_rows_locale_idx" ON "section_presets_blocks_table_rows" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_table_order_idx" ON "section_presets_blocks_table" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_table_parent_id_idx" ON "section_presets_blocks_table" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_table_path_idx" ON "section_presets_blocks_table" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_table_locale_idx" ON "section_presets_blocks_table" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_table_section_section_background__idx" ON "section_presets_blocks_table" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_contact_card_hours_order_idx" ON "section_presets_blocks_contact_card_hours" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_contact_card_hours_parent_id_idx" ON "section_presets_blocks_contact_card_hours" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_contact_card_hours_locale_idx" ON "section_presets_blocks_contact_card_hours" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_contact_card_order_idx" ON "section_presets_blocks_contact_card" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_contact_card_parent_id_idx" ON "section_presets_blocks_contact_card" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_contact_card_path_idx" ON "section_presets_blocks_contact_card" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_contact_card_locale_idx" ON "section_presets_blocks_contact_card" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_contact_card_section_section_back_idx" ON "section_presets_blocks_contact_card" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_icon_features_items_order_idx" ON "section_presets_blocks_icon_features_items" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_icon_features_items_parent_id_idx" ON "section_presets_blocks_icon_features_items" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_icon_features_items_locale_idx" ON "section_presets_blocks_icon_features_items" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_icon_features_order_idx" ON "section_presets_blocks_icon_features" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_icon_features_parent_id_idx" ON "section_presets_blocks_icon_features" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_icon_features_path_idx" ON "section_presets_blocks_icon_features" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_icon_features_locale_idx" ON "section_presets_blocks_icon_features" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_icon_features_section_section_bac_idx" ON "section_presets_blocks_icon_features" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_banner_order_idx" ON "section_presets_blocks_banner" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_banner_parent_id_idx" ON "section_presets_blocks_banner" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_banner_path_idx" ON "section_presets_blocks_banner" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_banner_locale_idx" ON "section_presets_blocks_banner" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_banner_section_section_background_idx" ON "section_presets_blocks_banner" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_button_group_links_order_idx" ON "section_presets_blocks_button_group_links" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_button_group_links_parent_id_idx" ON "section_presets_blocks_button_group_links" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_button_group_links_locale_idx" ON "section_presets_blocks_button_group_links" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_button_group_order_idx" ON "section_presets_blocks_button_group" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_button_group_parent_id_idx" ON "section_presets_blocks_button_group" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_button_group_path_idx" ON "section_presets_blocks_button_group" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_button_group_locale_idx" ON "section_presets_blocks_button_group" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_button_group_section_section_back_idx" ON "section_presets_blocks_button_group" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_divider_order_idx" ON "section_presets_blocks_divider" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_divider_parent_id_idx" ON "section_presets_blocks_divider" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_divider_path_idx" ON "section_presets_blocks_divider" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_divider_locale_idx" ON "section_presets_blocks_divider" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_divider_section_section_backgroun_idx" ON "section_presets_blocks_divider" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_columns_columns_order_idx" ON "section_presets_blocks_columns_columns" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_columns_columns_parent_id_idx" ON "section_presets_blocks_columns_columns" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_columns_columns_locale_idx" ON "section_presets_blocks_columns_columns" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_columns_order_idx" ON "section_presets_blocks_columns" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_columns_parent_id_idx" ON "section_presets_blocks_columns" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_columns_path_idx" ON "section_presets_blocks_columns" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_columns_locale_idx" ON "section_presets_blocks_columns" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_columns_section_section_backgroun_idx" ON "section_presets_blocks_columns" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_form_block_order_idx" ON "section_presets_blocks_form_block" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_form_block_parent_id_idx" ON "section_presets_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_form_block_path_idx" ON "section_presets_blocks_form_block" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_form_block_locale_idx" ON "section_presets_blocks_form_block" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_form_block_form_idx" ON "section_presets_blocks_form_block" USING btree ("form_id");
  CREATE INDEX "section_presets_blocks_form_block_section_section_backgr_idx" ON "section_presets_blocks_form_block" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_newsletter_order_idx" ON "section_presets_blocks_newsletter" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_newsletter_parent_id_idx" ON "section_presets_blocks_newsletter" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_newsletter_path_idx" ON "section_presets_blocks_newsletter" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_newsletter_locale_idx" ON "section_presets_blocks_newsletter" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_newsletter_form_idx" ON "section_presets_blocks_newsletter" USING btree ("form_id");
  CREATE INDEX "section_presets_blocks_newsletter_section_section_backgr_idx" ON "section_presets_blocks_newsletter" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_global_section_order_idx" ON "section_presets_blocks_global_section" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_global_section_parent_id_idx" ON "section_presets_blocks_global_section" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_global_section_path_idx" ON "section_presets_blocks_global_section" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_global_section_locale_idx" ON "section_presets_blocks_global_section" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_global_section_global_section_idx" ON "section_presets_blocks_global_section" USING btree ("global_section_id");
  CREATE INDEX "section_presets_blocks_global_section_section_section_ba_idx" ON "section_presets_blocks_global_section" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_site_idx" ON "section_presets" USING btree ("site");
  CREATE INDEX "section_presets_updated_at_idx" ON "section_presets" USING btree ("updated_at");
  CREATE INDEX "section_presets_created_at_idx" ON "section_presets" USING btree ("created_at");
  CREATE INDEX "section_presets_rels_order_idx" ON "section_presets_rels" USING btree ("order");
  CREATE INDEX "section_presets_rels_parent_idx" ON "section_presets_rels" USING btree ("parent_id");
  CREATE INDEX "section_presets_rels_path_idx" ON "section_presets_rels" USING btree ("path");
  CREATE INDEX "section_presets_rels_locale_idx" ON "section_presets_rels" USING btree ("locale");
  CREATE INDEX "section_presets_rels_pages_id_idx" ON "section_presets_rels" USING btree ("pages_id","locale");
  CREATE INDEX "section_presets_rels_articles_id_idx" ON "section_presets_rels" USING btree ("articles_id","locale");
  CREATE INDEX "section_presets_rels_people_id_idx" ON "section_presets_rels" USING btree ("people_id","locale");
  CREATE INDEX "section_presets_rels_documents_id_idx" ON "section_presets_rels" USING btree ("documents_id","locale");
  ALTER TABLE "pages" ADD CONSTRAINT "pages_template_id_page_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."page_templates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_template_id_page_templates_id_fk" FOREIGN KEY ("version_template_id") REFERENCES "public"."page_templates"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_global_sections_fk" FOREIGN KEY ("gsections_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_page_templates_fk" FOREIGN KEY ("page_templates_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_section_presets_fk" FOREIGN KEY ("section_presets_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_template_idx" ON "pages" USING btree ("template_id");
  CREATE INDEX "_pages_v_version_version_template_idx" ON "_pages_v" USING btree ("version_template_id");
  CREATE INDEX "payload_locked_documents_rels_gsections_id_idx" ON "payload_locked_documents_rels" USING btree ("gsections_id");
  CREATE INDEX "payload_locked_documents_rels_page_templates_id_idx" ON "payload_locked_documents_rels" USING btree ("page_templates_id");
  CREATE INDEX "payload_locked_documents_rels_section_presets_id_idx" ON "payload_locked_documents_rels" USING btree ("section_presets_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_global_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_preset" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_global_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_preset" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_hero_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_text_image_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_text_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_full_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_image_grid_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_image_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_cards_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_child_pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_cta_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_quote" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_stats_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_stats_bars" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_facts_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_article_feed_sites" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_article_feed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_people" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_timeline_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_timeline" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_accordion_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_accordion" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_video" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_embed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_tabs_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_pricing_plans_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_pricing_plans" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_pricing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_logo_wall_logos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_logo_wall" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_testimonials_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_carousel_slides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_carousel" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_table_header" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_table_rows_cells" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_table_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_table" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_contact_card_hours" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_contact_card" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_icon_features_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_icon_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_banner" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_button_group_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_button_group" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_divider" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_columns_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_form_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_blocks_newsletter" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gsections_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_hero_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_text_image_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_text_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_full_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_image_grid_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_image_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_cards_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_child_pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_cta_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_quote" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_stats_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_stats_bars" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_facts_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_article_feed_sites" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_article_feed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_people" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_timeline_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_timeline" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_accordion_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_accordion" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_video" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_embed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_tabs_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_pricing_plans_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_pricing_plans" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_pricing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_logo_wall_logos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_logo_wall" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_testimonials_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_carousel_slides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_carousel" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_table_header" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_table_rows_cells" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_table_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_table" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_contact_card_hours" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_contact_card" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_icon_features_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_icon_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_banner" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_button_group_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_button_group" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_divider" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_columns_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_form_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_blocks_newsletter" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_gsections_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_hero_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_text_image_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_text_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_full_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_image_grid_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_image_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_cards_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_child_pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_cta_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_quote" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_stats_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_stats_bars" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_facts_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_article_feed_sites" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_article_feed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_people" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_timeline_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_timeline" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_accordion_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_accordion" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_video" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_embed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_tabs_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_pricing_plans_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_pricing_plans" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_pricing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_logo_wall_logos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_logo_wall" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_testimonials_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_carousel_slides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_carousel" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_table_header" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_table_rows_cells" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_table_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_table" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_contact_card_hours" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_contact_card" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_icon_features_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_icon_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_banner" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_button_group_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_button_group" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_divider" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_columns_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_form_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_newsletter" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_blocks_global_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "page_templates_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_hero_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_text_image_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_text_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_full_image" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_image_grid_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_image_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_cards_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_child_pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_cta_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_quote" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_stats_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_stats_bars" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_facts_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_article_feed_sites" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_article_feed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_people" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_timeline_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_timeline" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_accordion_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_accordion" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_video" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_embed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_tabs_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_pricing_plans_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_pricing_plans" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_pricing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_logo_wall_logos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_logo_wall" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_testimonials_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_testimonials" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_carousel_slides" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_carousel" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_table_header" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_table_rows_cells" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_table_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_table" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_contact_card_hours" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_contact_card" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_icon_features_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_icon_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_banner" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_button_group_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_button_group" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_divider" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_columns_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_form_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_newsletter" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_blocks_global_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "section_presets_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_global_section" CASCADE;
  DROP TABLE "pages_blocks_preset" CASCADE;
  DROP TABLE "_pages_v_blocks_global_section" CASCADE;
  DROP TABLE "_pages_v_blocks_preset" CASCADE;
  DROP TABLE "gsections_blocks_hero_links" CASCADE;
  DROP TABLE "gsections_blocks_hero" CASCADE;
  DROP TABLE "gsections_blocks_content" CASCADE;
  DROP TABLE "gsections_blocks_text_image_links" CASCADE;
  DROP TABLE "gsections_blocks_text_image" CASCADE;
  DROP TABLE "gsections_blocks_full_image" CASCADE;
  DROP TABLE "gsections_blocks_image_grid_images" CASCADE;
  DROP TABLE "gsections_blocks_image_grid" CASCADE;
  DROP TABLE "gsections_blocks_cards_items" CASCADE;
  DROP TABLE "gsections_blocks_cards" CASCADE;
  DROP TABLE "gsections_blocks_child_pages" CASCADE;
  DROP TABLE "gsections_blocks_cta_links" CASCADE;
  DROP TABLE "gsections_blocks_cta" CASCADE;
  DROP TABLE "gsections_blocks_quote" CASCADE;
  DROP TABLE "gsections_blocks_stats_items" CASCADE;
  DROP TABLE "gsections_blocks_stats_bars" CASCADE;
  DROP TABLE "gsections_blocks_stats" CASCADE;
  DROP TABLE "gsections_blocks_facts_items" CASCADE;
  DROP TABLE "gsections_blocks_facts" CASCADE;
  DROP TABLE "gsections_blocks_article_feed_sites" CASCADE;
  DROP TABLE "gsections_blocks_article_feed" CASCADE;
  DROP TABLE "gsections_blocks_people" CASCADE;
  DROP TABLE "gsections_blocks_documents" CASCADE;
  DROP TABLE "gsections_blocks_timeline_items" CASCADE;
  DROP TABLE "gsections_blocks_timeline" CASCADE;
  DROP TABLE "gsections_blocks_accordion_items" CASCADE;
  DROP TABLE "gsections_blocks_accordion" CASCADE;
  DROP TABLE "gsections_blocks_video" CASCADE;
  DROP TABLE "gsections_blocks_embed" CASCADE;
  DROP TABLE "gsections_blocks_tabs_items" CASCADE;
  DROP TABLE "gsections_blocks_tabs" CASCADE;
  DROP TABLE "gsections_blocks_pricing_plans_features" CASCADE;
  DROP TABLE "gsections_blocks_pricing_plans" CASCADE;
  DROP TABLE "gsections_blocks_pricing" CASCADE;
  DROP TABLE "gsections_blocks_logo_wall_logos" CASCADE;
  DROP TABLE "gsections_blocks_logo_wall" CASCADE;
  DROP TABLE "gsections_blocks_testimonials_items" CASCADE;
  DROP TABLE "gsections_blocks_testimonials" CASCADE;
  DROP TABLE "gsections_blocks_carousel_slides" CASCADE;
  DROP TABLE "gsections_blocks_carousel" CASCADE;
  DROP TABLE "gsections_blocks_table_header" CASCADE;
  DROP TABLE "gsections_blocks_table_rows_cells" CASCADE;
  DROP TABLE "gsections_blocks_table_rows" CASCADE;
  DROP TABLE "gsections_blocks_table" CASCADE;
  DROP TABLE "gsections_blocks_contact_card_hours" CASCADE;
  DROP TABLE "gsections_blocks_contact_card" CASCADE;
  DROP TABLE "gsections_blocks_icon_features_items" CASCADE;
  DROP TABLE "gsections_blocks_icon_features" CASCADE;
  DROP TABLE "gsections_blocks_banner" CASCADE;
  DROP TABLE "gsections_blocks_button_group_links" CASCADE;
  DROP TABLE "gsections_blocks_button_group" CASCADE;
  DROP TABLE "gsections_blocks_divider" CASCADE;
  DROP TABLE "gsections_blocks_columns_columns" CASCADE;
  DROP TABLE "gsections_blocks_columns" CASCADE;
  DROP TABLE "gsections_blocks_form_block" CASCADE;
  DROP TABLE "gsections_blocks_newsletter" CASCADE;
  DROP TABLE "gsections" CASCADE;
  DROP TABLE "gsections_rels" CASCADE;
  DROP TABLE "_gsections_v_blocks_hero_links" CASCADE;
  DROP TABLE "_gsections_v_blocks_hero" CASCADE;
  DROP TABLE "_gsections_v_blocks_content" CASCADE;
  DROP TABLE "_gsections_v_blocks_text_image_links" CASCADE;
  DROP TABLE "_gsections_v_blocks_text_image" CASCADE;
  DROP TABLE "_gsections_v_blocks_full_image" CASCADE;
  DROP TABLE "_gsections_v_blocks_image_grid_images" CASCADE;
  DROP TABLE "_gsections_v_blocks_image_grid" CASCADE;
  DROP TABLE "_gsections_v_blocks_cards_items" CASCADE;
  DROP TABLE "_gsections_v_blocks_cards" CASCADE;
  DROP TABLE "_gsections_v_blocks_child_pages" CASCADE;
  DROP TABLE "_gsections_v_blocks_cta_links" CASCADE;
  DROP TABLE "_gsections_v_blocks_cta" CASCADE;
  DROP TABLE "_gsections_v_blocks_quote" CASCADE;
  DROP TABLE "_gsections_v_blocks_stats_items" CASCADE;
  DROP TABLE "_gsections_v_blocks_stats_bars" CASCADE;
  DROP TABLE "_gsections_v_blocks_stats" CASCADE;
  DROP TABLE "_gsections_v_blocks_facts_items" CASCADE;
  DROP TABLE "_gsections_v_blocks_facts" CASCADE;
  DROP TABLE "_gsections_v_blocks_article_feed_sites" CASCADE;
  DROP TABLE "_gsections_v_blocks_article_feed" CASCADE;
  DROP TABLE "_gsections_v_blocks_people" CASCADE;
  DROP TABLE "_gsections_v_blocks_documents" CASCADE;
  DROP TABLE "_gsections_v_blocks_timeline_items" CASCADE;
  DROP TABLE "_gsections_v_blocks_timeline" CASCADE;
  DROP TABLE "_gsections_v_blocks_accordion_items" CASCADE;
  DROP TABLE "_gsections_v_blocks_accordion" CASCADE;
  DROP TABLE "_gsections_v_blocks_video" CASCADE;
  DROP TABLE "_gsections_v_blocks_embed" CASCADE;
  DROP TABLE "_gsections_v_blocks_tabs_items" CASCADE;
  DROP TABLE "_gsections_v_blocks_tabs" CASCADE;
  DROP TABLE "_gsections_v_blocks_pricing_plans_features" CASCADE;
  DROP TABLE "_gsections_v_blocks_pricing_plans" CASCADE;
  DROP TABLE "_gsections_v_blocks_pricing" CASCADE;
  DROP TABLE "_gsections_v_blocks_logo_wall_logos" CASCADE;
  DROP TABLE "_gsections_v_blocks_logo_wall" CASCADE;
  DROP TABLE "_gsections_v_blocks_testimonials_items" CASCADE;
  DROP TABLE "_gsections_v_blocks_testimonials" CASCADE;
  DROP TABLE "_gsections_v_blocks_carousel_slides" CASCADE;
  DROP TABLE "_gsections_v_blocks_carousel" CASCADE;
  DROP TABLE "_gsections_v_blocks_table_header" CASCADE;
  DROP TABLE "_gsections_v_blocks_table_rows_cells" CASCADE;
  DROP TABLE "_gsections_v_blocks_table_rows" CASCADE;
  DROP TABLE "_gsections_v_blocks_table" CASCADE;
  DROP TABLE "_gsections_v_blocks_contact_card_hours" CASCADE;
  DROP TABLE "_gsections_v_blocks_contact_card" CASCADE;
  DROP TABLE "_gsections_v_blocks_icon_features_items" CASCADE;
  DROP TABLE "_gsections_v_blocks_icon_features" CASCADE;
  DROP TABLE "_gsections_v_blocks_banner" CASCADE;
  DROP TABLE "_gsections_v_blocks_button_group_links" CASCADE;
  DROP TABLE "_gsections_v_blocks_button_group" CASCADE;
  DROP TABLE "_gsections_v_blocks_divider" CASCADE;
  DROP TABLE "_gsections_v_blocks_columns_columns" CASCADE;
  DROP TABLE "_gsections_v_blocks_columns" CASCADE;
  DROP TABLE "_gsections_v_blocks_form_block" CASCADE;
  DROP TABLE "_gsections_v_blocks_newsletter" CASCADE;
  DROP TABLE "_gsections_v" CASCADE;
  DROP TABLE "_gsections_v_rels" CASCADE;
  DROP TABLE "page_templates_blocks_hero_links" CASCADE;
  DROP TABLE "page_templates_blocks_hero" CASCADE;
  DROP TABLE "page_templates_blocks_content" CASCADE;
  DROP TABLE "page_templates_blocks_text_image_links" CASCADE;
  DROP TABLE "page_templates_blocks_text_image" CASCADE;
  DROP TABLE "page_templates_blocks_full_image" CASCADE;
  DROP TABLE "page_templates_blocks_image_grid_images" CASCADE;
  DROP TABLE "page_templates_blocks_image_grid" CASCADE;
  DROP TABLE "page_templates_blocks_cards_items" CASCADE;
  DROP TABLE "page_templates_blocks_cards" CASCADE;
  DROP TABLE "page_templates_blocks_child_pages" CASCADE;
  DROP TABLE "page_templates_blocks_cta_links" CASCADE;
  DROP TABLE "page_templates_blocks_cta" CASCADE;
  DROP TABLE "page_templates_blocks_quote" CASCADE;
  DROP TABLE "page_templates_blocks_stats_items" CASCADE;
  DROP TABLE "page_templates_blocks_stats_bars" CASCADE;
  DROP TABLE "page_templates_blocks_stats" CASCADE;
  DROP TABLE "page_templates_blocks_facts_items" CASCADE;
  DROP TABLE "page_templates_blocks_facts" CASCADE;
  DROP TABLE "page_templates_blocks_article_feed_sites" CASCADE;
  DROP TABLE "page_templates_blocks_article_feed" CASCADE;
  DROP TABLE "page_templates_blocks_people" CASCADE;
  DROP TABLE "page_templates_blocks_documents" CASCADE;
  DROP TABLE "page_templates_blocks_timeline_items" CASCADE;
  DROP TABLE "page_templates_blocks_timeline" CASCADE;
  DROP TABLE "page_templates_blocks_accordion_items" CASCADE;
  DROP TABLE "page_templates_blocks_accordion" CASCADE;
  DROP TABLE "page_templates_blocks_video" CASCADE;
  DROP TABLE "page_templates_blocks_embed" CASCADE;
  DROP TABLE "page_templates_blocks_tabs_items" CASCADE;
  DROP TABLE "page_templates_blocks_tabs" CASCADE;
  DROP TABLE "page_templates_blocks_pricing_plans_features" CASCADE;
  DROP TABLE "page_templates_blocks_pricing_plans" CASCADE;
  DROP TABLE "page_templates_blocks_pricing" CASCADE;
  DROP TABLE "page_templates_blocks_logo_wall_logos" CASCADE;
  DROP TABLE "page_templates_blocks_logo_wall" CASCADE;
  DROP TABLE "page_templates_blocks_testimonials_items" CASCADE;
  DROP TABLE "page_templates_blocks_testimonials" CASCADE;
  DROP TABLE "page_templates_blocks_carousel_slides" CASCADE;
  DROP TABLE "page_templates_blocks_carousel" CASCADE;
  DROP TABLE "page_templates_blocks_table_header" CASCADE;
  DROP TABLE "page_templates_blocks_table_rows_cells" CASCADE;
  DROP TABLE "page_templates_blocks_table_rows" CASCADE;
  DROP TABLE "page_templates_blocks_table" CASCADE;
  DROP TABLE "page_templates_blocks_contact_card_hours" CASCADE;
  DROP TABLE "page_templates_blocks_contact_card" CASCADE;
  DROP TABLE "page_templates_blocks_icon_features_items" CASCADE;
  DROP TABLE "page_templates_blocks_icon_features" CASCADE;
  DROP TABLE "page_templates_blocks_banner" CASCADE;
  DROP TABLE "page_templates_blocks_button_group_links" CASCADE;
  DROP TABLE "page_templates_blocks_button_group" CASCADE;
  DROP TABLE "page_templates_blocks_divider" CASCADE;
  DROP TABLE "page_templates_blocks_columns_columns" CASCADE;
  DROP TABLE "page_templates_blocks_columns" CASCADE;
  DROP TABLE "page_templates_blocks_form_block" CASCADE;
  DROP TABLE "page_templates_blocks_newsletter" CASCADE;
  DROP TABLE "page_templates_blocks_global_section" CASCADE;
  DROP TABLE "page_templates" CASCADE;
  DROP TABLE "page_templates_rels" CASCADE;
  DROP TABLE "section_presets_blocks_hero_links" CASCADE;
  DROP TABLE "section_presets_blocks_hero" CASCADE;
  DROP TABLE "section_presets_blocks_content" CASCADE;
  DROP TABLE "section_presets_blocks_text_image_links" CASCADE;
  DROP TABLE "section_presets_blocks_text_image" CASCADE;
  DROP TABLE "section_presets_blocks_full_image" CASCADE;
  DROP TABLE "section_presets_blocks_image_grid_images" CASCADE;
  DROP TABLE "section_presets_blocks_image_grid" CASCADE;
  DROP TABLE "section_presets_blocks_cards_items" CASCADE;
  DROP TABLE "section_presets_blocks_cards" CASCADE;
  DROP TABLE "section_presets_blocks_child_pages" CASCADE;
  DROP TABLE "section_presets_blocks_cta_links" CASCADE;
  DROP TABLE "section_presets_blocks_cta" CASCADE;
  DROP TABLE "section_presets_blocks_quote" CASCADE;
  DROP TABLE "section_presets_blocks_stats_items" CASCADE;
  DROP TABLE "section_presets_blocks_stats_bars" CASCADE;
  DROP TABLE "section_presets_blocks_stats" CASCADE;
  DROP TABLE "section_presets_blocks_facts_items" CASCADE;
  DROP TABLE "section_presets_blocks_facts" CASCADE;
  DROP TABLE "section_presets_blocks_article_feed_sites" CASCADE;
  DROP TABLE "section_presets_blocks_article_feed" CASCADE;
  DROP TABLE "section_presets_blocks_people" CASCADE;
  DROP TABLE "section_presets_blocks_documents" CASCADE;
  DROP TABLE "section_presets_blocks_timeline_items" CASCADE;
  DROP TABLE "section_presets_blocks_timeline" CASCADE;
  DROP TABLE "section_presets_blocks_accordion_items" CASCADE;
  DROP TABLE "section_presets_blocks_accordion" CASCADE;
  DROP TABLE "section_presets_blocks_video" CASCADE;
  DROP TABLE "section_presets_blocks_embed" CASCADE;
  DROP TABLE "section_presets_blocks_tabs_items" CASCADE;
  DROP TABLE "section_presets_blocks_tabs" CASCADE;
  DROP TABLE "section_presets_blocks_pricing_plans_features" CASCADE;
  DROP TABLE "section_presets_blocks_pricing_plans" CASCADE;
  DROP TABLE "section_presets_blocks_pricing" CASCADE;
  DROP TABLE "section_presets_blocks_logo_wall_logos" CASCADE;
  DROP TABLE "section_presets_blocks_logo_wall" CASCADE;
  DROP TABLE "section_presets_blocks_testimonials_items" CASCADE;
  DROP TABLE "section_presets_blocks_testimonials" CASCADE;
  DROP TABLE "section_presets_blocks_carousel_slides" CASCADE;
  DROP TABLE "section_presets_blocks_carousel" CASCADE;
  DROP TABLE "section_presets_blocks_table_header" CASCADE;
  DROP TABLE "section_presets_blocks_table_rows_cells" CASCADE;
  DROP TABLE "section_presets_blocks_table_rows" CASCADE;
  DROP TABLE "section_presets_blocks_table" CASCADE;
  DROP TABLE "section_presets_blocks_contact_card_hours" CASCADE;
  DROP TABLE "section_presets_blocks_contact_card" CASCADE;
  DROP TABLE "section_presets_blocks_icon_features_items" CASCADE;
  DROP TABLE "section_presets_blocks_icon_features" CASCADE;
  DROP TABLE "section_presets_blocks_banner" CASCADE;
  DROP TABLE "section_presets_blocks_button_group_links" CASCADE;
  DROP TABLE "section_presets_blocks_button_group" CASCADE;
  DROP TABLE "section_presets_blocks_divider" CASCADE;
  DROP TABLE "section_presets_blocks_columns_columns" CASCADE;
  DROP TABLE "section_presets_blocks_columns" CASCADE;
  DROP TABLE "section_presets_blocks_form_block" CASCADE;
  DROP TABLE "section_presets_blocks_newsletter" CASCADE;
  DROP TABLE "section_presets_blocks_global_section" CASCADE;
  DROP TABLE "section_presets" CASCADE;
  DROP TABLE "section_presets_rels" CASCADE;
  ALTER TABLE "pages" DROP CONSTRAINT "pages_template_id_page_templates_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_template_id_page_templates_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_global_sections_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_page_templates_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_section_presets_fk";
  
  DROP INDEX "pages_template_idx";
  DROP INDEX "_pages_v_version_version_template_idx";
  DROP INDEX "payload_locked_documents_rels_gsections_id_idx";
  DROP INDEX "payload_locked_documents_rels_page_templates_id_idx";
  DROP INDEX "payload_locked_documents_rels_section_presets_id_idx";
  ALTER TABLE "pages" DROP COLUMN "template_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_template_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "gsections_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "page_templates_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "section_presets_id";
  DROP TYPE "public"."enum_pages_blocks_global_section_section_space_top";
  DROP TYPE "public"."enum_pages_blocks_global_section_section_space_bottom";
  DROP TYPE "public"."enum_pages_blocks_global_section_section_width";
  DROP TYPE "public"."enum_pages_blocks_global_section_section_overlay";
  DROP TYPE "public"."enum_pages_blocks_global_section_section_hide";
  DROP TYPE "public"."enum__pages_v_blocks_global_section_section_space_top";
  DROP TYPE "public"."enum__pages_v_blocks_global_section_section_space_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_global_section_section_width";
  DROP TYPE "public"."enum__pages_v_blocks_global_section_section_overlay";
  DROP TYPE "public"."enum__pages_v_blocks_global_section_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_hero_links_link_type";
  DROP TYPE "public"."enum_gsections_blocks_hero_links_link_appearance";
  DROP TYPE "public"."enum_gsections_blocks_hero_variant";
  DROP TYPE "public"."enum_gsections_blocks_hero_align";
  DROP TYPE "public"."enum_gsections_blocks_hero_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_hero_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_hero_section_width";
  DROP TYPE "public"."enum_gsections_blocks_hero_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_hero_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_content_width";
  DROP TYPE "public"."enum_gsections_blocks_content_align";
  DROP TYPE "public"."enum_gsections_blocks_content_background";
  DROP TYPE "public"."enum_gsections_blocks_content_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_content_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_content_section_width";
  DROP TYPE "public"."enum_gsections_blocks_content_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_content_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_text_image_links_link_type";
  DROP TYPE "public"."enum_gsections_blocks_text_image_links_link_appearance";
  DROP TYPE "public"."enum_gsections_blocks_text_image_image_position";
  DROP TYPE "public"."enum_gsections_blocks_text_image_layout";
  DROP TYPE "public"."enum_gsections_blocks_text_image_background";
  DROP TYPE "public"."enum_gsections_blocks_text_image_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_text_image_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_text_image_section_width";
  DROP TYPE "public"."enum_gsections_blocks_text_image_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_text_image_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_full_image_size";
  DROP TYPE "public"."enum_gsections_blocks_full_image_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_full_image_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_full_image_section_width";
  DROP TYPE "public"."enum_gsections_blocks_full_image_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_full_image_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_image_grid_columns";
  DROP TYPE "public"."enum_gsections_blocks_image_grid_background";
  DROP TYPE "public"."enum_gsections_blocks_image_grid_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_image_grid_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_image_grid_section_width";
  DROP TYPE "public"."enum_gsections_blocks_image_grid_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_image_grid_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_cards_items_link_type";
  DROP TYPE "public"."enum_gsections_blocks_cards_columns";
  DROP TYPE "public"."enum_gsections_blocks_cards_background";
  DROP TYPE "public"."enum_gsections_blocks_cards_align";
  DROP TYPE "public"."enum_gsections_blocks_cards_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_cards_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_cards_section_width";
  DROP TYPE "public"."enum_gsections_blocks_cards_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_cards_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_child_pages_depth";
  DROP TYPE "public"."enum_gsections_blocks_child_pages_columns";
  DROP TYPE "public"."enum_gsections_blocks_child_pages_background";
  DROP TYPE "public"."enum_gsections_blocks_child_pages_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_child_pages_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_child_pages_section_width";
  DROP TYPE "public"."enum_gsections_blocks_child_pages_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_child_pages_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_cta_links_link_type";
  DROP TYPE "public"."enum_gsections_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum_gsections_blocks_cta_background";
  DROP TYPE "public"."enum_gsections_blocks_cta_align";
  DROP TYPE "public"."enum_gsections_blocks_cta_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_cta_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_cta_section_width";
  DROP TYPE "public"."enum_gsections_blocks_cta_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_cta_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_quote_background";
  DROP TYPE "public"."enum_gsections_blocks_quote_align";
  DROP TYPE "public"."enum_gsections_blocks_quote_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_quote_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_quote_section_width";
  DROP TYPE "public"."enum_gsections_blocks_quote_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_quote_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_stats_background";
  DROP TYPE "public"."enum_gsections_blocks_stats_align";
  DROP TYPE "public"."enum_gsections_blocks_stats_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_stats_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_stats_section_width";
  DROP TYPE "public"."enum_gsections_blocks_stats_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_stats_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_facts_background";
  DROP TYPE "public"."enum_gsections_blocks_facts_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_facts_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_facts_section_width";
  DROP TYPE "public"."enum_gsections_blocks_facts_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_facts_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_article_feed_sites";
  DROP TYPE "public"."enum_gsections_blocks_article_feed_kind";
  DROP TYPE "public"."enum_gsections_blocks_article_feed_background";
  DROP TYPE "public"."enum_gsections_blocks_article_feed_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_article_feed_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_article_feed_section_width";
  DROP TYPE "public"."enum_gsections_blocks_article_feed_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_article_feed_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_people_layout";
  DROP TYPE "public"."enum_gsections_blocks_people_background";
  DROP TYPE "public"."enum_gsections_blocks_people_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_people_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_people_section_width";
  DROP TYPE "public"."enum_gsections_blocks_people_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_people_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_documents_background";
  DROP TYPE "public"."enum_gsections_blocks_documents_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_documents_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_documents_section_width";
  DROP TYPE "public"."enum_gsections_blocks_documents_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_documents_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_timeline_background";
  DROP TYPE "public"."enum_gsections_blocks_timeline_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_timeline_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_timeline_section_width";
  DROP TYPE "public"."enum_gsections_blocks_timeline_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_timeline_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_accordion_background";
  DROP TYPE "public"."enum_gsections_blocks_accordion_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_accordion_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_accordion_section_width";
  DROP TYPE "public"."enum_gsections_blocks_accordion_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_accordion_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_video_background";
  DROP TYPE "public"."enum_gsections_blocks_video_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_video_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_video_section_width";
  DROP TYPE "public"."enum_gsections_blocks_video_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_video_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_embed_provider";
  DROP TYPE "public"."enum_gsections_blocks_embed_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_embed_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_embed_section_width";
  DROP TYPE "public"."enum_gsections_blocks_embed_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_embed_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_tabs_background";
  DROP TYPE "public"."enum_gsections_blocks_tabs_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_tabs_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_tabs_section_width";
  DROP TYPE "public"."enum_gsections_blocks_tabs_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_tabs_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_pricing_plans_link_type";
  DROP TYPE "public"."enum_gsections_blocks_pricing_plans_link_appearance";
  DROP TYPE "public"."enum_gsections_blocks_pricing_background";
  DROP TYPE "public"."enum_gsections_blocks_pricing_align";
  DROP TYPE "public"."enum_gsections_blocks_pricing_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_pricing_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_pricing_section_width";
  DROP TYPE "public"."enum_gsections_blocks_pricing_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_pricing_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_logo_wall_logos_link_type";
  DROP TYPE "public"."enum_gsections_blocks_logo_wall_background";
  DROP TYPE "public"."enum_gsections_blocks_logo_wall_align";
  DROP TYPE "public"."enum_gsections_blocks_logo_wall_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_logo_wall_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_logo_wall_section_width";
  DROP TYPE "public"."enum_gsections_blocks_logo_wall_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_logo_wall_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_testimonials_columns";
  DROP TYPE "public"."enum_gsections_blocks_testimonials_background";
  DROP TYPE "public"."enum_gsections_blocks_testimonials_align";
  DROP TYPE "public"."enum_gsections_blocks_testimonials_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_testimonials_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_testimonials_section_width";
  DROP TYPE "public"."enum_gsections_blocks_testimonials_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_testimonials_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_carousel_slides_link_type";
  DROP TYPE "public"."enum_gsections_blocks_carousel_background";
  DROP TYPE "public"."enum_gsections_blocks_carousel_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_carousel_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_carousel_section_width";
  DROP TYPE "public"."enum_gsections_blocks_carousel_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_carousel_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_table_background";
  DROP TYPE "public"."enum_gsections_blocks_table_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_table_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_table_section_width";
  DROP TYPE "public"."enum_gsections_blocks_table_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_table_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_contact_card_background";
  DROP TYPE "public"."enum_gsections_blocks_contact_card_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_contact_card_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_contact_card_section_width";
  DROP TYPE "public"."enum_gsections_blocks_contact_card_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_contact_card_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_icon_features_items_icon";
  DROP TYPE "public"."enum_gsections_blocks_icon_features_items_link_type";
  DROP TYPE "public"."enum_gsections_blocks_icon_features_columns";
  DROP TYPE "public"."enum_gsections_blocks_icon_features_background";
  DROP TYPE "public"."enum_gsections_blocks_icon_features_align";
  DROP TYPE "public"."enum_gsections_blocks_icon_features_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_icon_features_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_icon_features_section_width";
  DROP TYPE "public"."enum_gsections_blocks_icon_features_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_icon_features_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_banner_variant";
  DROP TYPE "public"."enum_gsections_blocks_banner_link_type";
  DROP TYPE "public"."enum_gsections_blocks_banner_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_banner_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_banner_section_width";
  DROP TYPE "public"."enum_gsections_blocks_banner_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_banner_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_button_group_links_link_type";
  DROP TYPE "public"."enum_gsections_blocks_button_group_links_link_appearance";
  DROP TYPE "public"."enum_gsections_blocks_button_group_justify";
  DROP TYPE "public"."enum_gsections_blocks_button_group_background";
  DROP TYPE "public"."enum_gsections_blocks_button_group_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_button_group_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_button_group_section_width";
  DROP TYPE "public"."enum_gsections_blocks_button_group_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_button_group_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_divider_kind";
  DROP TYPE "public"."enum_gsections_blocks_divider_size";
  DROP TYPE "public"."enum_gsections_blocks_divider_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_divider_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_divider_section_width";
  DROP TYPE "public"."enum_gsections_blocks_divider_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_divider_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_columns_layout";
  DROP TYPE "public"."enum_gsections_blocks_columns_vertical_align";
  DROP TYPE "public"."enum_gsections_blocks_columns_background";
  DROP TYPE "public"."enum_gsections_blocks_columns_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_columns_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_columns_section_width";
  DROP TYPE "public"."enum_gsections_blocks_columns_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_columns_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_form_block_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_form_block_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_form_block_section_width";
  DROP TYPE "public"."enum_gsections_blocks_form_block_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_form_block_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_newsletter_mode";
  DROP TYPE "public"."enum_gsections_blocks_newsletter_background";
  DROP TYPE "public"."enum_gsections_blocks_newsletter_align";
  DROP TYPE "public"."enum_gsections_blocks_newsletter_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_newsletter_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_newsletter_section_width";
  DROP TYPE "public"."enum_gsections_blocks_newsletter_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_newsletter_section_hide";
  DROP TYPE "public"."enum_gsections_site";
  DROP TYPE "public"."enum_gsections_status";
  DROP TYPE "public"."enum__gsections_v_blocks_hero_links_link_type";
  DROP TYPE "public"."enum__gsections_v_blocks_hero_links_link_appearance";
  DROP TYPE "public"."enum__gsections_v_blocks_hero_variant";
  DROP TYPE "public"."enum__gsections_v_blocks_hero_align";
  DROP TYPE "public"."enum__gsections_v_blocks_hero_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_hero_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_hero_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_hero_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_hero_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_content_width";
  DROP TYPE "public"."enum__gsections_v_blocks_content_align";
  DROP TYPE "public"."enum__gsections_v_blocks_content_background";
  DROP TYPE "public"."enum__gsections_v_blocks_content_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_content_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_content_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_content_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_content_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_text_image_links_link_type";
  DROP TYPE "public"."enum__gsections_v_blocks_text_image_links_link_appearance";
  DROP TYPE "public"."enum__gsections_v_blocks_text_image_image_position";
  DROP TYPE "public"."enum__gsections_v_blocks_text_image_layout";
  DROP TYPE "public"."enum__gsections_v_blocks_text_image_background";
  DROP TYPE "public"."enum__gsections_v_blocks_text_image_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_text_image_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_text_image_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_text_image_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_text_image_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_full_image_size";
  DROP TYPE "public"."enum__gsections_v_blocks_full_image_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_full_image_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_full_image_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_full_image_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_full_image_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_image_grid_columns";
  DROP TYPE "public"."enum__gsections_v_blocks_image_grid_background";
  DROP TYPE "public"."enum__gsections_v_blocks_image_grid_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_image_grid_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_image_grid_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_image_grid_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_image_grid_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_cards_items_link_type";
  DROP TYPE "public"."enum__gsections_v_blocks_cards_columns";
  DROP TYPE "public"."enum__gsections_v_blocks_cards_background";
  DROP TYPE "public"."enum__gsections_v_blocks_cards_align";
  DROP TYPE "public"."enum__gsections_v_blocks_cards_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_cards_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_cards_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_cards_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_cards_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_child_pages_depth";
  DROP TYPE "public"."enum__gsections_v_blocks_child_pages_columns";
  DROP TYPE "public"."enum__gsections_v_blocks_child_pages_background";
  DROP TYPE "public"."enum__gsections_v_blocks_child_pages_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_child_pages_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_child_pages_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_child_pages_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_child_pages_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_cta_links_link_type";
  DROP TYPE "public"."enum__gsections_v_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum__gsections_v_blocks_cta_background";
  DROP TYPE "public"."enum__gsections_v_blocks_cta_align";
  DROP TYPE "public"."enum__gsections_v_blocks_cta_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_cta_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_cta_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_cta_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_cta_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_quote_background";
  DROP TYPE "public"."enum__gsections_v_blocks_quote_align";
  DROP TYPE "public"."enum__gsections_v_blocks_quote_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_quote_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_quote_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_quote_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_quote_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_stats_background";
  DROP TYPE "public"."enum__gsections_v_blocks_stats_align";
  DROP TYPE "public"."enum__gsections_v_blocks_stats_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_stats_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_stats_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_stats_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_stats_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_facts_background";
  DROP TYPE "public"."enum__gsections_v_blocks_facts_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_facts_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_facts_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_facts_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_facts_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_article_feed_sites";
  DROP TYPE "public"."enum__gsections_v_blocks_article_feed_kind";
  DROP TYPE "public"."enum__gsections_v_blocks_article_feed_background";
  DROP TYPE "public"."enum__gsections_v_blocks_article_feed_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_article_feed_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_article_feed_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_article_feed_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_article_feed_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_people_layout";
  DROP TYPE "public"."enum__gsections_v_blocks_people_background";
  DROP TYPE "public"."enum__gsections_v_blocks_people_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_people_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_people_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_people_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_people_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_documents_background";
  DROP TYPE "public"."enum__gsections_v_blocks_documents_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_documents_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_documents_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_documents_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_documents_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_timeline_background";
  DROP TYPE "public"."enum__gsections_v_blocks_timeline_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_timeline_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_timeline_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_timeline_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_timeline_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_accordion_background";
  DROP TYPE "public"."enum__gsections_v_blocks_accordion_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_accordion_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_accordion_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_accordion_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_accordion_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_video_background";
  DROP TYPE "public"."enum__gsections_v_blocks_video_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_video_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_video_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_video_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_video_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_embed_provider";
  DROP TYPE "public"."enum__gsections_v_blocks_embed_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_embed_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_embed_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_embed_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_embed_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_tabs_background";
  DROP TYPE "public"."enum__gsections_v_blocks_tabs_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_tabs_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_tabs_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_tabs_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_tabs_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_pricing_plans_link_type";
  DROP TYPE "public"."enum__gsections_v_blocks_pricing_plans_link_appearance";
  DROP TYPE "public"."enum__gsections_v_blocks_pricing_background";
  DROP TYPE "public"."enum__gsections_v_blocks_pricing_align";
  DROP TYPE "public"."enum__gsections_v_blocks_pricing_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_pricing_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_pricing_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_pricing_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_pricing_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_logo_wall_logos_link_type";
  DROP TYPE "public"."enum__gsections_v_blocks_logo_wall_background";
  DROP TYPE "public"."enum__gsections_v_blocks_logo_wall_align";
  DROP TYPE "public"."enum__gsections_v_blocks_logo_wall_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_logo_wall_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_logo_wall_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_logo_wall_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_logo_wall_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_testimonials_columns";
  DROP TYPE "public"."enum__gsections_v_blocks_testimonials_background";
  DROP TYPE "public"."enum__gsections_v_blocks_testimonials_align";
  DROP TYPE "public"."enum__gsections_v_blocks_testimonials_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_testimonials_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_testimonials_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_testimonials_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_testimonials_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_carousel_slides_link_type";
  DROP TYPE "public"."enum__gsections_v_blocks_carousel_background";
  DROP TYPE "public"."enum__gsections_v_blocks_carousel_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_carousel_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_carousel_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_carousel_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_carousel_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_table_background";
  DROP TYPE "public"."enum__gsections_v_blocks_table_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_table_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_table_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_table_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_table_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_contact_card_background";
  DROP TYPE "public"."enum__gsections_v_blocks_contact_card_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_contact_card_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_contact_card_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_contact_card_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_contact_card_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_icon_features_items_icon";
  DROP TYPE "public"."enum__gsections_v_blocks_icon_features_items_link_type";
  DROP TYPE "public"."enum__gsections_v_blocks_icon_features_columns";
  DROP TYPE "public"."enum__gsections_v_blocks_icon_features_background";
  DROP TYPE "public"."enum__gsections_v_blocks_icon_features_align";
  DROP TYPE "public"."enum__gsections_v_blocks_icon_features_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_icon_features_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_icon_features_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_icon_features_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_icon_features_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_banner_variant";
  DROP TYPE "public"."enum__gsections_v_blocks_banner_link_type";
  DROP TYPE "public"."enum__gsections_v_blocks_banner_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_banner_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_banner_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_banner_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_banner_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_button_group_links_link_type";
  DROP TYPE "public"."enum__gsections_v_blocks_button_group_links_link_appearance";
  DROP TYPE "public"."enum__gsections_v_blocks_button_group_justify";
  DROP TYPE "public"."enum__gsections_v_blocks_button_group_background";
  DROP TYPE "public"."enum__gsections_v_blocks_button_group_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_button_group_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_button_group_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_button_group_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_button_group_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_divider_kind";
  DROP TYPE "public"."enum__gsections_v_blocks_divider_size";
  DROP TYPE "public"."enum__gsections_v_blocks_divider_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_divider_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_divider_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_divider_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_divider_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_columns_layout";
  DROP TYPE "public"."enum__gsections_v_blocks_columns_vertical_align";
  DROP TYPE "public"."enum__gsections_v_blocks_columns_background";
  DROP TYPE "public"."enum__gsections_v_blocks_columns_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_columns_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_columns_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_columns_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_columns_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_form_block_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_form_block_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_form_block_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_form_block_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_form_block_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_newsletter_mode";
  DROP TYPE "public"."enum__gsections_v_blocks_newsletter_background";
  DROP TYPE "public"."enum__gsections_v_blocks_newsletter_align";
  DROP TYPE "public"."enum__gsections_v_blocks_newsletter_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_newsletter_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_newsletter_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_newsletter_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_newsletter_section_hide";
  DROP TYPE "public"."enum__gsections_v_version_site";
  DROP TYPE "public"."enum__gsections_v_version_status";
  DROP TYPE "public"."enum__gsections_v_published_locale";
  DROP TYPE "public"."enum_page_templates_blocks_hero_links_link_type";
  DROP TYPE "public"."enum_page_templates_blocks_hero_links_link_appearance";
  DROP TYPE "public"."enum_page_templates_blocks_hero_variant";
  DROP TYPE "public"."enum_page_templates_blocks_hero_align";
  DROP TYPE "public"."enum_page_templates_blocks_hero_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_hero_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_hero_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_hero_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_hero_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_content_width";
  DROP TYPE "public"."enum_page_templates_blocks_content_align";
  DROP TYPE "public"."enum_page_templates_blocks_content_background";
  DROP TYPE "public"."enum_page_templates_blocks_content_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_content_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_content_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_content_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_content_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_text_image_links_link_type";
  DROP TYPE "public"."enum_page_templates_blocks_text_image_links_link_appearance";
  DROP TYPE "public"."enum_page_templates_blocks_text_image_image_position";
  DROP TYPE "public"."enum_page_templates_blocks_text_image_layout";
  DROP TYPE "public"."enum_page_templates_blocks_text_image_background";
  DROP TYPE "public"."enum_page_templates_blocks_text_image_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_text_image_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_text_image_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_text_image_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_text_image_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_full_image_size";
  DROP TYPE "public"."enum_page_templates_blocks_full_image_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_full_image_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_full_image_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_full_image_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_full_image_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_image_grid_columns";
  DROP TYPE "public"."enum_page_templates_blocks_image_grid_background";
  DROP TYPE "public"."enum_page_templates_blocks_image_grid_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_image_grid_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_image_grid_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_image_grid_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_image_grid_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_cards_items_link_type";
  DROP TYPE "public"."enum_page_templates_blocks_cards_columns";
  DROP TYPE "public"."enum_page_templates_blocks_cards_background";
  DROP TYPE "public"."enum_page_templates_blocks_cards_align";
  DROP TYPE "public"."enum_page_templates_blocks_cards_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_cards_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_cards_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_cards_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_cards_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_child_pages_depth";
  DROP TYPE "public"."enum_page_templates_blocks_child_pages_columns";
  DROP TYPE "public"."enum_page_templates_blocks_child_pages_background";
  DROP TYPE "public"."enum_page_templates_blocks_child_pages_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_child_pages_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_child_pages_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_child_pages_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_child_pages_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_cta_links_link_type";
  DROP TYPE "public"."enum_page_templates_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum_page_templates_blocks_cta_background";
  DROP TYPE "public"."enum_page_templates_blocks_cta_align";
  DROP TYPE "public"."enum_page_templates_blocks_cta_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_cta_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_cta_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_cta_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_cta_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_quote_background";
  DROP TYPE "public"."enum_page_templates_blocks_quote_align";
  DROP TYPE "public"."enum_page_templates_blocks_quote_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_quote_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_quote_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_quote_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_quote_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_stats_background";
  DROP TYPE "public"."enum_page_templates_blocks_stats_align";
  DROP TYPE "public"."enum_page_templates_blocks_stats_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_stats_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_stats_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_stats_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_stats_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_facts_background";
  DROP TYPE "public"."enum_page_templates_blocks_facts_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_facts_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_facts_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_facts_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_facts_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_article_feed_sites";
  DROP TYPE "public"."enum_page_templates_blocks_article_feed_kind";
  DROP TYPE "public"."enum_page_templates_blocks_article_feed_background";
  DROP TYPE "public"."enum_page_templates_blocks_article_feed_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_article_feed_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_article_feed_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_article_feed_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_article_feed_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_people_layout";
  DROP TYPE "public"."enum_page_templates_blocks_people_background";
  DROP TYPE "public"."enum_page_templates_blocks_people_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_people_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_people_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_people_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_people_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_documents_background";
  DROP TYPE "public"."enum_page_templates_blocks_documents_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_documents_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_documents_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_documents_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_documents_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_timeline_background";
  DROP TYPE "public"."enum_page_templates_blocks_timeline_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_timeline_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_timeline_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_timeline_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_timeline_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_accordion_background";
  DROP TYPE "public"."enum_page_templates_blocks_accordion_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_accordion_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_accordion_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_accordion_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_accordion_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_video_background";
  DROP TYPE "public"."enum_page_templates_blocks_video_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_video_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_video_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_video_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_video_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_embed_provider";
  DROP TYPE "public"."enum_page_templates_blocks_embed_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_embed_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_embed_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_embed_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_embed_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_tabs_background";
  DROP TYPE "public"."enum_page_templates_blocks_tabs_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_tabs_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_tabs_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_tabs_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_tabs_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_pricing_plans_link_type";
  DROP TYPE "public"."enum_page_templates_blocks_pricing_plans_link_appearance";
  DROP TYPE "public"."enum_page_templates_blocks_pricing_background";
  DROP TYPE "public"."enum_page_templates_blocks_pricing_align";
  DROP TYPE "public"."enum_page_templates_blocks_pricing_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_pricing_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_pricing_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_pricing_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_pricing_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_logo_wall_logos_link_type";
  DROP TYPE "public"."enum_page_templates_blocks_logo_wall_background";
  DROP TYPE "public"."enum_page_templates_blocks_logo_wall_align";
  DROP TYPE "public"."enum_page_templates_blocks_logo_wall_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_logo_wall_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_logo_wall_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_logo_wall_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_logo_wall_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_testimonials_columns";
  DROP TYPE "public"."enum_page_templates_blocks_testimonials_background";
  DROP TYPE "public"."enum_page_templates_blocks_testimonials_align";
  DROP TYPE "public"."enum_page_templates_blocks_testimonials_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_testimonials_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_testimonials_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_testimonials_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_testimonials_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_carousel_slides_link_type";
  DROP TYPE "public"."enum_page_templates_blocks_carousel_background";
  DROP TYPE "public"."enum_page_templates_blocks_carousel_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_carousel_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_carousel_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_carousel_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_carousel_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_table_background";
  DROP TYPE "public"."enum_page_templates_blocks_table_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_table_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_table_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_table_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_table_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_contact_card_background";
  DROP TYPE "public"."enum_page_templates_blocks_contact_card_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_contact_card_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_contact_card_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_contact_card_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_contact_card_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_icon_features_items_icon";
  DROP TYPE "public"."enum_page_templates_blocks_icon_features_items_link_type";
  DROP TYPE "public"."enum_page_templates_blocks_icon_features_columns";
  DROP TYPE "public"."enum_page_templates_blocks_icon_features_background";
  DROP TYPE "public"."enum_page_templates_blocks_icon_features_align";
  DROP TYPE "public"."enum_page_templates_blocks_icon_features_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_icon_features_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_icon_features_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_icon_features_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_icon_features_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_banner_variant";
  DROP TYPE "public"."enum_page_templates_blocks_banner_link_type";
  DROP TYPE "public"."enum_page_templates_blocks_banner_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_banner_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_banner_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_banner_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_banner_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_button_group_links_link_type";
  DROP TYPE "public"."enum_page_templates_blocks_button_group_links_link_appearance";
  DROP TYPE "public"."enum_page_templates_blocks_button_group_justify";
  DROP TYPE "public"."enum_page_templates_blocks_button_group_background";
  DROP TYPE "public"."enum_page_templates_blocks_button_group_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_button_group_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_button_group_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_button_group_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_button_group_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_divider_kind";
  DROP TYPE "public"."enum_page_templates_blocks_divider_size";
  DROP TYPE "public"."enum_page_templates_blocks_divider_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_divider_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_divider_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_divider_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_divider_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_columns_layout";
  DROP TYPE "public"."enum_page_templates_blocks_columns_vertical_align";
  DROP TYPE "public"."enum_page_templates_blocks_columns_background";
  DROP TYPE "public"."enum_page_templates_blocks_columns_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_columns_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_columns_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_columns_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_columns_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_form_block_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_form_block_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_form_block_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_form_block_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_form_block_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_newsletter_mode";
  DROP TYPE "public"."enum_page_templates_blocks_newsletter_background";
  DROP TYPE "public"."enum_page_templates_blocks_newsletter_align";
  DROP TYPE "public"."enum_page_templates_blocks_newsletter_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_newsletter_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_newsletter_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_newsletter_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_newsletter_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_global_section_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_global_section_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_global_section_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_global_section_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_global_section_section_hide";
  DROP TYPE "public"."enum_page_templates_site";
  DROP TYPE "public"."enum_section_presets_blocks_hero_links_link_type";
  DROP TYPE "public"."enum_section_presets_blocks_hero_links_link_appearance";
  DROP TYPE "public"."enum_section_presets_blocks_hero_variant";
  DROP TYPE "public"."enum_section_presets_blocks_hero_align";
  DROP TYPE "public"."enum_section_presets_blocks_hero_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_hero_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_hero_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_hero_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_hero_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_content_width";
  DROP TYPE "public"."enum_section_presets_blocks_content_align";
  DROP TYPE "public"."enum_section_presets_blocks_content_background";
  DROP TYPE "public"."enum_section_presets_blocks_content_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_content_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_content_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_content_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_content_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_text_image_links_link_type";
  DROP TYPE "public"."enum_section_presets_blocks_text_image_links_link_appearance";
  DROP TYPE "public"."enum_section_presets_blocks_text_image_image_position";
  DROP TYPE "public"."enum_section_presets_blocks_text_image_layout";
  DROP TYPE "public"."enum_section_presets_blocks_text_image_background";
  DROP TYPE "public"."enum_section_presets_blocks_text_image_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_text_image_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_text_image_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_text_image_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_text_image_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_full_image_size";
  DROP TYPE "public"."enum_section_presets_blocks_full_image_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_full_image_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_full_image_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_full_image_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_full_image_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_image_grid_columns";
  DROP TYPE "public"."enum_section_presets_blocks_image_grid_background";
  DROP TYPE "public"."enum_section_presets_blocks_image_grid_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_image_grid_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_image_grid_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_image_grid_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_image_grid_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_cards_items_link_type";
  DROP TYPE "public"."enum_section_presets_blocks_cards_columns";
  DROP TYPE "public"."enum_section_presets_blocks_cards_background";
  DROP TYPE "public"."enum_section_presets_blocks_cards_align";
  DROP TYPE "public"."enum_section_presets_blocks_cards_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_cards_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_cards_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_cards_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_cards_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_child_pages_depth";
  DROP TYPE "public"."enum_section_presets_blocks_child_pages_columns";
  DROP TYPE "public"."enum_section_presets_blocks_child_pages_background";
  DROP TYPE "public"."enum_section_presets_blocks_child_pages_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_child_pages_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_child_pages_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_child_pages_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_child_pages_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_cta_links_link_type";
  DROP TYPE "public"."enum_section_presets_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum_section_presets_blocks_cta_background";
  DROP TYPE "public"."enum_section_presets_blocks_cta_align";
  DROP TYPE "public"."enum_section_presets_blocks_cta_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_cta_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_cta_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_cta_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_cta_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_quote_background";
  DROP TYPE "public"."enum_section_presets_blocks_quote_align";
  DROP TYPE "public"."enum_section_presets_blocks_quote_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_quote_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_quote_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_quote_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_quote_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_stats_background";
  DROP TYPE "public"."enum_section_presets_blocks_stats_align";
  DROP TYPE "public"."enum_section_presets_blocks_stats_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_stats_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_stats_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_stats_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_stats_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_facts_background";
  DROP TYPE "public"."enum_section_presets_blocks_facts_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_facts_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_facts_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_facts_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_facts_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_article_feed_sites";
  DROP TYPE "public"."enum_section_presets_blocks_article_feed_kind";
  DROP TYPE "public"."enum_section_presets_blocks_article_feed_background";
  DROP TYPE "public"."enum_section_presets_blocks_article_feed_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_article_feed_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_article_feed_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_article_feed_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_article_feed_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_people_layout";
  DROP TYPE "public"."enum_section_presets_blocks_people_background";
  DROP TYPE "public"."enum_section_presets_blocks_people_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_people_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_people_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_people_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_people_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_documents_background";
  DROP TYPE "public"."enum_section_presets_blocks_documents_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_documents_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_documents_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_documents_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_documents_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_timeline_background";
  DROP TYPE "public"."enum_section_presets_blocks_timeline_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_timeline_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_timeline_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_timeline_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_timeline_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_accordion_background";
  DROP TYPE "public"."enum_section_presets_blocks_accordion_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_accordion_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_accordion_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_accordion_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_accordion_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_video_background";
  DROP TYPE "public"."enum_section_presets_blocks_video_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_video_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_video_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_video_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_video_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_embed_provider";
  DROP TYPE "public"."enum_section_presets_blocks_embed_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_embed_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_embed_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_embed_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_embed_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_tabs_background";
  DROP TYPE "public"."enum_section_presets_blocks_tabs_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_tabs_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_tabs_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_tabs_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_tabs_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_pricing_plans_link_type";
  DROP TYPE "public"."enum_section_presets_blocks_pricing_plans_link_appearance";
  DROP TYPE "public"."enum_section_presets_blocks_pricing_background";
  DROP TYPE "public"."enum_section_presets_blocks_pricing_align";
  DROP TYPE "public"."enum_section_presets_blocks_pricing_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_pricing_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_pricing_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_pricing_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_pricing_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_logo_wall_logos_link_type";
  DROP TYPE "public"."enum_section_presets_blocks_logo_wall_background";
  DROP TYPE "public"."enum_section_presets_blocks_logo_wall_align";
  DROP TYPE "public"."enum_section_presets_blocks_logo_wall_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_logo_wall_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_logo_wall_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_logo_wall_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_logo_wall_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_testimonials_columns";
  DROP TYPE "public"."enum_section_presets_blocks_testimonials_background";
  DROP TYPE "public"."enum_section_presets_blocks_testimonials_align";
  DROP TYPE "public"."enum_section_presets_blocks_testimonials_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_testimonials_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_testimonials_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_testimonials_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_testimonials_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_carousel_slides_link_type";
  DROP TYPE "public"."enum_section_presets_blocks_carousel_background";
  DROP TYPE "public"."enum_section_presets_blocks_carousel_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_carousel_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_carousel_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_carousel_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_carousel_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_table_background";
  DROP TYPE "public"."enum_section_presets_blocks_table_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_table_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_table_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_table_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_table_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_contact_card_background";
  DROP TYPE "public"."enum_section_presets_blocks_contact_card_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_contact_card_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_contact_card_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_contact_card_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_contact_card_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_icon_features_items_icon";
  DROP TYPE "public"."enum_section_presets_blocks_icon_features_items_link_type";
  DROP TYPE "public"."enum_section_presets_blocks_icon_features_columns";
  DROP TYPE "public"."enum_section_presets_blocks_icon_features_background";
  DROP TYPE "public"."enum_section_presets_blocks_icon_features_align";
  DROP TYPE "public"."enum_section_presets_blocks_icon_features_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_icon_features_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_icon_features_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_icon_features_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_icon_features_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_banner_variant";
  DROP TYPE "public"."enum_section_presets_blocks_banner_link_type";
  DROP TYPE "public"."enum_section_presets_blocks_banner_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_banner_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_banner_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_banner_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_banner_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_button_group_links_link_type";
  DROP TYPE "public"."enum_section_presets_blocks_button_group_links_link_appearance";
  DROP TYPE "public"."enum_section_presets_blocks_button_group_justify";
  DROP TYPE "public"."enum_section_presets_blocks_button_group_background";
  DROP TYPE "public"."enum_section_presets_blocks_button_group_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_button_group_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_button_group_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_button_group_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_button_group_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_divider_kind";
  DROP TYPE "public"."enum_section_presets_blocks_divider_size";
  DROP TYPE "public"."enum_section_presets_blocks_divider_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_divider_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_divider_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_divider_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_divider_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_columns_layout";
  DROP TYPE "public"."enum_section_presets_blocks_columns_vertical_align";
  DROP TYPE "public"."enum_section_presets_blocks_columns_background";
  DROP TYPE "public"."enum_section_presets_blocks_columns_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_columns_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_columns_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_columns_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_columns_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_form_block_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_form_block_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_form_block_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_form_block_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_form_block_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_newsletter_mode";
  DROP TYPE "public"."enum_section_presets_blocks_newsletter_background";
  DROP TYPE "public"."enum_section_presets_blocks_newsletter_align";
  DROP TYPE "public"."enum_section_presets_blocks_newsletter_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_newsletter_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_newsletter_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_newsletter_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_newsletter_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_global_section_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_global_section_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_global_section_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_global_section_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_global_section_section_hide";
  DROP TYPE "public"."enum_section_presets_site";`)
}
