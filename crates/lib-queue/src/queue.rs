#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("queue not yet implemented")]
    NotImplemented,
}

#[derive(Default)]
pub struct Queue;

impl Queue {
    pub fn new() -> Self {
        Self
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn new_creates_queue() {
        let _ = Queue::new();
    }

    #[test]
    #[allow(clippy::default_constructed_unit_structs)]
    fn default_creates_queue() {
        let _ = Queue::default();
    }
}
