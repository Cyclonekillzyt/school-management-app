import { avatarPalette } from "@/lib/theme";


function hashString(str: string): number {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return Math.abs(hash);
}


export function getAvatarColor(seed: string): string {
  const index = hashString(seed) % avatarPalette.length;
  return avatarPalette[index];
}


export function getInitials(name: string): string {
  if (!name) return "?";

  return name
    .trim()
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
