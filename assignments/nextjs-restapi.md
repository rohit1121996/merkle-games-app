# Code Assignment - Game API

**Technology stack:** Next.js & REST API

## Objective

Develop a responsive Next.js/TypeScript web application that allows users to explore games using the provided REST API endpoints. The solution must meet functional, technical, and accessibility standards, and be optimized for usability and performance.

You will need to run the Games API locally for this assignment. Ensure you have access to the "Merkle Games API" container project or the provided zip file. API documentation is available in the container project once running.

## Time Allocation

**Allocate approximately 1 to 4 hours to complete the task.** Focus on fulfilling the essential requirements before attempting any optional enhancements. The purpose of this assignment is not to deliver a flawless and complete product, but to provide a foundation for discussion. We are particularly interested in your reasoning, project structure, and coding decisions. Please indicate the total time you spent on the assignment, as this will help us understand the scope of your effort.

## Evaluation Criteria

- Understanding of assignment
- Fulfillment of functional requirements and understanding of acceptance criteria
- Code quality and maintainability
- Visual design and user experience
- Responsiveness
- Accessibility compliance
- Performance and optimization
- Test coverage
- Documentation quality

## Submission Instructions

Submit your completed project in a public GitHub repository. The provided "Merkle Games API" project already contains the following structure:

- /server (API container)
- /client (your application goes here)
- README.md

Place your application in the /client folder. Ensure the repository includes:

- All relevant project files
- An updated README.md with setup instructions
- A brief explanation of your implementation approach and choices

Include the GitHub repository link in your submission.

## Scope of Your Assignment

Your work belongs in the `/client` folder. Please stay within that scope.

- **Do not modify the `/server` folder.** The API comes with challenges by design to test your problem-solving abilities. You are expected to work with the API as-is. Making changes to the `/server` folder is not allowed and will reflect negatively on your solution.
- **Use the REST API only.** This assignment is specifically about consuming the REST endpoints. Do not switch to GraphQL, and do not implement both. Working around the assigned API style instead of within it is outside the scope of the task and will reflect negatively on your solution.

If something about the API seems broken or awkward, treat it as part of the challenge and handle it on the client side rather than changing the server or swapping API styles. Note any such decisions in your README so we can discuss them.

## Use of External Tools

This assignment is intended to evaluate your individual coding skills, problem-solving approach, and architectural decisions. **Please do not use AI tools (such as GitHub Copilot, ChatGPT, or similar) to generate code or structure the solution**. Likewise, avoid copying large portions of code from existing repositories or online sources.

We are not assessing prompt engineering or AI-assisted development. The focus is on your own implementation, so we can have an informed discussion about your choices, strengths, and potential fit for the role. Assignments developed with vibe coding will be disqualified as that it not the purpose of the assignment.

## Requirements and Technology Stack

- Framework: Latest version of Next.js (using App Router structure)
- Language: TypeScript
- Styling: SCSS (with variables) - No Tailwind
- Testing: Vitest or Jest (unit tests)
- Accessibility: Compliant with WCAG 2.2 AA
- UI/Component Libraries: Not permitted
- Implement fallback images for missing/broken images

## Pages and Features

### Index Page

The index page should present 15 random games released between 2015 and 2017 in a responsive multi-column layout. Games should be sorted by average rating in descending order by default. Each game card must include:

- Image
- Title
- Release date (formatted)
- Average rating (ratings count)
- Genre

### Detail Page

The details page should include the following information:

- Game title and description
- A large featured image
- Release date
- Average rating
- Developer
- Genres
- Review list
  - Each review should have:
    - Review text
    - Rating
    - Username
- A back button for navigation

## Acceptance Criteria

### Index Page
**Feature: Browse Games**

**Scenario**: Display list of games  
**Given** the user lands on the index page  
**When** the data is fetched from the API  
**Then** games are displayed in a multi-column responsive grid on desktop  
**And** each card shows title, image, release date, rating, and genre  
**And** games are sorted by average rating in descending order

**Scenario**: Navigate to game details  
**Given** the index page is loaded  
**When** the user clicks a game card  
**Then** the application navigates to the game details page

**Scenario**: Switch between sorting options  
**Given** the user is on the index page  
**When** the user selects a sorting option  
**Then** the games are sorted accordingly  
**And** the user can switch between sorting by **release date** and sorting by **average rating**

### Detail Page
**Feature: View Game Details**

**Scenario**: Display full details for a game  
**Given** the user is on a game details page  
**Then** the page shows the title, description, image, rating, release date, developer, and genres  
**And** it displays the reviews with the username, review text, and rating  
**And** a back button is present on the page

## API Documentation

All available endpoints and request/response schemas are documented in the Swagger UI. Once you have spun up the API container, access the documentation at:

http://localhost:{{PORT}}/api-docs

## Bonus Features (Optional Enhancements)

- Improved visual design
- Smooth loading transitions
- Extended test coverage (unit, integration)
- Performance optimization
- Advanced accessibility features
- Search Engine Optimization (SEO)
- Robust error handling
- Support for light/dark modes
- Game search functionality
- Filter games by genre
