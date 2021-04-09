const S4 = (n: number) => {
  return new Array(n)
    .fill((((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1))
    .join("");
};

export const createId = (): string => {
  return `${S4(2)}-${S4(1)}-${S4(1)}-${S4(1)}-${S4(3)}`;
};
