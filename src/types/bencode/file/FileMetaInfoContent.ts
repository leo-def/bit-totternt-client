import { File } from "./File";

export class FileMetaInfoContent {
  constructor(
  /**
   * length: length of the file in bytes (integer)
   */
  readonly length: number,

  /**
   * name: the filename. This is purely advisory. (string)
   * or
   * the name of the directory in which to store all the files. This is purely advisory. (string)
   */
  readonly name: string,

  /**
   * piece length: number of bytes in each piece (integer)
   */
  readonly pieceLength: number,

  /**
   * pieces: string consisting of the concatenation of all 20-byte SHA1 hash values, one per piece (byte string, i.e. not urlencoded)
   */
  readonly pieces: string,

  /**
   * private: (optional) this field is an integer. If it is set to "1", the client MUST publish its presence to get other peers ONLY via the trackers explicitly described in the metainfo file. If this field is set to "0" or is not present, the client may obtain peer from other means, e.g. PEX peer exchange, dht. Here, "private" may be read as "no external peer source".
   */
  readonly isPrivate?: number,

  /**
   * md5sum: (optional) a 32-character hexadecimal string corresponding to the MD5 sum of the file. This is not used by BitTorrent at all, but it is included by some programs for greater compatibility.
   */
  readonly md5sum?: string,

  /**
   * files: a list of dictionaries, one for each file.
   */
  readonly files: Array<File> =[],
  ){}

  static fromFile(value: any): FileMetaInfoContent | undefined {
    if(!value) {
      return undefined
    }
      const length = value["length"]
      const name = value["name"]
      const pieceLength = value["piece length"]
      const pieces = value["pieces"] as string
      const isPrivate = value["private"]
      const md5sum = value["md5sum"]
      const files = (value["files"] ?? [] as Array<any>)
        .map((file: any) => File.fromFile(file))
        .filter((val?: File) => !!val) as Array<File>
    return new FileMetaInfoContent(
      length,
      name,
      pieceLength,
      pieces,
      isPrivate,
      md5sum,
      files,
    )
  }
}
