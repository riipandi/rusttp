//! The SPA's route table, as TanStack Router declares it (`FileRoutesByFullPath`), so the
//! server answers 404 exactly where the client router renders its not-found page.

/// What the route table says about a navigation.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Route {
    /// The full-path pattern that matches, e.g. `/vaults/$vaultId`.
    Matched(String),
    /// No route matches: the client renders its not-found page.
    NotFound,
    /// No route table is available (a stub build, or the dev server not answering).
    Unknown,
}

/// Full-path patterns: static segments, `$param`, an optional `{-$param}`, and a trailing `$`
/// splat. Static segments compare case-insensitively, TanStack Router's default.
#[derive(Clone, Debug, Default)]
pub(crate) struct Routes(Vec<String>);

/// A JSON array of full paths, or `null` for no route table.
pub(crate) fn parse(json: &str) -> Result<Option<Routes>, crate::Error> {
    serde_json::from_str::<Option<Vec<String>>>(json)
        .map(|patterns| patterns.map(Routes))
        .map_err(|err| crate::Error(format!("the route table does not parse: {err}")))
}

impl Routes {
    #[cfg(test)]
    fn new(patterns: Vec<String>) -> Self {
        Self(patterns)
    }

    pub(crate) fn find(&self, path: &str) -> Route {
        let path: Vec<&str> = segments(path).collect();
        // Static matches win over dynamic ones, as in the client router.
        let mut best: Option<(&String, usize)> = None;
        for pattern in &self.0 {
            if let Some(score) = matches(&segments(pattern).collect::<Vec<_>>(), &path)
                && best.is_none_or(|(_, top)| score > top)
            {
                best = Some((pattern, score));
            }
        }
        best.map_or(Route::NotFound, |(pattern, _)| Route::Matched(pattern.clone()))
    }
}

fn segments(path: &str) -> impl Iterator<Item = &str> {
    path.split('/').filter(|s| !s.is_empty())
}

/// The number of static segments matched, or `None` when the pattern does not match.
fn matches(pattern: &[&str], path: &[&str]) -> Option<usize> {
    match (pattern.split_first(), path.split_first()) {
        (None, None) => Some(0),
        (Some((&"$", _)), _) => Some(0),
        (Some((seg, rest)), _) if seg.starts_with("{-$") => {
            let skipped = matches(rest, path);
            let taken = path.split_first().and_then(|(_, tail)| matches(rest, tail));
            skipped.max(taken)
        }
        (Some((seg, rest)), Some((part, tail))) => {
            let is_param = seg.starts_with('$') || seg.contains("{$");
            if is_param {
                matches(rest, tail)
            } else if seg.eq_ignore_ascii_case(part) {
                matches(rest, tail).map(|score| score + 1)
            } else {
                None
            }
        }
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn routes() -> Routes {
        Routes::new(
            [
                "/",
                "/login",
                "/vaults/$vaultId",
                "/vaults/new",
                "/archives/$",
                "/posts/{-$lang}/about",
            ]
            .map(String::from)
            .to_vec(),
        )
    }

    fn found(path: &str) -> Option<String> {
        match routes().find(path) {
            Route::Matched(pattern) => Some(pattern),
            _ => None,
        }
    }

    #[test]
    fn static_and_dynamic_segments() {
        assert_eq!(found("/").as_deref(), Some("/"));
        assert_eq!(found("/LOGIN/").as_deref(), Some("/login"));
        assert_eq!(found("/vaults/713").as_deref(), Some("/vaults/$vaultId"));
        assert_eq!(found("/vaults/new").as_deref(), Some("/vaults/new"));
        assert_eq!(found("/vaults/713/keys"), None);
        assert_eq!(found("/chamber-of-secrets"), None);
    }

    #[test]
    fn splat_and_optional_segments() {
        assert_eq!(found("/archives").as_deref(), Some("/archives/$"));
        assert_eq!(found("/archives/vatican/secret").as_deref(), Some("/archives/$"));
        assert_eq!(found("/posts/about").as_deref(), Some("/posts/{-$lang}/about"));
        assert_eq!(found("/posts/it/about").as_deref(), Some("/posts/{-$lang}/about"));
        assert_eq!(found("/posts/it/fr/about"), None);
    }
}
