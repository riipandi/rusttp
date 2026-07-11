pub fn handle() -> i32 {
    eprintln!("Not yet implemented");
    0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn handle_returns_zero() {
        assert_eq!(handle(), 0);
    }
}
