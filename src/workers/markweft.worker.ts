type FormatName = "markdown" | "html" | "typst" | "latex";

interface MarkweftModule {
  default: () => Promise<unknown>;
  convertDocument: (source: string, from: FormatName, to: FormatName) => string;
  detectFormat: (source: string) => FormatName;
  detectFormatDetails: (source: string) => string;
  convertDocumentWithReport: (
    source: string,
    from: FormatName,
    to: FormatName,
    options: string,
  ) => string;
}

interface ConversionOptions {
  mode: "strict" | "compatible";
  full_html_document: boolean;
  document_title?: string;
  link_prefix?: string;
  image_prefix?: string;
}

interface Diagnostic {
  severity: "info" | "warning" | "error";
  code: string;
  message: string;
  line?: number;
  column?: number;
}

type WorkerRequest =
  | { type: "init" }
  | {
      type: "convert";
      id: number;
      source: string;
      from: FormatName | "auto";
      to: FormatName;
      options: ConversionOptions;
    };

type WorkerResponse =
  | { type: "ready" }
  | {
      type: "result";
      id: number;
      output: string;
      previewHtml: string;
      astJson: string;
      diagnostics: Diagnostic[];
      detectedFormat: FormatName;
      confidence: number;
    }
  | { type: "error"; id?: number; message: string };

const workerScope = self as unknown as {
  postMessage: (message: WorkerResponse) => void;
  addEventListener: (
    type: "message",
    listener: (event: MessageEvent<WorkerRequest>) => void,
  ) => void;
};

let modulePromise: Promise<MarkweftModule> | undefined;

function loadMarkweft(): Promise<MarkweftModule> {
  const moduleUrl = "/wasm/markweft/markweft.js";
  modulePromise ??= import(/* @vite-ignore */ moduleUrl).then(
    async (module) => {
      const markweft = module as MarkweftModule;
      await markweft.default();
      return markweft;
    },
  );
  return modulePromise;
}

workerScope.addEventListener("message", async ({ data }) => {
  try {
    const markweft = await loadMarkweft();
    if (data.type === "init") {
      workerScope.postMessage({ type: "ready" });
      return;
    }

    const detection = JSON.parse(markweft.detectFormatDetails(data.source)) as {
      format: FormatName;
      confidence: number;
    };
    const detectedFormat = data.from === "auto" ? detection.format : data.from;
    const report = JSON.parse(markweft.convertDocumentWithReport(
      data.source,
      detectedFormat,
      data.to,
      JSON.stringify(data.options),
    )) as {
      output: string;
      document: unknown;
      diagnostics: Diagnostic[];
    };
    const output = report.output;
    let previewHtml = data.to === "html" ? output : "";
    if (!previewHtml) {
      try {
        const previewOptions: ConversionOptions = {
          ...data.options,
          mode: "compatible",
          full_html_document: false,
        };
        const previewReport = JSON.parse(markweft.convertDocumentWithReport(
          data.source,
          detectedFormat,
          "html",
          JSON.stringify(previewOptions),
        )) as { output: string };
        previewHtml = previewReport.output;
      } catch {
        // A preview is optional; keep a successful source conversion usable.
      }
    }
    workerScope.postMessage({
      type: "result",
      id: data.id,
      output,
      previewHtml,
      astJson: JSON.stringify(report.document, null, 2),
      diagnostics: report.diagnostics,
      detectedFormat,
      confidence: detection.confidence,
    });
  } catch (error) {
    workerScope.postMessage({
      type: "error",
      id: data.type === "convert" ? data.id : undefined,
      message: error instanceof Error ? error.message : String(error),
    });
  }
});
