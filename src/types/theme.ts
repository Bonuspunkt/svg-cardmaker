export type Rect = [x: number, y: number, w: number, h: number];
export type TextPos = [x: number, y: number, fs: number];

export interface Theme {
  // Colors
  frame_bg: string;
  frame_inner: string;
  frame_border: string;
  title_bg: string;
  title_fg: string;
  art_bg: string;
  type_bg: string;
  type_fg: string;
  rules_bg: string;
  rules_fg: string;
  flavor_fg: string;
  footer_fg: string;
  pt_bg: string;
  pt_fg: string;

  // Fonts
  font_serif: string;
  font_sans: string;
  font_mono: string;

  // Layout rects
  card_sz: [w: number, h: number];
  inner_rec: Rect;
  title_rec: Rect;
  title_txt_rec: TextPos;
  title_rarity_rec: TextPos;
  art_rec: Rect;
  type_rec: Rect;
  type_txt_rec: TextPos;
  rules_rec: Rect;
  rules_txt_rec: TextPos;
  flavor_txt_rec: TextPos;
  footer_txt_rec_l: TextPos;
  footer_txt_rec_r: TextPos;
  opt_box: Rect;
  opt_txt_rec: TextPos;
}
