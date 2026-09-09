import { OcrResult } from "@/types/initialCost";
import { AnthropicOcrProvider } from "@/lib/ocr/anthropicOcrProvider";

/**
 * OCR/AI解析サービス層（プロバイダを差し替え可能にする抽象化）
 *
 * 想定フロー: 見積書アップロード → OCR/AI解析 → 費用項目抽出 → 診断フォームに自動入力
 *
 * 重要:
 * - このファイルはサーバー側（API Route等）からのみ呼び出すこと。
 * - APIキーはフロントエンドに直接埋め込まず、サーバー側の環境変数（process.env.*）から読み込むこと。
 * - 現在の実装は Claude (Anthropic API) を使用（AnthropicOcrProvider）。
 *   別のプロバイダ（OpenAI / Google Cloud Vision 等）に差し替える場合は
 *   OcrProvider を満たす新しいクラスを追加し、getOcrProvider() を差し替える。
 */

/** OCRサービスに渡すファイルの最小単位（ファイル名などUI都合の情報は含めない） */
export interface OcrInputFile {
  buffer: Buffer;
  mimeType: string;
}

export interface OcrProvider {
  name: string;
  /** 複数ファイル（複数ページの見積書）をまとめて1回で解析する */
  extract(files: OcrInputFile[]): Promise<OcrResult>;
}

/** ANTHROPIC_API_KEY が未設定の場合に返すエラー。サイト全体を壊さず手入力へフォールバックさせるために使用する */
export class OcrNotConfiguredError extends Error {
  constructor() {
    super("解析機能が設定されていません。手入力でご入力ください。");
    this.name = "OcrNotConfiguredError";
  }
}

class NotConfiguredOcrProvider implements OcrProvider {
  name = "not-configured";

  async extract(): Promise<OcrResult> {
    throw new OcrNotConfiguredError();
  }
}

export function getOcrProvider(): OcrProvider {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new NotConfiguredOcrProvider();
  }
  return new AnthropicOcrProvider(apiKey);
}
