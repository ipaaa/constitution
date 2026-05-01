export interface Contributor {
  name: string;
  role: string;
  avatar?: string;
  github?: string;
  description?: string;
}

export const contributors: Contributor[] = [
  {
    name: "專案發起人",
    role: "專案發起人",
    description: "g0v 社群提案與專案統籌",
  },
  {
    name: "前端工程師 A",
    role: "前端工程師",
    description: "網站架構與互動設計開發",
  },
  {
    name: "前端工程師 B",
    role: "前端工程師",
    description: "資料視覺化與響應式介面",
  },
  {
    name: "法律文案",
    role: "法律文案",
    description: "法律簡明文案撰寫與校對",
  },
  {
    name: "資料整理志工",
    role: "資料整理",
    description: "憲法法庭資料蒐集與結構化",
  },
  {
    name: "顧問",
    role: "顧問",
    description: "法律專業諮詢與內容審查",
  },
];
