use uuid::Uuid;

use crate::errors::Error;
use crate::model::User;
use crate::repository::users::UsersRepository;

pub struct GetUserService {
    repo: UsersRepository,
}

impl GetUserService {
    pub fn new(repo: UsersRepository) -> Self {
        Self { repo }
    }

    pub async fn by_id(&self, id: Uuid) -> Result<User, Error> {
        self.repo.find_by_id(id).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use uuid::Uuid;

    #[test]
    fn new_creates_service() {
        let repo = UsersRepository::new();
        let _ = GetUserService::new(repo);
    }

    #[tokio::test]
    async fn by_id_delegates_to_repo() {
        let svc = GetUserService::new(UsersRepository::new());
        let result = svc.by_id(Uuid::new_v4()).await;
        assert!(matches!(result.unwrap_err(), Error::NotFound));
    }
}
