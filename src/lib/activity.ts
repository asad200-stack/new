import type { ActivityType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function logActivity(input: {
  storeId: string;
  actorUserId: string | null;
  type: ActivityType;
  entityType?: string;
  entityId?: string;
  meta?: Prisma.InputJsonValue;
}) {
  await prisma.activityLog.create({
    data: {
      storeId: input.storeId,
      actorUserId: input.actorUserId,
      type: input.type,
      entityType: input.entityType,
      entityId: input.entityId,
      meta: input.meta,
    },
  });
}


