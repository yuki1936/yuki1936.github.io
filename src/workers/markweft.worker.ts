type FormatName = "markdown" | "html" | "typst" | "latex";

interface MarkweftModule {
  default: () => Promise<unknown>;
  convertDocument: (source: string, from: FormatName, to: FormatName) => string;
  detectFormat: (source: string) => FormatName;
}

type WorkerRequest =
  | { type: "init" }
  | {
      type: "convert";
      id: number;
      source: string;
      from: FormatName | "auto";
      to: FormatName;
    };

type WorkerResponse =
  | { type: "ready" }
  | { type: "result"; id: number; output: string; detectedFormat: FormatName }
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

    const detectedFormat = data.from === "auto" ? markweft.detectFormat(data.source) : data.from;
    const output = markweft.convertDocument(data.source, detectedFormat, data.to);
    workerScope.postMessage({ type: "result", id: data.id, output, detectedFormat });
  } catch (error) {
    workerScope.postMessage({
      type: "error",
      id: data.type === "convert" ? data.id : undefined,
      message: error instanceof Error ? error.message : String(error),
    });
  }
});
