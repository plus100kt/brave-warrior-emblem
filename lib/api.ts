import { GrantLog, Member } from "@/lib/data";

export async function fetchMembers(): Promise<Member[]> {
  const res = await fetch("/api/members", { cache: "no-store" });
  if (!res.ok) throw new Error("전투원 목록을 불러오지 못했습니다.");
  return res.json();
}

export async function createMember(payload: Omit<Member, "id">): Promise<Member> {
  const res = await fetch("/api/members", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("전투원 생성에 실패했습니다.");
  return res.json();
}

export async function updateMember(id: string, payload: Omit<Member, "id">): Promise<Member> {
  const res = await fetch(`/api/members/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("전투원 수정에 실패했습니다.");
  return res.json();
}

export async function deleteMember(id: string): Promise<void> {
  const res = await fetch(`/api/members/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("전투원 삭제에 실패했습니다.");
}

export async function fetchEmblems(): Promise<{ id: string; category: string; name: string }[]> {
  const res = await fetch("/api/emblems", { cache: "no-store" });
  if (!res.ok) throw new Error("엠블럼 목록을 불러오지 못했습니다.");
  return res.json();
}

export async function createEmblem(category: string, name: string): Promise<{ id: string; category: string; name: string }> {
  const res = await fetch("/api/emblems", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, name })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "엠블럼 생성에 실패했습니다.");
  }
  return res.json();
}

export async function deleteEmblem(id: string): Promise<void> {
  const res = await fetch(`/api/emblems/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("엠블럼 삭제에 실패했습니다.");
}

export async function fetchGrantLogs(): Promise<GrantLog[]> {
  const res = await fetch("/api/grant-logs", { cache: "no-store" });
  if (!res.ok) throw new Error("지급 로그를 불러오지 못했습니다.");
  return res.json();
}

export async function createGrantLog(log: Omit<GrantLog, "id" | "grantedAt">): Promise<GrantLog> {
  const res = await fetch("/api/grant-logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(log),
  });
  if (!res.ok) throw new Error("지급 로그 생성에 실패했습니다.");
  return res.json();
}

export async function deleteGrantLog(id: string): Promise<void> {
  const res = await fetch(`/api/grant-logs/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("지급 로그 삭제에 실패했습니다.");
}
