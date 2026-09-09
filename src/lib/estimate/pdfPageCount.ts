import { PDFDocument } from "pdf-lib";

/** PDFのページ数を取得する（アップロード上限チェック用） */
export async function getPdfPageCount(buffer: Buffer): Promise<number> {
  const doc = await PDFDocument.load(buffer, { updateMetadata: false });
  return doc.getPageCount();
}
