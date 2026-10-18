# Game API

## Overview

This document provides an overview of the Game API, which is a structured database containing information about various video games. The database includes details such as game titles, genres, platforms, release dates, developers, publishers, and user ratings.
Database contains fictional data for demonstration purposes. The project will seed a database with sample game data to illustrate its structure and functionality. Database will be containerized using Docker/Podman for the developers to easily have access to an API for their frontend exam or pair programming session.
Project in its end state will provide a RESTful API and GraphQL endpoint to access the game data.

## Database Structure

The Game API is organized into several tables, each representing a different aspect of the games. The main tables include:
1. **Games**: Contains basic information about each game.
   - ID (Primary Key)
   - Title
   - Description
   - Genre ID (Foreign Key)
   - Platform
   - Release Date
   - Developer ID (Foreign Key)
   - Publisher ID (Foreign Key)

2. **Companies**: Contains information about game or publisher.
   - ID (Primary Key)
   - Name
   - Country
   - Founded Year
   - Logo
   - Company type (Enum:Developer/Publisher)

3. **Genres**: Contains information about game genres.
   - ID (Primary Key)
   - Genre Name	

4. **User Reviews**: Contains user ratings for games.
   - ID (Primary Key)
   - Game ID (Foreign Key)
   - User ID (Foreign Key)
   - Rating Score
   - Review Text
   - Review Date

5. **Users**: Contains information about users who rate games.
   - ID (Primary Key)
   - Username
   - Email
   - Registration Date

6. **Images**: Contains images related to games.
   - ID (Primary Key)
   - Image URL
   - Image Type (Enum: Screenshot/Cover/Artwork)

7. **Image_Relations**: Contains polymorphic relationships linking images to various entities.
	- ID (Primary Key)
	- Image ID (Foreign Key)
	- Related Type (Enum: Game/Company/Genre/Rating/User)
	- Related ID (Integer - references the ID of the related entity)
	- Created Date

## Technologies Used
The Game API is built using the following technologies:

- Docker/Podman: Containerization for easy deployment and management
- Database Management System: PostgreSQL
- Backend: Node.js with Express
- API: RESTful API for accessing game data and GraphQL endpoint for flexible queries
- ORM: Sequelize for database interactions

## Data Seeding
The database will be seeded with fictional game data to demonstrate its structure and functionality. The seeding process will include:
- Inserting sample records into the Games, Companies, and Genres tables
- Adding user reviews in the User Reviews table
- Image associations in the Images and Image_Relations tables
- Ensuring relationships between tables are properly established through foreign keys
- Providing a script to automate the seeding process
- Quantity of data sufficient to demonstrate API functionality and performance. Atleast 250 games, 100 companies (20 publishers), 15 genres, and 1200 user reviews.
- Sample data will include a variety of game titles, genres, platforms, and user ratings to showcase the database's capabilities.
- Data will be in JSON, for easy manipulation and insertion into the database.

## API Endpoints
The Game API will provide the following API endpoints:
- `GET /games`: Retrieve a list of all games
- `GET /games/:id`: Retrieve details of a specific game by ID
- `GET /companies`: Retrieve a list of all companies
- `GET /genres`: Retrieve a list of all genres
- `GET /reviews`: Retrieve user reviews for games

## HATEOAS Implementation
The REST API implements HATEOAS (Hypermedia as the Engine of Application State) principles to provide discoverable and self-documenting endpoints. Each response includes hypermedia links that guide clients through available actions and relationships.

### HATEOAS Features:
- **Self-documenting responses**: Each resource includes links to related actions and resources
- **Navigation links**: Automatic generation of pagination, filtering, and sorting links
- **Relationship discovery**: Links to related entities (e.g., game → developer, game → genre)
- **Action availability**: Dynamic links based on resource state and user permissions
- **Resource versioning**: Links include API version information for backward compatibility

### Link Structure:
All API responses include a `_links` object containing:
- `self`: Link to the current resource
- `related`: Links to associated resources (developer, publisher, genre, reviews)
- `actions`: Available operations (edit, delete, etc.) based on context
- `navigation`: Pagination and collection traversal links

### Example Response:
```json
{
  "data": {
    "id": "123",
    "title": "Example Game",
    "genre": "Action"
  },
  "_links": {
    "self": { "href": "/api/v1/games/123" },
    "genre": { "href": "/api/v1/genres/action" },
    "developer": { "href": "/api/v1/companies/456" },
    "reviews": { "href": "/api/v1/games/123/reviews" },
    "images": { "href": "/api/v1/games/123/images" }
  }
}
```

## Documentation of API
Comprehensive documentation will be provided for the API, including:
- Endpoint descriptions
- Request and response formats
- HATEOAS link specifications and relationship mappings
- Example queries for the GraphQL endpoint
- GraphQL schema documentation (Playground/GraphiQL support)