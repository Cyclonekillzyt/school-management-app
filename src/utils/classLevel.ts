export function getClassLevel(className: string) {
  return className.split(" ").slice(0, 2).join(" ");
}
