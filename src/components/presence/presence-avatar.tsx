"use client";

import { Avatar } from "@/components/ui/avatar";
import { usePresence } from "@/lib/use-presence";

export function PresenceAvatar({
  userId,
  name,
  src,
  size,
}: {
  userId: string;
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const statuses = usePresence([userId]);
  return <Avatar name={name} src={src} size={size} presence={statuses[userId] ?? "offline"} />;
}
