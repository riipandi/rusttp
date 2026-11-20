use std::fmt::Write;

use serde_json::Value;

use crate::Error;

/// The app's static document around every page: the `<html lang>`, the head markup every page
/// shares (charset, viewport, icons, theme colour, critical CSS), and the markup inside the root
/// element until the SPA mounts (a loader). All three are trusted markup written as is.
#[derive(Clone, Debug)]
pub struct Shell {
    lang: &'static str,
    head: &'static str,
    body: &'static str,
    root_id: &'static str,
}

impl Shell {
    /// A shell for `lang` with an empty head and an empty `#root`.
    pub fn new(lang: &'static str) -> Self {
        Self {
            lang,
            head: "",
            body: "",
            root_id: "root",
        }
    }

    /// Head markup every page shares, written before the page's own head.
    #[must_use]
    pub fn head(mut self, html: &'static str) -> Self {
        self.head = html;
        self
    }

    /// Markup inside the root element until the SPA replaces it.
    #[must_use]
    pub fn body(mut self, html: &'static str) -> Self {
        self.body = html;
        self
    }

    /// The id of the element the SPA mounts on (default `root`).
    #[must_use]
    pub fn root_id(mut self, id: &'static str) -> Self {
        self.root_id = id;
        self
    }

    /// The whole document: `page_head` (the page's own head) and `tags` (the entry's scripts and
    /// styles) go in the head after the shared markup.
    pub(crate) fn render(&self, page_head: &str, tags: &str) -> String {
        let mut out = String::with_capacity(self.head.len() + self.body.len() + page_head.len() + tags.len() + 128);
        let _ = write!(
            out,
            "<!doctype html><html lang=\"{}\"><head>{}{page_head}{tags}</head><body><div id=\"{}\">{}</div></body></html>",
            self.lang, self.head, self.root_id, self.body
        );
        out
    }
}

/// The script, stylesheet, and modulepreload tags for the build manifest's entry chunk
/// (`build.manifest` in Vite, `.vite/manifest.json`), served from the site root.
pub(crate) fn entry_tags(manifest: &str) -> Result<String, Error> {
    let manifest: Value =
        serde_json::from_str(manifest).map_err(|err| Error(format!("the build manifest does not parse: {err}")))?;
    let chunks = manifest
        .as_object()
        .ok_or_else(|| Error("the build manifest is not an object".into()))?;
    let (entry_key, entry) = chunks
        .iter()
        .find(|(_, chunk)| chunk["isEntry"].as_bool() == Some(true))
        .ok_or_else(|| Error("the build manifest has no entry chunk".into()))?;

    // Depth-first over static imports, once each, so every stylesheet and preload is listed once.
    let mut seen = vec![entry_key.as_str()];
    let mut stack = vec![entry];
    let (mut styles, mut preloads) = (Vec::new(), Vec::new());
    while let Some(chunk) = stack.pop() {
        for css in chunk["css"].as_array().into_iter().flatten().filter_map(Value::as_str) {
            if !styles.contains(&css) {
                styles.push(css);
            }
        }
        for key in chunk["imports"]
            .as_array()
            .into_iter()
            .flatten()
            .filter_map(Value::as_str)
        {
            if !seen.contains(&key)
                && let Some(import) = chunks.get(key)
            {
                seen.push(key);
                if let Some(file) = import["file"].as_str() {
                    preloads.push(file);
                }
                stack.push(import);
            }
        }
    }

    let file = entry["file"]
        .as_str()
        .ok_or_else(|| Error("the entry chunk has no file".into()))?;
    let mut tags = String::new();
    for css in styles {
        let _ = write!(tags, "<link rel=\"stylesheet\" crossorigin href=\"/{css}\">");
    }
    for file in preloads {
        let _ = write!(tags, "<link rel=\"modulepreload\" crossorigin href=\"/{file}\">");
    }
    let _ = write!(tags, "<script type=\"module\" crossorigin src=\"/{file}\"></script>");
    Ok(tags)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn entry_tags_follow_static_imports_once() {
        let manifest = r#"{
            "app/main.tsx": {"file": "assets/main-a1.js", "isEntry": true, "css": ["assets/main-b2.css"], "imports": ["_vendor", "_shared"]},
            "_vendor": {"file": "assets/vendor-c3.js", "imports": ["_shared"]},
            "_shared": {"file": "assets/shared-d4.js", "css": ["assets/shared-e5.css"]},
            "app/routes/login.tsx": {"file": "assets/login-f6.js", "isDynamicEntry": true}
        }"#;
        let tags = entry_tags(manifest).unwrap();
        assert_eq!(
            tags,
            concat!(
                r#"<link rel="stylesheet" crossorigin href="/assets/main-b2.css">"#,
                r#"<link rel="stylesheet" crossorigin href="/assets/shared-e5.css">"#,
                r#"<link rel="modulepreload" crossorigin href="/assets/vendor-c3.js">"#,
                r#"<link rel="modulepreload" crossorigin href="/assets/shared-d4.js">"#,
                r#"<script type="module" crossorigin src="/assets/main-a1.js"></script>"#,
            )
        );
    }

    #[test]
    fn a_manifest_without_an_entry_is_refused() {
        assert!(entry_tags("{}").is_err());
        assert!(entry_tags("[]").is_err());
    }

    #[test]
    fn the_shell_wraps_head_and_root() {
        let html = Shell::new("en")
            .head("<meta charset=\"utf-8\">")
            .body("<p>Loading</p>")
            .render("<title>Langdon</title>", "<script></script>");
        assert_eq!(
            html,
            "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><title>Langdon</title><script></script></head><body><div id=\"root\"><p>Loading</p></div></body></html>"
        );
    }
}
