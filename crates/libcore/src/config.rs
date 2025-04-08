// Copyright 2025 Aris Ripandi <aris@duck.com>
// SPDX-License-Identifier: Apache-2.0 or MIT

use once_cell::sync::Lazy;
use std::error::Error;
use std::str::FromStr;
use std::{env, fmt};

/// The configuration parameters for the application.
///
/// These can either be passed from environment variables. This is a pretty simple configuration
/// struct as far as backend APIs go. You could imagine a bunch of other parameters going here,
/// like API keys for external services or flags enabling or disabling certain features or test
/// modes of the API.
///
/// For development convenience, these can also be read from a `.env` file in the working
/// directory where the application is started.
///
/// See `.env.example` in the repository root for details.

const DEFAULT_MAX_POOL: u32 = 1;
const DEFAULT_MAIL_FROM: &str = "Admin Sistem <admin@example.com>";

pub struct AppConfig {
    pub base_url: String,
    pub secret_key: String,
    pub database_url: String,
    pub database_max_pool: u32,
    pub smtp_host: String,
    pub smtp_port: u16,
    pub smtp_secure: bool,
    pub smtp_username: String,
    pub smtp_password: String,
    pub smtp_mail_from: String,
    pub github_client_id: String,
    pub github_client_secret: String,
}

pub static CONFIG: Lazy<Result<AppConfig, ConfigError>> = Lazy::new(|| {
    Ok(AppConfig {
        base_url: envar_required("BASE_URL")?,
        secret_key: envar_required("APP_SECRET")?,
        database_url: envar_required("DATABASE_URL")?,
        database_max_pool: envar_or_default("DATABASE_MAX_POOL", DEFAULT_MAX_POOL),
        smtp_host: envar_or_default("SMTP_HOST", String::from("localhost")),
        smtp_port: envar_or_default("SMTP_PORT", 1025),
        smtp_secure: envar_or_default("SMTP_SECURE", false),
        smtp_username: envar_or_default("SMTP_USERNAME", String::new()),
        smtp_password: envar_or_default("SMTP_PASSWORD", String::new()),
        smtp_mail_from: envar_or_default("SMTP_MAIL_FROM", String::from(DEFAULT_MAIL_FROM)),
        github_client_id: envar_or_default("GITHUB_CLIENT_ID", String::new()),
        github_client_secret: envar_or_default("GITHUB_CLIENT_SECRET", String::new()),
    })
});

fn envar_or_default<T>(name: &'static str, default: T) -> T
where
    T: FromStr,
{
    env::var(name).ok().and_then(|v| v.parse().ok()).unwrap_or(default)
}

fn envar_required(name: &'static str) -> Result<String, ConfigError> {
    env::var(name).map_err(|_| ConfigError::MissingEnvVar(name))
}

#[derive(Debug)]
pub enum ConfigError {
    MissingEnvVar(&'static str),
}

impl fmt::Display for ConfigError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ConfigError::MissingEnvVar(var) => write!(f, "{} is missing", var),
        }
    }
}

impl Error for ConfigError {}
