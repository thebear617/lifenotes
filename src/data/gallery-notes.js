import galleryCategories from './gallery-categories.js';

const galleryNotes = [
  {
    "slug": "xidian-new-area",
    "type": "video",
    "title": "西电-信息港校区",
    "category": "生活",
    "subcategory": "娱乐",
    "date": "2026-10-17",
    "cover": "images/gallery/inspiration/xidian-new-area.png",
    "sourceUrl": "https://www.xiaohongshu.com/discovery/item/6ad2edfd000000001b02ce9a?source=webshare&xhsshare=pc_web&xsec_token=ABRJDTffMfFuN19wxkptOA6mEPr7RKO-kBG29bv68DxPo=&xsec_source=pc_share"
  },
  {
    "slug": "ai-confrence-top20",
    "type": "image",
    "title": "AI顶会-前二十",
    "category": "生活",
    "subcategory": "娱乐",
    "date": "2026-10-17",
    "cover": "images/gallery/inspiration/ai-confrence-top20.jpg",
    "sourceUrl": "https://www.xiaohongshu.com/explore/6abcdc3d000000000200fc23?xsec_token=ABHMT-Hg6XoBqHddzm0eV2Fw_wdX03nc1b2k8lQ-LtXYw=&xsec_source=pc_search&source=web_search_result_notes"
  },
  {
    "slug": "micro-adjustment-guide",
    "type": "video",
    "title": "微调教学",
    "category": "生活",
    "subcategory": "娱乐",
    "date": "2026-10-05",
    "cover": "images/gallery/inspiration/micro-adjustment-guide.jpg",
    "sourceUrl": "https://www.xiaohongshu.com/explore/6ac1f292000000000202972e?xsec_token=ABPkDIvuPYen743MJgF5IPCbHXB0a5FsPBMhOyKHT_WHE=&xsec_source=pc_feed"
  },
  {
    "slug": "vibe-coding-interaction-dictionary-part-2",
    "type": "image",
    "title": "Vibe Coding产品交互视觉词典（下篇）",
    "category": "开发",
    "subcategory": "前端",
    "date": "2026-10-03",
    "cover": "images/gallery/inspiration/vibe-coding-interaction-dictionary-part-2.png",
    "sourceUrl": "https://www.xiaohongshu.com/explore/6aab87a2000000002b0112d6?xsec_token=ABGxrMhZ4K2fXcY7X3hlOrlhR0_Cr6g30Wb1TbB4uB5NM=&xsec_source=pc_user"
  },
  {
    "slug": "vibe-coding-interaction-dictionary-part-1",
    "type": "image",
    "title": "Vibe Coding产品交互视觉词典（上篇）",
    "category": "开发",
    "subcategory": "前端",
    "date": "2026-10-03",
    "cover": "images/gallery/inspiration/vibe-coding-interaction-dictionary-part-1.png",
    "sourceUrl": "https://www.xiaohongshu.com/explore/6aaa5cc9000000002601d0cb?xsec_token=ABuxiZi9McVMKorZfJeYZ_cDzLVXjOKFVeZQviu3U0sc0=&xsec_source=pc_user"
  }
];

const validTypes = new Set(['image', 'video']);
const categoryEntries = Object.entries(galleryCategories);

for (const note of galleryNotes) {
  if (!note.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(note.slug)) {
    throw new Error(`灵感画廊 slug 无效：${note.slug}`);
  }
  if (!validTypes.has(note.type)) throw new Error(`灵感画廊类型无效：${note.type}`);
  if (!note.title || !note.date || !note.cover || !note.sourceUrl) {
    throw new Error(`灵感画廊记录字段不完整：${note.slug}`);
  }
  const subcategories = Object.fromEntries(categoryEntries)[note.category] || [];
  if (!subcategories.includes(note.subcategory)) {
    throw new Error(`灵感画廊分类无效：${note.category} / ${note.subcategory}`);
  }
}

const slugs = galleryNotes.map((note) => note.slug);
if (new Set(slugs).size !== slugs.length) throw new Error('灵感画廊 slug 必须唯一');

export default galleryNotes;
