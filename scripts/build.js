const fs = require("fs");
const path = require("path");

const SCRIPT_DIR = path.resolve(__dirname, "../src");
const TEMPLATE_DIR = path.resolve(__dirname, "../templates");
const OUTPUT_DIR = path.resolve(__dirname, "../dist");
const STATIC_DIR = path.resolve(__dirname, "../static");

function findScripts(pathToDir) {
  const files = fs.readdirSync(pathToDir);
  return files.map(x => path.resolve(pathToDir, x));
}

function parseScript(raw) {
  const lines = raw.split("\n");
  const leadingCommentLines = [];

  for (const line of lines) {
    // Take the all comments at the beginning of the file
    if (/^\/\//.test(line)) {
      leadingCommentLines.push(line);
    } else {
      break;
    }
  }

  let userScriptOpened = false;
  let userScriptClosed = false;

  const metadata = {};
  const metadataRegex = /^\/\/\s+@(\w+)\s+(.+)$/;

  for (const line of leadingCommentLines) {
    if (!userScriptClosed && /==\/UserScript==/.test(line)) {
      userScriptClosed = true;
      continue;
    } else if (userScriptClosed) {
      throw new Error("UserScript closed.");
    }

    if (/==UserScript==/.test(line)) {
      if (userScriptOpened) {
        throw new Error("UserScript already opened.");
      } else {
        userScriptOpened = true;
        continue;
      }
    }
    if (!userScriptOpened) {
      throw new Error("UserScript not yet opened.");
    }

    const matches = line.match(metadataRegex);

    if (!matches) {
      console.log("line:", line);
      throw new Error("Unparsable metadata");
    }

    const [, key, value] = matches;

    if (metadata[key]) {
      throw new Error(`Duplicate value for key: ${key}`);
    }

    metadata[key] = value;
  }

  return {
    metadata,
    comments: leadingCommentLines,
    body: raw
  };
}

function main(srcDir, templateDir, staticDir, outputDir) {
  const scriptPaths = findScripts(srcDir);
  const scripts = scriptPaths.map(x => {
    const content = fs.readFileSync(x, "utf-8");
    try {
      const data = parseScript(content);
      return {
        ...data,
        href: `/${path.relative(srcDir, x)}`
      };
    } catch (e) {
      e.message = `${e.message} (while parsing ${x})`;
      throw e;
    }
  });

  const entryTemplate = fs.readFileSync(
    path.resolve(templateDir, "script-entry.html"),
    "utf-8"
  );
  const indexTemplate = fs.readFileSync(
    path.resolve(templateDir, "index.html"),
    "utf-8"
  );

  const entries = scripts
    .map(x => ({
      href: x.href,
      description: x.metadata.description,
      title: x.metadata.name,
      version: x.metadata.version
    }))
    .map(({ href, description, title, version }) =>
      entryTemplate
        .replace("%%HREF%%", href)
        .replace("%%TITLE%%", title)
        .replace("%%DESCRIPTION%%", description)
        .replace("%%VERSION%%", version)
    );

  const indexContent = indexTemplate.replace(
    "%%ENTRIES%%",
    `\n${entries.join("\n")}`
  );

  fs.rmdirSync(outputDir, { recursive: true });
  fs.mkdirSync(outputDir);
  fs.writeFileSync(path.resolve(outputDir, "index.html"), indexContent);

  for (const file of fs.readdirSync(staticDir)) {
    fs.copyFileSync(
      path.resolve(staticDir, file),
      path.resolve(outputDir, file)
    );
  }

  for (const file of fs.readdirSync(srcDir)) {
    fs.copyFileSync(path.resolve(srcDir, file), path.resolve(outputDir, file));
  }
}

main(SCRIPT_DIR, TEMPLATE_DIR, STATIC_DIR, OUTPUT_DIR);
