// Copyright 2025 Aris Ripandi <aris@duck.com>
// SPDX-License-Identifier: Apache-2.0 or MIT

use uuid::Uuid;

// Custom serialization for Uuid to lowercase and remove dashes
pub fn uuid_without_dashes<S>(uuid: &Uuid, serializer: S) -> Result<S::Ok, S::Error>
where
    S: serde::Serializer,
{
    let s = uuid.simple().encode_lower(&mut Uuid::encode_buffer()).to_string();

    serializer.serialize_str(&s)
}
