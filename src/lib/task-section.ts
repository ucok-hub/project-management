type TaskRoleFields = { giverId: string; assigneeId: string };

/** Section tugas default saat histori navigasi tidak tersedia. */
export function resolveTaskDefaultSection(
  me: { id: string },
  task: TaskRoleFields,
): "/saya-beri" | "/tugas-saya" {
  const isGiver = task.giverId === me.id;
  const isAssignee = task.assigneeId === me.id;
  return isGiver && !isAssignee ? "/saya-beri" : "/tugas-saya";
}
