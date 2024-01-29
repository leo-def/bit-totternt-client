import { BencodeValue } from "./BencodeValue";

export interface BencodeResult {
  value: BencodeValue | Array<BencodeValue>;
  lastIndex: number;
}
