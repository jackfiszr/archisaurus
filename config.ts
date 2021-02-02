type Config = {
  dbDir: string;
};

const config: Config = {
  dbDir: "db",
};

export type UserConfig = {
  [P in keyof Config]?: Config[P];
};

export default config;
