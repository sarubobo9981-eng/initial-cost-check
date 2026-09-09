/**
 * 見積書解析パイプライン（サーバー側）1段階目: normalizeEstimateFiles
 *
 * アップロードされたファイル（画像/PDF、撮影/選択いずれの経路でも）を
 * 後段の処理が共通で扱えるバッファ形式に正規化する。
 *
 * 将来HEIC/HEIF等に対応する場合は、ここでJPEG等への変換処理を行う想定。
 */

export interface NormalizedEstimateFile {
  buffer: Buffer;
  mimeType: string;
  originalName: string;
}

export async function normalizeEstimateFiles(files: File[]): Promise<NormalizedEstimateFile[]> {
  return Promise.all(
    files.map(async (file) => ({
      buffer: Buffer.from(await file.arrayBuffer()),
      mimeType: file.type,
      originalName: file.name,
    }))
  );
}
