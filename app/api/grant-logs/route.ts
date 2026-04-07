import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const logs = await prisma.grantLog.findMany({ orderBy: { grantedAt: "desc" } });
  return NextResponse.json(logs);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { memberId, memberNickname, memberJob, emblemKey, quantity, auctionType } = body;
  const log = await prisma.grantLog.create({
    data: { memberId, memberNickname, memberJob, emblemKey, quantity, auctionType },
  });
  return NextResponse.json(log, { status: 201 });
}
