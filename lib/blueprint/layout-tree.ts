export interface TreeNode {
  id: string | number;
  type:
    | "container"
    | "hero"
    | "card"
    | "grid"
    | "button"
    | "navbar"
    | "input"
    | "section"
    | "footer";
  instruction?: string;
  className?: string;
  props?: any;
  meta?: { y: number };
  children?: TreeNode[];
}
