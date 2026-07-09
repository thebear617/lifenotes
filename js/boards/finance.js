window.BOARD_DATA = window.BOARD_DATA || (window.BOARD_DATA = {});
window.BOARD_DATA["finance"] = {
 "home": {
  "title": "金融-经济",
  "desc": "理财与宏观经济的常识梳理",
  "gridCards": [
   {
    "id": "map",
    "icon": "🗺️",
    "title": "领域地图",
    "desc": "这个领域用于记录个人成长和工作生活中用得上的**经济学/金融学常识**。"
   },
   {
    "id": "qa",
    "icon": "💡",
    "title": "QA",
    "desc": "理财与宏观经济的常识梳理"
   }
  ]
 },
 "navTree": [
  {
   "id": "map",
   "icon": "🗺️",
   "label": "领域地图"
  },
  {
   "id": "qa",
   "icon": "💡",
   "label": "QA"
  }
 ],
 "content": {
  "map": {
   "title": "领域地图",
   "body": "<h1>金融-经济领域地图</h1>\n<p>这个领域用于记录个人成长和工作生活中用得上的<strong>经济学/金融学常识</strong>。</p>\n<h2>核心问题</h2>\n<ul>\n<li>经济学效应（巴拉萨-萨缪尔森、蒙代尔不可能三角、菲利普斯曲线等）的直觉化理解。</li>\n<li>个人理财、消费决策中常被混淆的金融概念。</li>\n</ul>\n<h2>长期关注对象</h2>\n<ul>\n<li>经济学经典效应（被短视频科普反复讲到的那些）</li>\n<li>个人金融素养（复利、通胀、汇率、利率）</li>\n</ul>\n<h2>常用来源</h2>\n<ul>\n<li>B 站经济学 UP 主（用讲故事/动画讲清楚一个效应）</li>\n<li>经典教材/讲义</li>\n</ul>\n<h2>总览</h2>\n<p>（领域刚启动；待来源增多后补\"经济学效应清单\"和\"个人金融常识清单\"两个分支。）</p>\n<h2>来源沉淀</h2>\n<details class=\"callout callout-note\"><summary>2026-06-05 / 宏观经济学: 巴萨效应与发达国家物价 · BV1DP5k66E55</summary><div class=\"callout-body\"><p><strong>来源</strong>：为什么发达国家的物价更高？双胞胎听爸爸讲巴萨效应的故事；原视频：<a href=\"https://www.bilibili.com/video/BV1DP5k66E55\">Bilibili</a></p>\n<p><strong>一句话结论</strong></p>\n<p>巴拉萨-萨缪尔森效应（Balassa-Samuelson effect）解释了为什么发达国家/富裕国家整体物价水平通常更高：服务部门（不可贸易部门）劳动生产率提升慢但工资向制造业看齐 → 服务价格高 → 整体物价高。</p>\n<p><strong>核心机制</strong></p>\n<table>\n<thead>\n<tr>\n<th>部门</th>\n<th>劳动生产率提升</th>\n<th>工资水平</th>\n<th>价格表现</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>可贸易部门（制造业/出口）</td>\n<td>快（国际竞争驱动）</td>\n<td>高</td>\n<td>全球化压低价格（电子产品）</td>\n</tr>\n<tr>\n<td>不可贸易部门（餐饮/理发/本地服务）</td>\n<td>慢（本地为主）</td>\n<td>向高生产率部门看齐</td>\n<td><strong>服务价格高 → 整体物价高</strong></td>\n</tr>\n</tbody>\n</table>\n<p><strong>为什么\"理发/餐饮\"在发达国家贵？</strong></p>\n<p>不是当地人\"不努力\"，而是<strong>全社会工资水平被制造业拉高</strong>，本地服务只能跟着涨价。</p>\n<p><strong>常见误解</strong></p>\n<ul>\n<li>\"发达国家物价高是因为货币值钱\" → 不完全对，是部门间生产率差异</li>\n<li>\"中国人理发便宜是因为人工便宜\" → 部分对，更深层是\"全社会工资水平较低\"导致服务价格低</li>\n</ul>\n<p><strong>写入边界</strong></p>\n<ul>\n<li>视频以\"双胞胎听爸爸讲故事\"形式呈现，是儿童化讲解，简化了原模型</li>\n<li>完整版需看 Balassa (1964) / Samuelson (1964) 原文，或克鲁格曼《国际经济学》相关章节</li>\n<li>现实例外：卢森堡/瑞士物价高不能完全用 BS 效应解释，还有汇率、税制等</li>\n</ul></div></details>\n<h2>待补</h2>\n<ul>\n<li class=\"task\"><input type=\"checkbox\" disabled> 把巴拉萨-萨缪尔森效应的\"为什么\"补完整（人均收入 vs 物价水平的跨国数据图）</li>\n<li class=\"task\"><input type=\"checkbox\" disabled> 加入 1-2 条个人金融基础（复利/通胀/汇率）</li>\n</ul>"
  },
  "qa": {
   "title": "QA",
   "body": "<h2>汇率与物价</h2>\n<details class=\"callout callout-question\"><summary>发达国家的物价为什么通常比发展中国家高？</summary><div class=\"callout-body\"><p>巴拉萨-萨缪尔森效应（Balassa-Samuelson effect）：发达国家/富裕国家在<strong>可贸易部门</strong>（制造业）的劳动生产率提升更快，工资水平向高生产率部门看齐；<strong>不可贸易部门</strong>（餐饮、理发、本地服务）劳动生产率提高慢，但工资也跟着上涨，导致服务价格上涨，进而拉高整体物价水平。</p></div></details>\n"
  }
 }
};
