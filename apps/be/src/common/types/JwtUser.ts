export type JwtUser = {
  sub: string;
  iat: number;
  exp: number;
  email: string;
  role: string;
};
