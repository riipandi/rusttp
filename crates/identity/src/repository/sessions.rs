use uuid::Uuid;

use crate::errors::Error;
use crate::model::Session;

#[derive(Default)]
pub struct SessionsRepository;

impl SessionsRepository {
    pub fn new() -> Self {
        Self
    }

    pub async fn find_by_token(&self, _token: &str) -> Result<Session, Error> {
        Err(Error::NotFound)
    }

    pub async fn find_by_user_id(&self, _user_id: Uuid) -> Result<Vec<Session>, Error> {
        Err(Error::NotFound)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;

    #[test]
    fn new_creates_repository() {
        let _ = SessionsRepository::new();
    }

    #[tokio::test]
    async fn find_by_token_returns_not_found() {
        let repo = SessionsRepository::new();
        let result = repo.find_by_token("token").await;
        assert!(result.is_err());
        assert!(matches!(result.unwrap_err(), Error::NotFound));
    }

    #[tokio::test]
    async fn find_by_user_id_returns_not_found() {
        let repo = SessionsRepository::new();
        let result = repo.find_by_user_id(Uuid::new_v4()).await;
        assert!(result.is_err());
        assert!(matches!(result.unwrap_err(), Error::NotFound));
    }
}
