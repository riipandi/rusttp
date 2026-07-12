use uuid::Uuid;

use crate::errors::Error;
use crate::model::User;

#[derive(Default)]
pub struct UsersRepository;

impl UsersRepository {
    pub fn new() -> Self {
        Self
    }

    pub async fn find_by_id(&self, _id: Uuid) -> Result<User, Error> {
        Err(Error::NotFound)
    }

    pub async fn find_by_email(&self, _email: &str) -> Result<User, Error> {
        Err(Error::NotFound)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;

    #[test]
    fn new_creates_repository() {
        let _ = UsersRepository::new();
    }

    #[tokio::test]
    async fn find_by_id_returns_not_found() {
        let repo = UsersRepository::new();
        let result = repo
            .find_by_id(Uuid::new_v7(uuid::Timestamp::now(uuid::NoContext)))
            .await;
        assert!(result.is_err());
        assert!(matches!(result.unwrap_err(), Error::NotFound));
    }

    #[tokio::test]
    async fn find_by_email_returns_not_found() {
        let repo = UsersRepository::new();
        let result = repo.find_by_email("test@example.com").await;
        assert!(result.is_err());
        assert!(matches!(result.unwrap_err(), Error::NotFound));
    }
}
