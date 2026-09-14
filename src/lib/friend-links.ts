export interface FriendLink {
  name: string;
  url: string;
  description: string;
  avatar?: string;
}

// 在这里追加友链即可，页面会自动渲染。
export const friendLinks: FriendLink[] = [
  {
    name: "示例站点",
    url: "https://example.com/",
    description: "占位条目 —— 替换为真实的友链。",
  },
];
