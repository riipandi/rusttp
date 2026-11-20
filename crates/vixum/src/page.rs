use std::fmt::Write;

use axum::http::StatusCode;

/// What one document says about itself: the head crawlers and link previews read, and the
/// status code. Every value is HTML-escaped except [`Page::head`], which is trusted markup.
#[derive(Clone, Debug)]
pub struct Page {
    status: StatusCode,
    title: String,
    description: Option<String>,
    canonical: Option<String>,
    image: Option<String>,
    noindex: bool,
    json_ld: Option<String>,
    head: Option<String>,
}

impl Page {
    /// A page with a title, answered with 200 and indexable.
    pub fn new(title: impl Into<String>) -> Self {
        Self {
            status: StatusCode::OK,
            title: title.into(),
            description: None,
            canonical: None,
            image: None,
            noindex: false,
            json_ld: None,
            head: None,
        }
    }

    /// The response status, e.g. 404 for content that does not exist, so crawlers drop it.
    #[must_use]
    pub fn status(mut self, status: StatusCode) -> Self {
        self.status = status;
        self
    }

    /// The meta description, reused for Open Graph.
    #[must_use]
    pub fn description(mut self, description: impl Into<String>) -> Self {
        self.description = Some(description.into());
        self
    }

    /// The canonical absolute URL, reused as `og:url`.
    #[must_use]
    pub fn canonical(mut self, url: impl Into<String>) -> Self {
        self.canonical = Some(url.into());
        self
    }

    /// The absolute URL of the link-preview image (`og:image`, a large Twitter card).
    #[must_use]
    pub fn image(mut self, url: impl Into<String>) -> Self {
        self.image = Some(url.into());
        self
    }

    /// Keeps the page out of search results (`robots: noindex, nofollow`).
    #[must_use]
    pub fn noindex(mut self, noindex: bool) -> Self {
        self.noindex = noindex;
        self
    }

    /// A JSON-LD document (already serialized), written as `application/ld+json`.
    #[must_use]
    pub fn json_ld(mut self, json: impl Into<String>) -> Self {
        self.json_ld = Some(json.into());
        self
    }

    /// Extra head markup, written as is: never pass request data through it.
    #[must_use]
    pub fn head(mut self, html: impl Into<String>) -> Self {
        self.head = Some(html.into());
        self
    }

    pub(crate) fn status_code(&self) -> StatusCode {
        self.status
    }

    pub(crate) fn write_head(&self, out: &mut String) {
        let title = escape(&self.title);
        let _ = write!(out, "<title>{title}</title><meta property=\"og:title\" content=\"{title}\">");
        let _ = write!(out, "<meta property=\"og:type\" content=\"website\">");
        if let Some(description) = &self.description {
            let description = escape(description);
            let _ = write!(
                out,
                "<meta name=\"description\" content=\"{description}\"><meta property=\"og:description\" content=\"{description}\">"
            );
        }
        if let Some(url) = &self.canonical {
            let url = escape(url);
            let _ = write!(
                out,
                "<link rel=\"canonical\" href=\"{url}\"><meta property=\"og:url\" content=\"{url}\">"
            );
        }
        let card = if let Some(image) = &self.image {
            let _ = write!(out, "<meta property=\"og:image\" content=\"{}\">", escape(image));
            "summary_large_image"
        } else {
            "summary"
        };
        let _ = write!(out, "<meta name=\"twitter:card\" content=\"{card}\">");
        if self.noindex {
            out.push_str("<meta name=\"robots\" content=\"noindex, nofollow\">");
        }
        if let Some(json) = &self.json_ld {
            // `<` as a JSON escape keeps a `</script>` inside a string from closing the tag.
            let _ = write!(
                out,
                "<script type=\"application/ld+json\">{}</script>",
                json.replace('<', "\\u003c")
            );
        }
        if let Some(head) = &self.head {
            out.push_str(head);
        }
    }
}

fn escape(value: &str) -> String {
    let mut out = String::with_capacity(value.len());
    for c in value.chars() {
        match c {
            '&' => out.push_str("&amp;"),
            '<' => out.push_str("&lt;"),
            '>' => out.push_str("&gt;"),
            '"' => out.push_str("&quot;"),
            '\'' => out.push_str("&#39;"),
            c => out.push(c),
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    fn head(page: &Page) -> String {
        let mut out = String::new();
        page.write_head(&mut out);
        out
    }

    #[test]
    fn values_are_escaped() {
        let html =
            head(&Page::new("<script>alert('Bellatrix')</script>").canonical("https://example.com/?a=1&b=\"2\""));
        assert!(html.contains("<title>&lt;script&gt;alert(&#39;Bellatrix&#39;)&lt;/script&gt;</title>"));
        assert!(html.contains("href=\"https://example.com/?a=1&amp;b=&quot;2&quot;\""));
    }

    #[test]
    fn json_ld_cannot_close_its_script() {
        let html = head(&Page::new("Louvre").json_ld(r#"{"name":"</script><script>alert(1)"}"#));
        assert!(html.contains(r#"{"name":"\u003c/script>\u003cscript>alert(1)"}</script>"#));
    }

    #[test]
    fn image_switches_to_a_large_card() {
        assert!(head(&Page::new("Rosslyn Chapel")).contains("twitter:card\" content=\"summary\""));
        let with_image = head(&Page::new("Rosslyn Chapel").image("https://example.com/rosslyn.jpg"));
        assert!(with_image.contains("og:image\" content=\"https://example.com/rosslyn.jpg\""));
        assert!(with_image.contains("summary_large_image"));
    }
}
