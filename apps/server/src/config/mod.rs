//! Process configuration read from the environment.

use std::fmt;
use std::str::FromStr;

/// The environment variable that selects the [`AppMode`].
const APP_MODE_VAR: &str = "APP_MODE";

/// What the process is for, from `APP_MODE`. Development-only surfaces (Storybook) mount in
/// every mode but `Production`.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub(crate) enum AppMode {
    /// A developer's machine.
    Development,
    /// A live deployment. The default, so an unset variable never exposes a development surface.
    #[default]
    Production,
    /// Automated tests and CI.
    Test,
}

/// `APP_MODE` holds something other than `development`, `production`, or `test`.
#[derive(Debug)]
pub(crate) struct InvalidAppMode(String);

impl fmt::Display for InvalidAppMode {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "invalid {APP_MODE_VAR} `{}`: expected development, production, or test",
            self.0
        )
    }
}

impl std::error::Error for InvalidAppMode {}

impl FromStr for AppMode {
    type Err = InvalidAppMode;

    fn from_str(value: &str) -> Result<Self, Self::Err> {
        match value.trim().to_ascii_lowercase().as_str() {
            "development" => Ok(Self::Development),
            "production" => Ok(Self::Production),
            "test" => Ok(Self::Test),
            _ => Err(InvalidAppMode(value.to_owned())),
        }
    }
}

impl AppMode {
    /// Reads `APP_MODE`: `Production` when it is unset or empty, an error when it is set to
    /// anything unknown. A typo such as `prod` must stop the server rather than count as "not
    /// production" and mount Storybook on a live deployment.
    pub(crate) fn from_env() -> Result<Self, InvalidAppMode> {
        match std::env::var(APP_MODE_VAR) {
            Ok(value) if !value.trim().is_empty() => value.parse(),
            _ => Ok(Self::default()),
        }
    }

    /// Whether development-only surfaces such as Storybook are served.
    pub(crate) fn serves_dev_tools(self) -> bool {
        self != Self::Production
    }
}

#[cfg(test)]
mod tests {
    use super::AppMode;

    #[test]
    fn app_mode_parses_the_three_modes_and_rejects_the_rest() {
        assert_eq!("development".parse::<AppMode>().unwrap(), AppMode::Development);
        assert_eq!(" Production\n".parse::<AppMode>().unwrap(), AppMode::Production);
        assert_eq!("TEST".parse::<AppMode>().unwrap(), AppMode::Test);
        assert!("prod".parse::<AppMode>().is_err());
        assert!("".parse::<AppMode>().is_err());
    }

    #[test]
    fn only_production_hides_the_dev_tools() {
        assert_eq!(AppMode::default(), AppMode::Production);
        assert!(!AppMode::Production.serves_dev_tools());
        assert!(AppMode::Development.serves_dev_tools());
        assert!(AppMode::Test.serves_dev_tools());
    }
}
