export type PrizeBond = {
  _id: string;
  number: string;
  purchaseDate: Date;
  status: "hold" | "win" | "sell";
};
