
export function applyCall(doc, call, registry) {
  if (call.call !== "insertSection") return doc;
  const section = registry.sections.find(s => s.id === call.args.sectionId);
  if (!section) return doc;
  const next = structuredClone(doc);
  if (call.args.mode === "append") {
    next.root.children.push(section.node);
    return next;
  }
  const parent = next.root;
  const i = parent.children.findIndex(n => n.id === call.args.targetId);
  if (i >= 0) parent.children.splice(i + 1, 0, section.node);
  return next;
}
