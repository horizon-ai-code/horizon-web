export interface ContentTag {
  label: string;
  value: string;
}

export interface FormattedContent {
  summary: string;
  tags: ContentTag[];
  details: string | null;
}

function flattenJson(obj: unknown, indent: number = 0): string {
  const pad = "  ".repeat(indent);
  const lines: string[] = [];

  if (typeof obj !== "object" || obj === null) {
    return String(obj);
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return "";
    const items = obj.map((v) =>
      typeof v === "object" && v !== null
        ? JSON.stringify(v)
        : String(v)
    );
    return items.join(", ");
  }

  for (const [key, val] of Object.entries(obj)) {
    const label = key.replace(/_/g, " ");
    if (typeof val === "object" && val !== null && !Array.isArray(val)) {
      const nested = flattenJson(val, indent + 1);
      lines.push(`${pad}${label}:`);
      if (nested) lines.push(nested);
    } else if (Array.isArray(val)) {
      if (val.length > 0) {
        const items = val.map((v) =>
          typeof v === "object" && v !== null ? JSON.stringify(v) : String(v)
        );
        lines.push(`${pad}${label}: ${items.join(", ")}`);
      }
    } else if (val !== undefined && val !== null && val !== "") {
      lines.push(`${pad}${label}: ${val}`);
    }
  }

  return lines.join("\n");
}

export function formatStatusContent(raw: string): FormattedContent {
  let text = raw;
  let details: string | null = null;

  // 1. Extract ```json ... ``` blocks and parse to readable text
  const jsonBlockRegex = /```json\s*([\s\S]*?)```/g;
  const parsedBlocks: string[] = [];
  text = text.replace(jsonBlockRegex, (_, json) => {
    try {
      const formatted = flattenJson(JSON.parse(json.trim()));
      if (formatted) parsedBlocks.push(formatted);
    } catch {
      parsedBlocks.push(json.trim());
    }
    return "";
  });
  if (parsedBlocks.length > 0) {
    details = parsedBlocks.join("\n\n");
  }

  // 1b. Extract standalone JSON objects (not in code blocks) — common in past session data
  const trimmed = text.trim();
  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
    try {
      const formatted = flattenJson(JSON.parse(trimmed));
      if (formatted) {
        if (details) {
          details = formatted + "\n\n" + details;
        } else {
          details = formatted;
        }
      }
      text = "";
    } catch {
      // Not valid JSON, fall through
    }
  }

  // If content is source code, show as collapsible details
  if (text.trim().match(/^(public|private|protected|class|void|int|boolean|String|if|for|while|try|return|import|package)\b/)) {
    const code = text.trim();
    const methodMatch = code.match(/(?:public|private|protected)\s+\w+\s+(\w+)\s*\(/);
    const summary = methodMatch ? `Code generated — ${methodMatch[1]}` : "Code generated";
    return { summary, tags: [], details: code };
  }

  // 2. Extract **Key:** `Value` or **Key:** Value pairs as tags (from structured content)
  const tags: ContentTag[] = [];
  const tagRegex = /\*\*([^*]+)\*:\*?\s*`([^`]+)`/g;
  let match: RegExpExecArray | null;
  while ((match = tagRegex.exec(text)) !== null) {
    tags.push({ label: match[1].trim(), value: match[2].trim() });
  }
  text = text.replace(tagRegex, "");

  // Also match **Key:** Value without backticks (line-based)
  const lineTagRegex = /^\*\*([^*]+)\*:\*?\s*(.+)$/gm;
  while ((match = lineTagRegex.exec(text)) !== null) {
    const val = match[2].trim();
    if (val && !val.startsWith("```")) {
      tags.push({ label: match[1].trim(), value: val });
    }
  }
  text = text.replace(lineTagRegex, "");

  // 3. Extract bullet items like "- **ACTION** on ..." as tags
  const bulletTagRegex = /-\s+\*\*([^*]+)\*\*\s*on\s+`([^`]+)`/g;
  while ((match = bulletTagRegex.exec(text)) !== null) {
    tags.push({ label: match[1].trim(), value: match[2].trim() });
  }
  text = text.replace(bulletTagRegex, "");

  // 4. Strip remaining **bold** markers
  text = text.replace(/\*\*(.*?)\*\*/g, "$1");

  // 5. Strip backtick code markers
  text = text.replace(/`([^`]+)`/g, "$1");

  // 6. Remove markdown headers
  text = text.replace(/^#{1,6}\s+/gm, "");

  // 7. Clean up: remove > blockquotes, extra newlines, trim
  text = text.replace(/^>\s+/gm, "");
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.trim();

  // 8. Extract the first meaningful line as summary, rest as additional text
  const lines = text.split("\n").filter((l) => l.trim());
  const summary = lines[0] || "";
  const rest = lines.slice(1).filter((l) => !l.match(/^\s*[-*]\s*$/)).join(" · ");

  // If there's meaningful rest content, add it as a tag
  if (rest && tags.length === 0) {
    tags.push({ label: "", value: rest });
  }

  return { summary, tags, details };
}
