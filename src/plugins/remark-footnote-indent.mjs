function isAdjacent(previous, next) {
  return previous?.position?.end?.line + 1 === next?.position?.start?.line;
}

function isIndentedContinuation(next) {
  // 空行会让连续的脚注内容被拆成多个 AST 节点，但只要仍然以两格缩进，
  // 就应该继续归入前一个脚注，而不是落到正文中。
  return next?.position?.start?.column === 3;
}

function getOrderedListStart(node, file) {
  if (!file?.value || node?.type !== 'list' || !node.ordered) return node?.start;

  const source = String(file.value);
  const line = source.split(/\r?\n/)[(node.position?.start?.line || 1) - 1] || '';
  const match = /^\s*(\d+)[.)]\s/.exec(line);
  return match ? Number(match[1]) : node.start;
}

function extractIndentedContent(content, file) {
  if (content?.type !== 'list') {
    return content?.position?.start?.column === 3
      ? { footnoteContent: content }
      : null;
  }

  const splitIndex = content.children.findIndex(item => item.position?.start?.column !== 3);
  if (splitIndex === 0) return null;

  const indentedItems = splitIndex === -1
    ? content.children
    : content.children.slice(0, splitIndex);
  const footnoteContent = {
    ...content,
    children: indentedItems,
    position: {
      ...content.position,
      end: indentedItems[indentedItems.length - 1]?.position?.end || content.position?.end,
    },
  };

  if (splitIndex === -1) return { footnoteContent };

  const remainingItems = content.children.slice(splitIndex);
  const remainingContent = {
    ...content,
    start: getOrderedListStart({ ...content, position: { ...content.position, start: remainingItems[0].position.start } }, file),
    children: remainingItems,
    position: {
      ...content.position,
      start: remainingItems[0].position.start,
    },
  };

  return { footnoteContent, remainingContent };
}

const NESTED_ORDERED_MARKER = /^(\d+)[.)][ \t]+(.*)$/;

function splitLazyNestedLists(list) {
  // 二级列表只比父级多缩进两格时，会被解析成父项段落的惰性续行。
  // 这里把这些带有序标记的续行拆出来重建为嵌套有序列表，
  // 让两格与四格缩进在脚注里渲染结果一致。
  for (const item of list.children) {
    if (!Array.isArray(item.children)) continue;
    for (let childIndex = 0; childIndex < item.children.length; childIndex += 1) {
      const child = item.children[childIndex];
      if (child.type !== 'paragraph') continue;
      const text = child.children?.length === 1 && child.children[0].type === 'text' ? child.children[0] : null;
      if (!text || !text.value.includes('\n')) continue;

      const lines = text.value.split('\n');
      let splitAt = -1;
      for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
        if (NESTED_ORDERED_MARKER.test(lines[lineIndex])) {
          splitAt = lineIndex;
          break;
        }
      }
      if (splitAt === -1) continue;

      const baseLine = child.position?.start?.line || 1;
      const items = [];
      let start = null;
      let current = null;
      for (let lineIndex = splitAt; lineIndex < lines.length; lineIndex += 1) {
        const match = NESTED_ORDERED_MARKER.exec(lines[lineIndex]);
        if (match) {
          if (start === null) start = Number(match[1]);
          current = {
            type: 'listItem',
            spread: false,
            children: [{
              type: 'paragraph',
              children: [{ type: 'text', value: match[2] }],
              position: { start: { line: baseLine + lineIndex, column: 1 }, end: { line: baseLine + lineIndex, column: 1 } },
            }],
            position: { start: { line: baseLine + lineIndex, column: 1 }, end: { line: baseLine + lineIndex, column: 1 } },
          };
          items.push(current);
        } else if (current) {
          const paragraph = current.children[0];
          paragraph.children[0].value += `\n${lines[lineIndex]}`;
          paragraph.position.end.line = baseLine + lineIndex;
          current.position.end.line = baseLine + lineIndex;
        }
      }

      const nested = {
        type: 'list',
        ordered: true,
        start: start === null ? 1 : start,
        spread: false,
        children: items,
        position: { start: { line: baseLine + splitAt, column: 1 }, end: { line: baseLine + lines.length - 1, column: 1 } },
      };

      if (splitAt === 1 && !lines[0].trim()) {
        item.children.splice(childIndex, 1, nested);
      } else {
        text.value = lines.slice(0, splitAt).join('\n');
        if (child.position) child.position.end.line = baseLine + splitAt - 1;
        if (text.position) text.position.end.line = baseLine + splitAt - 1;
        item.children.splice(childIndex + 1, 0, nested);
        childIndex += 1;
      }
    }
  }
}

function forEachListInFootnotes(node, inFootnote, visit) {
  const nextInFootnote = inFootnote || node.type === 'footnoteDefinition';
  if (nextInFootnote && node.type === 'list') visit(node);
  (node.children || []).forEach((child) => forEachListInFootnotes(child, nextInFootnote, visit));
}

export default function remarkFootnoteIndent() {
  return (tree, file) => {
    if (!Array.isArray(tree.children)) return;

    for (let index = 0; index < tree.children.length - 1; index += 1) {
      const definition = tree.children[index];
      const content = tree.children[index + 1];

      const canStart = isAdjacent(definition, content)
        || isIndentedContinuation(content);
      if (
        definition?.type !== 'footnoteDefinition'
        || !content?.position
        || !canStart
      ) {
        continue;
      }

      const extracted = definition.children?.length
        ? null
        : extractIndentedContent(content, file);
      if (extracted) {
        definition.children = [extracted.footnoteContent];
        if (extracted.remainingContent) {
          tree.children[index + 1] = extracted.remainingContent;
        } else {
          tree.children.splice(index + 1, 1);
        }
      }

      let nextIndex = index + 1;
      while (nextIndex < tree.children.length) {
        const next = tree.children[nextIndex];
        if (!isIndentedContinuation(next)) break;

        definition.children.push(next);
        tree.children.splice(nextIndex, 1);
      }
    }

    forEachListInFootnotes(tree, false, splitLazyNestedLists);
  };
}
