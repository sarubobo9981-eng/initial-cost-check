import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { CostCategory, OcrExtractedItem, OcrResult } from "@/types/initialCost";
import { OcrInputFile, OcrProvider } from "@/lib/ocr/ocrService";
import {
  ESTIMATE_SYSTEM_PROMPT,
  ESTIMATE_USER_INSTRUCTION,
  EstimateExtractionSchema,
  EstimateExtraction,
} from "@/lib/ocr/estimateExtractionPrompt";
import { ESTIMATE_ACCEPTED_IMAGE_TYPES, ESTIMATE_ACCEPTED_PDF_TYPE } from "@/types/estimateFile";

const DEFAULT_MODEL = "claude-sonnet-5";
const MAX_TOKENS = 4096;

/** 固定項目キー → 費用カテゴリ・表示ラベルの対応表（1箇所に集約） */
const FIXED_FIELD_MAP: Array<{
  key: keyof Omit<
    EstimateExtraction,
    "isEstimate" | "rejectionReason" | "rent" | "otherCosts"
  >;
  category: CostCategory;
  label: string;
}> = [
  { key: "managementFee", category: "management_fee", label: "管理費・共益費" },
  { key: "deposit", category: "deposit", label: "敷金" },
  { key: "keyMoney", category: "key_money", label: "礼金" },
  { key: "brokerageFee", category: "brokerage_fee", label: "仲介手数料" },
  { key: "guaranteeFee", category: "guarantee_company", label: "保証会社利用料" },
  { key: "fireInsurance", category: "fire_insurance", label: "火災保険料" },
  { key: "keyExchangeFee", category: "key_exchange", label: "鍵交換費用" },
  { key: "supportFee", category: "support_service", label: "24時間サポート・安心サポート等" },
  { key: "disinfectionFee", category: "disinfection", label: "消毒施工費" },
  { key: "cleaningFee", category: "cleaning_fee", label: "清掃費" },
];

function toContentBlock(file: OcrInputFile) {
  const data = file.buffer.toString("base64");
  if (ESTIMATE_ACCEPTED_IMAGE_TYPES.includes(file.mimeType)) {
    return {
      type: "image" as const,
      source: { type: "base64" as const, media_type: file.mimeType as "image/jpeg" | "image/png", data },
    };
  }
  if (file.mimeType === ESTIMATE_ACCEPTED_PDF_TYPE) {
    return {
      type: "document" as const,
      source: { type: "base64" as const, media_type: "application/pdf" as const, data },
    };
  }
  throw new Error("対応していないファイル形式です。");
}

function mapExtractionToOcrResult(extraction: EstimateExtraction): OcrResult {
  if (!extraction.isEstimate) {
    return {
      items: [],
      isEstimate: false,
      rejectionReason: extraction.rejectionReason ?? "見積書として認識できませんでした。",
    };
  }

  const items: OcrExtractedItem[] = [];

  for (const { key, category, label } of FIXED_FIELD_MAP) {
    const field = extraction[key];
    if (!field) continue; // 記載がない項目は追加しない（推測しない）
    items.push({
      label,
      amount: field.amount,
      category,
      confidence: field.confidence,
      originalText: field.originalText ?? undefined,
    });
  }

  for (const other of extraction.otherCosts) {
    items.push({
      label: other.name,
      amount: other.amount,
      category: "other",
      confidence: other.confidence,
      originalText: other.originalText ?? undefined,
    });
  }

  return {
    items,
    monthlyRent: extraction.rent?.amount ?? undefined,
    isEstimate: true,
  };
}

export class AnthropicOcrProvider implements OcrProvider {
  name = "anthropic";
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
    this.model = process.env.ANTHROPIC_ESTIMATE_MODEL || DEFAULT_MODEL;
  }

  async extract(files: OcrInputFile[]): Promise<OcrResult> {
    const contentBlocks = files.map(toContentBlock);

    const response = await this.client.messages.parse({
      model: this.model,
      max_tokens: MAX_TOKENS,
      system: ESTIMATE_SYSTEM_PROMPT,
      output_config: {
        format: zodOutputFormat(EstimateExtractionSchema),
      },
      messages: [
        {
          role: "user",
          content: [...contentBlocks, { type: "text", text: ESTIMATE_USER_INSTRUCTION }],
        },
      ],
    });

    if (!response.parsed_output) {
      throw new Error("見積書の解析結果を読み取れませんでした。");
    }

    return mapExtractionToOcrResult(response.parsed_output);
  }
}
