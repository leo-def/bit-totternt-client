import { BencodeResult } from "../types/bencode/BencodeResult";
import { BencodeStringSize } from "../types/bencode/BencodeStringSize";
import { BencodeValue } from "../types/bencode/BencodeValue";

export class BencodeUtils {
  static handle(
    str: Buffer,
    startIndex: number = 0
  ): BencodeResult | undefined {
    if (Number.isNaN(startIndex)) {
      throw this.throw(startIndex, "handle");
    }
    const identifier = this.charAt(str, startIndex);
    if (identifier === "d") {
      return BencodeUtils.createBencodeMap(str, startIndex);
    } else if (identifier === "l") {
      return BencodeUtils.createBencodeList(str, startIndex);
    } else if (identifier === "i") {
      return BencodeUtils.createBencodeNumber(str, startIndex);
    } else if (!Number.isNaN(identifier)) {
      return BencodeUtils.createBencodeString(str, startIndex);
    }
    throw this.throw(startIndex);
  }

  static createBencodeMap(str: Buffer, startIndex: number = 0): BencodeResult {
    const { value, lastIndex } = BencodeUtils.createBencodeList(
      str,
      startIndex
    );
    let currKey: string | null = null;
    const resultValue = (value as Array<BencodeValue>).reduce(
      (prev: Object, curr: BencodeValue) => {
        if (currKey == null) {
          currKey = curr as string;
          return prev;
        } else {
          const newValue = { [currKey]: curr };
          currKey = null;
          return {
            ...prev,
            ...newValue,
          };
        }
      },
      {} as Object
    );
    return {
      value: resultValue,
      lastIndex,
    };
  }

  static createBencodeList(str: Buffer, startIndex: number = 0): BencodeResult {
    let lastIndex = startIndex + 1;
    let nextChar = null;
    const value = [];
    do {
      const currResult = BencodeUtils.handle(str, lastIndex);
      if (!currResult) {
        throw this.throw(lastIndex, "create bencode list");
      }
      value.push(currResult.value);
      lastIndex = currResult.lastIndex;
      nextChar = this.charAt(str, lastIndex);
    } while (nextChar !== "e");
    return {
      value,
      lastIndex,
    };
  }

  static createBencodeNumber(
    str: Buffer,
    startIndex: number = 0
  ): BencodeResult {
    let lastIndex = startIndex + 1;
    let nextChar = null;
    do {
      nextChar = this.charAt(str, lastIndex);
      if (nextChar !== "e" && Number.isNaN(nextChar)) {
        throw this.throw(lastIndex, "create bencode number");
      }
      lastIndex++;
    } while (nextChar !== "e");
    const value = Number.parseInt(
      this.join(str, startIndex + 1, lastIndex - 1)
    );
    return {
      value,
      lastIndex,
    };
  }

  static createBencodeString(
    str: Buffer,
    startIndex: number = 0
  ): BencodeResult {
    const { size, lastIndex } = BencodeUtils.getBencodeStringSize(
      str,
      startIndex
    );
    // scape:
    let index = lastIndex + 1;
    const lastStrIndex = index + size;
    const value = this.join(str, index, lastStrIndex);
    return {
      value,
      lastIndex: lastStrIndex,
    };
  }

  static getBencodeStringSize(
    str: Buffer,
    startIndex: number = 0
  ): BencodeStringSize {
    let lastIndex = startIndex + 0;
    let nextChar = null;
    do {
      nextChar = this.charAt(str, lastIndex++);
      if (Number.isNaN(nextChar)) {
        throw this.throw(lastIndex - 1, "get bencode string size");
      }
    } while (nextChar !== ":");
    const sizeStr = this.join(str, startIndex, lastIndex - 1);
    const size = Number(sizeStr);
    return {
      size,
      lastIndex: lastIndex - 1,
    };
  }

  static throw(index?: number, on?: string) {
    return new Error(
      `Invalid bencode format${index !== undefined ? " at: " + index : ""}${
        on !== undefined ? " on: " + on : ""
      }`
    );
  }

  static join(str: Buffer, start: number, end: number) {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(this.charAt(str, i));
    }
    return result.join("");
  }

  static charAt(str: Buffer, index: number = 0): string {
    const byteAt = str.at(index);
    if (byteAt === undefined) {
      throw this.throw(index, "chat at");
    }
    return String.fromCharCode(byteAt);
  }
}
