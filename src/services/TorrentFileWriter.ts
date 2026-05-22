import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { FileMetaInfo } from "../types/bencode/file/FileMetaInfo";
import { File } from "../types/bencode/file/File";

export interface TorrentWriteResult {
  readonly outputPaths: Array<string>;
  readonly bytesWritten: number;
}

export class TorrentFileWriter {
  static getPieceHashes(fileMetaInfo: FileMetaInfo): Array<string> {
    const pieces = TorrentFileWriter.binaryStringToBuffer(fileMetaInfo.info.pieces);
    if (pieces.length % 20 !== 0) {
      throw new Error("Invalid pieces hash list length");
    }

    const hashes = new Array<string>();
    for (let i = 0; i < pieces.length; i += 20) {
      hashes.push(pieces.subarray(i, i + 20).toString("hex"));
    }
    return hashes;
  }

  static getTotalLength(fileMetaInfo: FileMetaInfo): number {
    if (Number.isFinite(fileMetaInfo.info.length)) {
      return fileMetaInfo.info.length;
    }
    return fileMetaInfo.info.files.reduce((total: number, file: File) => total + file.length, 0);
  }

  static verifyPiece(piece: Buffer, expectedHashHex: string): boolean {
    return crypto.createHash("sha1").update(piece).digest("hex") === expectedHashHex;
  }

  static assembleVerifiedBuffer(fileMetaInfo: FileMetaInfo, pieces: Array<Buffer>): Buffer {
    const expectedHashes = TorrentFileWriter.getPieceHashes(fileMetaInfo);
    if (pieces.length !== expectedHashes.length) {
      throw new Error(`Invalid piece count: expected ${expectedHashes.length}, received ${pieces.length}`);
    }

    pieces.forEach((piece: Buffer, index: number) => {
      const expectedLength = TorrentFileWriter.getPieceLength(fileMetaInfo, index);
      if (piece.length !== expectedLength) {
        throw new Error(`Invalid piece length at index ${index}: expected ${expectedLength}, received ${piece.length}`);
      }
      if (!TorrentFileWriter.verifyPiece(piece, expectedHashes[index])) {
        throw new Error(`Piece hash mismatch at index ${index}`);
      }
    });

    return Buffer.concat(pieces, TorrentFileWriter.getTotalLength(fileMetaInfo));
  }

  static async write(fileMetaInfo: FileMetaInfo, pieces: Array<Buffer>, outputDir: string): Promise<TorrentWriteResult> {
    const content = TorrentFileWriter.assembleVerifiedBuffer(fileMetaInfo, pieces);
    await fs.mkdir(outputDir, { recursive: true });

    if (fileMetaInfo.info.files.length > 0) {
      return TorrentFileWriter.writeMultiFile(fileMetaInfo, content, outputDir);
    }

    const outputPath = TorrentFileWriter.resolveSafeOutputPath(outputDir, [fileMetaInfo.info.name]);
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, content);
    return { outputPaths: [outputPath], bytesWritten: content.length };
  }

  static getPieceLength(fileMetaInfo: FileMetaInfo, pieceIndex: number): number {
    const pieceCount = TorrentFileWriter.getPieceHashes(fileMetaInfo).length;
    if (pieceIndex < 0 || pieceIndex >= pieceCount) {
      throw new Error(`Invalid piece index: ${pieceIndex}`);
    }

    const pieceLength = fileMetaInfo.info.pieceLength;
    if (pieceIndex < pieceCount - 1) {
      return pieceLength;
    }
    const remaining = TorrentFileWriter.getTotalLength(fileMetaInfo) - pieceLength * (pieceCount - 1);
    return remaining > 0 ? remaining : pieceLength;
  }

  private static async writeMultiFile(
    fileMetaInfo: FileMetaInfo,
    content: Buffer,
    outputDir: string,
  ): Promise<TorrentWriteResult> {
    let offset = 0;
    const outputPaths = new Array<string>();

    for (const file of fileMetaInfo.info.files) {
      const outputPath = TorrentFileWriter.resolveSafeOutputPath(outputDir, [fileMetaInfo.info.name, ...file.path]);
      const fileContent = content.subarray(offset, offset + file.length);
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, fileContent);
      outputPaths.push(outputPath);
      offset += file.length;
    }

    return { outputPaths, bytesWritten: content.length };
  }

  private static resolveSafeOutputPath(outputDir: string, segments: Array<string>): string {
    const safeSegments = segments.filter((segment: string) => !!segment);
    if (safeSegments.length === 0) {
      throw new Error("Invalid torrent output path");
    }

    for (const segment of safeSegments) {
      if (path.isAbsolute(segment) || segment === ".." || segment.includes(`..${path.sep}`) || segment.includes("/../")) {
        throw new Error(`Unsafe torrent output path segment: ${segment}`);
      }
    }

    const base = path.resolve(outputDir);
    const outputPath = path.resolve(base, ...safeSegments);
    if (outputPath !== base && !outputPath.startsWith(base + path.sep)) {
      throw new Error("Unsafe torrent output path");
    }
    return outputPath;
  }

  private static binaryStringToBuffer(value: string): Buffer {
    const buffer = Buffer.alloc(value.length);
    for (let i = 0; i < value.length; i++) {
      buffer.writeUInt8(value.charCodeAt(i) & 0xff, i);
    }
    return buffer;
  }
}
