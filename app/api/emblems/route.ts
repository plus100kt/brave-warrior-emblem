import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const emblems = await prisma.emblem.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }]
  });
  return NextResponse.json(emblems);
}

export async function POST(req: Request) {
  const { category, name } = await req.json();
  if (!category?.trim() || !name?.trim()) {
    return NextResponse.json({ error: "분류와 이름을 모두 입력해주세요." }, { status: 400 });
  }
  const emblem = await prisma.emblem.create({
    data: { category: category.trim(), name: name.trim() }
  });
  return NextResponse.json(emblem, { status: 201 });
}
