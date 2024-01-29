import { FileMetaInfoContent } from "./FileMetaInfoContent";

export class FileMetaInfo {
  constructor(
  /**
   * announce: The announce URL of the tracker (string)
   */
  readonly announce: string,

  /**
   * info: a dictionary that describes the file(s) of the torrent. There are two possible forms: one for the case of a 'single-file' torrent with no directory structure, and one for the case of a 'multi-file' torrent (see below for details)
   */
  readonly info: FileMetaInfoContent,

  /**
   * announce-list: (optional) this is an extention to the official specification, offering backwards-compatibility. (list of lists of strings).
   */
  readonly announceList?: Array<Array<string>>,

  /**
   * comment: (optional) free-form textual comments of the author (string)
   */
  readonly comment?: string,

  readonly httpSeeds?: Array<string>,

  /**
   * creation date: (optional) the creation time of the torrent, in standard UNIX epoch format (integer, seconds since 1-Jan-1970 00:00:00 UTC)
   */
  readonly creationDate?: number,

  /**
   * encoding: (optional) the string encoding format used to generate the pieces part of the info dictionary in the .torrent metafile (string)
   */
  readonly encoding?: string,

  /**
   * created by: (optional) name and version of the program used to create the .torrent (string)
   */
  readonly createdBy?: string
  ){}

  static fromFile(value: any): FileMetaInfo | undefined {
    console.log({value})
    if(!value) {
      return undefined
    }
    const announce = value["announce"]
    const creationDate = value["creation date"]
    const comment = value["comment"]
    const httpSeeds = value["httpseeds"]
    const info = FileMetaInfoContent.fromFile(value["info"])
    const encoding = value["encoding"]
    const createdBy = value["created by"]
    const announceList = value["announce-list"]
    if(!info) {
      throw new Error("Invalid file meta info")
    }
    return new FileMetaInfo(
      announce,
      info,
      announceList,
      comment,
      httpSeeds,
      creationDate,
      encoding,
      createdBy,
    )
  }
}
