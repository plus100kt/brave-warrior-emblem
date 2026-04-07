export const JOBS = ["어쎄신", "프리스트", "워리어", "위자드", "아처"] as const;
export type Job = (typeof JOBS)[number];

export type Goal = "전설" | "신화";
export const GOAL_MAX: Record<Goal, number> = { 전설: 3, 신화: 9 };

export type MemberEmblem = {
  id?: string;
  emblemKey: string;
  count: number;
  goal: Goal;
};

export type Member = {
  id: string;
  nickname: string;
  job: Job;
  abyssFloor: number;
  abyssStage: number;
  emblems: MemberEmblem[];
};

export const EMBLEMS = {
  기교: ["스크림 뱃", "헤츨링 무리", "블러드 골렘", "썬더리자드", "크립로드", "헬 드래곤", "분노한 광폭룡"],
  지혜: ["콜드 지충", "익사 러커", "윈드퓨리 토템", "샤오크", "동상 예티", "헌팅 해츨링", "숲의 영혼", "광폭룡", "원시 광폭룡", "흡마 옵시디언", "다크 히드라", "분노한 썬더리자드"],
  활력: ["도발 임프", "추혈 하운드", "디오크", "옵시디언", "퀸", "얼음곰", "히드라", "웹 크립로드"]
} as const;

export const ALL_EMBLEM_KEYS = Object.entries(EMBLEMS).flatMap(([category, names]) =>
  names.map((name) => `${category}|${name}`)
);

export type EmblemItem = { id: string; category: string; name: string };

export type GrantLog = {
  id: string;
  memberId: string;
  memberNickname: string;
  memberJob: string;
  emblemKey: string;
  quantity: number;
  auctionType: string;
  grantedAt: string;
};

export type GrantQueueItem = {
  memberId: string;
  memberNickname: string;
  memberJob: string;
  emblemKey: string;
  quantity: number;
};

export const CATEGORIES = ["기교", "지혜", "활력"] as const;
export type Category = (typeof CATEGORIES)[number];
