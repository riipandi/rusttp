// Copyright 2025 Aris Ripandi <aris@duck.com>
// SPDX-License-Identifier: Apache-2.0 or MIT

use sha1::{Digest, Sha1};

pub fn sha1(input: &str) -> String {
    // Create a SHA1 hash object
    let mut hasher = Sha1::new();

    // Update the hasher with the input data
    hasher.update(input.as_bytes());

    // Finalize the hash and get the result as a byte array
    let hash_result = hasher.finalize();

    // Format the byte array as a lowercase hexadecimal string
    let hash_string: String = hash_result.iter().map(|byte| format!("{:02x}", byte)).collect();

    hash_string
}
