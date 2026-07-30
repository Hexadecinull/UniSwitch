#!/usr/bin/env node
// CLI entry point. See docs/USAGE.md section 1 for the intended command shape.
// The plugin registry is empty until a language plugin package is added here,
// see docs/CONTRIBUTING.md "Adding a language plugin".

import { Command } from "commander";
import { readFileSync, writeFileSync } from "node:fs";
import { convert, type LanguagePlugin } from "@uniswitch/core";

// TODO: replace with real imports once a plugin package has something to export,
// e.g. import { pythonPlugin } from "@uniswitch/lang-python";
const registeredPlugins: LanguagePlugin[] = [];

function findPlugin(id: string): LanguagePlugin | undefined {
  return registeredPlugins.find((plugin) => plugin.id === id);
}

const program = new Command();

program
  .name("uniswitch")
  .description("Convert source code between programming languages")
  .version("0.1.0");

program
  .command("languages")
  .description("List supported source and target languages")
  .action(() => {
    if (registeredPlugins.length === 0) {
      console.log(
        "No language plugins are registered yet. This is expected in an early checkout, see docs/ARCHITECTURE.md section 6.",
      );
      return;
    }
    for (const plugin of registeredPlugins) {
      console.log(`${plugin.id} (${plugin.extensions.join(", ")})`);
    }
  });

program
  .command("convert <input>")
  .description("Convert a source file to another language")
  .requiredOption("--to <language>", "target language id")
  .option("--out <file>", "write output here instead of stdout")
  .option("--report <file>", "write the conversion report here instead of stderr")
  .action((input: string, options: { to: string; out?: string; report?: string }) => {
    const source = readFileSync(input, "utf8");
    const sourceExt = input.slice(input.lastIndexOf("."));
    const fromPlugin = registeredPlugins.find((plugin) => plugin.extensions.includes(sourceExt));
    const toPlugin = findPlugin(options.to);

    if (!fromPlugin || !toPlugin) {
      console.error(
        `No plugin available for this conversion yet (need a source plugin for "${sourceExt}" and a target plugin for "${options.to}"). Run "uniswitch languages" to see what's registered.`,
      );
      process.exitCode = 1;
      return;
    }

    const result = convert({ source, from: fromPlugin, to: toPlugin });

    if (options.out) {
      writeFileSync(options.out, result.output);
    } else {
      process.stdout.write(result.output);
    }

    const reportText = JSON.stringify(result.report, null, 2);
    if (options.report) {
      writeFileSync(options.report, reportText);
    } else {
      process.stderr.write(reportText + "\n");
    }
  });

program.parse();
