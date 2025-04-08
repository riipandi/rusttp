// Copyright 2025 Aris Ripandi <aris@duck.com>
// SPDX-License-Identifier: Apache-2.0 or MIT

use rand::rng;
use rand::seq::IndexedRandom;

pub fn random_str(length: usize) -> &'static str {
    const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let mut rng = rng();
    let random_string: String = (0..length)
        .map(|_| *CHARSET.choose(&mut rng).unwrap() as char)
        .collect();
    Box::leak(Box::new(random_string))
}
