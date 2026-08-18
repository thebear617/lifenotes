import { defaultHandlers } from 'mdast-util-to-hast';

export default function footnoteReferenceWithLabel(state, node) {
  const result = defaultHandlers.footnoteReference(state, node);
  const reference = result.children?.find(child => (
    child.type === 'element'
      && child.tagName === 'a'
      && Object.prototype.hasOwnProperty.call(child.properties || {}, 'dataFootnoteRef')
  ));

  if (reference) {
    reference.properties.dataFootnoteLabel = node.label || node.identifier;
  }

  return result;
}
