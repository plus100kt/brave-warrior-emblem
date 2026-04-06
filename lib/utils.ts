import { Member } from "@/lib/data";

export function abyssValue(member: Pick<Member, "abyssFloor" | "abyssStage">) {
  return member.abyssFloor * 100 + member.abyssStage;
}

export function formatAbyss(member: Pick<Member, "abyssFloor" | "abyssStage">) {
  return `${member.abyssFloor}-${member.abyssStage}`;
}

export function sortWithinJob(members: Member[]) {
  return [...members].sort((a, b) => {
    const diff = abyssValue(b) - abyssValue(a);
    if (diff !== 0) return diff;
    return a.nickname.localeCompare(b.nickname, "ko");
  });
}
