use rust_embed::Embed;

#[derive(Embed)]
#[folder = "web/"]
pub struct WebAssets;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn web_assets_get_returns_some_for_index() {
        assert!(WebAssets::get("index.html").is_some());
    }

    #[test]
    fn web_assets_get_returns_none_for_missing() {
        assert!(WebAssets::get("missing.txt").is_none());
    }
}
