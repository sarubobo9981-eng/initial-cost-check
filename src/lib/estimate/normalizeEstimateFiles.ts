import { get } from "@vercel/blob";
import { EstimateBlobFile } from "@/types/estimateFile";

/**
 * 見積書解析パイプライン（サーバー側）1段階目: normalizeEstimateFiles
 *
 * クライアントはファイル本体ではなく、Vercel Blobへ直接アップロード済みのURLだけを送ってくる
 * （Vercel Functionsのリクエストボディ上限(4.5MB)を回避するため）。
 * ここでBlobから実際のファイル内容を取得し、後段の処理が共通で扱えるバッファ形式に正規化する。
 *
 * 将来HEIC/HEIF等に対応する場合は、ここでJPEG等への変換処理を行う想定。
 */

export interface NormalizedEstimateFile {
  buffer: Buffer;
  mimeType: string;
}

export async function normalizeEstimateFiles(files: EstimateBlobFile[]): Promise<NormalizedEstimateFile[]> {
  return Promise.all(
    files.map(async (file) => {
      const result = await get(file.url, { access: "private" });
      if (!result || result.statusCode !== 200) {
        throw new Error("アップロードされたファイルを取得できませんでした。");
      }
      const arrayBuffer = await new Response(result.stream).arrayBuffer();
      return { buffer: Buffer.from(arrayBuffer), mimeType: file.contentType };
    })
  );
}
