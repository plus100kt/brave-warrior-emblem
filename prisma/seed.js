const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.memberEmblem.deleteMany();
  await prisma.member.deleteMany();

  const members = [
    {
      nickname: "암살자A",
      job: "어쎄신",
      abyssFloor: 4,
      abyssStage: 10,
      emblems: {
        create: [
          { emblemKey: "기교|스크림 뱃", count: 6 },
          { emblemKey: "기교|헬 드래곤", count: 1 }
        ]
      }
    },
    {
      nickname: "암살자B",
      job: "어쎄신",
      abyssFloor: 4,
      abyssStage: 7,
      emblems: {
        create: [{ emblemKey: "기교|스크림 뱃", count: 3 }]
      }
    },
    {
      nickname: "성직자A",
      job: "프리스트",
      abyssFloor: 5,
      abyssStage: 1,
      emblems: {
        create: [
          { emblemKey: "지혜|샤오크", count: 7 },
          { emblemKey: "활력|히드라", count: 2 }
        ]
      }
    },
    {
      nickname: "전사A",
      job: "워리어",
      abyssFloor: 4,
      abyssStage: 9,
      emblems: {
        create: [{ emblemKey: "활력|추혈 하운드", count: 4 }]
      }
    }
  ];

  for (const member of members) {
    await prisma.member.create({ data: member });
  }
}

main().finally(async () => {
  await prisma.$disconnect();
});
