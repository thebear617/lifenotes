function visit(node) {
  if (node?.type === 'element' && node.position?.start?.line && node.position?.end?.line) {
    node.properties ||= {};
    node.properties.dataSourceStart = node.position.start.line;
    node.properties.dataSourceEnd = node.position.end.line;
  }
  node?.children?.forEach(visit);
}

export default function rehypeSourcePosition() {
  return tree => visit(tree);
}
