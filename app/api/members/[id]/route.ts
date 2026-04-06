import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

export async function PUT(req: Request, { params }: Params) {
  const body = await req.json();

  await prisma.memberEmblem.deleteMany({
    where: { memberId: params.id }
  });

  const updated = await prisma.member.update({
    where: { id: params.id },
    data: {
      nickname: body.nickname,
      job: body.job,
      abyssFloor: Number(body.abyssFloor),
      abyssStage: Number(body.abyssStage),
      emblems: {
        create: (body.emblems ?? []).map((item: { emblemKey: string; count: number }) => ({
          emblemKey: item.emblemKey,
          count: Math.max(0, Math.min(9, Number(item.count) || 0))
        }))
      }
    },
    include: { emblems: true }
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: Params) {
  await prisma.member.delete({
    where: { id: params.id }
  });

  return NextResponse.json({ ok: true });
}
