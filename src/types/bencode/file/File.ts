export class File {
  constructor(
  /**
   * length: length of the file in bytes (integer)
   */
  readonly length: number,
  /**
   * md5sum: (optional) a 32-character hexadecimal string corresponding to the MD5 sum of the file. This is not used by BitTorrent at all, but it is included by some programs for greater compatibility.
   */
  readonly md5sum?: string,
  /**
   * path: a list containing one or more string elements that together represent the path and filename. Each element in the list corresponds to either a directory name or (in the case of the final element) the filename. For example, a the file "dir1/dir2/file.ext" would consist of three string elements: "dir1", "dir2", and "file.ext". This is encoded as a bencoded list of strings such as l4:dir14:dir28:file.exte
   */
  readonly path: Array<string> = [],
  ){}
  
  static fromFile(value: any): File | undefined {
    const length = value["length"]
    const md5sum = value["md5sum"]
    const path = value["path"] ?? []
    return new File(
      length,
      md5sum,
      path
    )
  }
}
