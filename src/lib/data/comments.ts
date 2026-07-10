import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { comments } from "@/db/schema";

export async function getCommentsForTask(taskId: string) {
  return db.query.comments.findMany({
    where: eq(comments.taskId, taskId),
    with: { author: true },
    orderBy: [asc(comments.createdAt)],
  });
}
