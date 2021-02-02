type Config = {
  dbDir: string;
  pretty: number;
};

const config: Config = {
  dbDir: "db",
  pretty: 0,
};

export type UserConfig = {
  [P in keyof Config]?: Config[P];
};

export default config;
