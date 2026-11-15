import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_freeform_items_kind" AS ENUM('text', 'image', 'button', 'shape');
  CREATE TYPE "public"."enum_pages_blocks_freeform_items_text_style" AS ENUM('heading', 'subheading', 'lead', 'body');
  CREATE TYPE "public"."enum_pages_blocks_freeform_items_fit" AS ENUM('cover', 'contain');
  CREATE TYPE "public"."enum_pages_blocks_freeform_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_freeform_items_link_appearance" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum_pages_blocks_freeform_items_shape_color" AS ENUM('tint', 'muted', 'brand', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_freeform_items_shape_radius" AS ENUM('none', 'rounded', 'circle');
  CREATE TYPE "public"."enum_pages_blocks_freeform_items_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_pages_blocks_freeform_items_valign" AS ENUM('top', 'center', 'bottom');
  CREATE TYPE "public"."enum_pages_blocks_freeform_row_height" AS ENUM('s', 'm', 'l');
  CREATE TYPE "public"."enum_pages_blocks_freeform_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_freeform_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_freeform_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_pages_blocks_freeform_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_pages_blocks_freeform_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_freeform_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__pages_v_blocks_freeform_items_kind" AS ENUM('text', 'image', 'button', 'shape');
  CREATE TYPE "public"."enum__pages_v_blocks_freeform_items_text_style" AS ENUM('heading', 'subheading', 'lead', 'body');
  CREATE TYPE "public"."enum__pages_v_blocks_freeform_items_fit" AS ENUM('cover', 'contain');
  CREATE TYPE "public"."enum__pages_v_blocks_freeform_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_freeform_items_link_appearance" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum__pages_v_blocks_freeform_items_shape_color" AS ENUM('tint', 'muted', 'brand', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_freeform_items_shape_radius" AS ENUM('none', 'rounded', 'circle');
  CREATE TYPE "public"."enum__pages_v_blocks_freeform_items_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum__pages_v_blocks_freeform_items_valign" AS ENUM('top', 'center', 'bottom');
  CREATE TYPE "public"."enum__pages_v_blocks_freeform_row_height" AS ENUM('s', 'm', 'l');
  CREATE TYPE "public"."enum__pages_v_blocks_freeform_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_freeform_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_freeform_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__pages_v_blocks_freeform_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_freeform_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_freeform_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_gsections_blocks_freeform_items_kind" AS ENUM('text', 'image', 'button', 'shape');
  CREATE TYPE "public"."enum_gsections_blocks_freeform_items_text_style" AS ENUM('heading', 'subheading', 'lead', 'body');
  CREATE TYPE "public"."enum_gsections_blocks_freeform_items_fit" AS ENUM('cover', 'contain');
  CREATE TYPE "public"."enum_gsections_blocks_freeform_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_gsections_blocks_freeform_items_link_appearance" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum_gsections_blocks_freeform_items_shape_color" AS ENUM('tint', 'muted', 'brand', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_freeform_items_shape_radius" AS ENUM('none', 'rounded', 'circle');
  CREATE TYPE "public"."enum_gsections_blocks_freeform_items_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_gsections_blocks_freeform_items_valign" AS ENUM('top', 'center', 'bottom');
  CREATE TYPE "public"."enum_gsections_blocks_freeform_row_height" AS ENUM('s', 'm', 'l');
  CREATE TYPE "public"."enum_gsections_blocks_freeform_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_gsections_blocks_freeform_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_freeform_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_gsections_blocks_freeform_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_gsections_blocks_freeform_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_gsections_blocks_freeform_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum__gsections_v_blocks_freeform_items_kind" AS ENUM('text', 'image', 'button', 'shape');
  CREATE TYPE "public"."enum__gsections_v_blocks_freeform_items_text_style" AS ENUM('heading', 'subheading', 'lead', 'body');
  CREATE TYPE "public"."enum__gsections_v_blocks_freeform_items_fit" AS ENUM('cover', 'contain');
  CREATE TYPE "public"."enum__gsections_v_blocks_freeform_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__gsections_v_blocks_freeform_items_link_appearance" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum__gsections_v_blocks_freeform_items_shape_color" AS ENUM('tint', 'muted', 'brand', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_freeform_items_shape_radius" AS ENUM('none', 'rounded', 'circle');
  CREATE TYPE "public"."enum__gsections_v_blocks_freeform_items_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum__gsections_v_blocks_freeform_items_valign" AS ENUM('top', 'center', 'bottom');
  CREATE TYPE "public"."enum__gsections_v_blocks_freeform_row_height" AS ENUM('s', 'm', 'l');
  CREATE TYPE "public"."enum__gsections_v_blocks_freeform_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum__gsections_v_blocks_freeform_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_freeform_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum__gsections_v_blocks_freeform_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum__gsections_v_blocks_freeform_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum__gsections_v_blocks_freeform_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_page_templates_blocks_freeform_items_kind" AS ENUM('text', 'image', 'button', 'shape');
  CREATE TYPE "public"."enum_page_templates_blocks_freeform_items_text_style" AS ENUM('heading', 'subheading', 'lead', 'body');
  CREATE TYPE "public"."enum_page_templates_blocks_freeform_items_fit" AS ENUM('cover', 'contain');
  CREATE TYPE "public"."enum_page_templates_blocks_freeform_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_page_templates_blocks_freeform_items_link_appearance" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum_page_templates_blocks_freeform_items_shape_color" AS ENUM('tint', 'muted', 'brand', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_freeform_items_shape_radius" AS ENUM('none', 'rounded', 'circle');
  CREATE TYPE "public"."enum_page_templates_blocks_freeform_items_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_page_templates_blocks_freeform_items_valign" AS ENUM('top', 'center', 'bottom');
  CREATE TYPE "public"."enum_page_templates_blocks_freeform_row_height" AS ENUM('s', 'm', 'l');
  CREATE TYPE "public"."enum_page_templates_blocks_freeform_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_page_templates_blocks_freeform_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_freeform_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_page_templates_blocks_freeform_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_page_templates_blocks_freeform_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_page_templates_blocks_freeform_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TYPE "public"."enum_section_presets_blocks_freeform_items_kind" AS ENUM('text', 'image', 'button', 'shape');
  CREATE TYPE "public"."enum_section_presets_blocks_freeform_items_text_style" AS ENUM('heading', 'subheading', 'lead', 'body');
  CREATE TYPE "public"."enum_section_presets_blocks_freeform_items_fit" AS ENUM('cover', 'contain');
  CREATE TYPE "public"."enum_section_presets_blocks_freeform_items_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_section_presets_blocks_freeform_items_link_appearance" AS ENUM('primary', 'secondary', 'text');
  CREATE TYPE "public"."enum_section_presets_blocks_freeform_items_shape_color" AS ENUM('tint', 'muted', 'brand', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_freeform_items_shape_radius" AS ENUM('none', 'rounded', 'circle');
  CREATE TYPE "public"."enum_section_presets_blocks_freeform_items_align" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_section_presets_blocks_freeform_items_valign" AS ENUM('top', 'center', 'bottom');
  CREATE TYPE "public"."enum_section_presets_blocks_freeform_row_height" AS ENUM('s', 'm', 'l');
  CREATE TYPE "public"."enum_section_presets_blocks_freeform_background" AS ENUM('none', 'muted', 'tint', 'dark', 'brand');
  CREATE TYPE "public"."enum_section_presets_blocks_freeform_section_space_top" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_freeform_section_space_bottom" AS ENUM('auto', 'none', 's', 'm', 'l', 'xl');
  CREATE TYPE "public"."enum_section_presets_blocks_freeform_section_width" AS ENUM('auto', 'text', 'content', 'wide', 'full');
  CREATE TYPE "public"."enum_section_presets_blocks_freeform_section_overlay" AS ENUM('none', 'light', 'dark');
  CREATE TYPE "public"."enum_section_presets_blocks_freeform_section_hide" AS ENUM('none', 'mobile', 'desktop');
  CREATE TABLE "pages_blocks_freeform_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_pages_blocks_freeform_items_kind" DEFAULT 'text',
  	"x" numeric DEFAULT 1,
  	"w" numeric DEFAULT 6,
  	"y" numeric DEFAULT 1,
  	"h" numeric DEFAULT 2,
  	"text" varchar,
  	"text_style" "enum_pages_blocks_freeform_items_text_style" DEFAULT 'body',
  	"image_id" integer,
  	"fit" "enum_pages_blocks_freeform_items_fit" DEFAULT 'cover',
  	"link_type" "enum_pages_blocks_freeform_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_pages_blocks_freeform_items_link_appearance" DEFAULT 'primary',
  	"shape_color" "enum_pages_blocks_freeform_items_shape_color" DEFAULT 'tint',
  	"shape_radius" "enum_pages_blocks_freeform_items_shape_radius" DEFAULT 'rounded',
  	"align" "enum_pages_blocks_freeform_items_align" DEFAULT 'left',
  	"valign" "enum_pages_blocks_freeform_items_valign" DEFAULT 'top',
  	"mobile_order" numeric,
  	"hide_on_mobile" boolean DEFAULT false
  );
  
  CREATE TABLE "pages_blocks_freeform" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"row_height" "enum_pages_blocks_freeform_row_height" DEFAULT 'm',
  	"background" "enum_pages_blocks_freeform_background" DEFAULT 'none',
  	"section_space_top" "enum_pages_blocks_freeform_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_pages_blocks_freeform_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_pages_blocks_freeform_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_pages_blocks_freeform_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_pages_blocks_freeform_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_freeform_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum__pages_v_blocks_freeform_items_kind" DEFAULT 'text',
  	"x" numeric DEFAULT 1,
  	"w" numeric DEFAULT 6,
  	"y" numeric DEFAULT 1,
  	"h" numeric DEFAULT 2,
  	"text" varchar,
  	"text_style" "enum__pages_v_blocks_freeform_items_text_style" DEFAULT 'body',
  	"image_id" integer,
  	"fit" "enum__pages_v_blocks_freeform_items_fit" DEFAULT 'cover',
  	"link_type" "enum__pages_v_blocks_freeform_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__pages_v_blocks_freeform_items_link_appearance" DEFAULT 'primary',
  	"shape_color" "enum__pages_v_blocks_freeform_items_shape_color" DEFAULT 'tint',
  	"shape_radius" "enum__pages_v_blocks_freeform_items_shape_radius" DEFAULT 'rounded',
  	"align" "enum__pages_v_blocks_freeform_items_align" DEFAULT 'left',
  	"valign" "enum__pages_v_blocks_freeform_items_valign" DEFAULT 'top',
  	"mobile_order" numeric,
  	"hide_on_mobile" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_freeform" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"row_height" "enum__pages_v_blocks_freeform_row_height" DEFAULT 'm',
  	"background" "enum__pages_v_blocks_freeform_background" DEFAULT 'none',
  	"section_space_top" "enum__pages_v_blocks_freeform_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__pages_v_blocks_freeform_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__pages_v_blocks_freeform_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__pages_v_blocks_freeform_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__pages_v_blocks_freeform_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "gsections_blocks_freeform_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_gsections_blocks_freeform_items_kind" DEFAULT 'text',
  	"x" numeric DEFAULT 1,
  	"w" numeric DEFAULT 6,
  	"y" numeric DEFAULT 1,
  	"h" numeric DEFAULT 2,
  	"text" varchar,
  	"text_style" "enum_gsections_blocks_freeform_items_text_style" DEFAULT 'body',
  	"image_id" integer,
  	"fit" "enum_gsections_blocks_freeform_items_fit" DEFAULT 'cover',
  	"link_type" "enum_gsections_blocks_freeform_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_gsections_blocks_freeform_items_link_appearance" DEFAULT 'primary',
  	"shape_color" "enum_gsections_blocks_freeform_items_shape_color" DEFAULT 'tint',
  	"shape_radius" "enum_gsections_blocks_freeform_items_shape_radius" DEFAULT 'rounded',
  	"align" "enum_gsections_blocks_freeform_items_align" DEFAULT 'left',
  	"valign" "enum_gsections_blocks_freeform_items_valign" DEFAULT 'top',
  	"mobile_order" numeric,
  	"hide_on_mobile" boolean DEFAULT false
  );
  
  CREATE TABLE "gsections_blocks_freeform" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"row_height" "enum_gsections_blocks_freeform_row_height" DEFAULT 'm',
  	"background" "enum_gsections_blocks_freeform_background" DEFAULT 'none',
  	"section_space_top" "enum_gsections_blocks_freeform_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_gsections_blocks_freeform_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_gsections_blocks_freeform_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_gsections_blocks_freeform_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_gsections_blocks_freeform_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_freeform_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum__gsections_v_blocks_freeform_items_kind" DEFAULT 'text',
  	"x" numeric DEFAULT 1,
  	"w" numeric DEFAULT 6,
  	"y" numeric DEFAULT 1,
  	"h" numeric DEFAULT 2,
  	"text" varchar,
  	"text_style" "enum__gsections_v_blocks_freeform_items_text_style" DEFAULT 'body',
  	"image_id" integer,
  	"fit" "enum__gsections_v_blocks_freeform_items_fit" DEFAULT 'cover',
  	"link_type" "enum__gsections_v_blocks_freeform_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__gsections_v_blocks_freeform_items_link_appearance" DEFAULT 'primary',
  	"shape_color" "enum__gsections_v_blocks_freeform_items_shape_color" DEFAULT 'tint',
  	"shape_radius" "enum__gsections_v_blocks_freeform_items_shape_radius" DEFAULT 'rounded',
  	"align" "enum__gsections_v_blocks_freeform_items_align" DEFAULT 'left',
  	"valign" "enum__gsections_v_blocks_freeform_items_valign" DEFAULT 'top',
  	"mobile_order" numeric,
  	"hide_on_mobile" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_gsections_v_blocks_freeform" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"row_height" "enum__gsections_v_blocks_freeform_row_height" DEFAULT 'm',
  	"background" "enum__gsections_v_blocks_freeform_background" DEFAULT 'none',
  	"section_space_top" "enum__gsections_v_blocks_freeform_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum__gsections_v_blocks_freeform_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum__gsections_v_blocks_freeform_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum__gsections_v_blocks_freeform_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum__gsections_v_blocks_freeform_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "page_templates_blocks_freeform_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_page_templates_blocks_freeform_items_kind" DEFAULT 'text' NOT NULL,
  	"x" numeric DEFAULT 1 NOT NULL,
  	"w" numeric DEFAULT 6 NOT NULL,
  	"y" numeric DEFAULT 1 NOT NULL,
  	"h" numeric DEFAULT 2 NOT NULL,
  	"text" varchar,
  	"text_style" "enum_page_templates_blocks_freeform_items_text_style" DEFAULT 'body',
  	"image_id" integer,
  	"fit" "enum_page_templates_blocks_freeform_items_fit" DEFAULT 'cover',
  	"link_type" "enum_page_templates_blocks_freeform_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_page_templates_blocks_freeform_items_link_appearance" DEFAULT 'primary',
  	"shape_color" "enum_page_templates_blocks_freeform_items_shape_color" DEFAULT 'tint',
  	"shape_radius" "enum_page_templates_blocks_freeform_items_shape_radius" DEFAULT 'rounded',
  	"align" "enum_page_templates_blocks_freeform_items_align" DEFAULT 'left',
  	"valign" "enum_page_templates_blocks_freeform_items_valign" DEFAULT 'top',
  	"mobile_order" numeric,
  	"hide_on_mobile" boolean DEFAULT false
  );
  
  CREATE TABLE "page_templates_blocks_freeform" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"row_height" "enum_page_templates_blocks_freeform_row_height" DEFAULT 'm',
  	"background" "enum_page_templates_blocks_freeform_background" DEFAULT 'none',
  	"section_space_top" "enum_page_templates_blocks_freeform_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_page_templates_blocks_freeform_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_page_templates_blocks_freeform_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_page_templates_blocks_freeform_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_page_templates_blocks_freeform_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "section_presets_blocks_freeform_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_section_presets_blocks_freeform_items_kind" DEFAULT 'text' NOT NULL,
  	"x" numeric DEFAULT 1 NOT NULL,
  	"w" numeric DEFAULT 6 NOT NULL,
  	"y" numeric DEFAULT 1 NOT NULL,
  	"h" numeric DEFAULT 2 NOT NULL,
  	"text" varchar,
  	"text_style" "enum_section_presets_blocks_freeform_items_text_style" DEFAULT 'body',
  	"image_id" integer,
  	"fit" "enum_section_presets_blocks_freeform_items_fit" DEFAULT 'cover',
  	"link_type" "enum_section_presets_blocks_freeform_items_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_section_presets_blocks_freeform_items_link_appearance" DEFAULT 'primary',
  	"shape_color" "enum_section_presets_blocks_freeform_items_shape_color" DEFAULT 'tint',
  	"shape_radius" "enum_section_presets_blocks_freeform_items_shape_radius" DEFAULT 'rounded',
  	"align" "enum_section_presets_blocks_freeform_items_align" DEFAULT 'left',
  	"valign" "enum_section_presets_blocks_freeform_items_valign" DEFAULT 'top',
  	"mobile_order" numeric,
  	"hide_on_mobile" boolean DEFAULT false
  );
  
  CREATE TABLE "section_presets_blocks_freeform" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"row_height" "enum_section_presets_blocks_freeform_row_height" DEFAULT 'm',
  	"background" "enum_section_presets_blocks_freeform_background" DEFAULT 'none',
  	"section_space_top" "enum_section_presets_blocks_freeform_section_space_top" DEFAULT 'auto',
  	"section_space_bottom" "enum_section_presets_blocks_freeform_section_space_bottom" DEFAULT 'auto',
  	"section_width" "enum_section_presets_blocks_freeform_section_width" DEFAULT 'auto',
  	"section_background_media_id" integer,
  	"section_overlay" "enum_section_presets_blocks_freeform_section_overlay" DEFAULT 'none',
  	"section_anchor" varchar,
  	"section_hide" "enum_section_presets_blocks_freeform_section_hide" DEFAULT 'none',
  	"section_style_class" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_freeform_items" ADD CONSTRAINT "pages_blocks_freeform_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_freeform_items" ADD CONSTRAINT "pages_blocks_freeform_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_freeform"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_freeform" ADD CONSTRAINT "pages_blocks_freeform_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_freeform" ADD CONSTRAINT "pages_blocks_freeform_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_freeform_items" ADD CONSTRAINT "_pages_v_blocks_freeform_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_freeform_items" ADD CONSTRAINT "_pages_v_blocks_freeform_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_freeform"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_freeform" ADD CONSTRAINT "_pages_v_blocks_freeform_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_freeform" ADD CONSTRAINT "_pages_v_blocks_freeform_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_freeform_items" ADD CONSTRAINT "gsections_blocks_freeform_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_freeform_items" ADD CONSTRAINT "gsections_blocks_freeform_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections_blocks_freeform"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gsections_blocks_freeform" ADD CONSTRAINT "gsections_blocks_freeform_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gsections_blocks_freeform" ADD CONSTRAINT "gsections_blocks_freeform_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."gsections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_freeform_items" ADD CONSTRAINT "_gsections_v_blocks_freeform_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_freeform_items" ADD CONSTRAINT "_gsections_v_blocks_freeform_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v_blocks_freeform"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_freeform" ADD CONSTRAINT "_gsections_v_blocks_freeform_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_gsections_v_blocks_freeform" ADD CONSTRAINT "_gsections_v_blocks_freeform_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_gsections_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_freeform_items" ADD CONSTRAINT "page_templates_blocks_freeform_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_freeform_items" ADD CONSTRAINT "page_templates_blocks_freeform_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates_blocks_freeform"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_freeform" ADD CONSTRAINT "page_templates_blocks_freeform_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "page_templates_blocks_freeform" ADD CONSTRAINT "page_templates_blocks_freeform_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."page_templates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_freeform_items" ADD CONSTRAINT "section_presets_blocks_freeform_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_freeform_items" ADD CONSTRAINT "section_presets_blocks_freeform_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets_blocks_freeform"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_freeform" ADD CONSTRAINT "section_presets_blocks_freeform_section_background_media_id_media_id_fk" FOREIGN KEY ("section_background_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "section_presets_blocks_freeform" ADD CONSTRAINT "section_presets_blocks_freeform_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."section_presets"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_freeform_items_order_idx" ON "pages_blocks_freeform_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_freeform_items_parent_id_idx" ON "pages_blocks_freeform_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_freeform_items_locale_idx" ON "pages_blocks_freeform_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_freeform_items_image_idx" ON "pages_blocks_freeform_items" USING btree ("image_id");
  CREATE INDEX "pages_blocks_freeform_order_idx" ON "pages_blocks_freeform" USING btree ("_order");
  CREATE INDEX "pages_blocks_freeform_parent_id_idx" ON "pages_blocks_freeform" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_freeform_path_idx" ON "pages_blocks_freeform" USING btree ("_path");
  CREATE INDEX "pages_blocks_freeform_locale_idx" ON "pages_blocks_freeform" USING btree ("_locale");
  CREATE INDEX "pages_blocks_freeform_section_section_background_media_idx" ON "pages_blocks_freeform" USING btree ("section_background_media_id");
  CREATE INDEX "_pages_v_blocks_freeform_items_order_idx" ON "_pages_v_blocks_freeform_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_freeform_items_parent_id_idx" ON "_pages_v_blocks_freeform_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_freeform_items_locale_idx" ON "_pages_v_blocks_freeform_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_freeform_items_image_idx" ON "_pages_v_blocks_freeform_items" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_freeform_order_idx" ON "_pages_v_blocks_freeform" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_freeform_parent_id_idx" ON "_pages_v_blocks_freeform" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_freeform_path_idx" ON "_pages_v_blocks_freeform" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_freeform_locale_idx" ON "_pages_v_blocks_freeform" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_freeform_section_section_background_medi_idx" ON "_pages_v_blocks_freeform" USING btree ("section_background_media_id");
  CREATE INDEX "gsections_blocks_freeform_items_order_idx" ON "gsections_blocks_freeform_items" USING btree ("_order");
  CREATE INDEX "gsections_blocks_freeform_items_parent_id_idx" ON "gsections_blocks_freeform_items" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_freeform_items_locale_idx" ON "gsections_blocks_freeform_items" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_freeform_items_image_idx" ON "gsections_blocks_freeform_items" USING btree ("image_id");
  CREATE INDEX "gsections_blocks_freeform_order_idx" ON "gsections_blocks_freeform" USING btree ("_order");
  CREATE INDEX "gsections_blocks_freeform_parent_id_idx" ON "gsections_blocks_freeform" USING btree ("_parent_id");
  CREATE INDEX "gsections_blocks_freeform_path_idx" ON "gsections_blocks_freeform" USING btree ("_path");
  CREATE INDEX "gsections_blocks_freeform_locale_idx" ON "gsections_blocks_freeform" USING btree ("_locale");
  CREATE INDEX "gsections_blocks_freeform_section_section_background_med_idx" ON "gsections_blocks_freeform" USING btree ("section_background_media_id");
  CREATE INDEX "_gsections_v_blocks_freeform_items_order_idx" ON "_gsections_v_blocks_freeform_items" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_freeform_items_parent_id_idx" ON "_gsections_v_blocks_freeform_items" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_freeform_items_locale_idx" ON "_gsections_v_blocks_freeform_items" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_freeform_items_image_idx" ON "_gsections_v_blocks_freeform_items" USING btree ("image_id");
  CREATE INDEX "_gsections_v_blocks_freeform_order_idx" ON "_gsections_v_blocks_freeform" USING btree ("_order");
  CREATE INDEX "_gsections_v_blocks_freeform_parent_id_idx" ON "_gsections_v_blocks_freeform" USING btree ("_parent_id");
  CREATE INDEX "_gsections_v_blocks_freeform_path_idx" ON "_gsections_v_blocks_freeform" USING btree ("_path");
  CREATE INDEX "_gsections_v_blocks_freeform_locale_idx" ON "_gsections_v_blocks_freeform" USING btree ("_locale");
  CREATE INDEX "_gsections_v_blocks_freeform_section_section_background__idx" ON "_gsections_v_blocks_freeform" USING btree ("section_background_media_id");
  CREATE INDEX "page_templates_blocks_freeform_items_order_idx" ON "page_templates_blocks_freeform_items" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_freeform_items_parent_id_idx" ON "page_templates_blocks_freeform_items" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_freeform_items_locale_idx" ON "page_templates_blocks_freeform_items" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_freeform_items_image_idx" ON "page_templates_blocks_freeform_items" USING btree ("image_id");
  CREATE INDEX "page_templates_blocks_freeform_order_idx" ON "page_templates_blocks_freeform" USING btree ("_order");
  CREATE INDEX "page_templates_blocks_freeform_parent_id_idx" ON "page_templates_blocks_freeform" USING btree ("_parent_id");
  CREATE INDEX "page_templates_blocks_freeform_path_idx" ON "page_templates_blocks_freeform" USING btree ("_path");
  CREATE INDEX "page_templates_blocks_freeform_locale_idx" ON "page_templates_blocks_freeform" USING btree ("_locale");
  CREATE INDEX "page_templates_blocks_freeform_section_section_backgroun_idx" ON "page_templates_blocks_freeform" USING btree ("section_background_media_id");
  CREATE INDEX "section_presets_blocks_freeform_items_order_idx" ON "section_presets_blocks_freeform_items" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_freeform_items_parent_id_idx" ON "section_presets_blocks_freeform_items" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_freeform_items_locale_idx" ON "section_presets_blocks_freeform_items" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_freeform_items_image_idx" ON "section_presets_blocks_freeform_items" USING btree ("image_id");
  CREATE INDEX "section_presets_blocks_freeform_order_idx" ON "section_presets_blocks_freeform" USING btree ("_order");
  CREATE INDEX "section_presets_blocks_freeform_parent_id_idx" ON "section_presets_blocks_freeform" USING btree ("_parent_id");
  CREATE INDEX "section_presets_blocks_freeform_path_idx" ON "section_presets_blocks_freeform" USING btree ("_path");
  CREATE INDEX "section_presets_blocks_freeform_locale_idx" ON "section_presets_blocks_freeform" USING btree ("_locale");
  CREATE INDEX "section_presets_blocks_freeform_section_section_backgrou_idx" ON "section_presets_blocks_freeform" USING btree ("section_background_media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_freeform_items" CASCADE;
  DROP TABLE "pages_blocks_freeform" CASCADE;
  DROP TABLE "_pages_v_blocks_freeform_items" CASCADE;
  DROP TABLE "_pages_v_blocks_freeform" CASCADE;
  DROP TABLE "gsections_blocks_freeform_items" CASCADE;
  DROP TABLE "gsections_blocks_freeform" CASCADE;
  DROP TABLE "_gsections_v_blocks_freeform_items" CASCADE;
  DROP TABLE "_gsections_v_blocks_freeform" CASCADE;
  DROP TABLE "page_templates_blocks_freeform_items" CASCADE;
  DROP TABLE "page_templates_blocks_freeform" CASCADE;
  DROP TABLE "section_presets_blocks_freeform_items" CASCADE;
  DROP TABLE "section_presets_blocks_freeform" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_freeform_items_kind";
  DROP TYPE "public"."enum_pages_blocks_freeform_items_text_style";
  DROP TYPE "public"."enum_pages_blocks_freeform_items_fit";
  DROP TYPE "public"."enum_pages_blocks_freeform_items_link_type";
  DROP TYPE "public"."enum_pages_blocks_freeform_items_link_appearance";
  DROP TYPE "public"."enum_pages_blocks_freeform_items_shape_color";
  DROP TYPE "public"."enum_pages_blocks_freeform_items_shape_radius";
  DROP TYPE "public"."enum_pages_blocks_freeform_items_align";
  DROP TYPE "public"."enum_pages_blocks_freeform_items_valign";
  DROP TYPE "public"."enum_pages_blocks_freeform_row_height";
  DROP TYPE "public"."enum_pages_blocks_freeform_background";
  DROP TYPE "public"."enum_pages_blocks_freeform_section_space_top";
  DROP TYPE "public"."enum_pages_blocks_freeform_section_space_bottom";
  DROP TYPE "public"."enum_pages_blocks_freeform_section_width";
  DROP TYPE "public"."enum_pages_blocks_freeform_section_overlay";
  DROP TYPE "public"."enum_pages_blocks_freeform_section_hide";
  DROP TYPE "public"."enum__pages_v_blocks_freeform_items_kind";
  DROP TYPE "public"."enum__pages_v_blocks_freeform_items_text_style";
  DROP TYPE "public"."enum__pages_v_blocks_freeform_items_fit";
  DROP TYPE "public"."enum__pages_v_blocks_freeform_items_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_freeform_items_link_appearance";
  DROP TYPE "public"."enum__pages_v_blocks_freeform_items_shape_color";
  DROP TYPE "public"."enum__pages_v_blocks_freeform_items_shape_radius";
  DROP TYPE "public"."enum__pages_v_blocks_freeform_items_align";
  DROP TYPE "public"."enum__pages_v_blocks_freeform_items_valign";
  DROP TYPE "public"."enum__pages_v_blocks_freeform_row_height";
  DROP TYPE "public"."enum__pages_v_blocks_freeform_background";
  DROP TYPE "public"."enum__pages_v_blocks_freeform_section_space_top";
  DROP TYPE "public"."enum__pages_v_blocks_freeform_section_space_bottom";
  DROP TYPE "public"."enum__pages_v_blocks_freeform_section_width";
  DROP TYPE "public"."enum__pages_v_blocks_freeform_section_overlay";
  DROP TYPE "public"."enum__pages_v_blocks_freeform_section_hide";
  DROP TYPE "public"."enum_gsections_blocks_freeform_items_kind";
  DROP TYPE "public"."enum_gsections_blocks_freeform_items_text_style";
  DROP TYPE "public"."enum_gsections_blocks_freeform_items_fit";
  DROP TYPE "public"."enum_gsections_blocks_freeform_items_link_type";
  DROP TYPE "public"."enum_gsections_blocks_freeform_items_link_appearance";
  DROP TYPE "public"."enum_gsections_blocks_freeform_items_shape_color";
  DROP TYPE "public"."enum_gsections_blocks_freeform_items_shape_radius";
  DROP TYPE "public"."enum_gsections_blocks_freeform_items_align";
  DROP TYPE "public"."enum_gsections_blocks_freeform_items_valign";
  DROP TYPE "public"."enum_gsections_blocks_freeform_row_height";
  DROP TYPE "public"."enum_gsections_blocks_freeform_background";
  DROP TYPE "public"."enum_gsections_blocks_freeform_section_space_top";
  DROP TYPE "public"."enum_gsections_blocks_freeform_section_space_bottom";
  DROP TYPE "public"."enum_gsections_blocks_freeform_section_width";
  DROP TYPE "public"."enum_gsections_blocks_freeform_section_overlay";
  DROP TYPE "public"."enum_gsections_blocks_freeform_section_hide";
  DROP TYPE "public"."enum__gsections_v_blocks_freeform_items_kind";
  DROP TYPE "public"."enum__gsections_v_blocks_freeform_items_text_style";
  DROP TYPE "public"."enum__gsections_v_blocks_freeform_items_fit";
  DROP TYPE "public"."enum__gsections_v_blocks_freeform_items_link_type";
  DROP TYPE "public"."enum__gsections_v_blocks_freeform_items_link_appearance";
  DROP TYPE "public"."enum__gsections_v_blocks_freeform_items_shape_color";
  DROP TYPE "public"."enum__gsections_v_blocks_freeform_items_shape_radius";
  DROP TYPE "public"."enum__gsections_v_blocks_freeform_items_align";
  DROP TYPE "public"."enum__gsections_v_blocks_freeform_items_valign";
  DROP TYPE "public"."enum__gsections_v_blocks_freeform_row_height";
  DROP TYPE "public"."enum__gsections_v_blocks_freeform_background";
  DROP TYPE "public"."enum__gsections_v_blocks_freeform_section_space_top";
  DROP TYPE "public"."enum__gsections_v_blocks_freeform_section_space_bottom";
  DROP TYPE "public"."enum__gsections_v_blocks_freeform_section_width";
  DROP TYPE "public"."enum__gsections_v_blocks_freeform_section_overlay";
  DROP TYPE "public"."enum__gsections_v_blocks_freeform_section_hide";
  DROP TYPE "public"."enum_page_templates_blocks_freeform_items_kind";
  DROP TYPE "public"."enum_page_templates_blocks_freeform_items_text_style";
  DROP TYPE "public"."enum_page_templates_blocks_freeform_items_fit";
  DROP TYPE "public"."enum_page_templates_blocks_freeform_items_link_type";
  DROP TYPE "public"."enum_page_templates_blocks_freeform_items_link_appearance";
  DROP TYPE "public"."enum_page_templates_blocks_freeform_items_shape_color";
  DROP TYPE "public"."enum_page_templates_blocks_freeform_items_shape_radius";
  DROP TYPE "public"."enum_page_templates_blocks_freeform_items_align";
  DROP TYPE "public"."enum_page_templates_blocks_freeform_items_valign";
  DROP TYPE "public"."enum_page_templates_blocks_freeform_row_height";
  DROP TYPE "public"."enum_page_templates_blocks_freeform_background";
  DROP TYPE "public"."enum_page_templates_blocks_freeform_section_space_top";
  DROP TYPE "public"."enum_page_templates_blocks_freeform_section_space_bottom";
  DROP TYPE "public"."enum_page_templates_blocks_freeform_section_width";
  DROP TYPE "public"."enum_page_templates_blocks_freeform_section_overlay";
  DROP TYPE "public"."enum_page_templates_blocks_freeform_section_hide";
  DROP TYPE "public"."enum_section_presets_blocks_freeform_items_kind";
  DROP TYPE "public"."enum_section_presets_blocks_freeform_items_text_style";
  DROP TYPE "public"."enum_section_presets_blocks_freeform_items_fit";
  DROP TYPE "public"."enum_section_presets_blocks_freeform_items_link_type";
  DROP TYPE "public"."enum_section_presets_blocks_freeform_items_link_appearance";
  DROP TYPE "public"."enum_section_presets_blocks_freeform_items_shape_color";
  DROP TYPE "public"."enum_section_presets_blocks_freeform_items_shape_radius";
  DROP TYPE "public"."enum_section_presets_blocks_freeform_items_align";
  DROP TYPE "public"."enum_section_presets_blocks_freeform_items_valign";
  DROP TYPE "public"."enum_section_presets_blocks_freeform_row_height";
  DROP TYPE "public"."enum_section_presets_blocks_freeform_background";
  DROP TYPE "public"."enum_section_presets_blocks_freeform_section_space_top";
  DROP TYPE "public"."enum_section_presets_blocks_freeform_section_space_bottom";
  DROP TYPE "public"."enum_section_presets_blocks_freeform_section_width";
  DROP TYPE "public"."enum_section_presets_blocks_freeform_section_overlay";
  DROP TYPE "public"."enum_section_presets_blocks_freeform_section_hide";`)
}
