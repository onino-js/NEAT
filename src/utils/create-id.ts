const C4 = (n: number) => {
  return new Array(n)
    .fill((((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1))
    .join("");
};

export const createId = (): string => {
  return `${C4(2)}-${C4(1)}-${C4(1)}-${C4(1)}-${C4(3)}`;
};
