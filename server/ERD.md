# Game API - Entity Relationship Diagram

## Database Schema

```mermaid
erDiagram
    GENRES ||--o{ GAMES : "categorizes"
    COMPANIES ||--o{ GAMES : "develops"
    COMPANIES ||--o{ GAMES : "publishes"
    GAMES ||--o{ USER_REVIEWS : "receives"
    USERS ||--o{ USER_REVIEWS : "writes"
    IMAGES ||--o{ IMAGE_RELATIONS : "linked_through"

    GENRES {
        int id PK "Auto-increment"
        string genre_name UK "Max 50 chars"
        datetime created_at
        datetime updated_at
    }

    COMPANIES {
        int id PK "Auto-increment"
        string name UK "Max 100 chars"
        string country "Max 50 chars, nullable"
        int founded_year "nullable"
        string logo "Max 255 chars, nullable"
        enum company_type "Developer/Publisher"
        datetime created_at
        datetime updated_at
    }

    USERS {
        int id PK "Auto-increment"
        string username UK "Max 50 chars"
        string email UK "Max 100 chars"
        string password "Max 255 chars"
        datetime registration_date "Default NOW"
        datetime created_at
        datetime updated_at
    }

    GAMES {
        int id PK "Auto-increment"
        string title "Max 200 chars"
        text description "nullable"
        int genre_id FK "References genres.id"
        string platform "Max 100 chars, nullable"
        datetime release_date "nullable"
        int developer_id FK "References companies.id, nullable"
        int publisher_id FK "References companies.id, nullable"
        datetime created_at
        datetime updated_at
    }

    USER_REVIEWS {
        int id PK "Auto-increment"
        int game_id FK "References games.id"
        int user_id FK "References users.id"
        decimal rating_score "2,1 - Range 0-10"
        text review_text "nullable"
        datetime review_date "Default NOW"
        datetime created_at
        datetime updated_at
    }

    IMAGES {
        int id PK "Auto-increment"
        string image_url "Max 500 chars"
        enum image_type "Screenshot/Cover/Artwork"
        datetime created_at
        datetime updated_at
    }

    IMAGE_RELATIONS {
        int id PK "Auto-increment"
        int image_id FK "References images.id"
        enum related_type "Game/Company/Genre/Rating/User"
        int related_id "Polymorphic reference"
        datetime created_date "Default NOW"
        datetime created_at
        datetime updated_at
    }
```

## Relationship Details

### Primary Relationships

1. **GENRES → GAMES** (One-to-Many)
   - One genre can categorize many games
   - Each game must have exactly one genre
   - Foreign Key: `games.genre_id` → `genres.id`
   - On Update: CASCADE
   - On Delete: RESTRICT

2. **COMPANIES → GAMES (Developer)** (One-to-Many)
   - One company can develop many games
   - Each game can have one developer (nullable)
   - Foreign Key: `games.developer_id` → `companies.id`
   - On Update: CASCADE
   - On Delete: SET NULL

3. **COMPANIES → GAMES (Publisher)** (One-to-Many)
   - One company can publish many games
   - Each game can have one publisher (nullable)
   - Foreign Key: `games.publisher_id` → `companies.id`
   - On Update: CASCADE
   - On Delete: SET NULL

4. **GAMES → USER_REVIEWS** (One-to-Many)
   - One game can have many user reviews
   - Each review belongs to exactly one game
   - Foreign Key: `user_reviews.game_id` → `games.id`
   - On Update: CASCADE
   - On Delete: CASCADE

5. **USERS → USER_REVIEWS** (One-to-Many)
   - One user can write many reviews
   - Each review is written by exactly one user
   - Foreign Key: `user_reviews.user_id` → `users.id`
   - On Update: CASCADE
   - On Delete: CASCADE

6. **IMAGES → IMAGE_RELATIONS** (One-to-Many)
   - One image can be linked to multiple entities
   - Each relation references exactly one image
   - Foreign Key: `image_relations.image_id` → `images.id`
   - On Update: CASCADE
   - On Delete: CASCADE

### Polymorphic Relationship

**IMAGE_RELATIONS** implements a polymorphic relationship pattern:
- `related_type` specifies the entity type (Game, Company, Genre, Rating, or User)
- `related_id` stores the ID of the related entity
- This allows images to be associated with any entity type through a single junction table

## Indexes

### GAMES
- `genre_id` - Foreign key lookup
- `developer_id` - Foreign key lookup
- `publisher_id` - Foreign key lookup
- `release_date` - Date-based queries

### USER_REVIEWS
- `game_id` - Foreign key lookup
- `user_id` - Foreign key lookup
- `(game_id, user_id)` - UNIQUE constraint (one review per user per game)

### IMAGE_RELATIONS
- `image_id` - Foreign key lookup
- `(related_type, related_id)` - Polymorphic relationship lookup

## Constraints

### Unique Constraints
- `genres.genre_name` - Unique genre names
- `companies.name` - Unique company names
- `users.username` - Unique usernames
- `users.email` - Unique email addresses
- `user_reviews.(game_id, user_id)` - One review per user per game

### Enums
- `companies.company_type`: 'Developer' | 'Publisher'
- `images.image_type`: 'Screenshot' | 'Cover' | 'Artwork'
- `image_relations.related_type`: 'Game' | 'Company' | 'Genre' | 'Rating' | 'User'

### Data Validation
- `user_reviews.rating_score`: DECIMAL(2,1) with min 0, max 10
