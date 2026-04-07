import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const log = await prisma.grantLog.findUnique({ where: { id: params.id } });
  if (!log) return NextResponse.json({ error: "로그를 찾을 수 없습니다." }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    const memberEmblem = await tx.memberEmblem.findUnique({
      where: { memberId_emblemKey: { memberId: log.memberId, emblemKey: log.emblemKey } },
    });
    if (memberEmblem) {
      await tx.memberEmblem.update({
        where: { id: memberEmblem.id },
        data: { count: Math.max(0, memberEmblem.count - log.quantity) },
      });
    }
    await tx.grantLog.delete({ where: { id: params.id } });
  });

  return new NextResponse(null, { status: 204 });
}
