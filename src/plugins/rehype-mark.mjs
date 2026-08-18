const skippedElements = new Set(['code', 'pre', 'script', 'style', 'textarea']);

function splitHighlights(value) {
  const nodes = [];
  const pattern = /==([^=\n]+?)==/g;
  let cursor = 0;
  let match;

  while ((match = pattern.exec(value)) !== null) {
    if (match.index > cursor) {
      nodes.push({ type: 'text', value: value.slice(cursor, match.index) });
    }

    nodes.push({
      type: 'element',
      tagName: 'mark',
      properties: {},
      children: [{ type: 'text', value: match[1] }],
    });

    cursor = pattern.lastIndex;
  }

  if (cursor < value.length) {
    nodes.push({ type: 'text', value: value.slice(cursor) });
  }

  return nodes.length ? nodes : [{ type: 'text', value }];
}

function transformChildren(parent) {
  if (!Array.isArray(parent.children)) return;

  parent.children = parent.children.flatMap(child => {
    if (child.type === 'text' && child.value.includes('==')) {
      return splitHighlights(child.value);
    }

    if (!(child.type === 'element' && skippedElements.has(child.tagName))) {
      transformChildren(child);
    }

    return child;
  });
}

export default function rehypeMark() {
  return tree => transformChildren(tree);
}
