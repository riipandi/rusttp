// Copyright 2025 Aris Ripandi <aris@duck.com>
// SPDX-License-Identifier: Apache-2.0 or MIT

use anyhow::Context;
use sqlx::types::Uuid;
use tokio::task;

/// Generates a token asynchronously by combining a new UUID with an existing UUID.
///
/// The token is created by first generating a new UUID (token_id) using `Uuid::new_v4()`,
/// and then combining it with the provided UUID (param_id). The resulting token is a string
/// formed by concatenating the simplified representations of the two UUIDs.
///
/// # Arguments
///
/// * `param_id` - The UUID used to create the token.
///
/// # Returns
///
/// A Result containing a tuple with the generated `Uuid` (token_id) and the resulting token as a `String`.
///
/// # Errors
///
/// Returns an error if there is a panic during the token creation process or if there are issues
/// with the UUID generation.
///
/// # Examples
///
/// ```rust,ignore
/// use sqlx::types::Uuid;
/// use libcore::utils::helper::generate_token;
///
/// #[tokio::main]
/// async fn main() {
///     let user_id = Uuid::new_v4();
///     match generate_token(user_id).await {
///         Ok((token_id, token)) => {
///             println!("Token ID: {}", token_id);
///             println!("Token: {}", token);
///         }
///         Err(err) => eprintln!("Error generating token: {:?}", err),
///     }
/// }
/// ```
pub async fn generate_token(param_id: Uuid) -> anyhow::Result<(Uuid, String)> {
    task::spawn_blocking(move || {
        let token_id = Uuid::new_v4();
        let stripped_token_id = token_id.as_simple().to_string();
        let stripped_param_id = param_id.as_simple().to_string();
        let token = format!("{}{}", stripped_token_id, stripped_param_id);
        Ok((token_id, token))
    })
    .await
    .context("panic in creating token()")?
}

pub fn calculate_total_pages(total_count: u64, page_size: u64) -> u64 {
    (total_count as f32 / page_size as f32).ceil() as u64
}
