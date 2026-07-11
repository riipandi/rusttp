#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("mailer not yet implemented")]
    NotImplemented,
}

#[derive(Default)]
pub struct Mailer;

impl Mailer {
    pub fn new() -> Self {
        Self
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn new_creates_mailer() {
        let _ = Mailer::new();
    }

    #[test]
    #[allow(clippy::default_constructed_unit_structs)]
    fn default_creates_mailer() {
        let _ = Mailer::default();
    }
}
