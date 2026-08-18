function isElement(node, tagName) {
  return node?.type === 'element' && (!tagName || node.tagName === tagName);
}

function wrapTables(parent) {
  if (!Array.isArray(parent.children)) return;

  parent.children = parent.children.flatMap(child => {
    if (isElement(child, 'table')) {
      return {
        type: 'element',
        tagName: 'div',
        properties: { className: ['table-scroll'] },
        children: [child],
      };
    }

    if (isElement(child)) wrapTables(child);
    return child;
  });
}

export default function rehypeTableWrap() {
  return tree => wrapTables(tree);
}
