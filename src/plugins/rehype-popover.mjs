function isElement(node, tagName) {
  return node?.type === 'element' && (!tagName || node.tagName === tagName);
}

function hasProperty(node, property) {
  return isElement(node) && Object.prototype.hasOwnProperty.call(node.properties || {}, property);
}

function decodeFootnoteId(href) {
  const match = /^#user-content-fn-(.+)$/.exec(href || '');
  return match ? decodeURIComponent(match[1]) : null;
}

function isBackref(node) {
  return isElement(node, 'a') && hasProperty(node, 'dataFootnoteBackref');
}

function withoutBackrefs(node) {
  if (!node?.children) return node;

  return {
    ...node,
    children: node.children
      .filter(child => !isBackref(child))
      .map(withoutBackrefs),
  };
}

function findFootnoteSection(tree) {
  let section;

  function visit(node) {
    if (section || !node?.children) return;
    if (isElement(node, 'section') && hasProperty(node, 'dataFootnotes')) {
      section = node;
      return;
    }
    node.children.forEach(visit);
  }

  visit(tree);
  return section;
}

function collectDefinitions(section) {
  const definitions = new Map();
  const list = section?.children?.find(child => isElement(child, 'ol'));

  list?.children?.forEach(item => {
    if (!isElement(item, 'li')) return;

    const encodedId = String(item.properties?.id || '').replace(/^user-content-fn-/, '');
    if (!encodedId) return;

    const id = decodeURIComponent(encodedId);
    definitions.set(id, item.children.filter(child => !isBackref(child)).map(withoutBackrefs));
  });

  return definitions;
}

function isFootnoteReference(node) {
  return isElement(node, 'sup') && node.children?.some(child => (
    isElement(child, 'a') && hasProperty(child, 'dataFootnoteRef')
  ));
}

function getReferenceId(node) {
  const reference = node.children.find(child => isElement(child, 'a') && hasProperty(child, 'dataFootnoteRef'));
  return decodeFootnoteId(reference?.properties?.href);
}

function replaceReferences(parent, definitions) {
  if (!Array.isArray(parent.children)) return;

  parent.children = parent.children.flatMap(child => {
    if (isFootnoteReference(child)) {
      const id = getReferenceId(child);
      if (!id || !definitions.has(id)) return child;

      return {
        type: 'element',
        tagName: 'button',
        properties: {
          type: 'button',
          className: ['article-popover-trigger'],
          dataArticlePopoverTrigger: id,
          ariaExpanded: 'false',
        },
        children: [{ type: 'text', value: id }],
      };
    }

    if (isElement(child)) replaceReferences(child, definitions);
    return child;
  });
}

function createTemplates(tree, definitions) {
  definitions.forEach((children, id) => {
    tree.children.push({
      type: 'element',
      tagName: 'template',
      properties: {
        className: ['article-popover-template'],
        dataArticlePopoverContent: id,
      },
      children,
    });
  });
}

export default function rehypePopover() {
  return tree => {
    const section = findFootnoteSection(tree);
    if (!section) return;

    const definitions = collectDefinitions(section);
    if (!definitions.size) return;

    replaceReferences(tree, definitions);
    tree.children = tree.children.filter(child => child !== section);
    createTemplates(tree, definitions);
  };
}
