window.BOARD_DATA = window.BOARD_DATA || (window.BOARD_DATA = {});
window.BOARD_DATA["phone"] = {
 "home": {
  "title": "手机",
  "desc": "手机品牌/系统/使用技巧/产业科普",
  "gridCards": [
   {
    "id": "map",
    "icon": "🗺️",
    "title": "领域地图",
    "desc": "手机品牌、系统功能、使用技巧、维修回收、配件生态、移动通信和消费电子相关的知识观"
   }
  ]
 },
 "navTree": [
  {
   "id": "map",
   "icon": "🗺️",
   "label": "领域地图"
  }
 ],
 "content": {
  "map": {
   "title": "领域地图",
   "body": "<h1>手机领域地图</h1>\n<p>手机品牌、系统功能、使用技巧、维修回收、配件生态、移动通信和消费电子相关的知识观察。</p>\n<h2>核心问题</h2>\n<ul>\n<li>不同品牌/系统的使用技巧如何转化为可复现的操作指南</li>\n<li>手机发热、续航、存储、网络等常见问题的排查与优化</li>\n<li>消费电子产业（供应链、渠道、回收、配件生态）的关键逻辑</li>\n</ul>\n<h2>长期关注对象</h2>\n<ul>\n<li>主流品牌与系统：Apple（iOS）、华为（HarmonyOS）、小米（HyperOS）、OPPO（ColorOS）、vivo（OriginOS）、三星（One UI）</li>\n<li>使用与维护技巧：发热、续航、充电、电池健康、存储清理、网络设置、拍照录像、数据迁移</li>\n<li>产业观察：供应链、渠道、回收、以旧换新、运营商套餐、配件生态</li>\n</ul>\n<h2>常用来源</h2>\n<ul>\n<li>B 站数码 UP 主（使用技巧、系统对比、产业分析）</li>\n<li>品牌官方支持文档</li>\n<li>消费者实测与经验帖</li>\n</ul>\n<h2>来源沉淀</h2>\n<h4 class=\"note-h\">2026-05-12 / 使用技巧: 夏天 iPhone 发烫的 3 个设置检查项</h4>\n<p><strong>来源</strong>：B站视频《到夏天iPhone就太烫了？教大家个快速降温方法！》\n<strong>链接</strong>：https://www.bilibili.com/video/BV1AaoXBhEwT/</p>\n<p><strong>核心判断</strong>：降温思路不是物理散热，而是减少后台刷新、分析上传和弱 Wi-Fi 下的蜂窝补偿，从而降低后台活动与联网耗电。</p>\n<p><strong>操作路径</strong>：\n- <code>设置</code> → <code>通用</code> → <code>后台 App 刷新</code> → 关闭\n- <code>设置</code> → <code>隐私与安全性</code> → <code>分析与改进</code> → 关闭 <code>共享 iPhone 分析</code>\n- <code>设置</code> → <code>蜂窝网络</code> → 滑到底部 → 关闭 <code>无线局域网助理</code></p>\n<p><strong>适用场景</strong>：日常待机、刷视频、聊天时发热或掉电偏快；不希望 App 在后台频繁刷新；不希望弱 Wi-Fi 时自动用蜂窝补流量。</p>\n<p><strong>边界</strong>：非万能方案。重度游戏、长时间拍视频、导航、无线充电、边充边玩、太阳直晒等场景依然会明显升温。已出现高温警告时应暂停使用并放到阴凉处自然降温。关闭后台刷新后部分 App 内容更新会变慢；关闭无线局域网助理后弱 Wi-Fi 体验可能变差。</p>\n\n<h4 class=\"note-h\">2026-05-12 / 使用技巧: 手机系统时间慢了会导致抢票失败</h4>\n<p><strong>来源</strong>：B站视频《我一直抢不到票，原来是因为这样！》\n<strong>链接</strong>：https://www.bilibili.com/video/BV1J9oSBUEPj/</p>\n<p><strong>核心判断</strong>：抢票失败不一定是因为信号或性能差，系统时间不准确是常见但容易被忽视的原因。售票系统依赖精确时间戳验证请求顺序，偏差哪怕 0.1 秒都可能错过放票瞬间。</p>\n<p><strong>判断方法</strong>：浏览器访问 Time.is（https://time.is/），查看手机系统时间与标准时间的差值。</p>\n<p><strong>修复（强制重新同步 NTP）</strong>：\n1. 关闭\"自动设置时间\"\n2. 手动把时间调快或调慢几分钟\n3. 重新开启\"自动设置时间\"（强制拉取完整 NTP 时间）\n4. 仍不生效则重启手机后重复</p>\n<p><strong>各品牌路径</strong>：\n| 品牌 | 路径 |\n|---|---|\n| 华为/荣耀 | 设置 → 系统和更新 → 日期和时间 → 自动获取时间 |\n| iPhone | 设置 → 通用 → 日期与时间 → 自动设置 |\n| 小米 | 设置 → 更多设置 → 日期和时间 → 自动同步时间 |\n| OPPO | 设置 → 系统管理 → 日期和时间 → 自动获取时间 |\n| vivo | 设置 → 系统管理 → 日期和时间 → 自动同步时间 |\n| 三星 | 设置 → 常规管理 → 日期和时间 → 自动获取时间 |</p>\n<p><strong>抢票前额外建议</strong>：提前 1 分钟打开页面刷新；重启手机清后台缓存；只保留抢票和支付 App。</p>\n<p><strong>边界</strong>：部分抢票系统还有人机验证、账号等级等额外门槛，时间同步只是排查方向之一。</p>\n\n<h4 class=\"note-h\">2026-05-13 / 工具: Picsew 长截图使用方式</h4>\n<p><strong>核心判断</strong>：iPhone 长截图分两类——Safari 网页优先用 iOS 自带\"整页 / Full Page\"；微信、App 页面、评论区等任意第三方页面优先用 Picsew。</p>\n<p><strong>方法一：多张截图自动拼接（适合微信聊天、设置页、文章局部）</strong>\n1. 连续截多张截图，每两张之间保留重复内容\n2. 打开 Picsew → 选择截图 → Vertical 竖向拼接\n3. 检查拼接位置 → 裁掉多余区域 → 导出</p>\n<p><strong>方法二：录屏滚动生成长图（适合超长页面）</strong>\n1. 开始屏幕录制 → 缓慢匀速向下滚动 → 停止录屏\n2. 打开 Picsew → 选择录屏 → Scrollshot 生成长图 → 裁边导出\n3. 关键：滚动速度要慢，不要来回滑动</p>\n<p><strong>iOS 自带整页截图</strong>：截图 → 点预览 → 整页 / Full Page → 保存。限制：非所有 App 支持，第三方页面仍需 Picsew。</p>\n<p><strong>最佳实践</strong>：普通网页先试自带整页；任意 App 用 Picsew；短页面多张拼接；超长页面录屏滚动。</p>\n",
   "records": [
    {
     "date": "2026-05-12",
     "category": "使用技巧",
     "title": "夏天 iPhone 发烫的 3 个设置检查项",
     "html": "<p><strong>来源</strong>：B站视频《到夏天iPhone就太烫了？教大家个快速降温方法！》\n<strong>链接</strong>：https://www.bilibili.com/video/BV1AaoXBhEwT/</p>\n<p><strong>核心判断</strong>：降温思路不是物理散热，而是减少后台刷新、分析上传和弱 Wi-Fi 下的蜂窝补偿，从而降低后台活动与联网耗电。</p>\n<p><strong>操作路径</strong>：\n- <code>设置</code> → <code>通用</code> → <code>后台 App 刷新</code> → 关闭\n- <code>设置</code> → <code>隐私与安全性</code> → <code>分析与改进</code> → 关闭 <code>共享 iPhone 分析</code>\n- <code>设置</code> → <code>蜂窝网络</code> → 滑到底部 → 关闭 <code>无线局域网助理</code></p>\n<p><strong>适用场景</strong>：日常待机、刷视频、聊天时发热或掉电偏快；不希望 App 在后台频繁刷新；不希望弱 Wi-Fi 时自动用蜂窝补流量。</p>\n<p><strong>边界</strong>：非万能方案。重度游戏、长时间拍视频、导航、无线充电、边充边玩、太阳直晒等场景依然会明显升温。已出现高温警告时应暂停使用并放到阴凉处自然降温。关闭后台刷新后部分 App 内容更新会变慢；关闭无线局域网助理后弱 Wi-Fi 体验可能变差。</p>"
    },
    {
     "date": "2026-05-12",
     "category": "使用技巧",
     "title": "手机系统时间慢了会导致抢票失败",
     "html": "<p><strong>来源</strong>：B站视频《我一直抢不到票，原来是因为这样！》\n<strong>链接</strong>：https://www.bilibili.com/video/BV1J9oSBUEPj/</p>\n<p><strong>核心判断</strong>：抢票失败不一定是因为信号或性能差，系统时间不准确是常见但容易被忽视的原因。售票系统依赖精确时间戳验证请求顺序，偏差哪怕 0.1 秒都可能错过放票瞬间。</p>\n<p><strong>判断方法</strong>：浏览器访问 Time.is（https://time.is/），查看手机系统时间与标准时间的差值。</p>\n<p><strong>修复（强制重新同步 NTP）</strong>：\n1. 关闭\"自动设置时间\"\n2. 手动把时间调快或调慢几分钟\n3. 重新开启\"自动设置时间\"（强制拉取完整 NTP 时间）\n4. 仍不生效则重启手机后重复</p>\n<p><strong>各品牌路径</strong>：\n| 品牌 | 路径 |\n|---|---|\n| 华为/荣耀 | 设置 → 系统和更新 → 日期和时间 → 自动获取时间 |\n| iPhone | 设置 → 通用 → 日期与时间 → 自动设置 |\n| 小米 | 设置 → 更多设置 → 日期和时间 → 自动同步时间 |\n| OPPO | 设置 → 系统管理 → 日期和时间 → 自动获取时间 |\n| vivo | 设置 → 系统管理 → 日期和时间 → 自动同步时间 |\n| 三星 | 设置 → 常规管理 → 日期和时间 → 自动获取时间 |</p>\n<p><strong>抢票前额外建议</strong>：提前 1 分钟打开页面刷新；重启手机清后台缓存；只保留抢票和支付 App。</p>\n<p><strong>边界</strong>：部分抢票系统还有人机验证、账号等级等额外门槛，时间同步只是排查方向之一。</p>"
    },
    {
     "date": "2026-05-13",
     "category": "工具",
     "title": "Picsew 长截图使用方式",
     "html": "<p><strong>核心判断</strong>：iPhone 长截图分两类——Safari 网页优先用 iOS 自带\"整页 / Full Page\"；微信、App 页面、评论区等任意第三方页面优先用 Picsew。</p>\n<p><strong>方法一：多张截图自动拼接（适合微信聊天、设置页、文章局部）</strong>\n1. 连续截多张截图，每两张之间保留重复内容\n2. 打开 Picsew → 选择截图 → Vertical 竖向拼接\n3. 检查拼接位置 → 裁掉多余区域 → 导出</p>\n<p><strong>方法二：录屏滚动生成长图（适合超长页面）</strong>\n1. 开始屏幕录制 → 缓慢匀速向下滚动 → 停止录屏\n2. 打开 Picsew → 选择录屏 → Scrollshot 生成长图 → 裁边导出\n3. 关键：滚动速度要慢，不要来回滑动</p>\n<p><strong>iOS 自带整页截图</strong>：截图 → 点预览 → 整页 / Full Page → 保存。限制：非所有 App 支持，第三方页面仍需 Picsew。</p>\n<p><strong>最佳实践</strong>：普通网页先试自带整页；任意 App 用 Picsew；短页面多张拼接；超长页面录屏滚动。</p>"
    }
   ]
  }
 }
};
