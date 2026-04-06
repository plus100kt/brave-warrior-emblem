import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const members = await prisma.member.findMany({
    include: { emblems: true },
    orderBy: [{ job: "asc" }, { abyssFloor: "desc" }, { abyssStage: "desc" }]
  });
  return NextResponse.json(members);
}

export async function POST(req: Request) {
  const body = await req.json();
  const created = await prisma.member.create({
    data: {
      nickname: body.nickname,
      job: body.job,
      abyssFloor: Number(body.abyssFloor),
      abyssStage: Number(body.abyssStage),
      emblems: {
        create: (body.emblems ?? []).map((item: { emblemKey: string; count: number; goal?: string }) => ({
          emblemKey: item.emblemKey,
          count: Math.max(0, Math.min(9, Number(item.count) || 0)),
          goal: item.goal === "전설" ? "전설" : "신화"
        }))
      }
    },
    include: { emblems: true }
  });

  return NextResponse.json(created, { status: 201 });
}
