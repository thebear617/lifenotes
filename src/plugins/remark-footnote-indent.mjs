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
  };
}
