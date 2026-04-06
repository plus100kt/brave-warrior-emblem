import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

export async function DELETE(_: Request, { params }: Params) {
  await prisma.emblem.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
