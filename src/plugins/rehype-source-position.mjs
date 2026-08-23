function visit(node) {
  if (node?.type === 'element' && node.position?.start?.line && node.position?.end?.line) {
    node.properties ||= {};
    node.properties.dataSourceStart = node.position.start.line;
    node.properties.dataSourceEnd = node.position.end.line;
  }
  node?.children?.forEach(visit);
}

function hasClass(node, className) {
  const classes = node?.properties?.className;
  return Array.isArray(classes) ? classes.includes(className) : classes === className;
}

function mathSourceRanges(value) {
  const lines = String(value || '').split(/\r?\n/);
  const ranges = [];
  let codeFence = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (codeFence) {
      if (/^\s*```/.test(line)) codeFence = false;
      continue;
    }
    if (/^\s*```math\s*$/.test(line)) {
      const start = index + 1;
      let end = index;
      for (index += 1; index < lines.length; index += 1) {
        if (/^\s*```\s*$/.test(lines[index])) {
          end = index + 1;
          break;
        }
      }
      if (end) ranges.push({ start, end });
      continue;
    }
    if (/^\s*```/.test(line)) {
      codeFence = true;
      continue;
    }
    if (/^\s*\$\$.*\$\$\s*$/.test(line)) {
      ranges.push({ start: index + 1, end: index + 1 });
      continue;
    }
    if (/^\s*\$\$\s*$/.test(line)) {
      const start = index + 1;
      let end = index;
      for (index += 1; index < lines.length; index += 1) {
        if (/^\s*\$\$\s*$/.test(lines[index])) {
          end = index + 1;
          break;
        }
      }
      if (end) ranges.push({ start, end });
    }
  }

  return ranges;
}

function attachMathPositions(node, ranges, index = { value: 0 }) {
  if (node?.type === 'element' && hasClass(node, 'katex-display')) {
    const range = ranges[index.value];
    index.value += 1;
    if (range) {
      node.properties ||= {};
      node.properties.dataSourceStart = range.start;
      node.properties.dataSourceEnd = range.end;
    }
  }
  node?.children?.forEach((child) => attachMathPositions(child, ranges, index));
}

export default function rehypeSourcePosition() {
  return (tree, file) => {
    visit(tree);
    attachMathPositions(tree, mathSourceRanges(file?.value));
  };
}
