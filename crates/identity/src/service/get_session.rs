use crate::errors::Error;
use crate::model::Session;
use crate::repository::sessions::SessionsRepository;

pub struct GetSessionService {
    repo: SessionsRepository,
}

impl GetSessionService {
    pub fn new(repo: SessionsRepository) -> Self {
        Self { repo }
    }

    pub async fn by_token(&self, token: &str) -> Result<Session, Error> {
        self.repo.find_by_token(token).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn new_creates_service() {
        let repo = SessionsRepository::new();
        let _ = GetSessionService::new(repo);
    }

    #[tokio::test]
    async fn by_token_delegates_to_repo() {
        let svc = GetSessionService::new(SessionsRepository::new());
        let result = svc.by_token("anything").await;
        assert!(matches!(result.unwrap_err(), Error::NotFound));
    }
}
