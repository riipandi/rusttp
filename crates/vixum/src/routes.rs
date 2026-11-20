//! The SPA's route table, as TanStack Router builds it from the route tree, so the server
//! answers 404 exactly where the client router renders its not-found page, and a page resolver
//! gets the same params, title, and description the client route has.

/// What the route table says about a navigation.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Route {
    /// A route matches.
    Matched {
        /// The full-path pattern, e.g. `/vaults/$vaultId`.
        pattern: String,
        /// The path params, percent-decoded, in pattern order; a splat is named `_splat`, as in
        /// TanStack Router. An optional param that is absent is not listed.
        params: Vec<(String, String)>,
        /// The route's `staticData.pageTitle` (the nearest one up its parent chain).
        title: Option<String>,
        /// The route's `staticData.pageDescription` (the nearest one up its parent chain).
        description: Option<String>,
    },
    /// No route matches: the client renders its not-found page.
    NotFound,
    /// No route table is available (a stub build, or the dev server not answering).
    Unknown,
}

impl Route {
    /// The value of path param `name`, when a route matched and the param is present.
    pub fn param(&self, name: &str) -> Option<&str> {
        match self {
            Self::Matched { params, .. } => params
                .iter()
                .find(|(key, _)| key == name)
                .map(|(_, value)| value.as_str()),
            Self::NotFound | Self::Unknown => None,
        }
    }

    /// The matched route's title, as its `staticData` declares it.
    pub fn title(&self) -> Option<&str> {
        match self {
            Self::Matched { title, .. } => title.as_deref(),
            Self::NotFound | Self::Unknown => None,
        }
    }

    /// The matched route's description, as its `staticData` declares it.
    pub fn description(&self) -> Option<&str> {
        match self {
            Self::Matched { description, .. } => description.as_deref(),
            Self::NotFound | Self::Unknown => None,
        }
    }
}

/// One navigable route as the Vite plugin writes it.
#[derive(Clone, Debug, Default)]
struct Entry {
    path: String,
    title: Option<String>,
    description: Option<String>,
}

/// Full-path patterns, parsed once. Segments: static, `$param`, `{$param}` and `{-$param}`
/// (optional) with an optional static prefix and suffix, and a trailing `$` (or `{$}`) splat.
#[derive(Clone, Debug, Default)]
pub(crate) struct Routes(Vec<(Entry, Vec<Segment>)>);

#[derive(Clone, Debug, PartialEq, Eq)]
enum Segment {
    Static(String),
    Param {
        prefix: String,
        name: String,
        suffix: String,
        optional: bool,
    },
    Splat,
}

/// A JSON array of `{"path", "title"?, "description"?}` (or bare path strings), or `null` for no
/// route table.
pub(crate) fn parse(json: &str) -> Result<Option<Routes>, crate::Error> {
    let invalid = |reason: String| crate::Error(format!("the route table does not parse: {reason}"));
    let table: serde_json::Value = serde_json::from_str(json).map_err(|err| invalid(err.to_string()))?;
    if table.is_null() {
        return Ok(None);
    }
    let entries = table.as_array().ok_or_else(|| invalid("not an array".into()))?;
    let text = |value: &serde_json::Value, key: &str| value[key].as_str().map(String::from);
    let entries = entries
        .iter()
        .map(|entry| {
            // A bare string is a path alone (a table written before titles were part of it).
            if let Some(path) = entry.as_str() {
                return Ok(Entry {
                    path: path.into(),
                    ..Entry::default()
                });
            }
            Ok(Entry {
                path: text(entry, "path").ok_or_else(|| invalid(format!("an entry has no path: {entry}")))?,
                title: text(entry, "title"),
                description: text(entry, "description"),
            })
        })
        .collect::<Result<Vec<_>, crate::Error>>()?;
    Ok(Some(Routes::new(entries)))
}

impl Routes {
    fn new(entries: Vec<Entry>) -> Self {
        Self(
            entries
                .into_iter()
                .map(|entry| {
                    let segments = split(&entry.path).map(Segment::parse).collect();
                    (entry, segments)
                })
                .collect(),
        )
    }

    pub(crate) fn find(&self, path: &str) -> Route {
        let path: Vec<&str> = split(path).collect();
        // The most specific match wins, as in the client router: static segments first, then
        // params with a prefix or suffix, then bare params.
        let mut best: Option<Candidate<'_>> = None;
        for (entry, segments) in &self.0 {
            let mut params = Vec::new();
            if let Some(score) = matches(segments, &path, &mut params)
                && best.as_ref().is_none_or(|(_, top, _)| score > *top)
            {
                best = Some((entry, score, params));
            }
        }
        best.map_or(Route::NotFound, |(entry, _, params)| Route::Matched {
            pattern: entry.path.clone(),
            params,
            title: entry.title.clone(),
            description: entry.description.clone(),
        })
    }
}

/// (static segments, affixed params), compared in that order.
type Score = (usize, usize);

/// A candidate match: its pattern, score, and params.
type Candidate<'a> = (&'a Entry, Score, Vec<(String, String)>);

fn split(path: &str) -> impl Iterator<Item = &str> {
    path.split('/').filter(|s| !s.is_empty())
}

impl Segment {
    fn parse(segment: &str) -> Self {
        if segment == "$" || segment == "{$}" {
            return Self::Splat;
        }
        if let Some(name) = segment.strip_prefix('$') {
            return Self::Param {
                prefix: String::new(),
                name: name.into(),
                suffix: String::new(),
                optional: false,
            };
        }
        if let (Some(open), Some(close)) = (segment.find('{'), segment.rfind('}'))
            && open < close
        {
            let inner = &segment[open + 1..close];
            let (optional, name) = match inner.strip_prefix("-$") {
                Some(name) => (true, name),
                None => (false, inner.strip_prefix('$').unwrap_or(inner)),
            };
            return Self::Param {
                prefix: segment[..open].into(),
                name: name.into(),
                suffix: segment[close + 1..].into(),
                optional,
            };
        }
        Self::Static(segment.into())
    }
}

fn matches(pattern: &[Segment], path: &[&str], params: &mut Vec<(String, String)>) -> Option<Score> {
    let Some((segment, rest)) = pattern.split_first() else {
        return path.is_empty().then_some((0, 0));
    };
    match segment {
        Segment::Splat => {
            params.push(("_splat".into(), decode(&path.join("/"))));
            Some((0, 0))
        }
        Segment::Static(text) => {
            let (part, tail) = path.split_first()?;
            if !text.eq_ignore_ascii_case(part) {
                return None;
            }
            matches(rest, tail, params).map(|(fixed, affixed)| (fixed + 1, affixed))
        }
        Segment::Param {
            prefix,
            name,
            suffix,
            optional,
        } => {
            // Taking the segment first, so an optional param that can match does.
            if let Some((part, tail)) = path.split_first()
                && part.len() > prefix.len() + suffix.len()
                && part.starts_with(prefix.as_str())
                && part.ends_with(suffix.as_str())
            {
                let mut taken = params.clone();
                taken.push((name.clone(), decode(&part[prefix.len()..part.len() - suffix.len()])));
                if let Some((fixed, affixed)) = matches(rest, tail, &mut taken) {
                    *params = taken;
                    let affix = usize::from(!prefix.is_empty() || !suffix.is_empty());
                    return Some((fixed, affixed + affix));
                }
            }
            if *optional { matches(rest, path, params) } else { None }
        }
    }
}

/// Percent-decoding of a path param; a malformed escape stays as written.
fn decode(value: &str) -> String {
    let bytes = value.as_bytes();
    let mut out = Vec::with_capacity(bytes.len());
    let mut i = 0;
    while i < bytes.len() {
        let hex = |b: u8| char::from(b).to_digit(16);
        if bytes[i] == b'%'
            && let (Some(hi), Some(lo)) =
                (bytes.get(i + 1).copied().and_then(hex), bytes.get(i + 2).copied().and_then(hex))
        {
            // Two hex digits always fit a byte.
            out.push(u8::try_from(hi * 16 + lo).unwrap_or_default());
            i += 3;
        } else {
            out.push(bytes[i]);
            i += 1;
        }
    }
    String::from_utf8_lossy(&out).into_owned()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn routes() -> Routes {
        Routes::from_paths(
            [
                "/",
                "/login",
                "/vaults/$vaultId",
                "/vaults/new",
                "/archives/$",
                "/posts/{-$lang}/about",
                "/files/report-{$year}.pdf",
                "/files/{$name}",
            ]
            .map(String::from)
            .to_vec(),
        )
    }

    impl Routes {
        fn from_paths(paths: Vec<String>) -> Self {
            Self::new(
                paths
                    .into_iter()
                    .map(|path| Entry {
                        path,
                        ..Entry::default()
                    })
                    .collect(),
            )
        }
    }

    fn found(path: &str) -> Option<(String, Vec<(String, String)>)> {
        match routes().find(path) {
            Route::Matched { pattern, params, .. } => Some((pattern, params)),
            _ => None,
        }
    }

    fn params(pairs: &[(&str, &str)]) -> Vec<(String, String)> {
        pairs.iter().map(|(k, v)| ((*k).into(), (*v).into())).collect()
    }

    #[test]
    fn static_and_dynamic_segments() {
        assert_eq!(found("/").map(|m| m.0).as_deref(), Some("/"));
        assert_eq!(found("/LOGIN/").map(|m| m.0).as_deref(), Some("/login"));
        assert_eq!(
            found("/vaults/713"),
            Some(("/vaults/$vaultId".into(), params(&[("vaultId", "713")])))
        );
        assert_eq!(found("/vaults/new"), Some(("/vaults/new".into(), vec![])));
        assert_eq!(found("/vaults/713/keys"), None);
        assert_eq!(found("/chamber-of-secrets"), None);
    }

    #[test]
    fn params_are_percent_decoded() {
        assert_eq!(
            found("/vaults/Gringotts%20713").unwrap().1,
            params(&[("vaultId", "Gringotts 713")])
        );
        assert_eq!(found("/vaults/caf%C3%A9").unwrap().1, params(&[("vaultId", "café")]));
        assert_eq!(found("/vaults/100%").unwrap().1, params(&[("vaultId", "100%")]));
    }

    #[test]
    fn splat_and_optional_segments() {
        assert_eq!(found("/archives"), Some(("/archives/$".into(), params(&[("_splat", "")]))));
        assert_eq!(
            found("/archives/vatican/secret").unwrap().1,
            params(&[("_splat", "vatican/secret")])
        );
        assert_eq!(found("/posts/about"), Some(("/posts/{-$lang}/about".into(), vec![])));
        assert_eq!(found("/posts/it/about").unwrap().1, params(&[("lang", "it")]));
        assert_eq!(found("/posts/it/fr/about"), None);
    }

    #[test]
    fn affixed_params_check_and_strip_their_affixes() {
        assert_eq!(
            found("/files/report-1999.pdf"),
            Some(("/files/report-{$year}.pdf".into(), params(&[("year", "1999")])))
        );
        assert_eq!(
            found("/files/notes.txt"),
            Some(("/files/{$name}".into(), params(&[("name", "notes.txt")])))
        );
        assert_eq!(found("/files/report-.pdf").unwrap().0, "/files/{$name}");
    }

    #[test]
    fn route_param_reads_a_matched_value() {
        let route = routes().find("/vaults/713");
        assert_eq!(route.param("vaultId"), Some("713"));
        assert_eq!(route.param("lang"), None);
        assert_eq!(Route::NotFound.param("vaultId"), None);
    }

    #[test]
    fn titles_and_descriptions_come_from_the_table() {
        let table = r#"[
            {"path": "/", "title": "Home"},
            {"path": "/vaults/$vaultId", "title": "Vault", "description": "A vault at Gringotts."}
        ]"#;
        let routes = parse(table).unwrap().unwrap();
        let vault = routes.find("/vaults/713");
        assert_eq!(vault.title(), Some("Vault"));
        assert_eq!(vault.description(), Some("A vault at Gringotts."));
        assert_eq!(routes.find("/").description(), None);
        assert!(parse("null").unwrap().is_none());
        assert!(parse(r#"[{"title": "No path"}]"#).is_err());
        assert!(parse(r#"{"path": "/"}"#).is_err());
    }
}
