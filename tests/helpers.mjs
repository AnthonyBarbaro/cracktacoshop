import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function resolveSourceFile(filePath) {
  const candidates = [filePath, `${filePath}.ts`, `${filePath}.tsx`];
  const file = candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
  if (!file) throw new Error(`Source module not found: ${filePath}`);
  return file;
}

export function createSourceLoader(globals = {}) {
  const { require: boundaryRequire, ...runtimeGlobals } = globals;
  const cache = new Map();

  const load = (relativePath) => {
    const file = resolveSourceFile(path.resolve(repositoryRoot, relativePath));
    if (cache.has(file)) return cache.get(file).exports;

    const sourceModule = { exports: {} };
    cache.set(file, sourceModule);
    const nativeRequire = createRequire(file);
    const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;

    vm.runInNewContext(code, {
      module: sourceModule,
      exports: sourceModule.exports,
      URL,
      Date,
      Intl,
      Event,
      AbortController,
      Buffer,
      FormData,
      File,
      Blob,
      Request,
      Response,
      Headers,
      TextEncoder,
      TextDecoder,
      process,
      setTimeout,
      clearTimeout,
      require: (specifier) => {
        const boundary = boundaryRequire?.(specifier);
        if (boundary !== undefined) return boundary;
        if (specifier.startsWith("@/")) return load(`src/${specifier.slice(2)}`);
        if (specifier.startsWith(".")) return load(path.resolve(path.dirname(file), specifier));
        return nativeRequire(specifier);
      },
      ...runtimeGlobals,
    }, { filename: file });

    return sourceModule.exports;
  };

  return load;
}

export function loadSourceModule(relativePath, globals = {}) {
  return createSourceLoader(globals)(relativePath);
}
